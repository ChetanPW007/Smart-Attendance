import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Clock, BookOpen, X, CheckCircle2, Share2, FileText, Table, Search, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

export default function HistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchSubject, setSearchSubject] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  // Detail Modal
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/attendance`);
      setSessions(response.data);
      setFilteredSessions(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    let result = sessions;
    if (searchSubject.trim() !== '') {
      result = result.filter(s => s.subject.toLowerCase().includes(searchSubject.toLowerCase()));
    }
    if (filterDate !== '') {
      try {
        const [year, month, day] = filterDate.split('-');
        const targetDate = new Date(year, parseInt(month) - 1, parseInt(day));
        const searchMonth = targetDate.toLocaleString('en-US', { month: 'short' });
        const searchDay = targetDate.getDate();
        const searchYear = targetDate.getFullYear();
        const searchDateStr = `${searchMonth} ${searchDay}, ${searchYear}`;
        result = result.filter(s => s.dateTime.includes(searchDateStr));
      } catch (e) {
        console.error('Date parsing error', e);
      }
    }
    setFilteredSessions(result);
  };

  // Re-run search if user clears filters
  useEffect(() => {
    if (searchSubject === '' && filterDate === '') {
      setFilteredSessions(sessions);
    }
  }, [searchSubject, filterDate, sessions]);

  const handleSessionClick = async (id) => {
    setSelectedSession(id);
    setDetailsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/attendance/${id}`);
      setSessionDetails(response.data);
    } catch (error) {
      console.error('Error fetching session details:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedSession(null);
    setSessionDetails(null);
  };

  const generateFileName = (details, extension) => {
    const safeSubject = details.subject.replace(/[^a-zA-Z0-9]/g, '_');
    return `Attendance_${safeSubject}_Session${details.session}.${extension}`;
  };

  const attemptWhatsAppShare = async (file, title) => {
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: title,
          text: `Attendance for ${sessionDetails.className} - ${sessionDetails.subject} (Session ${sessionDetails.session}). Total Present: ${sessionDetails.students.filter(s => s.status === 'Present').length}/${sessionDetails.students.length}.`
        });
        return true;
      } catch (err) {
        console.error('WhatsApp Share API error:', err);
      }
    }
    return false;
  };

  const sharePDF = async () => {
    if (!sessionDetails) return;
    const doc = new jsPDF();
    const presentStudents = sessionDetails.students.filter(s => s.status === 'Present');
    
    doc.setFontSize(16);
    doc.text(`Attendance Report`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Class: ${sessionDetails.className} | Subject: ${sessionDetails.subject}`, 14, 30);
    doc.text(`Session: ${sessionDetails.session} | Date: ${sessionDetails.dateTime}`, 14, 36);
    doc.text(`Total Present: ${presentStudents.length}/${sessionDetails.students.length}`, 14, 42);

    const tableData = presentStudents.map((s, i) => [i + 1, s.name, s.usn, 'Present']);
    
    autoTable(doc, {
      startY: 48,
      head: [['#', 'Name', 'USN', 'Status']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [4, 120, 87] }
    });

    const fileName = generateFileName(sessionDetails, 'pdf');
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    const successfullyShared = await attemptWhatsAppShare(file, 'Attendance PDF');
    if (!successfullyShared) {
      doc.save(fileName);
      alert('PDF Generated & Downloaded! You can now attach it manually in WhatsApp.');
    }
  };

  const shareExcel = async () => {
    if (!sessionDetails) return;
    const presentStudents = sessionDetails.students.filter(s => s.status === 'Present');
    
    const formattedData = presentStudents.map((s, i) => ({
      '#': i + 1,
      'Name': s.name,
      'USN': s.usn,
      'Status': 'Present'
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Present_Students");
    
    const fileName = generateFileName(sessionDetails, 'xlsx');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const file = new File([excelBlob], fileName, { type: 'application/octet-stream' });
    
    const successfullyShared = await attemptWhatsAppShare(file, 'Attendance Excel');
    if (!successfullyShared) {
       XLSX.writeFile(wb, fileName);
       alert('Excel Generated & Downloaded! You can now attach it manually in WhatsApp.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500 animate-pulse">Loading history...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <div className="mb-8 pl-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Attendance History</h1>
        <p className="mt-2 text-slate-500">Review all previously submitted attendance sessions (sorted from newest to oldest).</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-end">
          <div className="flex-1 w-full relative">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Search Subject</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BookOpen className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchSubject}
                onChange={(e) => setSearchSubject(e.target.value)}
                placeholder="Type subject name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              />
            </div>
          </div>
          <div className="flex-1 w-full relative md:max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Filter by Date</label>
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all"
              />
            </div>
          </div>
          <button 
            onClick={handleSearch}
            className="w-full md:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 flex items-center justify-center rounded-full mb-6">
               <BookOpen className="w-10 h-10 text-slate-400" />
            </div>
            <p className="text-xl font-semibold text-slate-700">No history found</p>
            <p className="text-slate-500 mt-2">Sessions you submit will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => (
            <div 
              key={session._id}
              onClick={() => handleSessionClick(session._id)}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group active:scale-[0.98]"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
                  {session.className}
                </h3>
                <span className="bg-primary-50 text-primary-700 text-[11px] font-bold px-3 py-1.5 rounded-full border border-primary-100 uppercase tracking-wide">
                  Session {session.session}
                </span>
              </div>
              
              <div className="space-y-3 mt-6">
                <div className="flex items-center text-slate-600 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <BookOpen className="w-4 h-4 mr-3 text-primary-500" />
                  <span className="font-medium truncate">{session.subject}</span>
                </div>
                <div className="flex items-center text-slate-600 text-sm bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <Clock className="w-4 h-4 mr-3 text-primary-500" />
                  <span>{session.dateTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200">
            {detailsLoading || !sessionDetails ? (
              <div className="p-16 text-center text-slate-500 animate-pulse">Loading detailed view...</div>
            ) : (
              <>
                <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 rounded-t-2xl gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{sessionDetails.className}</h2>
                    <p className="text-sm font-medium text-slate-500 mt-2 flex items-center gap-2 flex-wrap">
                       <span className="px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-700">{sessionDetails.subject}</span>
                       <span className="text-slate-300">&bull;</span>
                       <span>Session {sessionDetails.session}</span>
                       <span className="text-slate-300">&bull;</span>
                       <span className="text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100 font-bold whitespace-nowrap">
                         {sessionDetails.students.filter(s => s.status === 'Present').length}/{sessionDetails.students.length} Present
                       </span>
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="relative group/dropdown">
                      <button className="flex items-center gap-1.5 px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg text-sm font-semibold transition-colors">
                        <Share2 className="w-4 h-4" /> Share WhatsApp
                      </button>
                      
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-20 overflow-hidden transform origin-top-right scale-95 group-hover/dropdown:scale-100">
                        <button onClick={sharePDF} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left">
                          <FileText className="w-4 h-4 text-slate-400" /> As PDF
                        </button>
                        <button onClick={shareExcel} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 text-left border-t border-slate-100">
                          <Table className="w-4 h-4 text-slate-400" /> As Excel
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={closeModal}
                      className="p-2 bg-white rounded-lg text-slate-400 hover:text-slate-700 border border-slate-200 shadow-sm transition-colors active:scale-95"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <div className="p-0 overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white sticky top-0 shadow-sm z-10">
                      <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50/80 backdrop-blur">
                        <th className="py-4 px-6 w-16 text-center">#</th>
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">USN</th>
                        <th className="py-4 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sessionDetails.students.filter(s => s.status === 'Present').map((student, idx) => {
                        return (
                          <tr key={student._id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-6 text-center text-sm text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-6 text-sm font-medium text-slate-900">{student.name}</td>
                            <td className="py-3 px-6 text-sm text-slate-500 font-mono">{student.usn}</td>
                            <td className="py-3 px-6 text-center">
                              <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200 shadow-sm">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Present
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
                   Showing only PRESENT students.
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
