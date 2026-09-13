import React, { useEffect, useState } from 'react';
import { Cpu, MapPin, Pencil, Sprout, UserRound, Navigation } from 'lucide-react';
import type { HardwareState, Language, UserProfile } from '../types';
import { useAppTranslation } from '../i18n';

interface ProfileFarmSettingsProps {
  language: Language;
  user: UserProfile;
  onSave: (profile: UserProfile) => void;
  hardwareState: HardwareState;
}

export const ProfileFarmSettings: React.FC<ProfileFarmSettingsProps> = ({ language: _language, user, onSave, hardwareState }) => {
  const { t } = useAppTranslation();
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

  const soilOptions = [
    { value: 'Black Soil', label: t.soilBlack },
    { value: 'Alluvial', label: t.soilAlluvial },
    { value: 'Red Soil', label: t.soilRed },
    { value: 'Laterite', label: t.soilLaterite },
    { value: 'Sandy', label: t.soilSandy },
  ];

  const irrigationOptions = [
    { value: 'Drip', label: t.irrigationDrip },
    { value: 'Sprinkler', label: t.irrigationSprinkler },
    { value: 'Flood', label: t.irrigationFlood },
  ];

  const getSoilLabel = (val?: string) => {
    if (!val) return t.notSpecified;
    const match = soilOptions.find((o) => o.value.toLowerCase() === val.toLowerCase());
    return match ? match.label : val;
  };

  const getIrrigationLabel = (val?: string) => {
    if (!val) return t.notSpecified;
    const match = irrigationOptions.find((o) => o.value.toLowerCase() === val.toLowerCase());
    return match ? match.label : val;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <section className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-agri-200/80">
        <div className="flex items-center justify-between gap-3 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-agri-100 text-agri-800"><UserRound className="w-5 h-5" /></span>
          <div>
            <h2 className="text-xl font-black text-slate-900">{t.profileSettingsTitle}</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">{t.profileSettingsSubtitle}</p>
          </div>
          </div>
          {!isEditing ? (
            <button type="button" onClick={startEditing} className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-agri-700 px-3 py-2 text-xs font-black text-white hover:bg-agri-800 sm:w-auto">
              <Pencil className="w-3.5 h-3.5" /> {t.editProfile}
            </button>
          ) : (
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
              <button type="button" onClick={cancelEditing} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 sm:w-auto">{t.cancel}</button>
              <button type="button" onClick={saveChanges} className="w-full rounded-xl bg-agri-700 px-3 py-2 text-xs font-black text-white hover:bg-agri-800 sm:w-auto">{t.saveChanges}</button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {isEditing ? <EditInput label={t.farmerNameLabel} value={draft.name} onChange={(value) => updateDraft('name', value)} /> : <InfoItem label={t.farmerNameLabel} value={user.name} />}
          {isEditing ? <EditInput label={t.contactNumberLabel} value={draft.phone} onChange={(value) => updateDraft('phone', value)} /> : <InfoItem label={t.contactNumberLabel} value={user.phone} />}
          {isEditing ? <EditInput label={t.fieldLocationLabel} value={draft.villageTaluka || draft.location || ''} onChange={(value) => updateDraft('villageTaluka', value)} icon={<MapPin className="w-4 h-4" />} /> : <InfoItem label={t.fieldLocationLabel} value={`${user.villageTaluka || user.location || user.district || 'Nagpur'}, ${user.state || t.countryIndia}`} icon={<MapPin className="w-4 h-4" />} />}
          {isEditing ? <EditInput label={t.totalAcresLabel} type="number" value={String(draft.farmSize)} onChange={(value) => updateDraft('farmSize', Math.max(0, Number(value)))} /> : <InfoItem label={t.totalAcresRegisteredLabel} value={`${user.farmSize} ${user.farmUnit === 'Acres' || !user.farmUnit ? t.unitAcres : user.farmUnit}`} />}
          <div className="sm:col-span-2">
            <InfoItem 
              label={t.trackedGpsLabel}
              value={user.latitude && user.longitude ? `${user.latitude.toFixed(5)}° N, ${user.longitude.toFixed(5)}° E (${t.liveFixedLabel})` : `21.14580° N, 79.08820° E (${t.autoMappedGpsLabel})`}
              icon={<Navigation className="w-4 h-4 text-emerald-600" />} 
            />
          </div>
        </div>
      </section>

      <section className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 shadow-xl border border-agri-200/80">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2"><Sprout className="w-5 h-5 text-agri-700" /> {t.cropPortfolio}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {isEditing ? <EditInput label={t.primaryCropsLabel} value={crops.join(', ')} onChange={(value) => updateDraft('primaryCrop', value)} /> : <InfoItem label={t.primaryCropsLabel} value={crops.join(', ')} />}
          {isEditing ? <EditSelect label={t.soilTypeLabel} value={draft.soilType || ''} options={soilOptions} placeholder={`${t.selectOption} ${t.soilTypeLabel}`} onChange={(value) => updateDraft('soilType', value)} /> : <InfoItem label={t.soilTypeLabel} value={getSoilLabel(user.soilType)} />}
          {isEditing ? <EditSelect label={t.irrigationLabel} value={draft.irrigationType || ''} options={irrigationOptions} placeholder={`${t.selectOption} ${t.irrigationLabel}`} onChange={(value) => updateDraft('irrigationType', value)} /> : <InfoItem label={t.irrigationLabel} value={getIrrigationLabel(user.irrigationType)} />}
        </div>
        <div className="mt-5 p-4 rounded-2xl bg-agri-50 border border-agri-200 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-agri-700 shrink-0" />
          <div>
            <p className="text-xs font-black text-slate-900">{t.connectedIotHardware}</p>
            <p className="text-sm font-bold text-agri-800 mt-0.5">{hardwareState.isConnected ? `${hardwareState.deviceName} (${hardwareState.deviceId})` : t.noDeviceConnected}</p>
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

const EditSelect: React.FC<{ label: string; value: string; options: { value: string; label: string }[]; placeholder?: string; onChange: (value: string) => void }> = ({ label, value, options, placeholder, onChange }) => (
  <label className="p-3 rounded-2xl bg-slate-50 border border-agri-300">
    <span className="text-[11px] uppercase tracking-wide font-black text-slate-500">{label}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-bold text-slate-900 focus:border-agri-600 focus:ring-1 focus:ring-agri-600">
      <option value="">{placeholder || `Select ${label}`}</option>
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  </label>
);
