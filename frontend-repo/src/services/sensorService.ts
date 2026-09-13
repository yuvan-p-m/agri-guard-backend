/**
 * Reusable sensor service — single source of truth in frontend for live IoT sensor readings.
 * Connects to Firebase Realtime Database (`sensors` path) using a live listener (onValue).
 *
 * Implements agronomic reference ranges, zero-handling, and hardware health checks.
 * Supplies raw sensor snapshot to Part 2 (Crop Recommendation) and Part 3 (Disease Progression Risk).
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, off, get, type DataSnapshot } from 'firebase/database';

export type SensorStatus = 'Optimal' | 'Low' | 'High' | 'Critical' | 'No reading';

export interface SensorInterpretation {
  key: string;
  name: string;
  value: number | boolean | string | null;
  displayValue: string;
  unit: string;
  status: SensorStatus;
  explanation: string;
}

export interface RawSensorData {
  ec?: number;
  humidity?: number;
  moisture?: number;
  nitrogen?: number;
  ph?: number;
  phosphorous?: number;
  potassium?: number;
  pump?: boolean | number;
  rain?: number | boolean;
  rainval?: boolean;
  temperature?: number;
  [key: string]: any;
}

export interface InterpretedSensorSnapshot {
  available: boolean;
  timestamp: string;
  raw: RawSensorData | null;
  readings: Record<string, SensorInterpretation>;
  zeroCount: number;
  hardwareWarning: string | null;
  error?: string;
}

const FIREBASE_CONFIG = {
  databaseURL: 'https://esp32-19748-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'agri-gaurd-db',
};

// Initialize Firebase App singleton
const firebaseApp = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
const database = getDatabase(firebaseApp);

// Agronomic reference ranges and metadata
const SENSOR_META: Record<
  string,
  {
    name: string;
    unit: string;
    zeroMeansNoReading: boolean;
    optimal: [number, number];
    low?: [number, number];
    high?: [number, number];
    explanations: Record<SensorStatus, string>;
  }
> = {
  ph: {
    name: 'Soil pH',
    unit: '',
    zeroMeansNoReading: true,
    optimal: [6.0, 7.5],
    low: [5.0, 6.0],
    high: [7.5, 8.5],
    explanations: {
      Optimal: 'Soil pH is in the ideal range for most crops — nutrients are readily available.',
      Low: 'Soil is acidic — consider liming to raise pH for better nutrient absorption.',
      High: 'Soil is alkaline — iron and zinc availability may be reduced.',
      Critical: 'pH is extremely out of range — soil amendment urgently needed.',
      'No reading': 'pH sensor shows no reading — check probe connection.',
    },
  },
  humidity: {
    name: 'Air Humidity',
    unit: '%',
    zeroMeansNoReading: true,
    optimal: [40, 70],
    low: [25, 40],
    high: [70, 85],
    explanations: {
      Optimal: 'Air humidity supports healthy transpiration and leaf function.',
      Low: 'Low humidity — crops may wilt; increase irrigation if possible.',
      High: 'High humidity — elevated risk of fungal diseases like mildew.',
      Critical: 'Extreme humidity level — monitor closely for disease outbreaks.',
      'No reading': 'Humidity sensor shows no reading — check hardware connection.',
    },
  },
  temperature: {
    name: 'Air Temperature',
    unit: '°C',
    zeroMeansNoReading: true,
    optimal: [18, 30],
    low: [10, 18],
    high: [30, 40],
    explanations: {
      Optimal: 'Temperature is comfortable for most crops — good growing conditions.',
      Low: 'Cool conditions — cold-sensitive crops may suffer; consider protective covers.',
      High: 'Hot conditions — crops may face heat stress; ensure adequate watering.',
      Critical: 'Temperature is extreme — immediate protective action recommended.',
      'No reading': 'Temperature sensor shows no reading — check probe.',
    },
  },
  moisture: {
    name: 'Soil Moisture',
    unit: '%',
    zeroMeansNoReading: true,
    optimal: [40, 60],
    low: [20, 40],
    high: [60, 80],
    explanations: {
      Optimal: 'Soil moisture is ideal — roots have good water access without waterlogging.',
      Low: 'Soil is dry — irrigation needed to prevent water stress.',
      High: 'Soil is waterlogged — reduce irrigation; ensure drainage to prevent root rot.',
      Critical: 'Extreme moisture level — check irrigation system and field drainage.',
      'No reading': 'Soil moisture sensor shows no reading — check hardware connection.',
    },
  },
  ec: {
    name: 'Electrical Conductivity',
    unit: 'µS/cm',
    zeroMeansNoReading: true,
    optimal: [50, 200],
    low: [30, 50],
    high: [200, 500],
    explanations: {
      Optimal: 'Electrical conductivity indicates balanced soil salinity — nutrients available.',
      Low: 'Low EC suggests nutrient-poor soil — consider fertilizer application.',
      High: 'High EC indicates salt buildup — flush soil with clean water if persistent.',
      Critical: 'Extreme EC value — soil salinity may be toxic to roots.',
      'No reading': 'EC sensor shows no reading — check electrode connection.',
    },
  },
  nitrogen: {
    name: 'Nitrogen (N)',
    unit: 'mg/kg',
    zeroMeansNoReading: true,
    optimal: [80, 200],
    low: [40, 80],
    high: [200, 500],
    explanations: {
      Optimal: 'Nitrogen level supports healthy leaf growth and chlorophyll production.',
      Low: 'Nitrogen deficient — apply urea or organic nitrogen source for green growth.',
      High: 'Excess nitrogen — may cause excessive vegetative growth at expense of fruit.',
      Critical: 'Extreme nitrogen deficiency — adjust fertilization immediately.',
      'No reading': 'Nitrogen sensor shows no reading — check RS485 connection.',
    },
  },
  phosphorous: {
    name: 'Phosphorus (P)',
    unit: 'mg/kg',
    zeroMeansNoReading: true,
    optimal: [40, 100],
    low: [20, 40],
    high: [100, 400],
    explanations: {
      Optimal: 'Phosphorus level supports strong root development and flowering.',
      Low: 'Phosphorus deficient — apply DAP or rock phosphate for root and bloom health.',
      High: 'Excess phosphorus — can lock out other micronutrients like zinc.',
      Critical: 'Extreme phosphorus deficiency — review fertilization plan.',
      'No reading': 'Phosphorus sensor shows no reading — check RS485 connection.',
    },
  },
  potassium: {
    name: 'Potassium (K)',
    unit: 'mg/kg',
    zeroMeansNoReading: true,
    optimal: [100, 250],
    low: [50, 100],
    high: [250, 500],
    explanations: {
      Optimal: 'Potassium level supports strong cell walls, disease resistance, and fruit quality.',
      Low: 'Potassium deficient — apply MOP or SOP for better fruit and stress tolerance.',
      High: 'Excess potassium — may interfere with magnesium and calcium uptake.',
      Critical: 'Extreme potassium deficiency — adjust fertilization.',
      'No reading': 'Potassium sensor shows no reading — check RS485 connection.',
    },
  },
  rain: {
    name: 'Rain Detector',
    unit: '',
    zeroMeansNoReading: false,
    optimal: [0, 1],
    explanations: {
      Optimal: 'No rain currently detected — safe for field and spray operations.',
      High: 'Rain detected — delay chemical spraying; ensure field drainage.',
      Low: 'No rain currently detected — safe for field and spray operations.',
      Critical: 'Heavy rain detected — monitor field runoff.',
      'No reading': 'Rain sensor unavailable.',
    },
  },
  pump: {
    name: 'Irrigation Pump',
    unit: '',
    zeroMeansNoReading: false,
    optimal: [0, 1],
    explanations: {
      Optimal: 'Pump is idle — no active irrigation.',
      High: 'Pump is running — irrigation system is actively delivering water.',
      Low: 'Pump is idle — no active irrigation.',
      Critical: 'Pump status abnormal.',
      'No reading': 'Pump status unavailable.',
    },
  },
};

/**
 * Pure function: Interprets a single raw sensor value into status, display value, and farmer explanation.
 */
export function interpretSensorValue(key: string, value: any): SensorInterpretation {
  const meta = SENSOR_META[key];

  if (!meta) {
    return {
      key,
      name: key,
      value: value ?? null,
      displayValue: value !== undefined && value !== null ? String(value) : '--',
      unit: '',
      status: 'No reading',
      explanation: `No calibration range available for ${key}.`,
    };
  }

  // Missing or null value
  if (value === undefined || value === null) {
    return {
      key,
      name: meta.name,
      value: null,
      displayValue: '--',
      unit: meta.unit,
      status: 'No reading',
      explanation: meta.explanations['No reading'],
    };
  }

  // Handle boolean pump
  if (key === 'pump') {
    const isRunning = value === true || value === 1 || value === '1' || value === 'true';
    return {
      key,
      name: meta.name,
      value: isRunning,
      displayValue: isRunning ? 'ON' : 'OFF',
      unit: '',
      status: 'Optimal',
      explanation: isRunning
        ? 'Pump is running — irrigation system is actively delivering water.'
        : 'Pump is idle — no active irrigation.',
    };
  }

  // Handle rain (ESP32 analog ADC: 4095 is dry, < 2500 is rain; or boolean)
  if (key === 'rain') {
    const num = Number(value);
    const isRaining =
      value === true ||
      value === 'true' ||
      (num > 0 && num < 2500) ||
      num === 1;

    return {
      key,
      name: meta.name,
      value: num,
      displayValue: isRaining ? 'Rain Detected' : 'No Rain',
      unit: '',
      status: isRaining ? 'High' : 'Optimal',
      explanation: isRaining
        ? meta.explanations.High
        : meta.explanations.Optimal,
    };
  }

  const num = Number(value);
  if (isNaN(num)) {
    return {
      key,
      name: meta.name,
      value: null,
      displayValue: '--',
      unit: meta.unit,
      status: 'No reading',
      explanation: meta.explanations['No reading'],
    };
  }

  // Exact 0 handling for agronomic sensors where 0 means disconnected/no reading
  if (num === 0 && meta.zeroMeansNoReading) {
    return {
      key,
      name: meta.name,
      value: 0,
      displayValue: '0',
      unit: meta.unit,
      status: 'No reading',
      explanation: meta.explanations['No reading'],
    };
  }

  // Standard threshold evaluation
  const [optLo, optHi] = meta.optimal;
  let status: SensorStatus = 'Optimal';

  if (num >= optLo && num <= optHi) {
    status = 'Optimal';
  } else if (meta.low && num >= meta.low[0] && num < meta.low[1]) {
    status = 'Low';
  } else if (meta.high && num > meta.high[0] && num <= meta.high[1]) {
    status = 'High';
  } else {
    status = 'Critical';
  }

  return {
    key,
    name: meta.name,
    value: num,
    displayValue: Number.isInteger(num) ? String(num) : num.toFixed(1),
    unit: meta.unit,
    status,
    explanation: meta.explanations[status] || '',
  };
}

/**
 * Pure function: Interprets all sensor fields from a raw data object.
 */
export function interpretAllSensors(raw: RawSensorData | null): InterpretedSensorSnapshot {
  if (!raw || typeof raw !== 'object') {
    return {
      available: false,
      timestamp: new Date().toLocaleTimeString(),
      raw: null,
      readings: {},
      zeroCount: 0,
      hardwareWarning: 'Unable to connect to sensor hardware — data unavailable.',
    };
  }

  const keys = ['ec', 'humidity', 'moisture', 'nitrogen', 'ph', 'phosphorous', 'potassium', 'pump', 'rain', 'temperature'];
  const readings: Record<string, SensorInterpretation> = {};
  let zeroCount = 0;

  for (const key of keys) {
    const val = raw[key];
    const inter = interpretSensorValue(key, val);
    readings[key] = inter;

    // Count physical soil/air sensors that show No reading / exactly 0 (excluding pump & rain)
    if (key !== 'pump' && key !== 'rain') {
      if (inter.status === 'No reading') {
        zeroCount += 1;
      }
    }
  }

  let hardwareWarning: string | null = null;
  if (zeroCount >= 3) {
    hardwareWarning = `Some sensors show no reading — check hardware connection. (${zeroCount} sensors disconnected or returned 0)`;
  }

  return {
    available: true,
    timestamp: new Date().toLocaleTimeString(),
    raw,
    readings,
    zeroCount,
    hardwareWarning,
  };
}

// In-memory cache of latest raw data received
let cachedRawSnapshot: RawSensorData | null = null;
let cachedInterpretedSnapshot: InterpretedSensorSnapshot | null = null;

/**
 * Returns the latest raw sensor snapshot.
 * Used by Part 2 (Crop Recommendation) and Part 3 (Disease Progression Risk).
 */
export function getLatestSensorSnapshot(): RawSensorData | null {
  return cachedRawSnapshot;
}

/**
 * Returns the latest interpreted sensor snapshot.
 */
export function getLatestInterpretedSnapshot(): InterpretedSensorSnapshot | null {
  return cachedInterpretedSnapshot;
}

/**
 * Connect to Firebase Realtime Database (`sensors` path) using a live listener (onValue).
 * Values update in the UI automatically as they change.
 *
 * @param callback Called whenever new data arrives or error occurs
 * @returns Unsubscribe cleanup function
 */
export function subscribeToLiveSensors(
  callback: (snapshot: InterpretedSensorSnapshot) => void
): () => void {
  const sensorsRef = ref(database, 'sensors');

  onValue(
    sensorsRef,
    (snapshot: DataSnapshot) => {
      const val = snapshot.val() as RawSensorData | null;
      cachedRawSnapshot = val;
      const interpreted = interpretAllSensors(val);
      cachedInterpretedSnapshot = interpreted;
      callback(interpreted);
    },
    (error: Error) => {
      console.error('Firebase RTDB onValue listener error:', error);
      const errSnapshot: InterpretedSensorSnapshot = {
        available: false,
        timestamp: new Date().toLocaleTimeString(),
        raw: cachedRawSnapshot,
        readings: cachedInterpretedSnapshot ? cachedInterpretedSnapshot.readings : {},
        zeroCount: 0,
        hardwareWarning: 'Connection to Firebase Realtime Database failed.',
        error: error.message,
      };
      callback(errSnapshot);
    }
  );

  return () => {
    off(sensorsRef);
  };
}

/**
 * Fetch sensor snapshot once (for synchronous requirements or one-off server fallbacks)
 */
export async function fetchSensorSnapshotOnce(): Promise<InterpretedSensorSnapshot> {
  try {
    const sensorsRef = ref(database, 'sensors');
    const snapshot = await get(sensorsRef);
    const val = snapshot.val() as RawSensorData | null;
    cachedRawSnapshot = val;
    const interpreted = interpretAllSensors(val);
    cachedInterpretedSnapshot = interpreted;
    return interpreted;
  } catch (err: any) {
    return {
      available: false,
      timestamp: new Date().toLocaleTimeString(),
      raw: null,
      readings: {},
      zeroCount: 0,
      hardwareWarning: 'Failed to fetch sensor data: ' + (err?.message || String(err)),
    };
  }
}
