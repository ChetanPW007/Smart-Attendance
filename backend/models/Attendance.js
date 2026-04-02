const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  className: { type: String, required: true },
  subject: { type: String, required: true },
  session: { type: Number, required: true },
  dateTime: { type: String, required: true },
  students: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
      name: { type: String, required: true },
      usn: { type: String, required: true },
      status: { type: String, enum: ['Present', 'Absent'], required: true }
    }
  ]
});

module.exports = mongoose.model('Attendance', attendanceSchema);
