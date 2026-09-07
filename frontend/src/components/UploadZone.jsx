import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, ArrowRight, Loader2, Sparkles, CheckCircle2, FileUp } from 'lucide-react';

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
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
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

  const loadSampleData = async () => {
    setIsLoading(true);
    onError(null);
    try {
      const response = await fetch("/sample_sales.xlsx");
      if (!response.ok) {
        throw new Error("Could not load sample dataset file.");
      }
      const blob = await response.blob();
      const sampleFile = new File([blob], "sample_sales.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      await processUpload(sampleFile);
    } catch (err) {
      onError("Sample file fetch failed. Please select an Excel file from your computer.");
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Workspace Header */}
      <div className="mb-6 border-b border-[var(--border-color)] pb-4">
        <div className="flex items-center space-x-2 text-xs font-semibold text-blue-500 mb-1">
          <FileUp className="h-3.5 w-3.5" />
          <span>DATA CONNECTOR</span>
        </div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">
          Import Excel Sales Dataset
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Select an <code className="text-blue-500 font-mono">.xlsx</code> file to profile columns and generate report analytics.
        </p>
      </div>

      {/* Main Drag & Drop Connector Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all bg-[var(--bg-surface)] ${
          dragActive
            ? 'border-blue-500 bg-blue-500/5'
            : selectedFile
            ? 'border-emerald-500/60 bg-emerald-500/5'
            : 'border-[var(--border-color)] hover:border-blue-500/60'
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
          <div className="flex flex-col items-center justify-center py-4">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-3" />
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">Profiling Dataset & Aggregating Metrics...</h3>
            <p className="text-xs text-[var(--text-muted)]">Extracting semantic roles, KPIs, and chart data</p>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center justify-center">
            <div className="h-12 w-12 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center justify-center mb-3 text-emerald-500">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-0.5">{selectedFile.name}</h3>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              {(selectedFile.size / 1024).toFixed(1)} KB • Valid Excel Worksheet
            </p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                Change File
              </button>
              <button
                onClick={() => processUpload()}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-md text-xs shadow-sm transition-all cursor-pointer"
              >
                <span>Process & Profile Dataset</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="h-12 w-12 bg-[var(--bg-app)] border border-[var(--border-color)] rounded-lg flex items-center justify-center mb-3 text-blue-500">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
              Drag & Drop your Excel file here
            </h3>
            <p className="text-xs text-[var(--text-secondary)] max-w-sm mb-5">
              Supports standard sales datasets (<code className="text-blue-500 font-mono">.xlsx</code>).
            </p>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-md text-xs transition-all cursor-pointer shadow-sm"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Browse File (.xlsx)</span>
            </button>
          </div>
        )}
      </div>

      {/* Demo sample trigger option */}
      {!isLoading && (
        <div className="mt-6 pt-4 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
          <span className="text-[var(--text-muted)]">Don't have a dataset ready?</span>
          <button
            onClick={loadSampleData}
            className="flex items-center space-x-1.5 text-blue-500 hover:text-blue-600 font-medium transition-all cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Load Demo Sales Dataset</span>
          </button>
        </div>
      )}
    </div>
  );
}
