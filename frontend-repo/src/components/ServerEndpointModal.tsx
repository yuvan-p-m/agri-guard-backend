import React, { useState } from 'react';
import { Server, CheckCircle2, XCircle, Loader2, X, RefreshCw, Smartphone, Laptop, Globe } from 'lucide-react';
import { getApiBaseUrl, setCustomApiEndpoint } from '../services/api';

interface ServerEndpointModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServerEndpointModal: React.FC<ServerEndpointModalProps> = ({ isOpen, onClose }) => {
  const [currentUrl, setCurrentUrl] = useState<string>(getApiBaseUrl());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async (urlToTest: string) => {
    setTestStatus('testing');
    setTestMessage('Testing connection to backend API...');
    
    const cleanUrl = urlToTest.trim().replace(/\/+$/, '');
    const healthUrl = cleanUrl.endsWith('/api/v1') 
      ? `${cleanUrl}/health` 
      : `${cleanUrl}/health`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(healthUrl, { 
        method: 'GET',
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setTestStatus('success');
        setTestMessage('🟢 Connection Successful! Backend API is reachable.');
      } else {
        setTestStatus('error');
        setTestMessage(`🔴 Server responded with HTTP ${res.status}`);
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(
        err.name === 'AbortError' 
          ? '🔴 Connection timed out (6s). Check if your PC and phone are on the same Wi-Fi.'
          : '🔴 Failed to connect. Ensure your backend is running and reachable on this network.'
      );
    }
  };

  const handleSave = () => {
    setCustomApiEndpoint(currentUrl.trim());
    onClose();
  };

  const handlePresetSelect = (preset: string) => {
    setCurrentUrl(preset);
    handleTestConnection(preset);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-5 sm:p-6 border border-slate-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-2xl bg-agri-100 flex items-center justify-center text-agri-800">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Backend API Server</h3>
            <p className="text-[11px] text-slate-500 font-medium">Configure network endpoint for mobile device</p>
          </div>
        </div>

        {/* Quick Preset Buttons */}
        <div className="space-y-1.5 mb-3.5">
          <label className="block text-[11px] font-bold text-slate-700">Quick Endpoint Presets:</label>
          <div className="grid grid-cols-1 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handlePresetSelect('http://192.168.1.5:8000/api/v1')}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-agri-50 border border-slate-200 hover:border-agri-400 text-left transition-all"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-800">Physical Phone (LAN 192.168.1.5)</span>
                  <p className="text-[10px] font-mono text-slate-500">http://192.168.1.5:8000/api/v1</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-agri-700 bg-agri-100 px-1.5 py-0.5 rounded">Use</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('http://192.168.1.6:8000/api/v1')}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-agri-50 border border-slate-200 hover:border-agri-400 text-left transition-all"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-800">Physical Phone (LAN 192.168.1.6)</span>
                  <p className="text-[10px] font-mono text-slate-500">http://192.168.1.6:8000/api/v1</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-agri-700 bg-agri-100 px-1.5 py-0.5 rounded">Use</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('http://10.0.2.2:8000/api/v1')}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-agri-50 border border-slate-200 hover:border-agri-400 text-left transition-all"
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-blue-600" />
                <div>
                  <span className="font-bold text-slate-800">Android Studio Emulator</span>
                  <p className="text-[10px] font-mono text-slate-500">http://10.0.2.2:8000/api/v1</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">Use</span>
            </button>

            <button
              type="button"
              onClick={() => handlePresetSelect('http://127.0.0.1:8000/api/v1')}
              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-agri-50 border border-slate-200 hover:border-agri-400 text-left transition-all"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <div>
                  <span className="font-bold text-slate-800">Localhost (PC Browser)</span>
                  <p className="text-[10px] font-mono text-slate-500">http://127.0.0.1:8000/api/v1</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">Use</span>
            </button>
          </div>
        </div>

        {/* Custom Input */}
        <div className="mb-3">
          <label className="block text-[11px] font-bold text-slate-800 mb-1">
            Active Server Base URL:
          </label>
          <div className="relative">
            <input
              type="text"
              value={currentUrl}
              onChange={(e) => setCurrentUrl(e.target.value)}
              placeholder="e.g. http://192.168.1.6:8000/api/v1"
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:border-agri-600 bg-slate-50 text-slate-900"
            />
          </div>
        </div>

        {/* Test Result Message */}
        {testMessage && (
          <div className={`mb-3 p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
            testStatus === 'success' 
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : testStatus === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-slate-100 text-slate-700'
          }`}>
            {testStatus === 'testing' && <Loader2 className="w-3.5 h-3.5 animate-spin text-agri-600 shrink-0" />}
            {testStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
            {testStatus === 'error' && <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
            <span className="break-words">{testMessage}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleTestConnection(currentUrl)}
            disabled={testStatus === 'testing'}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {testStatus === 'testing' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Test Connection</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 px-3 rounded-xl bg-agri-700 hover:bg-agri-800 text-white font-bold text-xs flex items-center justify-center transition-colors shadow-sm"
          >
            Save & Connect
          </button>
        </div>

      </div>
    </div>
  );
};
