import { EcomProduct } from '../types';

export const ecommerceProducts: EcomProduct[] = [
  {
    id: 'prod-copper-oxy',
    name: 'Blitox Copper Oxychloride 50% WP (Fungicide & Bactericide)',
    category: 'Chemical Fungicide',
    brand: 'Tata Rallis Agri / Blitox',
    packSize: '500 g Pack',
    price: 345,
    originalPrice: 420,
    rating: 4.8,
    reviewCount: 1420,
    badge: 'Govt Certified',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=500&auto=format&fit=crop&q=60',
    description: {
      en: 'Broad-spectrum protective copper bactericide for citrus canker, leaf spots, and vegetable blights.',
      hi: 'सिट्रस कैंकर, पत्ती धब्बा और सब्जियों के झुलसा रोग के लिए प्रभावी तांबा आधारित जीवाणुनाशक।',
      ta: 'சிட்ரஸ் புண் மற்றும் காய்கறி கருகல் நோய்களைக் கட்டுப்படுத்தும் சிறந்த காப்பர் மருந்து.'
    },
    vendor: 'Kisan Kendra Direct'
  },
  {
    id: 'prod-neem-1500',
    name: 'EcoNeem Pure Cold-Pressed 1500 PPM Azadirachtin',
    category: 'Organic Bio-Fungicide',
    brand: 'Godrej Agrovet Organic',
    packSize: '1 Liter Bottle',
    price: 490,
    originalPrice: 580,
    rating: 4.9,
    reviewCount: 2310,
    badge: 'Organic India',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=500&auto=format&fit=crop&q=60',
    description: {
      en: '100% organic botanical anti-feedant, pest repellant and natural bactericide. Zero chemical residue.',
      hi: '100% प्राकृतिक शुद्ध नीम तेल। कीटों और जीवाणुओं को भगाने के लिए सुरक्षित जैविक उपाय।',
      ta: '100% தூய இயற்கை வேப்ப எண்ணெய். பூச்சிகள் மற்றும் நோய்களை கட்டுப்படுத்தும் இயற்கை தீர்வு.'
    },
    vendor: 'IFFCO Kisan Bazaar'
  },
  {
    id: 'prod-azoxy-difeno',
    name: 'Amistar Top (Azoxystrobin 18.2% + Difenoconazole 11.4% SC)',
    category: 'Chemical Fungicide',
    brand: 'Syngenta Crop Protection',
    packSize: '200 ml Pack',
    price: 880,
    originalPrice: 1050,
    rating: 4.9,
    reviewCount: 3100,
    badge: 'Best Seller',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=500&auto=format&fit=crop&q=60',
    description: {
      en: 'Dual-action systemic fungicide for immediate knockdown of late blight, powdery mildew, and anthracnose.',
      hi: 'टमाटर के पछेती झुलसा, पाउडरी मिल्ड्यू और फल सड़न के लिए अत्यंत प्रभावी सिस्टेमिक फफूंदनाशक।',
      ta: 'தக்காளி கருகல் மற்றும் சாம்பல் நோயைக் கட்டுப்படுத்தும் சக்திவாய்ந்த பூஞ்சைக் கொல்லி.'
    },
    vendor: 'Syngenta Official Partner'
  },
  {
    id: 'prod-tricho-bio',
    name: 'Niprot Trichoderma harzianum Bio-Fungicide Powder',
    category: 'Organic Bio-Fungicide',
    brand: 'Biotech Kisan Consortium',
    packSize: '1 kg Foil Pack',
    price: 260,
    originalPrice: 320,
    rating: 4.7,
    reviewCount: 980,
    badge: 'Govt Certified',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=60',
    description: {
      en: 'Living antagonistic bio-agent that destroys fungal mycelium in soil and foliage naturally.',
      hi: 'मिट्टी और पत्तियों में फफूंद को नष्ट करने वाला लाभकारी जैविक फफूंदनाशक पाउडर।',
      ta: 'மண் மற்றும் பயிர்களில் உள்ள பூஞ்சைகளை அழிக்கும் நன்மை செய்யும் நுண்ணுயிர் தூள்.'
    },
    vendor: 'Kisan Bio Agri'
  },
  {
    id: 'prod-nativo-wg',
    name: 'Nativo 75 WG (Tebuconazole 50% + Trifloxystrobin 25%)',
    category: 'Chemical Fungicide',
    brand: 'Bayer CropScience',
    packSize: '100 g Pack',
    price: 680,
    originalPrice: 790,
    rating: 4.9,
    reviewCount: 1840,
    badge: 'Best Seller',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&auto=format&fit=crop&q=60',
    description: {
      en: 'Premium solution for rice blast, sheath blight, and spot diseases with yield enhancement benefit.',
      hi: 'धान के ब्लास्ट और भूरा धब्बा रोग के लिए बायर का विश्व प्रसिद्ध फफूंदनाशक।',
      ta: 'நெல் குலை நோய் மற்றும் இலைப்புள்ளி நோய்க்கான சிறந்த தீர்வு.'
    },
    vendor: 'Bayer Agri Express'
  },
  {
    id: 'prod-diafen-50',
    name: 'Pegasus Diafenthiuron 50% WP Insecticide & Miticide',
    category: 'Pesticide',
    brand: 'Syngenta Agri',
    packSize: '250 g Box',
    price: 920,
    originalPrice: 1100,
    rating: 4.8,
    reviewCount: 890,
    badge: 'Govt Certified',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=500&auto=format&fit=crop&q=60',
    description: {
      en: 'Fast acting contact and stomach poison for controlling thrips, mites, and whiteflies in chilli.',
      hi: 'मिर्च के थ्रिप्स, माइट्स और सफेद मक्खी को तुरंत समाप्त करने वाली असरदार दवा।',
      ta: 'மிளகாயில் உள்ள அசுவினி, சிலந்தி மற்றும் வெள்ளை ஈக்களை அழிக்கும் சிறந்த மருந்து.'
    },
    vendor: 'Krishi Vikas Kendra'
  },
  {
    id: 'prod-sticky-traps',
    name: 'AgriGuard Yellow & Blue Insect Sticky Traps (Pack of 25)',
    category: 'Sprayer Equipment',
    brand: 'AgriGuard AgroTech',
    packSize: '25 Heavy Duty Traps',
    price: 299,
    originalPrice: 450,
    rating: 4.7,
    reviewCount: 1250,
    badge: 'Organic India',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=500&auto=format&fit=crop&q=60',
    description: {
      en: 'UV-resistant weatherproof traps that capture thrips, aphids, and whiteflies without chemicals.',
      hi: 'कीड़ों को पकड़ने वाले मजबूत चिपचिपे पीले और नीले ट्रैप। 100% जैविक सुरक्षा।',
      ta: 'ரசாயனம் இன்றி பூச்சிகளைப் பிடிக்கும் புற ஊதா எதிர்ப்பு ஒட்டும் பொறிகள்.'
    },
    vendor: 'AgriGuard Direct'
  },
  {
    id: 'prod-knapsack-sprayer',
    name: 'Battery 2-in-1 Knapsack Sprayer 16L Heavy Duty (12V 12Ah)',
    category: 'Sprayer Equipment',
    brand: 'Neptune Agri Farming',
    packSize: '16 Liter Tank Unit',
    price: 2450,
    originalPrice: 3200,
    rating: 4.8,
    reviewCount: 4120,
    badge: 'Next-Day Delivery',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=500&auto=format&fit=crop&q=60',
    description: {
      en: 'Continuous pressure electric backpack sprayer with adjustable brass nozzle set and padded shoulder straps.',
      hi: '16 लीटर क्षमता वाला शक्तिशाली बैटरी चालित स्प्रेयर। सटीक छिड़काव के लिए पीतल के 4 नोजल के साथ।',
      ta: '16 லிட்டர் கொள்ளளவு கொண்ட பேட்டரி தெளிப்பான். பித்தளை முனைகளுடன் கூடியது.'
    },
    vendor: 'AgriTools India'
  },
  {
    id: 'prod-ppe-kit',
    name: 'Farmer Protective Safety Kit (Coverall + N95 Mask + Nitrile Gloves + Goggles)',
    category: 'Sprayer Equipment',
    brand: 'Kisan Shield Safety',
    packSize: 'Full 4-Piece Kit',
    price: 380,
    originalPrice: 550,
    rating: 4.9,
    reviewCount: 830,
    badge: 'Govt Certified',
    inStock: true,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    description: {
      en: 'Essential protective gear to prevent chemical inhalation and skin contact during spraying.',
      hi: 'छिड़काव के समय किसान की सुरक्षा के लिए मास्क, चश्मा, दस्ताने और सूट का पूरा सेट।',
      ta: 'மருந்து தெளிக்கும் போது உடலையும் கண்களையும் பாதுகாக்கும் முழு கவச உடை தொகுப்பு.'
    },
    vendor: 'Kisan Safety Direct'
  }
];
