import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Mic, 
  MicOff, 
  Camera, 
  Sparkles, 
  ImageIcon, 
  Check, 
  AlertCircle,
  Sliders,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import type { Language, DiseaseDiagnosis } from '../types';
import { translations } from '../data/translations';
import { cropDiseases } from '../data/cropDiseases';

interface DiagnosticHubProps {
  language: Language;
  onAnalyze: (diagnosis: DiseaseDiagnosis, customImage?: string, symptomsText?: string) => void;
  isAnalyzing: boolean;
  selectedAcreage: number;
  onAcreageChange: (acres: number) => void;
  activeDiagnosis: DiseaseDiagnosis | null;
  isAnalyzed: boolean;
  onClearAnalysis: () => void;
}

export const DiagnosticHub: React.FC<DiagnosticHubProps> = ({
  language,
  onAnalyze,
  isAnalyzing,
  selectedAcreage,
  onAcreageChange,
  activeDiagnosis,
  isAnalyzed,
  onClearAnalysis,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'describe'>('upload');
  
  // No default pre-loaded image on page load (Clean empty dropzone state)
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [selectedCropId, setSelectedCropId] = useState<string>(cropDiseases[0].id);
  const [symptomText, setSymptomText] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  // Quick symptom chips
  const symptomTags = [
    { key: 'yellowing', label: t.symptomYellowing, text: 'Yellowing leaves and chlorosis.' },
    { key: 'spots', label: t.symptomSpots, text: 'Brown corky spots with yellow halo.' },
    { key: 'wilting', label: t.symptomWilting, text: 'Wilting and drooping during hot hours.' },
    { key: 'powder', label: t.symptomWhitePowder, text: 'White powdery fungal coating on underside.' },
    { key: 'curl', label: t.symptomLeafCurl, text: 'Curled and crinkled leaf margins with stunted growth.' },
    { key: 'rot', label: t.symptomFruitRot, text: 'Fruit rot and premature fruit dropping.' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImagePreview(url);
    }
  };

  const handleSampleCropSelect = (disease: DiseaseDiagnosis) => {
    setSelectedCropId(disease.id);
    setUploadedImagePreview(disease.sampleImage);
    if (disease.symptoms[language]?.length) {
      setSymptomText(disease.symptoms[language].join(', '));
    }
  };

  const handleAddSymptomTag = (tagText: string) => {
    setSymptomText((prev) => (prev ? `${prev} ${tagText}` : tagText));
  };

  // Realistic Voice Speech-To-Text Handler
  const handleVoiceToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;

        setIsRecording(true);

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setSymptomText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };

        recognition.onerror = () => {
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognition.start();
      } catch (err) {
        setIsRecording(false);
      }
    } else {
      setIsRecording(true);
      setTimeout(() => {
        const mockVoiceText = 
          language === 'hi' 
            ? 'पत्तियों पर भूरे रंग के धब्बे दिख रहे हैं और पत्तियां नीचे की ओर गिर रही हैं।'
            : language === 'ta'
            ? 'இலைகளில் பழுப்பு நிற புள்ளிகள் மற்றும் மஞ்சள் நிற வளையங்கள் தெரிகின்றன.'
            : 'Noticed brown spots with yellow margins on citrus leaves and light stem blemishes.';
        setSymptomText((prev) => (prev ? `${prev} ${mockVoiceText}` : mockVoiceText));
        setIsRecording(false);
      }, 2000);
    }
  };

  const handleTriggerAnalysis = () => {
    const targetDisease = cropDiseases.find((d) => d.id === selectedCropId) || cropDiseases[0];
    onAnalyze(targetDisease, uploadedImagePreview || targetDisease.sampleImage, symptomText);
  };

  const handleClearAnalysis = () => {
    setActiveTab('upload');
    setUploadedImagePreview(null);
    setSelectedCropId(cropDiseases[0].id);
    setSymptomText('');
    onClearAnalysis();
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-agri-200/80 transition-all">
      
      {/* Header of Diagnostic Hub */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-agri-100 text-agri-800">
              <Sparkles className="w-5 h-5 text-agri-700" />
            </span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {t.diagnosticHubTitle}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <p className="text-xs text-slate-500 font-medium">
              {t.diagnosticHubSubtitle}
            </p>
            {isAnalyzed && (
              <button
                type="button"
                onClick={handleClearAnalysis}
                className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-[11px] font-bold text-slate-700 hover:border-agri-400 hover:text-agri-800 transition-colors"
              >
                Clear Analysis / Scan New Crop
              </button>
            )}
          </div>
        </div>

        {/* Acreage Control Widget */}
        <div className="flex items-center gap-2 bg-agri-50 px-3.5 py-2 rounded-2xl border border-agri-200 self-start sm:self-auto shadow-2xs">
          <Sliders className="w-4 h-4 text-agri-700" />
          <span className="text-xs font-bold text-slate-700">{t.fieldSizeLabel}</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="50"
              value={selectedAcreage}
              onChange={(e) => onAcreageChange(Math.max(0.5, parseFloat(e.target.value) || 1))}
              className="w-16 px-2 py-1 text-xs font-black text-center bg-white rounded-lg border border-agri-300 text-agri-950 focus:ring-1 focus:ring-agri-600"
            />
            <span className="text-xs font-bold text-agri-800">{t.acresUnit}</span>
          </div>
        </div>
      </div>

      {/* Tabs: Upload Image vs Describe Symptoms */}
      <div className="mt-5">
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'upload'
                ? 'bg-white text-agri-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 font-bold'
            }`}
          >
            <span>{t.tabUpload}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('describe')}
            className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all ${
              activeTab === 'describe'
                ? 'bg-white text-agri-900 shadow-sm border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 font-bold'
            }`}
          >
            <span>{t.tabDescribe}</span>
          </button>
        </div>

        {/* Tab 1: Upload Image & Camera Input */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            
            {/* Hidden Inputs for File and Camera */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Drag & Drop / Preview Box */}
            <div className="relative border-2 border-dashed border-agri-300 hover:border-agri-600 rounded-3xl p-5 sm:p-6 text-center bg-agri-50/40 transition-all">
              
              {uploadedImagePreview ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden shadow-md border-2 border-agri-500 shrink-0 bg-slate-100">
                    <img
                      src={uploadedImagePreview}
                      alt="Crop Preview"
                      className="w-full h-full object-cover"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-agri-900/60 flex items-center justify-center">
                        <div className="w-full h-1.5 bg-citrus-400 animate-scanner shadow-lg shadow-citrus-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                      <Check className="w-3.5 h-3.5" /> High-Resolution Leaf Scan Ready
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-slate-900">
                      Crop: {cropDiseases.find(d => d.id === selectedCropId)?.cropName[language] || 'Custom Plant Photo'}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>{t.browseFile}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-agri-100 hover:bg-agri-200 border border-agri-300 text-xs font-bold text-agri-900 flex items-center gap-1.5 shadow-2xs"
                      >
                        <Camera className="w-3.5 h-3.5 text-agri-700" />
                        <span>{t.takePhotoCamera}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Clean Empty Dropzone State with side-by-side Upload and Camera buttons */
                <div className="py-6 space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-agri-100/80 flex items-center justify-center text-agri-700 shadow-inner">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-800">
                      {t.emptyDropzoneTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                      {t.emptyDropzoneSub}
                    </p>
                  </div>

                  {/* Dual Action Buttons: Upload & Camera */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-agri-600 text-agri-900 text-xs sm:text-sm font-extrabold shadow-sm transition-all flex items-center gap-2 hover:scale-105"
                    >
                      <Upload className="w-4 h-4 text-agri-700" />
                      <span>{t.browseFile}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="px-4 py-2.5 rounded-2xl bg-agri-700 hover:bg-agri-800 text-white text-xs sm:text-sm font-extrabold shadow-md shadow-agri-700/25 transition-all flex items-center gap-2 hover:scale-105"
                    >
                      <Camera className="w-4 h-4 text-citrus-300" />
                      <span>{t.takePhotoCamera}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pre-Loaded Sample Crops for Instant 1-Click Testing */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                {t.orSelectSample}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {cropDiseases.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => handleSampleCropSelect(d)}
                    className={`p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between text-xs ${
                      selectedCropId === d.id && uploadedImagePreview === d.sampleImage
                        ? 'border-agri-600 bg-agri-100/90 ring-2 ring-agri-600/30 shadow-sm'
                        : 'border-slate-200 hover:border-agri-300 bg-slate-50/70 hover:bg-white'
                    }`}
                  >
                    <div className="font-extrabold text-slate-900 truncate">
                      {d.cropName[language].split('/')[0]}
                    </div>
                    <div className="text-[10px] text-agri-700 font-bold truncate mt-1">
                      {d.diseaseName[language].split('(')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Describe Symptoms / Voice Input */}
        {activeTab === 'describe' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  {t.tabDescribe}
                </label>
                
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isRecording
                      ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                      : 'bg-agri-100 text-agri-800 hover:bg-agri-200 border border-agri-300'
                  }`}
                >
                  {isRecording ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>{t.stopListening}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-agri-700" />
                      <span>{t.voiceInputBtn}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Voice Listening Animation Bar */}
              {isRecording && (
                <div className="mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span>{t.listeningPrompt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1 bg-rose-500 animate-soundwave rounded-full" />
                    <span className="w-1 bg-rose-600 animate-soundwave rounded-full delay-100" />
                    <span className="w-1 bg-rose-500 animate-soundwave rounded-full delay-200" />
                    <span className="w-1 bg-rose-400 animate-soundwave rounded-full delay-300" />
                  </div>
                </div>
              )}

              <textarea
                rows={3}
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                placeholder={t.describePlaceholder}
                className="w-full p-3.5 text-xs sm:text-sm rounded-2xl border border-slate-300 focus:border-agri-600 focus:ring-1 focus:ring-agri-600 bg-slate-50/50 leading-relaxed font-medium"
              />
            </div>

            {/* Quick Symptom Chips */}
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                {t.quickSymptomTags}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {symptomTags.map((tag) => (
                  <button
                    key={tag.key}
                    type="button"
                    onClick={() => handleAddSymptomTag(tag.text)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-agri-100 text-slate-700 hover:text-agri-900 border border-slate-200 hover:border-agri-300 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <span>+</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Analyze Action Button */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            disabled={isAnalyzing || (!uploadedImagePreview && !symptomText.trim())}
            onClick={handleTriggerAnalysis}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-agri-700 via-agri-800 to-agri-900 hover:from-agri-800 hover:to-agri-950 text-white font-black text-sm sm:text-base shadow-lg shadow-agri-800/30 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-citrus-300" />
                <span>{t.analyzingText}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-citrus-300" />
                <span>{t.analyzeButton}</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
};
