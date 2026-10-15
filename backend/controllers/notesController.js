const PersonalNote = require('../models/PersonalNote');
const memoryStore = require('../config/memoryStore');
const { isConnected } = require('../config/db');

// @desc Get student notes with search & subject filter
// @route GET /api/notes
exports.getNotes = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { subject, search, bookmarkedOnly } = req.query;

    let notes = [];
    if (isConnected()) {
      const q = { user: userId };
      if (subject) q.subject = new RegExp(subject, 'i');
      if (bookmarkedOnly === 'true') q.isBookmarked = true;
      if (search) {
        q.$or = [
          { title: new RegExp(search, 'i') },
          { content: new RegExp(search, 'i') },
          { topic: new RegExp(search, 'i') }
        ];
      }
      notes = await PersonalNote.find(q).sort({ updatedAt: -1 });
    } else {
      notes = memoryStore.find('personalnotes', { user: userId });
      if (subject) notes = notes.filter(n => n.subject.toLowerCase().includes(subject.toLowerCase()));
      if (bookmarkedOnly === 'true') notes = notes.filter(n => n.isBookmarked);
      if (search) {
        const s = search.toLowerCase();
        notes = notes.filter(n =>
          n.title.toLowerCase().includes(s) ||
          n.content.toLowerCase().includes(s) ||
          (n.topic && n.topic.toLowerCase().includes(s))
        );
      }
      notes.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
    }

    res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (err) {
    next(err);
  }
};

// @desc Create note
// @route POST /api/notes
exports.createNote = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { title, subject, topic, content, tags, isAiGenerated } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide both note title and content.' });
    }

    const noteData = {
      user: userId,
      title,
      subject: subject || 'General',
      topic: topic || 'Study Notes',
      content,
      tags: tags || [],
      isAiGenerated: Boolean(isAiGenerated),
      isBookmarked: false
    };

    let savedNote;
    if (isConnected()) {
      savedNote = await PersonalNote.create(noteData);
    } else {
      savedNote = memoryStore.insertOne('personalnotes', noteData);
    }

    res.status(201).json({
      success: true,
      message: 'Note saved successfully',
      data: savedNote
    });
  } catch (err) {
    next(err);
  }
};

// @desc Update note
// @route PUT /api/notes/:id
exports.updateNote = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;
    const { title, subject, topic, content, tags, isBookmarked } = req.body;

    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (subject !== undefined) updateFields.subject = subject;
    if (topic !== undefined) updateFields.topic = topic;
    if (content !== undefined) updateFields.content = content;
    if (tags !== undefined) updateFields.tags = tags;
    if (isBookmarked !== undefined) updateFields.isBookmarked = isBookmarked;

    let updatedNote;
    if (isConnected()) {
      updatedNote = await PersonalNote.findOneAndUpdate(
        { _id: id, user: userId },
        { $set: updateFields },
        { new: true }
      );
    } else {
      const note = memoryStore.findById('personalnotes', id);
      if (note && String(note.user) === String(userId)) {
        updatedNote = memoryStore.findByIdAndUpdate('personalnotes', id, updateFields);
      }
    }

    if (!updatedNote) {
      return res.status(404).json({ success: false, message: 'Note not found or unauthorized' });
    }

    res.status(200).json({
      success: true,
      message: 'Note updated',
      data: updatedNote
    });
  } catch (err) {
    next(err);
  }
};

// @desc Delete note
// @route DELETE /api/notes/:id
exports.deleteNote = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { id } = req.params;

    let deleted = false;
    if (isConnected()) {
      const res = await PersonalNote.deleteOne({ _id: id, user: userId });
      deleted = res.deletedCount > 0;
    } else {
      const note = memoryStore.findById('personalnotes', id);
      if (note && String(note.user) === String(userId)) {
        deleted = memoryStore.findByIdAndDelete('personalnotes', id);
      }
    }

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Note deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
