import React, { useState } from 'react';
import {
  PROJECT_CODE_FILES,
  CodeFile,
  downloadProjectZip,
} from '../lib/projectZipGenerator';
import { Download, X, Copy, Check, FileCode, Folder, Database, Shield, Cog, FileCheck } from 'lucide-react';

interface SourceCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourceCodeViewerModal: React.FC<SourceCodeViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<CodeFile>(PROJECT_CODE_FILES[0]!);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      await downloadProjectZip('the-bike-yard-next16-prisma-full-source.zip');
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-5xl h-[88vh] rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                Production Deliverable
              </span>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-400">
                Next.js 16 + Prisma 6.12 + PostgreSQL
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              The Bike Yard Source Code Package (.ZIP)
            </h2>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generating ZIP...' : 'Download Full Codebase (.ZIP)'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-6 py-2 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Complete project ZIP downloaded! Contains Next.js 16 app, ~50 model Prisma schema, migrations, tests & config.</span>
          </div>
        )}

        {/* Body Split */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left: File Tree Browser */}
          <div className="w-full md:w-72 border-r border-slate-800 bg-slate-950/70 p-3 overflow-y-auto space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
              Project Structure
            </div>

            {PROJECT_CODE_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-left transition-colors ${
                  selectedFile.path === file.path
                    ? 'bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{file.path}</span>
              </button>
            ))}
          </div>

          {/* Right: Code Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
            {/* File info bar */}
            <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 px-4 py-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="font-mono text-amber-400 font-semibold">{selectedFile.path}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400 text-[11px]">{selectedFile.description}</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-md bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-auto p-4 font-mono text-xs text-slate-200 bg-slate-950 selection:bg-amber-500/20">
              <pre className="whitespace-pre">{selectedFile.content}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
