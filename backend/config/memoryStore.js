const fs = require('fs');
const path = require('path');

// Simple persistent JSON / in-memory store fallback for when MongoDB daemon is not running
class MemoryStore {
  constructor() {
    this.data = {
      users: [],
      userprofiles: [],
      studymaterials: [],
      codingquestions: [],
      codingsubmissions: [],
      aptitudequestions: [],
      quizattempts: [],
      mocktests: [],
      mocktestattempts: [],
      learningprogresses: [],
      skillanalyses: [],
      studyplans: [],
      personalnotes: [],
      bookmarks: [],
      aiconversations: [],
      aiusagerecords: []
    };
    this.filePath = path.join(__dirname, '../data/local_storage.json');
    this.loadFromFile();
  }

  loadFromFile() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = { ...this.data, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('[MemoryStore] Failed to load local storage JSON, initializing fresh in-memory.');
    }
  }

  saveToFile() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      // ignore
    }
  }

  generateId() {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }

  getCollection(name) {
    const key = name.toLowerCase();
    if (!this.data[key]) this.data[key] = [];
    return this.data[key];
  }

  find(collectionName, query = {}) {
    const col = this.getCollection(collectionName);
    return col.filter(item => {
      for (const [k, v] of Object.entries(query)) {
        if (v && typeof v === 'object' && v.$ne !== undefined) {
          if (item[k] === v.$ne) return false;
        } else if (item[k] != v) {
          return false;
        }
      }
      return true;
    });
  }

  findOne(collectionName, query = {}) {
    const results = this.find(collectionName, query);
    return results.length > 0 ? { ...results[0] } : null;
  }

  findById(collectionName, id) {
    const col = this.getCollection(collectionName);
    const item = col.find(i => String(i._id) === String(id));
    return item ? { ...item } : null;
  }

  insertOne(collectionName, doc) {
    const col = this.getCollection(collectionName);
    const newDoc = {
      ...doc,
      _id: doc._id || this.generateId(),
      createdAt: doc.createdAt || new Date(),
      updatedAt: doc.updatedAt || new Date()
    };
    col.push(newDoc);
    this.saveToFile();
    return { ...newDoc };
  }

  updateOne(collectionName, query, update) {
    const col = this.getCollection(collectionName);
    const index = col.findIndex(item => {
      for (const [k, v] of Object.entries(query)) {
        if (item[k] != v) return false;
      }
      return true;
    });
    if (index === -1) return null;
    col[index] = { ...col[index], ...update, updatedAt: new Date() };
    this.saveToFile();
    return { ...col[index] };
  }

  findByIdAndUpdate(collectionName, id, update) {
    const col = this.getCollection(collectionName);
    const index = col.findIndex(i => String(i._id) === String(id));
    if (index === -1) return null;
    col[index] = { ...col[index], ...update, updatedAt: new Date() };
    this.saveToFile();
    return { ...col[index] };
  }

  deleteOne(collectionName, query) {
    const col = this.getCollection(collectionName);
    const index = col.findIndex(item => {
      for (const [k, v] of Object.entries(query)) {
        if (item[k] != v) return false;
      }
      return true;
    });
    if (index !== -1) {
      col.splice(index, 1);
      this.saveToFile();
      return true;
    }
    return false;
  }

  findByIdAndDelete(collectionName, id) {
    const col = this.getCollection(collectionName);
    const index = col.findIndex(i => String(i._id) === String(id));
    if (index !== -1) {
      col.splice(index, 1);
      this.saveToFile();
      return true;
    }
    return false;
  }
}

const memoryStore = new MemoryStore();
module.exports = memoryStore;
