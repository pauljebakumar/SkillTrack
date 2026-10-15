const StudyMaterial = require('../models/StudyMaterial');
const LearningProgress = require('../models/LearningProgress');
const Bookmark = require('../models/Bookmark');
const memoryStore = require('../config/memoryStore');
const { isConnected } = require('../config/db');

// @desc Get all study materials with filters
// @route GET /api/study
exports.getAll = async (req, res, next) => {
  try {
    const { category, subject, difficulty, search } = req.query;

    let materials = [];
    if (isConnected()) {
      const query = {};
      if (category) query.category = category;
      if (subject) query.subject = new RegExp(subject, 'i');
      if (difficulty) query.difficulty = difficulty;
      if (search) {
        query.$or = [
          { title: new RegExp(search, 'i') },
          { topic: new RegExp(search, 'i') },
          { tags: new RegExp(search, 'i') }
        ];
      }
      materials = await StudyMaterial.find(query).select('-content.solvedExamples -content.commonErrors');
    } else {
      materials = memoryStore.getCollection('studymaterials');
      if (category) materials = materials.filter(m => m.category === category);
      if (subject) materials = materials.filter(m => m.subject.toLowerCase().includes(subject.toLowerCase()));
      if (difficulty) materials = materials.filter(m => m.difficulty === difficulty);
      if (search) {
        const s = search.toLowerCase();
        materials = materials.filter(m =>
          m.title.toLowerCase().includes(s) ||
          m.topic.toLowerCase().includes(s) ||
          (m.tags && m.tags.some(t => t.toLowerCase().includes(s)))
        );
      }
    }

    // Attach student progress if logged in
    let userProgress = {};
    if (req.user) {
      const userId = req.user._id || req.user.id;
      if (isConnected()) {
        const prog = await LearningProgress.find({ user: userId });
        prog.forEach(p => {
          userProgress[p.topic] = p.status;
        });
      } else {
        const prog = memoryStore.find('learningprogresses', { user: userId });
        prog.forEach(p => {
          userProgress[p.topic] = p.status;
        });
      }
    }

    const items = materials.map(m => {
      const plain = typeof m.toObject === 'function' ? m.toObject() : { ...m };
      return {
        ...plain,
        userStatus: userProgress[plain.topic] || 'not_started'
      };
    });

    res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (err) {
    next(err);
  }
};

// @desc Get single study material by slug or id
// @route GET /api/study/:slugOrId
exports.getOne = async (req, res, next) => {
  try {
    const { slugOrId } = req.params;
    let material = null;

    if (isConnected()) {
      material = await StudyMaterial.findOne({
        $or: [{ slug: slugOrId }, { _id: slugOrId.match(/^[0-9a-fA-F]{24}$/) ? slugOrId : null }]
      });
      if (material) {
        material.viewCount = (material.viewCount || 0) + 1;
        await material.save();
      }
    } else {
      const items = memoryStore.getCollection('studymaterials');
      material = items.find(m => m.slug === slugOrId || String(m._id) === String(slugOrId));
      if (material) {
        material.viewCount = (material.viewCount || 0) + 1;
        memoryStore.saveToFile();
      }
    }

    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }

    let progress = null;
    let isBookmarked = false;
    if (req.user) {
      const userId = req.user._id || req.user.id;
      if (isConnected()) {
        progress = await LearningProgress.findOne({ user: userId, topic: material.topic });
        const b = await Bookmark.findOne({ user: userId, itemId: String(material._id) });
        isBookmarked = Boolean(b);
      } else {
        progress = memoryStore.findOne('learningprogresses', { user: userId, topic: material.topic });
        const b = memoryStore.findOne('bookmarks', { user: userId, itemId: String(material._id) });
        isBookmarked = Boolean(b);
      }
    }

    res.status(200).json({
      success: true,
      data: material,
      progress: progress || { status: 'not_started', progressPercentage: 0 },
      isBookmarked
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update study progress
// @route POST /api/study/:id/progress
exports.updateProgress = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { status, progressPercentage, timeSpentMinutes, personalNotes } = req.body;

    let material;
    if (isConnected()) {
      material = await StudyMaterial.findById(id);
    } else {
      material = memoryStore.findById('studymaterials', id);
    }

    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material not found' });
    }

    const progressData = {
      user: userId,
      studyMaterial: material._id,
      subject: material.subject,
      topic: material.topic,
      category: material.category,
      status: status || 'completed',
      progressPercentage: progressPercentage !== undefined ? progressPercentage : 100,
      timeSpentMinutes: timeSpentMinutes || 15,
      personalNotes: personalNotes || '',
      lastStudiedAt: new Date()
    };

    let result;
    if (isConnected()) {
      result = await LearningProgress.findOneAndUpdate(
        { user: userId, topic: material.topic },
        { $set: progressData },
        { upsert: true, new: true }
      );
    } else {
      const existing = memoryStore.findOne('learningprogresses', { user: userId, topic: material.topic });
      if (existing) {
        result = memoryStore.updateOne('learningprogresses', { user: userId, topic: material.topic }, progressData);
      } else {
        result = memoryStore.insertOne('learningprogresses', progressData);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Progress recorded successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc Toggle bookmark
// @route POST /api/study/:id/bookmark
exports.toggleBookmark = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    let material;
    if (isConnected()) {
      material = await StudyMaterial.findById(id);
    } else {
      material = memoryStore.findById('studymaterials', id);
    }

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    let isBookmarked = false;
    if (isConnected()) {
      const existing = await Bookmark.findOne({ user: userId, itemId: String(id) });
      if (existing) {
        await Bookmark.deleteOne({ _id: existing._id });
        isBookmarked = false;
      } else {
        await Bookmark.create({
          user: userId,
          itemType: 'study_material',
          itemId: String(id),
          title: material.title,
          subject: material.subject
        });
        isBookmarked = true;
      }
    } else {
      const existing = memoryStore.findOne('bookmarks', { user: userId, itemId: String(id) });
      if (existing) {
        memoryStore.deleteOne('bookmarks', { _id: existing._id });
        isBookmarked = false;
      } else {
        memoryStore.insertOne('bookmarks', {
          user: userId,
          itemType: 'study_material',
          itemId: String(id),
          title: material.title,
          subject: material.subject
        });
        isBookmarked = true;
      }
    }

    res.status(200).json({
      success: true,
      isBookmarked,
      message: isBookmarked ? 'Bookmarked to your library' : 'Removed from bookmarks'
    });
  } catch (err) {
    next(err);
  }
};
