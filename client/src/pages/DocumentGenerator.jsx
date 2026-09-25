import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../context/ToastContext';
import { FileText, Download, Save, RefreshCw, AlertTriangle, Eye, ArrowLeft } from 'lucide-react';

// Zod schemas for validation
const unifiedSchema = z.zod ? z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters'),
  department: z.string().min(1, 'Department is required'),
  startDate: z.string().min(1, 'Start Date is required'),
  duration: z.string().min(1, 'Duration is required'),
  documentDate: z.string().min(1, 'Document Date is required'),
  internshipType: z.enum(['Paid', 'Unpaid']),
  performanceGrade: z.string().min(1, 'Performance Grade is required'),
  achievementDescription: z.string().min(10, 'Achievement Description must be at least 10 characters'),
  companyName: z.string().default('Ston Technology'),
  additionalNotes: z.string().optional(),
}) : null;

export default function DocumentGenerator({ type, editingRecord, clearEditing, setActiveTab }) {
  // If zod is not defined (since we imported * as z), let's fallback to creating them manually:
  const schema = unifiedSchema || z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    role: z.string().min(2, 'Role must be at least 2 characters'),
    department: z.string().min(1, 'Department is required'),
    startDate: z.string().min(1, 'Start date is required'),
    duration: z.string().min(1, 'Duration is required'),
    documentDate: z.string().min(1, 'Date is required'),
    internshipType: z.enum(['Paid', 'Unpaid']),
    performanceGrade: z.string().min(1, 'Performance grade is required'),
    achievementDescription: z.string().min(10, 'Achievement description must be at least 10 characters'),
    companyName: z.string().default('Ston Technology'),
    additionalNotes: z.string().optional(),
  });

  const toast = useToast();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);

  // Helper to format date professionally (e.g. 2026-06-29 -> June 29, 2026)
  const formatDateProfessionally = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Prefill default documentDate as today in local YYYY-MM-DD
  const getTodayString = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Setup React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid }
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      companyName: 'Ston Technology',
      internshipType: 'Unpaid',
      documentDate: getTodayString(),
      startDate: getTodayString(),
      performanceGrade: 'Outstanding',
    }
  });

  const watchedValues = watch();

  // Load values if we are editing an existing record
  useEffect(() => {
    if (editingRecord) {
      const details = JSON.parse(editingRecord.additional_details || '{}');
      if (editingRecord.document_type === type) {
        reset({
          fullName: editingRecord.full_name,
          role: editingRecord.role,
          department: editingRecord.department || '',
          duration: editingRecord.duration,
          documentDate: editingRecord.document_date,
          companyName: 'Ston Technology',
          status: editingRecord.status,
          // Unified fields
          startDate: details.startDate || getTodayString(),
          internshipType: details.internshipType || 'Unpaid',
          additionalNotes: details.additionalNotes || '',
          performanceGrade: details.performanceGrade || 'Outstanding',
          achievementDescription: details.achievementDescription || '',
        });
      }
    } else {
      reset({
        companyName: 'Ston Technology',
        internshipType: 'Unpaid',
        documentDate: getTodayString(),
        startDate: getTodayString(),
        performanceGrade: 'Outstanding',
        fullName: '',
        role: '',
        department: '',
        duration: '',
        additionalNotes: '',
        achievementDescription: '',
      });
    }
  }, [editingRecord, type, reset]);

  // Debounced live preview generation
  useEffect(() => {
    if (!watchedValues.fullName || !watchedValues.role || !watchedValues.duration) {
      setPreviewUrl(null);
      return;
    }

    const timer = setTimeout(() => {
      generateLivePreview();
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [
    watchedValues.fullName,
    watchedValues.role,
    watchedValues.department,
    watchedValues.startDate,
    watchedValues.duration,
    watchedValues.documentDate,
    watchedValues.internshipType,
    watchedValues.performanceGrade,
    watchedValues.achievementDescription
  ]);

  const generateLivePreview = async () => {
    setPreviewLoading(true);
    try {
      const payload = {
        ...watchedValues,
        documentType: type,
        // Format dates professionally for drawing
        startDate: formatDateProfessionally(watchedValues.startDate),
        documentDate: formatDateProfessionally(watchedValues.documentDate)
      };

      const response = await fetch('http://localhost:5000/api/generate/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const blob = await response.blob();
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(URL.createObjectURL(blob));
      }
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setPreviewLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setPendingFormData(data);
    
    // Check duplicate if not editing and duplicate bypass not enabled
    if (!editingRecord) {
      try {
        const params = new URLSearchParams({ name: data.fullName, role: data.role });
        const res = await fetch(`http://localhost:5000/api/records/check-duplicate?${params.toString()}`);
        const dupResult = await res.json();
        
        if (dupResult.duplicate) {
          setShowDuplicateModal(true);
          return;
        }
      } catch (err) {
        console.error('Duplicate check failed:', err);
      }
    }

    // Proceed to generate
    await saveRecordAndGenerate(data, false);
  };

  const saveRecordAndGenerate = async (data, bypassDuplicate = false) => {
    setSubmitLoading(true);
    try {
      const payload = {
        ...data,
        documentType: type,
        // Format dates professionally for drawing
        startDate: formatDateProfessionally(data.startDate),
        documentDate: formatDateProfessionally(data.documentDate),
        bypassDuplicate
      };

      let response;
      if (editingRecord) {
        // Regenerating existing record
        response = await fetch(`http://localhost:5000/api/records/${editingRecord.id}/regenerate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // Generating new record
        response = await fetch('http://localhost:5000/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      const result = await response.json();

      if (result.success) {
        if (editingRecord) {
          toast.success('Record regenerated successfully!');
          // Trigger download for regenerated record
          window.open(`http://localhost:5000/api/records/${result.recordId}/download`, '_blank');
        } else {
          toast.success(
            <span className="flex flex-col gap-1">
              <span className="font-bold">Records created and PDFs generated!</span>
              <span className="flex gap-3 text-xs mt-1">
                {result.offerUrl && (
                  <a href={`http://localhost:5000${result.offerUrl}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                    View Offer Letter
                  </a>
                )}
                {result.certUrl && (
                  <a href={`http://localhost:5000${result.certUrl}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                    View Certificate
                  </a>
                )}
              </span>
            </span>,
            8000 // duration 8s to give user time to click
          );
        }
        
        if (editingRecord) {
          clearEditing();
        }
        setActiveTab('dashboard');
      } else {
        toast.error(result.error || 'Failed to generate document');
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Connection error, failed to submit form');
    } finally {
      setSubmitLoading(false);
      setShowDuplicateModal(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {editingRecord && (
            <button
              onClick={() => { clearEditing(); setActiveTab('dashboard'); }}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white font-sans tracking-tight">
              {editingRecord ? 'Edit & Regenerate' : 'Generate'} {type === 'offer_letter' ? 'Internship Offer Letter' : 'Internship Completion Certificate'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {editingRecord 
                ? `Regenerate existing document keeping the same Intern ID (${editingRecord.document_type === 'offer_letter' ? 'INTERN' : 'CERT'}-${editingRecord.intern_id})`
                : 'Fill out the form below. The PDF live preview will render side-by-side.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Form Container (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-4 rounded-2xl space-y-4 border border-slate-200/50 dark:border-slate-800/40">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Full Name of Intern
              </label>
              <input
                type="text"
                placeholder="e.g. Aaryan Koirala"
                {...register('fullName')}
                className={`w-full px-4 py-1.5 rounded-lg border bg-white dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white ${
                  errors.fullName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.fullName && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.fullName.message}</p>}
            </div>

            {/* Position / Role */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Position / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Node.js Developer Intern"
                {...register('role')}
                className={`w-full px-4 py-1.5 rounded-lg border bg-white dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white ${
                  errors.role ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.role && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.role.message}</p>}
            </div>

            {/* Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Engineering"
                {...register('department')}
                className={`w-full px-4 py-1.5 rounded-lg border bg-white dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white ${
                  errors.department ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.department && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.department.message}</p>}
            </div>

            {/* Split layout for Dates & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3 Months"
                  {...register('duration')}
                  className={`w-full px-4 py-1.5 rounded-lg border bg-white dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white ${
                    errors.duration ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                {errors.duration && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.duration.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Document Date
                </label>
                <input
                  type="date"
                  {...register('documentDate')}
                  className={`w-full px-4 py-1.5 rounded-lg border bg-white dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white ${
                    errors.documentDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                {errors.documentDate && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.documentDate.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register('startDate')}
                  className={`w-full px-4 py-1.5 rounded-lg border bg-white dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white ${
                    errors.startDate ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                {errors.startDate && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.startDate.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Type
                </label>
                <select
                  {...register('internshipType')}
                  className="w-full px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-300"
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Your monthly stipend will be INR 15,000..."
                {...register('additionalNotes')}
                className="w-full px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Performance Grade
              </label>
              <input
                type="text"
                placeholder="e.g. Outstanding / A+ / Excellent"
                {...register('performanceGrade')}
                className={`w-full px-4 py-1.5 rounded-lg border bg-white dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white ${
                  errors.performanceGrade ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.performanceGrade && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.performanceGrade.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                Achievement Description
              </label>
              <textarea
                rows="3"
                placeholder="e.g. for their outstanding contribution to designing and deploying the core backend services, and demonstrating exceptional problem-solving skills..."
                {...register('achievementDescription')}
                className={`w-full px-4 py-1.5 rounded-lg border bg-white dark:bg-slate-950/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white resize-none ${
                  errors.achievementDescription ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-200 dark:border-slate-800'
                }`}
              />
              {errors.achievementDescription && <p className="text-rose-500 text-xs mt-1.5 font-medium">{errors.achievementDescription.message}</p>}
            </div>

            <div className="pt-1 border-t border-slate-100 dark:border-slate-800/80 flex gap-3">
              <button
                type="submit"
                disabled={!isValid || submitLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-40 text-white font-semibold text-sm py-2 px-4 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer transition-all"
              >
                {submitLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {editingRecord ? 'Save & Regenerate' : 'Save Record & Export'}
                  </>
                )}
              </button>

              {editingRecord && (
                <button
                  type="button"
                  onClick={() => { clearEditing(); setActiveTab('dashboard'); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Live Preview Container (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col h-[650px] relative">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-white text-xs font-semibold shadow">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            Live Preview
          </div>

          <div className="w-full h-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-inner flex items-center justify-center relative">
            {previewLoading && (
              <div className="absolute inset-0 bg-slate-900/10 dark:bg-slate-900/30 backdrop-blur-xs z-20 flex flex-col items-center justify-center gap-2.5">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-800/80 px-3 py-1 rounded-full shadow">
                  Rendering updated preview...
                </span>
              </div>
            )}

            {previewUrl ? (
              <iframe
                src={`${previewUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none"
                title="PDF Live Preview"
              />
            ) : (
              <div className="text-center p-8 max-w-sm">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                  <FileText className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Preview Available</h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Fill in the Name, Role, and Duration fields to display a live, vector-quality PDF preview.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Duplicate Record Warning Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="glass-panel max-w-md w-full p-4 rounded-2xl border border-rose-500/20 text-left shadow-2xl animate-fade-in">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white font-sans">
                  Duplicate Intern Warning
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  An intern named <strong className="text-slate-800 dark:text-slate-200">"{pendingFormData?.fullName}"</strong> with the role <strong className="text-slate-800 dark:text-slate-200">"{pendingFormData?.role}"</strong> already exists in the database.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Are you sure you want to generate another document for this combination? This will assign a new Intern ID.
                </p>
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                No, Cancel
              </button>
              <button
                onClick={() => saveRecordAndGenerate(pendingFormData, true)}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-md shadow-rose-500/10 cursor-pointer"
              >
                Yes, Generate Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
