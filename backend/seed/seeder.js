require('dotenv').config();
const mongoose = require('mongoose');
const { isConnected, connectDB } = require('../config/db');
const memoryStore = require('../config/memoryStore');
const User = require('../models/User');
const UserProfile = require('../models/UserProfile');
const StudyMaterial = require('../models/StudyMaterial');
const CodingQuestion = require('../models/CodingQuestion');
const AptitudeQuestion = require('../models/AptitudeQuestion');
const MockTest = require('../models/MockTest');
const {
  users,
  studyMaterials,
  codingQuestions,
  aptitudeQuestions,
  mockTests,
  getHashedPassword
} = require('./seedData');

const seedAll = async () => {
  console.log('[SkillTrack Seeder] Initializing database seeding...');
  await connectDB();

  // Prepare hashed users
  const preparedUsers = [];
  for (const u of users) {
    const hashedPassword = await getHashedPassword(u.password);
    preparedUsers.push({
      ...u,
      password: hashedPassword
    });
  }

  // 1. Populate MemoryStore first (ensures out-of-the-box readiness even without MongoDB daemon)
  memoryStore.data.users = [...preparedUsers];
  memoryStore.data.studymaterials = [...studyMaterials.map((s, idx) => ({ ...s, _id: s._id || `sm_${idx + 1}` }))];
  memoryStore.data.codingquestions = [...codingQuestions.map((c, idx) => ({ ...c, _id: c._id || `cq_${idx + 1}` }))];
  memoryStore.data.aptitudequestions = [...aptitudeQuestions.map((a, idx) => ({ ...a, _id: a._id || `aq_${idx + 1}` }))];
  memoryStore.data.mocktests = [...mockTests.map((m, idx) => ({ ...m, _id: m._id || `mt_${idx + 1}` }))];

  // User Profiles in MemoryStore
  memoryStore.data.userprofiles = [
    {
      _id: 'up_admin_1',
      user: preparedUsers[0]._id,
      bio: 'Administrator & Placement Content Director',
      targetRole: 'Full Stack Director',
      cgpa: 9.2,
      dailyGoalMinutes: 60
    },
    {
      _id: 'up_student_1',
      user: preparedUsers[1]._id,
      bio: 'Pre-final year CSE student preparing for product placements',
      targetRole: 'Software Development Engineer (SDE-1)',
      targetCompanies: ['Google', 'Microsoft', 'Amazon', 'TCS Digital'],
      cgpa: 8.7,
      dailyGoalMinutes: 90
    }
  ];

  memoryStore.saveToFile();
  console.log('[SkillTrack Seeder] Seeded local storage fallback.');

  // 2. If MongoDB is connected, seed MongoDB collections
  if (isConnected()) {
    try {
      await User.deleteMany();
      await UserProfile.deleteMany();
      await StudyMaterial.deleteMany();
      await CodingQuestion.deleteMany();
      await AptitudeQuestion.deleteMany();
      await MockTest.deleteMany();

      // Insert users
      const createdUsers = await User.insertMany(preparedUsers);
      console.log(`[SkillTrack Seeder] Seeded ${createdUsers.length} Users into MongoDB.`);

      // Insert profiles
      await UserProfile.create({
        user: createdUsers[0]._id,
        bio: 'Administrator & Placement Content Director',
        targetRole: 'Full Stack Director',
        cgpa: 9.2
      });
      await UserProfile.create({
        user: createdUsers[1]._id,
        bio: 'Pre-final year CSE student preparing for product placements',
        targetRole: 'Software Development Engineer (SDE-1)',
        targetCompanies: ['Google', 'Microsoft', 'Amazon'],
        cgpa: 8.7
      });

      // Insert Study Materials
      const createdStudy = await StudyMaterial.insertMany(studyMaterials);
      console.log(`[SkillTrack Seeder] Seeded ${createdStudy.length} Study Materials.`);

      // Insert Coding Questions
      const createdCoding = await CodingQuestion.insertMany(codingQuestions);
      console.log(`[SkillTrack Seeder] Seeded ${createdCoding.length} Coding Questions.`);

      // Insert Aptitude Questions
      const createdAptitude = await AptitudeQuestion.insertMany(aptitudeQuestions);
      console.log(`[SkillTrack Seeder] Seeded ${createdAptitude.length} Aptitude Questions.`);

      // Insert Mock Tests
      const createdMock = await MockTest.insertMany(mockTests);
      console.log(`[SkillTrack Seeder] Seeded ${createdMock.length} Mock Tests.`);
    } catch (err) {
      console.error('[SkillTrack Seeder] MongoDB Seeding Error:', err.message);
    }
  }

  console.log('[SkillTrack Seeder] Seeding finished successfully!');
};

if (require.main === module) {
  seedAll().then(() => {
    process.exit(0);
  });
}

module.exports = seedAll;
