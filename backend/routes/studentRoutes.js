const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const router = express.Router();
const Student = require('../models/Student');

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ usn: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST add a single student manually
router.post('/single', async (req, res) => {
  try {
    const { name, usn } = req.body;
    if (!name || !usn) {
      return res.status(400).json({ message: 'Name and USN are required' });
    }
    const newStudent = new Student({ name, usn });
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'USN already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Configure Multer for file upload (memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// POST endpoint to handle Excel file of students
router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload an Excel file.' });
  }
  
  try {
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Expected format: array of objects with 'name' and 'usn' columns
    const data = xlsx.utils.sheet_to_json(sheet);
    
    // Process and insert students (updates existing if USN matches)
    let processedCount = 0;
    for (let row of data) {
      const name = row.name || row.Name || row.NAME;
      const usn = row.usn || row.USN || row.Usn;
      
      if (name && usn) {
        await Student.findOneAndUpdate(
          { usn: String(usn).trim() },
          { name: String(name).trim() },
          { upsert: true, new: true }
        );
        processedCount++;
      }
    }
    
    res.json({ message: `Successfully uploaded and synced ${processedCount} students.` });
  } catch (error) {
    console.error('Error parsing excel:', error);
    res.status(500).json({ message: 'Failed to process Excel file', error: error.message });
  }
});

// PUT update a student
router.put('/:id', async (req, res) => {
  try {
    const { name, usn } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, usn },
      { new: true, runValidators: true }
    );
    if (!updatedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json(updatedStudent);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'USN already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a student
router.delete('/:id', async (req, res) => {
  try {
    const deletedStudent = await Student.findByIdAndDelete(req.params.id);
    if (!deletedStudent) return res.status(404).json({ message: 'Student not found' });
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
