import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export default function UploadZone({ onUploadSuccess, onError, isLoading, setIsLoading }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSelectFile = (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endswith?.(".xlsx") && !file.name.toLowerCase().endsWith(".xlsx")) {
      onError("Invalid file format. Please upload an Excel '.xlsx' file.");
      return;
    }
    setSelectedFile(file);
    onError(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const processUpload = async (fileToUpload) => {
    const file = fileToUpload || selectedFile;
    if (!file) return;

    setIsLoading(true);
    onError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/dashboard/upload", {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || "Failed to process Excel file.");
      }

      if (resData.success && resData.data) {
        onUploadSuccess(resData.data);
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err) {
      onError(err.message || "An unexpected error occurred during file upload.");
    } finally {
      setIsLoading(false);
    }
  };

  // Demo sample loader function
  const loadSampleData = async () => {
    setIsLoading(true);
    onError(null);
    try {
      // Fetch sample_sales.xlsx from backend or root endpoint
      const response = await fetch("/sample_sales.xlsx");
      if (!response.ok) {
        throw new Error("Could not load sample dataset file.");
      }
      const blob = await response.blob();
      const sampleFile = new File([blob], "sample_sales.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      await processUpload(sampleFile);
    } catch (err) {
      // Fallback: try uploading manually or notify user
      onError("Sample file fetch failed. Please select an Excel file from your computer.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Hero section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3.5 py-1.5 rounded-full text-xs font-medium mb-4">
          <Sparkles className="h-3.5 w-3.5 text-blue-400" />
          <span>Phase 01 — Task 01: Direct Excel to Dashboard</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Upload Excel & Generate Sales Dashboard
        </h2>
        <p className="text-slate-400 text-base max-w-xl mx-auto">
          Upload your sales dataset in <code className="text-blue-400 font-semibold bg-slate-800 px-1.5 py-0.5 rounded">.xlsx</code> format to generate an instant executive dashboard.
        </p>
      </div>

      {/* Main Drag & Drop Card */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all bg-slate-900/60 backdrop-blur-sm ${
          dragActive
            ? 'border-blue-500 bg-blue-500/5 scale-[1.01]'
            : selectedFile
            ? 'border-emerald-500/60 bg-emerald-500/5'
            : 'border-slate-700/80 hover:border-slate-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-white mb-1">Parsing Excel & Aggregating Data...</h3>
            <p className="text-sm text-slate-400">Extracting KPIs, trends, and category performance</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{selectedFile.name}</h3>
            <p className="text-sm text-slate-400 mb-6">
              {(selectedFile.size / 1024).toFixed(1)} KB • Ready for dashboard generation
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Change File
              </button>
              <button
                onClick={() => processUpload()}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
              >
                <span>Generate Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-4 text-blue-400">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Drag & Drop your Excel file here
            </h3>
            <p className="text-sm text-slate-400 max-w-sm mb-6">
              Supports standard sales Excel files (<code className="text-blue-400">.xlsx</code>). Automatically parses Orders, Sales, Profit, Products & Regions.
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-6 py-2.5 rounded-xl border border-slate-700 transition-all cursor-pointer shadow-sm"
            >
              <Upload className="h-4 w-4 text-blue-400" />
              <span>Browse File (.xlsx)</span>
            </button>
          </div>
        )}
      </div>

      {/* Demo sample trigger option */}
      {!isLoading && (
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-slate-400 text-center sm:text-left">
            Don't have a sales Excel file ready?
          </div>
          <button
            onClick={loadSampleData}
            className="flex items-center space-x-2 bg-slate-800/60 hover:bg-slate-800 text-blue-400 hover:text-blue-300 border border-slate-700/60 px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span>Load Demo Sales Dataset</span>
          </button>
        </div>
      )}
    </div>
  );
}
