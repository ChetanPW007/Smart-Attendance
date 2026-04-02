import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Check, X, Save, AlertCircle, Upload, Keyboard } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export default function AttendancePage() {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [apiError, setApiError] = useState('');
  
  // Modal states
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [session, setSession] = useState(1);
  
  // File upload state for seeding Excel later
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  // Manage Keyboard Interactions
  useEffect(() => {
    if (students.length === 0 || showModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = Math.min(prev + 1, students.length - 1);
          scrollRow(next);
          return next;
        });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => {
          const next = Math.max(prev - 1, 0);
          scrollRow(next);
          return next;
        });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex < students.length) {
          toggleAttendance(students[focusedIndex]._id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [students, focusedIndex, showModal]);

  const scrollRow = (idx) => {
    const el = document.getElementById(`student-row-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_URL}/students`);
      const data = Array.isArray(response.data) ? response.data : [];
      setStudents(data);
      setApiError('');
      // Initialize all to absent (unchecked)
      const initialAttendance = {};
      data.forEach(s => {
        initialAttendance[s._id] = false;
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
      setApiError('Cannot connect to the database. Please set MONGO_URI in Vercel Environment Variables and redeploy.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append('file', file);
    
    setUploading(true);
    try {
      await axios.post(`${API_URL}/students/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('Students imported successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
      await fetchStudents();
    } catch (error) {
       console.error('Error uploading:', error);
       alert('Upload failed. Ensure backend is running and Excel format is correct (Columns: Name, USN).');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const toggleAttendance = (id) => {
    setAttendance(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenModal = () => {
    if (students.length === 0) {
      alert("No students available to submit attendance.");
      return;
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const now = new Date();
    // Format to 12-hour AM/PM
    const dateTime = now.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true, month: 'short', day: 'numeric', year: 'numeric' });

    const attendanceData = {
      className,
      subject,
      session: Number(session),
      dateTime,
      students: students.map(s => ({
        studentId: s._id,
        name: s.name,
        usn: s.usn,
        status: attendance[s._id] ? 'Present' : 'Absent'
      }))
    };

    try {
      await axios.post(`${API_URL}/attendance`, attendanceData);
      setSuccessMsg(`Attendance saved for ${className} - ${subject} (Session ${session})`);
      setShowModal(false);
      // Reset forms
      setClassName('');
      setSubject('');
      setSession(1);
      // Reset checkboxes
      const resetAtt = {};
      students.forEach(s => { resetAtt[s._id] = false; });
      setAttendance(resetAtt);
      setFocusedIndex(-1);
      
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to save attendance. Please make sure backend is running.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading students...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      {/* DB Connection Error Banner */}
      {apiError && (
        <div className="mb-4 flex items-start gap-3 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-medium shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <span>{apiError}</span>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-white flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Today's Attendance</h1>
              <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-slate-500 text-xs font-semibold">
                <Keyboard className="w-3.5 h-3.5" />
                Keyboard Enabled (Up/Down/Enter)
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500">Use arrow keys or click to mark students present. Default is Absent.</p>
          </div>
          <div className="flex items-center gap-4">
            {successMsg && (
              <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full text-sm font-medium animate-in slide-in-from-top-2">
                <Check className="w-4 h-4" />
                {successMsg}
              </div>
            )}
            
            <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg cursor-pointer transition-colors text-sm border border-slate-200">
              <Upload className="w-4 h-4" />
              {uploading ? 'Importing...' : 'Import Excel'}
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" disabled={uploading}/>
            </label>
          </div>
        </div>

        {students.length === 0 ? (
           <div className="p-16 text-center flex flex-col items-center bg-slate-50/50">
             <div className="w-20 h-20 bg-slate-100 flex items-center justify-center rounded-full mb-6">
                <AlertCircle className="w-10 h-10 text-slate-400" />
             </div>
             <p className="text-xl font-semibold text-slate-700">No students found</p>
             <p className="text-slate-500 mt-2 max-w-sm mb-6">Import an Excel file with 'Name' and 'USN' columns to populate your class list.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6 w-16 text-center">#</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">USN</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student, index) => {
                  const isPresent = attendance[student._id];
                  const isFocused = focusedIndex === index;
                  return (
                    <tr 
                      id={`student-row-${index}`}
                      key={student._id} 
                      className={`transition-all cursor-pointer border-l-4 ${
                        isFocused ? 'border-l-primary-500 bg-primary-50/60' : 'border-l-transparent hover:bg-slate-50/50'
                       } ${isPresent && !isFocused ? 'bg-primary-50/20' : ''}`}
                      onClick={() => {
                        setFocusedIndex(index);
                        toggleAttendance(student._id);
                      }}
                    >
                      <td className="py-3 px-6 text-center text-sm font-medium text-slate-400">
                        {isFocused ? <span className="text-primary-600 font-bold">&raquo;</span> : index + 1}
                      </td>
                      <td className={`py-3 px-6 text-sm font-medium ${isFocused ? 'text-primary-800' : 'text-slate-900'}`}>{student.name}</td>
                      <td className="py-3 px-6 text-sm text-slate-500 font-mono tracking-wide">{student.usn}</td>
                      <td className="py-3 px-6 text-center">
                        <div className="inline-flex items-center justify-center">
                          <button
                            type="button"
                            className={`w-7 h-7 rounded border flex items-center justify-center transition-all ${
                              isPresent 
                                ? 'bg-primary-600 border-primary-600 text-white shadow-inner scale-110' 
                                : 'bg-white border-slate-300 text-transparent hover:border-primary-400'
                            }`}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleOpenModal}
            disabled={students.length === 0}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            Submit Attendance
          </button>
        </div>
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Confirm Submission</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Class Name</label>
                <input 
                  required
                  type="text" 
                  value={className}
                  onChange={e => setClassName(e.target.value)}
                  placeholder="e.g. CS 5th Sem"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <input 
                  required
                  type="text" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Web Development"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
                <select 
                  required
                  value={session}
                  onChange={e => setSession(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all appearance-none bg-white"
                >
                  {[1,2,3,4,5,6,7].map(num => (
                    <option key={num} value={num}>Session {num}</option>
                  ))}
                </select>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-70 transition-all active:scale-95 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Done'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
