export type Language =
  | 'en' | 'ta' | 'hi' | 'te' | 'ml' | 'kn'
  | 'bn' | 'mr' | 'gu' | 'pa' | 'ur' | 'or' | 'as' | 'ne' | 'si'
  | 'ar' | 'fr' | 'es' | 'pt' | 'de' | 'it' | 'ru' | 'uk' | 'tr'
  | 'id' | 'ms' | 'th' | 'vi' | 'ko' | 'ja';

export type LocalizedText = {
  en: string;
  [language: string]: string;
};

export type LocalizedTextList = {
  en: string[];
  [language: string]: string[];
};

export interface HardwareState {
  isConnected: boolean;
  deviceId: string | null;
  deviceName: string;
  lastPing: string | null;
}

export interface CropRecommendation {
  crop: string;
  crop_key?: string;
  confidence?: number;
  reason: string;
  ideal_profile?: {
    ideal_N?: number;
    ideal_P?: number;
    ideal_K?: number;
    ideal_temp?: number;
    ideal_humidity?: number;
    ideal_ph?: number;
    ideal_rainfall?: number;
  };
}

export interface CropRecommendationResponse {
  status: string;
  detail?: string;
  location: string;
  model_type?: string;
  dataset?: string;
  accuracy?: string;
  total_crops?: number;
  input_features?: {
    N?: number;
    P?: number;
    K?: number;
    temperature?: number;
    humidity?: number;
    ph?: number;
    rainfall?: number;
  };
  weather: {
    temp: number;
    feels_like?: number;
    humidity: number;
    rain_mm: number;
    condition: string;
    resolved_name?: string;
  };
  sensor_snapshot: {
    ec?: number;
    humidity?: number;
    moisture?: number;
    nitrogen?: number;
    ph?: number;
    phosphorous?: number;
    potassium?: number;
    pump?: boolean | number;
    rain?: number | boolean;
    temperature?: number;
  };
  recommendations: CropRecommendation[];
}

export interface MandiRecord {
  state: string;
  district: string;
  market: string;
  commodity: string;
  min_price: string;
  max_price: string;
  modal_price: string;
  arrival_date: string;
}

export interface MandiPricesResponse {
  status: 'success' | 'error' | string;
  source?: string;
  state?: string;
  crop?: string;
  last_updated?: string;
  message?: string;
  records: MandiRecord[];
}

export interface WeeklyPriceRecord {
  week: string;
  price: number;
}

export interface PriceForecastResponse {
  status: 'success' | 'error' | string;
  crop?: string;
  state?: string;
  weekly_prices: WeeklyPriceRecord[];
  forecast: number[];
  trend: 'RISING' | 'FALLING' | 'STABLE' | string;
  pct_change: number;
  verdict_title?: string;
  recommendation: string;
  record_count: number;
  message?: string;
}

export interface CropAlertResponse {
  status: 'success' | 'error' | string;
  crop: string;
  alert_type: string;
  message: string;
  recommendation: string;
}

export interface ProgressionRisk {
  risk: string;
  progression_stage?: string;
  vulnerability_window?: string;
  message: string;
  pathology_factors?: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  username: string;
  phone: string;
  language: Language;
  farmSize: number;
  farmUnit: 'Acres' | 'Hectares' | 'Bigha' | 'Guntha';
  primaryCrop: string;
  cropType?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  role?: string;
  secondaryCrops?: string[];
  soilType?: string;
  irrigationType?: string;
  iotDeviceSerial?: string;
  state: string;
  district: string;
  villageTaluka?: string;
  pincode?: string;
}

export interface WeatherInfo {
  city: string;
  state: string;
  tempC: number;
  condition: string;
  humidity: number;
  rainfallChance: number;
  windSpeedKmH: number;
  soilMoisture: string;
  fungalRiskLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  leafWetnessHours: number;
  alertSummary: string;
  iconType: 'rain' | 'sun' | 'cloud' | 'storm';
  sprayWindows?: {
    timeSlot: string;
    status: 'Optimal' | 'Caution' | 'Unfavorable';
    reason: string;
  }[];
  forecast?: {
    date: string;
    temp_max: number;
    temp_min: number;
    humidity: number;
    rainfall_mm: number;
    disease_risk: string;
    risk_reason: string;
  }[];
  weeklyForecast?: {
    day: string;
    tempMax: number;
    tempMin: number;
    condition: string;
    rainProb: number;
    risk: 'Low' | 'Moderate' | 'High';
  }[];
}

export interface IoTSensorData {
  deviceId: string;
  nodeName: string;
  lastUpdated: string;
  isOnline: boolean;
  batteryLevel: number;
  signalStrengthDbm: number;
  ambientTempC: number;
  soilTempC: number;
  ambientHumidityPct: number;
  soilMoisturePct: number;
  soilMoistureStatus: 'Dry' | 'Optimal' | 'Adequate' | 'Waterlogged';
  rainStatus: 'No Rain' | 'Light Rain' | 'Heavy Rain';
  rainIntensityMmHr: number;
  solarRadiationWm2: number;
  npk: {
    nitrogenMgKg: number;
    nitrogenStatus: 'Low' | 'Sufficient' | 'Optimal';
    phosphorusMgKg: number;
    phosphorusStatus: 'Low' | 'Sufficient' | 'Optimal';
    potassiumMgKg: number;
    potassiumStatus: 'Low' | 'Sufficient' | 'Optimal';
  };
  aiAdvisory: LocalizedText;
}

export interface RemedyItem {
  id: string;
  name: string;
  activeIngredient?: string;
  dosageFormula: (sizeInAcres: number) => { amount: string; waterVolume: string };
  instructions: string;
  schedule: string;
  safetyCaution?: string;
  phiDays?: number; // Pre-Harvest Interval
  productLinkIds?: string[];
}

export interface DiseaseDiagnosis {
  id: string;
  cropId: string;
  cropName: LocalizedText;
  diseaseName: LocalizedText;
  scientificName: string;
  pathogenType: 'Fungus' | 'Bacterium' | 'Virus' | 'Pest' | 'Nutrient Deficiency';
  stage: 'Early Stage (Inception)' | 'Moderate Progression' | 'Severe Outbreak';
  confidence: number;
  incubationPeriod: string;
  spreadRiskRate: number; // e.g. 45% crop loss if untreated in 7 days
  earlyWarningAlert: LocalizedText;
  symptoms: LocalizedTextList;
  visualFeatures: string[];
  organicProtocol: {
    overview: LocalizedText;
    remedies: RemedyItem[];
  };
  chemicalProtocol: {
    overview: LocalizedText;
    remedies: RemedyItem[];
  };
  preventativeTips: LocalizedTextList;
  recommendedProductIds: string[];
  sampleImage: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  crop: string;
  diseaseName: string;
  stage: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
  status: 'Resolved' | 'In Treatment' | 'Monitoring';
  fieldArea: string;
  treatmentChosen: 'Organic' | 'Chemical' | 'Combined';
  feedback: 'worked' | 'not_worked' | null;
  feedbackTimestamp?: string;
  confidenceScore: number;
  imageThumbnail: string;
}

export interface SmsAlert {
  id: string;
  timestamp: string;
  type: 'weather' | 'pest_alert' | 'treatment_reminder' | 'soil_advisory';
  urgency: 'high' | 'medium' | 'normal';
  title: LocalizedText;
  message: LocalizedText;
  actionRequired?: LocalizedText;
  isRead: boolean;
}

export interface TrackingStep {
  title: string;
  desc: string;
  time: string;
  completed: boolean;
  current: boolean;
}

