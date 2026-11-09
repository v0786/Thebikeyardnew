import React, { useState, useMemo } from 'react';
import { dealershipStore } from '../services/dealershipStore';
import { CSV_SAMPLE_TEMPLATE, parseBikesCsv } from '../services/marketBikesDatabase';
import { formatInr } from '../lib/currency';
import {
  Upload,
  FileSpreadsheet,
  Download,
  Check,
  AlertTriangle,
  X,
  Database,
  Sparkles,
  FileText,
  Eye,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface CsvUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffName?: string;
}

export const CsvUploadModal: React.FC<CsvUploadModalProps> = ({
  isOpen,
  onClose,
  staffName = 'Showroom Manager',
}) => {
  const [csvContent, setCsvContent] = useState<string>(CSV_SAMPLE_TEMPLATE);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [importMode, setImportMode] = useState<'APPEND' | 'REPLACE'>('APPEND');
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live parse bikes from current CSV text
  const parseResult = useMemo(() => {
    return parseBikesCsv(csvContent);
  }, [csvContent]);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setResultMessage({
        type: 'error',
        text: 'Please select a valid .csv file.',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setCsvContent(text);
        setActiveTab('preview');
        setResultMessage(null);
      }
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcessCsv = () => {
    setResultMessage(null);
    const res = dealershipStore.importBikesFromCsv(csvContent, {
      staffName,
      mode: importMode,
    });

    if (res.success) {
      setResultMessage({
        type: 'success',
        text: `Successfully loaded ${res.count} motorcycle models (${importMode === 'REPLACE' ? 'Catalogue Replaced' : 'Added to Showroom'}). Auto-calculated MH-04 Thane RTO tax & insurance!`,
      });
      setTimeout(() => {
        onClose();
      }, 2000);
    } else {
      setResultMessage({
        type: 'error',
        text: res.errors.join(' ') || 'Failed to parse CSV file. Ensure valid headers and numbers.',
      });
    }
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_SAMPLE_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'the-bike-yard-motorcycle-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadSampleData = () => {
    setCsvContent(CSV_SAMPLE_TEMPLATE);
    setActiveTab('preview');
    setResultMessage(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border border-slate-800 bg-[#0B0F0D] shadow-2xl p-4 sm:p-7 space-y-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs uppercase font-extrabold tracking-wider text-amber-500">
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                Showroom Inventory Ingestion
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">
                Automated Thane MH-04 On-Road Engine
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
              Upload CSV to Load New Motorcycles
            </h2>
            <p className="text-xs text-slate-400">
              Bulk import brand new or updated motorcycles from a spreadsheet. The system automatically computes 11% MH RTO tax, 5-year insurance, and 4 multi-tier variants (Base, Base Premium, Mid, Top).
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close CSV Upload"
            className="rounded-xl border border-slate-700 bg-slate-900 p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers + Template download */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'upload'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File or Paste</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'preview'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Parsed Preview ({parseResult.importedCount} bikes)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSampleData}
              className="text-xs text-slate-300 hover:text-amber-400 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 transition-colors"
            >
              Load Sample CSV
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 font-medium transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* Status notification */}
        {resultMessage && (
          <div
            className={`rounded-2xl border p-4 text-xs flex items-center gap-3 ${
              resultMessage.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
                : 'border-rose-500/40 bg-rose-950/60 text-rose-300'
            }`}
          >
            {resultMessage.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{resultMessage.text}</span>
          </div>
        )}

        {/* Tab 1: Upload or Paste */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {/* Drag & Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${
                dragActive
                  ? 'border-amber-400 bg-amber-500/10 scale-[1.01]'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
              }`}
            >
              <input
                type="file"
                accept=".csv,text/csv,application/vnd.ms-excel"
                onChange={handleFileInputChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                id="csv-file-upload-input"
              />
              <div className="space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-bold text-white">
                  Drop your motorcycle CSV file here, or{' '}
                  <span className="text-amber-400 underline">browse files</span>
                </div>
                <p className="text-xs text-slate-400">
                  Supports comma-separated values (.csv) with headers: Brand, Model, Variant, ExShowroomINR, Category, EngineCC, PowerBHP, TorqueNM, MileageKMPL
                </p>
              </div>
            </div>

            {/* Direct CSV Textarea Editor */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5 text-slate-400">
                <span>Or paste raw CSV contents directly:</span>
                <span className="font-mono text-[11px] text-amber-400">
                  {parseResult.importedCount} valid bikes detected
                </span>
              </div>
              <textarea
                rows={7}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="Brand,Model,Variant,ExShowroomINR,Category,EngineCC,PowerBHP,TorqueNM,MileageKMPL..."
                className="w-full font-mono text-xs rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200 focus:border-amber-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Live Parsed Preview Table */}
        {activeTab === 'preview' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-semibold">
                Parsed Motorcycle Models ({parseResult.importedCount} ready to load):
              </span>
              <button
                onClick={() => setActiveTab('upload')}
                className="text-xs text-amber-400 hover:underline"
              >
                Edit CSV Data
              </button>
            </div>

            {parseResult.bikes.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8 text-center text-slate-400 text-xs">
                No valid bikes parsed from CSV. Please check headers and price values.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 divide-y divide-slate-800/80">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1F2A1F]/60 text-slate-300 font-semibold sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Brand & Model</th>
                      <th className="p-2.5">Variant</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5">Engine / Power</th>
                      <th className="p-2.5 text-right">Ex-Showroom</th>
                      <th className="p-2.5 text-right">On-Road Thane</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {parseResult.bikes.map((bike, idx) => {
                      const onRoad =
                        bike.exShowroomPaise +
                        bike.rtoTaxPaise +
                        bike.insurancePaise +
                        bike.handlingPaise;
                      return (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="p-2.5 font-bold text-white">
                            {bike.brand} {bike.model}
                          </td>
                          <td className="p-2.5 text-slate-400">{bike.variant}</td>
                          <td className="p-2.5">{bike.category}</td>
                          <td className="p-2.5 tabular-nums">
                            {bike.engineCc} cc · {bike.powerBhp} bhp
                          </td>
                          <td className="p-2.5 text-right font-medium tabular-nums">
                            {formatInr(bike.exShowroomPaise)}
                          </td>
                          <td className="p-2.5 text-right font-bold text-amber-400 tabular-nums">
                            {formatInr(onRoad)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Ingestion Options & Action Footer */}
        <div className="pt-2 border-t border-slate-800 space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1F2A1F]/30 p-3 rounded-2xl border border-slate-800">
            <div>
              <div className="text-xs font-bold text-white">Import Strategy:</div>
              <div className="text-[11px] text-slate-400">
                Choose whether new bikes should be appended or replace current showroom stock.
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setImportMode('APPEND')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  importMode === 'APPEND'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Append to Catalogue</span>
              </button>
              <button
                type="button"
                onClick={() => setImportMode('REPLACE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                  importMode === 'REPLACE'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Replace Showroom</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-[11px] text-slate-400 text-center sm:text-left">
              Imported motorcycles immediately appear in the digital showroom, comparison matrix, and EMI calculator.
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={parseResult.importedCount === 0}
                onClick={handleProcessCsv}
                className="w-1/2 sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 text-xs font-bold text-slate-950 shadow-md hover:bg-amber-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Load {parseResult.importedCount} Bikes into Showroom</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
