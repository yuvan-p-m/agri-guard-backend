import React, { useEffect, useState } from 'react';
import { Cpu, MapPin, Pencil, Sprout, UserRound, Navigation } from 'lucide-react';
import type { HardwareState, Language, UserProfile } from '../types';

interface ProfileFarmSettingsProps {
  language: Language;
  user: UserProfile;
  onSave: (profile: UserProfile) => void;
  hardwareState: HardwareState;
}

export const ProfileFarmSettings: React.FC<ProfileFarmSettingsProps> = ({ language, user, onSave, hardwareState }) => {
  void language;
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(user);

  useEffect(() => {
    if (!isEditing) setDraft(user);
  }, [user, isEditing]);

  const crops = [draft.primaryCrop, ...(draft.secondaryCrops || [])].filter(Boolean);
  const updateDraft = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };
  const startEditing = () => {
    setDraft(user);
    setIsEditing(true);
  };
  const cancelEditing = () => {
    setDraft(user);
    setIsEditing(false);
  };
  const saveChanges = () => {
    onSave({
      ...draft,
      primaryCrop: draft.primaryCrop.split(',')[0].trim(),
      secondaryCrops: draft.primaryCrop.split(',').slice(1).map((crop) => crop.trim()).filter(Boolean),
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <section className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-agri-200/80">
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-agri-100 text-agri-800"><UserRound className="w-5 h-5" /></span>
          <div>
            <h2 className="text-xl font-black text-slate-900">Profile & Farm Settings</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Your farmer identity and registered field details</p>
          </div>
          </div>
          {!isEditing ? (
            <button type="button" onClick={startEditing} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-agri-700 px-3 py-2 text-xs font-black text-white hover:bg-agri-800 sm:w-auto">
              <Pencil className="w-3.5 h-3.5" /> Edit Profile
            </button>
          ) : (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
              <button type="button" onClick={cancelEditing} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 sm:w-auto">Cancel</button>
              <button type="button" onClick={saveChanges} className="w-full rounded-xl bg-agri-700 px-3 py-2 text-xs font-black text-white hover:bg-agri-800 sm:w-auto">Save Changes</button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {isEditing ? <EditInput label="Farmer Name" value={draft.name} onChange={(value) => updateDraft('name', value)} /> : <InfoItem label="Farmer Name" value={user.name} />}
          {isEditing ? <EditInput label="Contact Number" value={draft.phone} onChange={(value) => updateDraft('phone', value)} /> : <InfoItem label="Contact Number" value={user.phone} />}
          {isEditing ? <EditInput label="Field Location" value={draft.villageTaluka || draft.location || ''} onChange={(value) => updateDraft('villageTaluka', value)} icon={<MapPin className="w-4 h-4" />} /> : <InfoItem label="Field Location" value={`${user.villageTaluka || user.location || user.district || 'Nagpur'}, ${user.state || 'India'}`} icon={<MapPin className="w-4 h-4" />} />}
          {isEditing ? <EditInput label="Total Acres" type="number" value={String(draft.farmSize)} onChange={(value) => updateDraft('farmSize', Math.max(0, Number(value)))} /> : <InfoItem label="Total Acres Registered" value={`${user.farmSize} ${user.farmUnit}`} />}
          <div className="sm:col-span-2">
            <InfoItem 
              label="Tracked GPS Coordinates" 
              value={user.latitude && user.longitude ? `${user.latitude.toFixed(5)}° N, ${user.longitude.toFixed(5)}° E (Live Fixed)` : '21.14580° N, 79.08820° E (Auto-Mapped GPS)'} 
              icon={<Navigation className="w-4 h-4 text-emerald-600" />} 
            />
          </div>
        </div>
      </section>

      <section className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-agri-200/80">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Sprout className="w-5 h-5 text-agri-700" /> Crop Portfolio</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {isEditing ? <EditInput label="Primary Crops" value={crops.join(', ')} onChange={(value) => updateDraft('primaryCrop', value)} /> : <InfoItem label="Primary Crops" value={crops.join(', ')} />}
          {isEditing ? <EditSelect label="Soil Type" value={draft.soilType || ''} options={['Black Soil', 'Alluvial', 'Red Soil', 'Laterite', 'Sandy']} onChange={(value) => updateDraft('soilType', value)} /> : <InfoItem label="Soil Type" value={user.soilType || 'Not specified'} />}
          {isEditing ? <EditSelect label="Irrigation" value={draft.irrigationType || ''} options={['Drip', 'Sprinkler', 'Flood']} onChange={(value) => updateDraft('irrigationType', value)} /> : <InfoItem label="Irrigation" value={user.irrigationType || 'Not specified'} />}
        </div>
        <div className="mt-5 p-4 rounded-2xl bg-agri-50 border border-agri-200 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-agri-700 shrink-0" />
          <div>
            <p className="text-xs font-black text-slate-900">Connected IoT Hardware</p>
            <p className="text-sm font-bold text-agri-800 mt-0.5">{hardwareState.isConnected ? `${hardwareState.deviceName} (${hardwareState.deviceId})` : 'No device connected'}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string; icon?: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
    <p className="text-[11px] uppercase tracking-wide font-black text-slate-500 flex items-center gap-1.5">{icon}{label}</p>
    <p className="text-sm font-extrabold text-slate-900 mt-1.5 break-words">{value}</p>
  </div>
);

const EditInput: React.FC<{ label: string; value: string; onChange: (value: string) => void; type?: string; icon?: React.ReactNode }> = ({ label, value, onChange, type = 'text', icon }) => (
  <label className="p-3 rounded-2xl bg-slate-50 border border-agri-300">
    <span className="text-[11px] uppercase tracking-wide font-black text-slate-500 flex items-center gap-1.5">{icon}{label}</span>
    <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-bold text-slate-900 focus:border-agri-600 focus:ring-1 focus:ring-agri-600" />
  </label>
);

const EditSelect: React.FC<{ label: string; value: string; options: string[]; onChange: (value: string) => void }> = ({ label, value, options, onChange }) => (
  <label className="p-3 rounded-2xl bg-slate-50 border border-agri-300">
    <span className="text-[11px] uppercase tracking-wide font-black text-slate-500">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-bold text-slate-900 focus:border-agri-600 focus:ring-1 focus:ring-agri-600">
      <option value="">Select {label}</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </label>
);
