import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import AttendancePage from './pages/AttendancePage';
import HistoryPage from './pages/HistoryPage';
import LoginPage from './pages/LoginPage';
import { ClipboardList, History, LogOut } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check local storage for auth session
    const authStatus = localStorage.getItem('attendance_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    localStorage.setItem('attendance_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('attendance_auth');
  };

  // Render Login Page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-center py-3 gap-2">
              {/* Brand and Mobile Top Row */}
              <div className="flex-shrink-0 flex items-center gap-2 text-primary-600">
                <ClipboardList className="h-8 w-8" />
                <span className="font-bold text-lg sm:text-xl tracking-wide text-slate-900">SmartAttendance</span>
              </div>
              
              <div className="flex items-center sm:hidden">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-1 p-2 rounded-md text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 text-red-500" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="w-full sm:w-auto sm:ml-auto flex items-center justify-between sm:justify-start space-x-1 sm:space-x-4 border-t sm:border-0 border-slate-100 pt-2 sm:pt-0 mt-1 sm:mt-0">
                <Link 
                  to="/" 
                  className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span className="truncate">Attendance</span>
                </Link>
                <Link 
                  to="/history" 
                  className="flex-1 sm:flex-none flex justify-center items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                >
                  <History className="h-4 w-4" />
                  <span className="truncate">History</span>
                </Link>
                <div className="hidden sm:flex items-center ml-2 border-l border-slate-200 pl-4">
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 w-full flex flex-col">
          <Routes>
            <Route path="/" element={<AttendancePage />} />
            <Route path="/history" element={<HistoryPage />} />
            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
