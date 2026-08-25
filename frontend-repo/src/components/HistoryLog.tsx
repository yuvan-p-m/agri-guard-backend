import React, { useState } from 'react';
import { 
  History, 
  Search, 
  ThumbsUp, 
  ThumbsDown, 
  CheckCircle2, 
  Sparkles,
  FileCheck,
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Language, HistoryRecord } from '../types';
import { translations } from '../data/translations';

interface HistoryLogProps {
  language: Language;
  history: HistoryRecord[];
  onUpdateFeedback: (recordId: string, feedback: 'worked' | 'not_worked') => void;
  onSelectHistoryItem: (record: HistoryRecord) => void;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({
  language,
  history,
  onUpdateFeedback,
  onSelectHistoryItem,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Resolved' | 'In Treatment'>('all');
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);

  const t = translations[language];

  const handleFeedback = (e: React.MouseEvent, recordId: string, feedback: 'worked' | 'not_worked') => {
    e.stopPropagation(); // prevent card click
    onUpdateFeedback(recordId, feedback);
    setActiveFeedbackId(recordId);

    if (feedback === 'worked') {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#479556', '#2c6037', '#fbbf24']
      });
    }

    setTimeout(() => {
      setActiveFeedbackId(null);
    }, 4000);
  };

  const filteredHistory = history.filter((rec) => {
    const matchesSearch = 
      rec.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.diseaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.date.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || rec.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-agri-200/80">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-agri-100 text-agri-800">
            <History className="w-5 h-5 text-agri-700" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {t.historyTitle}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {t.historySubtitle}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === 'all' ? 'bg-white text-agri-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            {t.filterAll}
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('Resolved')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === 'Resolved' ? 'bg-white text-agri-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            {t.filterResolved}
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('In Treatment')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              filterStatus === 'In Treatment' ? 'bg-white text-agri-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            {t.filterInTreatment}
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mt-4 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.searchHistoryPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-agri-600 focus:ring-1 focus:ring-agri-600 bg-slate-50/60 font-medium"
        />
      </div>

      {/* History Items List */}
      <div className="mt-5 space-y-3.5">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            {t.noHistoryFound}
          </div>
        ) : (
          filteredHistory.map((record) => (
            <div
              key={record.id}
              onClick={() => onSelectHistoryItem(record)}
              className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-agri-400 hover:shadow-md transition-all cursor-pointer group"
            >
              {/* Record Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-agri-100 overflow-hidden border border-agri-300 shrink-0">
                    <img 
                      src={record.imageThumbnail} 
                      alt={record.crop} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900">
                        {record.crop}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        record.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}>
                        {record.status}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-agri-800 mt-0.5">
                      {record.diseaseName}
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {record.date}
                      </span>
                      <span>• Area: {record.fieldArea}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-[11px] font-bold text-agri-700 bg-agri-50 px-2.5 py-1 rounded-md border border-agri-200">
                    {record.confidenceScore}% AI Confidence
                  </span>
                  <div className="px-3 py-1.5 rounded-xl bg-agri-700 text-white text-xs font-bold flex items-center gap-1 group-hover:bg-agri-800 transition-colors shadow-2xs">
                    <span>{t.reReferenceAdvice}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Feedback Learning Loop UI */}
              <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-agri-600" />
                  <span>{t.feedbackPrompt}</span>
                </p>

                {record.feedback ? (
                  <div className="flex items-center gap-2 bg-agri-50 px-3 py-1.5 rounded-xl border border-agri-200 text-xs">
                    <span className="font-bold text-agri-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-agri-600" />
                      {record.feedback === 'worked' ? t.treatmentWorked : t.treatmentFailed}
                    </span>
                    <span className="text-[10px] text-agri-700 font-semibold">
                      (Model Reinforced ⚡)
                    </span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleFeedback(e, record.id, 'worked')}
                      className="py-1.5 px-3 rounded-xl text-xs font-bold bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 transition-all flex items-center gap-1 shadow-2xs hover:scale-105"
                    >
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.treatmentWorked}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleFeedback(e, record.id, 'not_worked')}
                      className="py-1.5 px-3 rounded-xl text-xs font-bold bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 transition-all flex items-center gap-1 shadow-2xs hover:scale-105"
                    >
                      <ThumbsDown className="w-3.5 h-3.5 text-rose-600" />
                      <span>{t.treatmentFailed}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Animated Confirmation on Feedback submit */}
              {activeFeedbackId === record.id && (
                <p className="text-[11px] font-bold text-emerald-800 mt-2 bg-emerald-100/90 p-2 rounded-lg border border-emerald-300 animate-fade-in text-center">
                  {t.feedbackThankYou}
                </p>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
};
