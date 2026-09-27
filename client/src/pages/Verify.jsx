import React, { useState, useEffect } from 'react';
import { Award, CheckCircle, ShieldAlert, Search, Calendar, User, Briefcase, FileText, Check } from 'lucide-react';
import { apiUrl } from '../api';

export default function Verify({ initialId }) {
  const [internId, setInternId] = useState(initialId || '');
  const [loading, setLoading] = useState(false);
  const [verifiedData, setVerifiedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialId) {
      handleVerify(initialId);
    }
  }, [initialId]);

  const handleVerify = async (idToVerify) => {
    const id = String(idToVerify).trim().replace(/[^0-9]/g, ''); // Extract digits
    if (!id) {
      setErrorMsg('Please enter a valid numeric Intern ID');
      setVerifiedData(null);
      setSearched(true);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setVerifiedData(null);
    setSearched(true);

    try {
      const response = await fetch(apiUrl(`/api/verify/${id}`));
      if (response.ok) {
        const data = await response.json();
        setVerifiedData(data);
      } else {
        const err = await response.json();
        setErrorMsg(err.error || 'Document not verified or not found in our database.');
      }
    } catch (error) {
      console.error('Verification query failed:', error);
      setErrorMsg('Connection error to verification server');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleVerify(internId);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 md:p-8 animate-fade-in font-sans">
      
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Main Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 items-center justify-center shadow-lg shadow-blue-500/20">
            <Award className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              Certificate Generation Studio
            </h1>
            <p className="text-xs uppercase font-extrabold tracking-widest text-blue-600 dark:text-blue-400 mt-0.5">
              Credential Verification Portal
            </p>
          </div>
        </div>

        {/* Search / Lookup Box */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Enter Intern ID (e.g. 2001)"
                value={internId}
                onChange={(e) => setInternId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-semibold text-sm px-6 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-md shadow-blue-500/10"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        {loading && (
          <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Verifying credential signature...</p>
          </div>
        )}

        {/* Verified Panel */}
        {searched && !loading && verifiedData && (
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 dark:border-emerald-500/20 relative overflow-hidden shadow-xl animate-slide-up">
            
            {/* Corner Verified Tag */}
            <div className="absolute top-0 right-0 bg-emerald-500 text-white py-1 px-4 text-[10px] font-black uppercase tracking-widest rounded-bl-xl flex items-center gap-1 shadow">
              <Check className="w-3.5 h-3.5" />
              Verified
            </div>

            <div className="space-y-6">
              <div className="flex gap-3 items-center border-b border-slate-100 dark:border-slate-800/80 pb-4">
                <div className="w-11 h-11 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-md font-extrabold text-slate-800 dark:text-white">
                    Verified Credential Found
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mt-0.5">
                    Certificate Generation Studio Registry Record
                  </p>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                
                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                  <User className="w-5 h-5 text-slate-450 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider">Intern Name</span>
                    <p className="font-bold text-slate-800 dark:text-white mt-0.5">{verifiedData.fullName}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                  <Award className="w-5 h-5 text-slate-450 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider">Credential ID</span>
                    <p className="font-bold text-slate-800 dark:text-white mt-0.5">
                      {verifiedData.documentType === 'offer_letter' ? 'INTERN' : 'CERT'}-{verifiedData.internId}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-slate-450 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider">Position & Dept</span>
                    <p className="font-bold text-slate-800 dark:text-white mt-0.5">{verifiedData.role}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{verifiedData.department || 'N/A'}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-slate-450 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-extrabold tracking-wider">Internship Details</span>
                    <p className="font-bold text-slate-800 dark:text-white mt-0.5">Duration: {verifiedData.duration}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-550">Issue Date: {verifiedData.documentDate}</p>
                  </div>
                </div>

              </div>

              {/* Status and Company Footer */}
              <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 dark:text-slate-450 text-center md:text-left">
                  Issued by: <strong>{verifiedData.companyName}</strong> on {new Date(verifiedData.verificationDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Registry Status:</span>
                  <span className="px-3 py-1 bg-emerald-500 text-white font-extrabold rounded-full uppercase tracking-wider text-[9px]">
                    {verifiedData.status}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Invalid Panel */}
        {searched && !loading && errorMsg && (
          <div className="glass-panel p-6 rounded-2xl border border-rose-500/20 text-center space-y-4 shadow-xl animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-md font-bold text-slate-800 dark:text-white">
                Credential Verification Failed
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                {errorMsg}
              </p>
              <p className="text-xs text-slate-450 dark:text-slate-550 mt-1 max-w-md mx-auto">
                Please double-check the Intern ID printed on your document. If you believe this is a mistake, contact company support.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
