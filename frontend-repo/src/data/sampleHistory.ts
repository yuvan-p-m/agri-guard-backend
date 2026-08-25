import { HistoryRecord, SmsAlert, WeatherInfo, UserProfile } from '../types';

export const demoProfiles: UserProfile[] = [
  {
    id: 'demo-rajesh',
    name: 'Rajesh Kumar',
    username: 'rajesh_farmer',
    phone: '+91 98765 43210',
    language: 'en',
    farmSize: 4.5,
    farmUnit: 'Acres',
    primaryCrop: 'Citrus (Orange / Sweet Lime)',
    state: 'Maharashtra',
    district: 'Nagpur (Citrus Belt)',
    isLoggedIn: true,
  },
  {
    id: 'demo-murugan',
    name: 'Murugan S.',
    username: 'murugan_paddy',
    phone: '+91 94432 18902',
    language: 'ta',
    farmSize: 2.5,
    farmUnit: 'Acres',
    primaryCrop: 'Paddy / Tomato',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    isLoggedIn: true,
  },
  {
    id: 'demo-sunita',
    name: 'Sunita Devi',
    username: 'sunita_krishi',
    phone: '+91 97654 32189',
    language: 'hi',
    farmSize: 1.8,
    farmUnit: 'Acres',
    primaryCrop: 'Chilli & Vegetables',
    state: 'Uttar Pradesh',
    district: 'Varanasi',
    isLoggedIn: true,
  }
];

export const sampleWeatherStations: Record<string, WeatherInfo> = {
  'Nagpur (Citrus Belt)': {
    city: 'Nagpur',
    state: 'Maharashtra',
    tempC: 29,
    condition: 'Partly Cloudy & Humid',
    humidity: 82,
    rainfallChance: 65,
    windSpeedKmH: 14,
    soilMoisture: '78% (Adequate)',
    fungalRiskLevel: 'High',
    leafWetnessHours: 8.5,
    alertSummary: 'Rain showers predicted in 24h. Spore dispersal risk is elevated.',
    iconType: 'rain'
  },
  'Coimbatore': {
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    tempC: 27,
    condition: 'Warm & Breezy',
    humidity: 74,
    rainfallChance: 30,
    windSpeedKmH: 18,
    soilMoisture: '65% (Optimal)',
    fungalRiskLevel: 'Moderate',
    leafWetnessHours: 5.0,
    alertSummary: 'Moderate fungal risk. Ideal spraying window: 6:30 AM - 9:00 AM.',
    iconType: 'cloud'
  },
  'Varanasi': {
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    tempC: 31,
    condition: 'Sunny & High Heat',
    humidity: 58,
    rainfallChance: 15,
    windSpeedKmH: 11,
    soilMoisture: '52% (Dry Topsoil)',
    fungalRiskLevel: 'Low',
    leafWetnessHours: 2.0,
    alertSummary: 'Low fungal risk; monitor for thrips and mite vectors in dry heat.',
    iconType: 'sun'
  },
  'Nashik (Vegetable Hub)': {
    city: 'Nashik',
    state: 'Maharashtra',
    tempC: 25,
    condition: 'Overcast with Mist',
    humidity: 88,
    rainfallChance: 80,
    windSpeedKmH: 16,
    soilMoisture: '84% (High Moisture)',
    fungalRiskLevel: 'Severe',
    leafWetnessHours: 11.2,
    alertSummary: 'Critical Downy/Late Blight warning for vegetable crops. Immediate action advised.',
    iconType: 'storm'
  }
};

export const initialHistoryRecords: HistoryRecord[] = [
  {
    id: 'hist-101',
    date: '2026-08-18',
    crop: 'Citrus (Orange)',
    diseaseName: 'Citrus Bacterial Canker',
    stage: 'Early Stage',
    severity: 'Moderate',
    status: 'Resolved',
    fieldArea: '4.5 Acres',
    treatmentChosen: 'Combined',
    feedback: 'worked',
    feedbackTimestamp: '2026-08-22',
    confidenceScore: 96.2,
    imageThumbnail: '/images/auth-bg.png'
  },
  {
    id: 'hist-102',
    date: '2026-08-10',
    crop: 'Tomato',
    diseaseName: 'Tomato Late Blight (Early Spores)',
    stage: 'Early Stage',
    severity: 'High',
    status: 'Resolved',
    fieldArea: '2.0 Acres',
    treatmentChosen: 'Chemical',
    feedback: 'worked',
    feedbackTimestamp: '2026-08-16',
    confidenceScore: 94.8,
    imageThumbnail: '/images/dashboard-bg.jpg'
  },
  {
    id: 'hist-103',
    date: '2026-08-02',
    crop: 'Chilli',
    diseaseName: 'Chilli Leaf Curl & Thrips',
    stage: 'Moderate',
    severity: 'Moderate',
    status: 'In Treatment',
    fieldArea: '1.5 Acres',
    treatmentChosen: 'Organic',
    feedback: null,
    confidenceScore: 93.5,
    imageThumbnail: '/images/dashboard-bg.jpg'
  }
];

export const initialSmsAlerts: SmsAlert[] = [
  {
    id: 'sms-01',
    timestamp: 'Today, 07:30 AM',
    type: 'weather',
    urgency: 'high',
    title: {
      en: '🌧️ Heavy Rain Warning - Delay Chemical Spraying',
      hi: '🌧️ भारी वर्षा चेतावनी - रासायनिक छिड़काव 24 घंटे टालें',
      ta: '🌧️ கனமழை எச்சரிக்கை - மருந்து தெளிப்பதை 24 மணி நேரம் தள்ளிப்போடவும்'
    },
    message: {
      en: 'AgriGuard Alert: 65% chance of thunderstorm tomorrow in your taluk. Avoid foliar chemical spraying today to prevent chemical wash-off and wastage.',
      hi: 'एग्रीगार्ड अलर्ट: कल आपके क्षेत्र में बारिश की 65% संभावना है। आज छिड़काव न करें ताकि दवा बहकर बर्बाद न हो।',
      ta: 'அக்ரிகார்ட் எச்சரிக்கை: நாளை உங்கள் பகுதியில் 65% மழை வாய்ப்பு உள்ளது. மருந்து வீணாகாமல் இருக்க இன்று தெளிக்க வேண்டாம்.'
    },
    actionRequired: {
      en: 'Reschedule spraying to post-rain window on Wednesday morning.',
      hi: 'बुधवार सुबह बारिश थमने के बाद ही छिड़काव करें।',
      ta: 'புதன்கிழமை காலை மழை நின்ற பிறகு மருந்து தெளிக்கவும்.'
    },
    isRead: false
  },
  {
    id: 'sms-02',
    timestamp: 'Yesterday, 04:15 PM',
    type: 'pest_alert',
    urgency: 'high',
    title: {
      en: '⚠️ Regional Citrus Canker Spore Warning',
      hi: '⚠️ क्षेत्र में सिट्रस कैंकर जीवाणु फैलाव चेतावनी',
      ta: '⚠️ பிராந்திய சிட்ரஸ் பாக்டீரியா நோய் எச்சரிக்கை'
    },
    message: {
      en: 'AgriGuard Network: 14 nearby orchards in your 10km radius reported early canker lesions due to sustained humidity. Inspect lower leaves today.',
      hi: 'एग्रीगार्ड नेटवर्क: आपके 10 किमी दायरे में 14 बागानों में कैंकर रोग के लक्षण मिले हैं। अपने पौधों की तुरंत जांच करें।',
      ta: 'அக்ரிகார்ட் தகவல்: உங்கள் பகுதியில் உள்ள 14 தோட்டங்களில் சிட்ரஸ் புண் நோய் அறிகுறிகள் பதிவாகியுள்ளன. உடனே பரிசோதிக்கவும்.'
    },
    actionRequired: {
      en: 'Scan affected leaves with AgriGuard photo scanner.',
      hi: 'एग्रीगार्ड स्कैनर से तुरंत पत्तों की फोटो जांच करें।',
      ta: 'அக்ரிகார்ட் கேமரா மூலம் இலைகளை உடனடியாக ஆய்வு செய்யவும்.'
    },
    isRead: false
  },
  {
    id: 'sms-03',
    timestamp: '20 Aug, 09:00 AM',
    type: 'treatment_reminder',
    urgency: 'normal',
    title: {
      en: '🌱 Follow-up Booster Spray Reminder (Day 5)',
      hi: '🌱 द्वितीय बूस्टर स्प्रे अनुस्मारक (दिन 5)',
      ta: '🌱 இரண்டாவது தெளிப்பு நினைவூட்டல் (நாள் 5)'
    },
    message: {
      en: 'AgriGuard Follow-up: It has been 5 days since your initial Neem/Bio-agent spray for Tomato plot. Apply second round to seal plant immunity.',
      hi: 'एग्रीगार्ड अनुस्मारक: टमाटर के खेत में पहला जैविक स्प्रे किए 5 दिन हो चुके हैं। पूर्ण सुरक्षा के लिए दूसरा स्प्रे आज करें।',
      ta: 'அக்ரிகார்ட் நினைவூட்டல்: முதல் தெளிப்பு செய்து 5 நாட்கள் ஆகிவிட்டன. முழுமையான பலன் பெற இரண்டாவது சுற்றை இன்று தெளிக்கவும்.'
    },
    isRead: true
  }
];
