import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import DocumentGenerator from './pages/DocumentGenerator';
import Settings from './pages/Settings';
import Verify from './pages/Verify';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editingRecord, setEditingRecord] = useState(null);
  const [verificationId, setVerificationId] = useState(null);
  const [isVerifyRoute, setIsVerifyRoute] = useState(false);

  // Custom pathname router to support public verification URLs e.g. /verify/2001
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname;
      if (path === '/verify' || path.startsWith('/verify/')) {
        setIsVerifyRoute(true);
        const parts = path.split('/');
        const id = parts[2] || '';
        setVerificationId(id);
      } else {
        setIsVerifyRoute(false);
      }
    };

    checkRoute();
    
    // Listen to history changes
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  const clearEditing = () => {
    setEditingRecord(null);
  };

  if (isVerifyRoute) {
    return (
      <ThemeProvider>
        <ToastProvider>
          <Verify initialId={verificationId} />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100">
          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main className="flex-1 max-w-7xl w-full mx-auto px-2 md:px-4 py-4">
            {activeTab === 'dashboard' && (
              <Dashboard 
                setActiveTab={setActiveTab} 
                setEditingRecord={setEditingRecord} 
              />
            )}
            
            {activeTab === 'generate-offer' && (
              <DocumentGenerator 
                type="offer_letter" 
                editingRecord={editingRecord}
                clearEditing={clearEditing}
                setActiveTab={setActiveTab}
              />
            )}
            
            {activeTab === 'generate-cert' && (
              <DocumentGenerator 
                type="certificate" 
                editingRecord={editingRecord}
                clearEditing={clearEditing}
                setActiveTab={setActiveTab}
              />
            )}
            
            {activeTab === 'settings' && <Settings />}
          </main>

          <footer className="py-2 border-t border-slate-200/50 dark:border-slate-850/50 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Certificate Generation Studio. All rights reserved.
          </footer>
        </div>
      </ToastProvider>
    </ThemeProvider>
  );
}
