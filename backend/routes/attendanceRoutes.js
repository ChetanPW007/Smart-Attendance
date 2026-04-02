const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// POST save a new attendance session
router.post('/', async (req, res) => {
  try {
    const { className, subject, session, dateTime, students } = req.body;
    
    if (!className || !subject || !session || !dateTime || !students) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newSession = new Attendance({
      className,
      subject,
      session,
      dateTime,
      students
    });
    
    await newSession.save();
    res.status(201).json({ message: 'Attendance saved successfully', attendanceId: newSession._id });
  } catch (error) {
    console.error('Save attendance error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET all historical sessions (omit detailed student list to keep lightweight)
router.get('/', async (req, res) => {
  try {
    const sessions = await Attendance.find().select('-students').sort({ dateTime: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET detailed view for a single session
router.get('/:id', async (req, res) => {
  try {
    const sessionDetail = await Attendance.findById(req.params.id);
    if (!sessionDetail) return res.status(404).json({ message: 'Session not found' });
    
    res.json(sessionDetail);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE a session
router.delete('/:id', async (req, res) => {
  try {
    const deletedSession = await Attendance.findByIdAndDelete(req.params.id);
    if (!deletedSession) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
