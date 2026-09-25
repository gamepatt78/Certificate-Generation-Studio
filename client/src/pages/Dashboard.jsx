import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Search, Download, Edit3, ArrowRight, RefreshCw, FileText, Award, Calendar, Users, Eye, HelpCircle } from 'lucide-react';

export default function Dashboard({ setActiveTab, setEditingRecord }) {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    offerLetters: 0,
    certificates: 0,
    active: 0,
    nextInternId: 2001,
  });
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [docTypeFilter, setDocTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounced search query
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchRecords();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, docTypeFilter, statusFilter, page]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/records/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        document_type: docTypeFilter,
        status: statusFilter,
        page: String(page),
        limit: '10'
      });

      const response = await fetch(`http://localhost:5000/api/records?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
        setTotalPages(Math.ceil(data.total / data.limit));
      } else {
        toast.error('Failed to load records');
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      toast.error('Connection error to backend');
    } finally {
      setLoading(false);
    }
  };



  const handleEdit = (record) => {
    setEditingRecord(record);
    if (record.document_type === 'offer_letter') {
      setActiveTab('generate-offer');
    } else {
      setActiveTab('generate-cert');
    }
  };

  const handleVerifyView = (record) => {
    // Open verification portal in a new tab
    window.open(`/verify/${record.intern_id}`, '_blank');
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of internship records, system metrics, and document search.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setEditingRecord(null);
              setActiveTab('generate-offer');
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            New Offer Letter
          </button>
          <button
            onClick={() => {
              setEditingRecord(null);
              setActiveTab('generate-cert');
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-md shadow-indigo-500/10 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            New Certificate
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Total Generated</p>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{stats.total}</h3>
          </div>
        </div>

        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Active Interns</p>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{stats.active}</h3>
          </div>
        </div>

        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Certificates</p>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{stats.certificates}</h3>
          </div>
        </div>

        <div className="glass-card p-3 rounded-xl flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Offer Letters</p>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{stats.offerLetters}</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3 rounded-xl flex flex-col md:flex-row items-center gap-3 justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, Name, Role, Department..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <select
            value={docTypeFilter}
            onChange={(e) => { setDocTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-600 dark:text-slate-300"
          >
            <option value="">All Document Types</option>
            <option value="offer_letter">Offer Letters</option>
            <option value="certificate">Certificates</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-600 dark:text-slate-300"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Revoked">Revoked</option>
          </select>

          <button
            onClick={() => {
              setSearch('');
              setDocTypeFilter('');
              setStatusFilter('');
              setPage(1);
              fetchRecords();
              fetchStats();
              toast.success('Filters cleared');
            }}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 cursor-pointer"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-panel rounded-xl overflow-hidden shadow border border-slate-200/50 dark:border-slate-800/40">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Intern ID</th>
                <th className="py-2.5 px-4">Name</th>
                <th className="py-2.5 px-4">Role & Dept</th>
                <th className="py-2.5 px-4">Type</th>
                <th className="py-2.5 px-4">Document Date</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-[13px]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex justify-center items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      Loading records...
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400 dark:text-slate-500">
                    No documents found. Try adjusting your search query or generate a new document!
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="py-2 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {record.document_type === 'offer_letter' ? 'INTERN' : 'CERT'}-{record.intern_id}
                    </td>
                    <td className="py-2 px-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {record.full_name}
                    </td>
                    <td className="py-2 px-4">
                      <div className="font-medium text-slate-700 dark:text-slate-300">{record.role}</div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">{record.department || 'N/A'}</div>
                    </td>
                    <td className="py-2 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                        record.document_type === 'offer_letter'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      }`}>
                        {record.document_type === 'offer_letter' ? (
                          <>
                            <FileText className="w-3 h-3" />
                            Offer Letter
                          </>
                        ) : (
                          <>
                            <Award className="w-3 h-3" />
                            Certificate
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {record.document_date}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                        record.status === 'Active'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : record.status === 'Completed'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        {record.document_type === 'certificate' && (
                          <button
                            onClick={() => handleVerifyView(record)}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                            title="Verify Authenticity"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(record)}
                          className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-blue-600 dark:hover:text-slate-200 cursor-pointer"
                          title="Edit & Regenerate"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {record.offer_letter_url && (
                          <button
                            onClick={() => window.open(record.offer_letter_url, '_blank')}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-emerald-600 dark:hover:text-slate-200 cursor-pointer"
                            title="View/Download Offer Letter"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                        {record.certificate_url && (
                          <button
                            onClick={() => window.open(record.certificate_url, '_blank')}
                            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-slate-200 cursor-pointer"
                            title="View/Download Certificate"
                          >
                            <Award className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
