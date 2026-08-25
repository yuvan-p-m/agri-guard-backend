// API service for backend integration using native fetch
import { Capacitor } from '@capacitor/core';
import type { UserProfile } from '../types';

/**
 * Dynamically resolves the active API base endpoint:
 * 1. Runtime override via localStorage ('api_endpoint_override')
 * 2. Environment variable VITE_API_BASE_URL (with auto-adjustment for native platforms)
 * 3. Native mobile fallback: LAN IP (192.168.1.6:8000/api/v1) or Android Emulator (10.0.2.2:8000/api/v1)
 * 4. Browser web default: 127.0.0.1:8000/api/v1
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const runtimeOverride = localStorage.getItem('api_endpoint_override');
    if (runtimeOverride && runtimeOverride.trim()) {
      return runtimeOverride.trim().replace(/\/+$/, '');
    }
  }

  const envUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();

  if (envUrl) {
    const cleanEnv = envUrl.replace(/\/+$/, '');
    if (isNative && (cleanEnv.includes('localhost') || cleanEnv.includes('127.0.0.1'))) {
      // Inside an Android native container, route localhost to 10.0.2.2 host alias
      return cleanEnv.replace(/localhost|127\.0\.0\.1/g, '10.0.2.2');
    }
    return cleanEnv;
  }

  if (isNative) {
    return 'http://10.0.2.2:8000/api/v1';
  }

  return 'http://127.0.0.1:8000/api/v1';
}

export function setCustomApiEndpoint(url: string): void {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('api_endpoint_override');
    } else {
      localStorage.setItem('api_endpoint_override', url.trim().replace(/\/+$/, ''));
    }
  }
}

export const API_BASE_URL = getApiBaseUrl();

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface RegisterPayload {
  full_name: string;
  email: string;
  phone?: string;
  password: string;
  confirm_password: string;
  crop_type?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const primaryBaseUrl = getApiBaseUrl();
  const isNative = typeof window !== 'undefined' && Capacitor.isNativePlatform();

  // Candidates list for resilient mobile connections (primary, ADB reverse 127.0.0.1, emulator 10.0.2.2, physical LAN 192.168.1.5)
  const candidateUrls = [
    primaryBaseUrl,
    ...(isNative 
      ? ['http://127.0.0.1:8000/api/v1', 'http://10.0.2.2:8000/api/v1', 'http://192.168.1.5:8000/api/v1', 'http://192.168.1.6:8000/api/v1'] 
      : ['http://127.0.0.1:8000/api/v1', 'http://10.0.2.2:8000/api/v1', 'http://192.168.1.5:8000/api/v1', 'http://192.168.1.6:8000/api/v1'])
  ].filter((url, index, self) => self.indexOf(url) === index);

  let lastError: any = null;

  for (const candidateBase of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutMs = isNative ? 3500 : 6000;
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(`${candidateBase}${cleanEndpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error: any = new Error(data?.detail || `HTTP Error ${response.status}`);
        error.response = { status: response.status, data };
        throw error;
      }

      // If a candidate succeeded and it was different from primary, remember it
      if (candidateBase !== primaryBaseUrl) {
        setCustomApiEndpoint(candidateBase);
      }

      return data as T;
    } catch (err: any) {
      // If it's a valid HTTP response with error status (e.g. 400 Bad Request, 401 Unauthorized), don't fallback to other servers
      if (err?.response?.status) {
        throw err;
      }
      lastError = err;
      // Network/connection error -> try next candidate in loop
    }
  }

  const customError: any = new Error(
    `Unable to connect to backend server (${primaryBaseUrl}). Tap 'Server IP' in the top header to configure or check network connection.`
  );
  customError.original = lastError;
  throw customError;
}

// Auth APIs
export const authAPI = {
  register: async (data: RegisterPayload): Promise<AuthResponse> => {
    const resData = await request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (resData?.access_token) {
      localStorage.setItem('access_token', resData.access_token);
    }
    return resData;
  },
  login: async (data: LoginPayload): Promise<AuthResponse> => {
    const resData = await request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (resData?.access_token) {
      localStorage.setItem('access_token', resData.access_token);
    }
    return resData;
  },
  getMe: async (): Promise<UserProfile> => {
    return request<UserProfile>('/auth/me');
  }
};

// Disease Detection APIs
export const diseaseAPI = {
  predict: async (file: File) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file);
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    const res = await fetch(`${API_BASE_URL}/disease/predict`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return res.json();
  },
  history: () => request('/disease/history'),
};

// Sensor APIs
export const sensorAPI = {
  addReading: (data: any) => request('/sensors/reading', { method: 'POST', body: JSON.stringify(data) }),
  getLatest: () => request('/sensors/latest'),
};

// Weather APIs
export const weatherAPI = {
  getWeatherByCoords: (lat: number, lon: number) => request(`/weather?lat=${lat}&lon=${lon}`),
  getWeatherByCity: (city: string) => request(`/weather?city=${encodeURIComponent(city)}`),
  getForecast: (city?: string, lat?: number, lon?: number) =>
    request(`/weather/forecast?${lat && lon ? `lat=${lat}&lon=${lon}` : `city=${encodeURIComponent(city || 'Nagpur')}`}`),
  getCurrent: (city?: string, lat?: number, lon?: number) =>
    request(`/weather/current?${lat && lon ? `lat=${lat}&lon=${lon}` : `city=${encodeURIComponent(city || 'Nagpur')}`}`),
};

// Alert APIs
export const alertsAPI = {
  subscribe: (data: { phone: string; crop?: string; alert_types?: string[] }) =>
    request('/alerts/subscribe', { method: 'POST', body: JSON.stringify(data) }),
  sendWeatherAlert: (phone: string, alertMessage: string) =>
    request('/alerts/send-weather-alert', { method: 'POST', body: JSON.stringify({ phone, alert_message: alertMessage }) }),
};

// Risk APIs
export const riskAPI = {
  earlyWarning: () => request('/risk/early-warning'),
};

// Feedback APIs
export const feedbackAPI = {
  submit: (data: any) => request('/feedback/submit', { method: 'POST', body: JSON.stringify(data) }),
  impact: () => request('/feedback/impact'),
};

export default { request };
