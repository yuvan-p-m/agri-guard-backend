import { DiseaseDiagnosis } from '../types';

export const cropDiseases: DiseaseDiagnosis[] = [
  {
    id: 'citrus-canker',
    cropId: 'citrus',
    cropName: {
      en: 'Citrus (Orange / Sweet Lime / Lemon)',
      hi: 'संतरा / नींबू / मौसमी (Citrus)',
      ta: 'ஆரஞ்சு / எலுமிச்சை / சாத்துக்குடி'
    },
    diseaseName: {
      en: 'Citrus Bacterial Canker (Early Stage)',
      hi: 'सिट्रस कैंकर जीवाणु रोग (प्रारंभिक चरण)',
      ta: 'சிட்ரஸ் பாக்டீரியா புண் நோய் (ஆரம்ப நிலை)'
    },
    scientificName: 'Xanthomonas citri subsp. citri',
    pathogenType: 'Bacterium',
    stage: 'Early Stage (Inception)',
    confidence: 96.4,
    incubationPeriod: '5 - 14 Days',
    spreadRiskRate: 48,
    earlyWarningAlert: {
      en: 'Early pinhead lesions detected with characteristic oily water-soaked margins. Immediate spray required before monsoon showers disperse bacteria across orchard.',
      hi: 'पत्तियों पर हल्के तैलीय धब्बे दिखे हैं। बारिश से पहले तुरंत छिड़काव करें ताकि जीवाणु पूरे बागान में न फैले।',
      ta: 'இலைகளில் ஆரம்ப கட்ட எண்ணெய் போன்ற நீர்க்கசிவு புள்ளிகள் கண்டறியப்பட்டுள்ளன. மழைக்கு முன் உடனடியாக தெளிக்க வேண்டும்.'
    },
    symptoms: {
      en: [
        'Small, raised blister-like spots on leaves and twigs',
        'Yellow chlorotic halos surrounding brown corky centers',
        'Early leaf drop and premature fruit spotting if untreated'
      ],
      hi: [
        'पत्तियों और टहनियों पर छोटे उभरे हुए छाले जैसे धब्बे',
        'भूरे खुरदुरे केंद्रों के चारों ओर पीले छल्ले (Yellow Halo)',
        'शुरुआती अवस्था में पत्तियां गिरना और फलों पर निशान'
      ],
      ta: [
        'இலைகள் மற்றும் கிளைகளில் சிறிய கொப்பளம் போன்ற புள்ளிகள்',
        'பழுப்பு நிற மையத்தைச் சுற்றி மஞ்சள் வளையங்கள்',
        'இலை உதிர்தல் மற்றும் காய்களில் புள்ளிகள் தோன்றுதல்'
      ]
    },
    visualFeatures: ['Cork-like eruption', 'Yellow concentric halo', 'Leaf margin lesions'],
    organicProtocol: {
      overview: {
        en: 'Apply natural copper-based bio-bactericide combined with botanical extracts to strengthen leaf cuticle without chemical residue.',
        hi: 'बिना रासायनिक अवशेष के पत्तों की सुरक्षा के लिए तांबा युक्त जैविक जीवाणुनाशक और नीम अर्क का प्रयोग करें।',
        ta: 'இரசாயன எச்சங்கள் இன்றி இயற்கை செம்பு நுண்ணுயிர் கொல்லி மற்றும் வேப்ப எண்ணெய் கரைசலைப் பயன்படுத்தவும்.'
      },
      remedies: [
        {
          id: 'org-neem-oil',
          name: 'Cold-Pressed Neem Oil (1500 ppm) + Soap Emulsion',
          dosageFormula: (acres) => ({
            amount: `${(acres * 1200).toFixed(0)} ml (${(1.2 * acres).toFixed(1)} L)`,
            waterVolume: `${(acres * 200).toFixed(0)} Liters (10-12 Knapsack Tanks)`
          }),
          instructions: 'Mix 5ml Neem oil per liter of water with 1ml natural liquid soap. Spray on both upper and lower leaf surfaces.',
          schedule: 'Apply twice with 5 days interval during morning hours (7:00 AM - 9:30 AM).',
          safetyCaution: 'Do not spray when temperature exceeds 35°C.',
          phiDays: 0,
          productLinkIds: ['prod-neem-1500', 'prod-knapsack-sprayer']
        },
        {
          id: 'org-pseudomonas',
          name: 'Pseudomonas fluorescens (Bio-Bactericide powder)',
          dosageFormula: (acres) => ({
            amount: `${(acres * 1000).toFixed(0)} grams (1 kg/Acre)`,
            waterVolume: `${(acres * 200).toFixed(0)} Liters`
          }),
          instructions: 'Dissolve 5g/L water and drench canopy to colonize plant tissues against bacterial invasion.',
          schedule: 'Spray 7 days after neem application.',
          safetyCaution: 'Store bio-culture in cool shade away from direct sunlight.',
          phiDays: 0,
          productLinkIds: ['prod-pseudomonas-bio']
        }
      ]
    },
    chemicalProtocol: {
      overview: {
        en: 'Targeted bactericidal combination of Copper Oxychloride with Streptomycin formulation for rapid pathogen arrest.',
        hi: 'रोगजनक को तेजी से रोकने के लिए कॉपर ऑक्सीक्लोराइड और स्ट्रेप्टोमाइसिन का सटीक छिड़काव।',
        ta: 'பாக்டீரியாவை உடனடியாகக் கட்டுப்படுத்த காப்பர் ஆக்ஸிகுளோரைடு மற்றும் ஸ்ட்ரெப்டோமைசின் கலவை தெளிப்பு.'
      },
      remedies: [
        {
          id: 'chem-copper-strep',
          name: 'Copper Oxychloride 50% WP + Streptomycin Sulphate 90%',
          activeIngredient: 'Copper Oxychloride (50%) + Streptomycin (90%)',
          dosageFormula: (acres) => ({
            amount: `Copper Oxychloride: ${(acres * 500).toFixed(0)}g + Streptomycin: ${(acres * 20).toFixed(0)}g`,
            waterVolume: `${(acres * 200).toFixed(0)} Liters (12 Knapsack Tanks)`
          }),
          instructions: 'Dissolve 2.5g Copper Oxychloride and 0.1g Streptocycline per liter of clean water.',
          schedule: 'First spray immediately; repeat 2nd spray after 12-14 days if wet weather continues.',
          safetyCaution: 'Wear protective mask and gloves. Do not mix with acidic fertilizers or alkaline sprays.',
          phiDays: 14,
          productLinkIds: ['prod-copper-oxy', 'prod-ppe-kit', 'prod-strepto-plus']
        }
      ]
    },
    preventativeTips: {
      en: [
        'Prune and destroy infected twigs during dormant season before new flush emergence.',
        'Install windbreaks (such as Casuarina or Sesbania) around orchard perimeter to reduce rain-wind splash.',
        'Control Citrus Leaf Miner insect vectors which create wounds through which canker bacteria enter.'
      ],
      hi: [
        'नई पत्तियां आने से पहले संक्रमित टहनियों की छंटाई करके उन्हें जला दें।',
        'बाग के चारों ओर हवा रोधक पेड़ लगाएं ताकि हवा और बारिश से जीवाणु न फैले।',
        'सिट्रस लीफ माइनर कीट को नियंत्रित करें जो पत्तियों को काटकर संक्रमण का रास्ता बनाते हैं।'
      ],
      ta: [
        'புதிய துளிர்கள் வரும் முன் பாதிக்கப்பட்ட கிளைகளை கவாத்து செய்து எரிக்கவும்.',
        'காற்றின் மூலம் நோய் பரவுவதை தடுக்க தோட்டத்தைச் சுற்றி காற்றுத்தடுப்பு மரங்களை நடவும்.',
        'இலை துளைப்பான் புழுக்களைக் கட்டுப்படுத்துங்கள்.'
      ]
    },
    recommendedProductIds: ['prod-copper-oxy', 'prod-neem-1500', 'prod-pseudomonas-bio', 'prod-knapsack-sprayer', 'prod-ppe-kit'],
    sampleImage: '/images/auth-bg.png'
  },
  {
    id: 'tomato-late-blight',
    cropId: 'tomato',
    cropName: {
      en: 'Tomato / Solanaceous Vegetables',
      hi: 'टमाटर / शिमला मिर्च (Solanaceous)',
      ta: 'தக்காளி / குடைமிளகாய்'
    },
    diseaseName: {
      en: 'Tomato Late Blight (Early Spore Inception)',
      hi: 'टमाटर का पछेती झुलसा रोग (प्रारंभिक अवस्था)',
      ta: 'தக்காளி பின் பருவ கருகல் நோய் (ஆரம்ப நிலை)'
    },
    scientificName: 'Phytophthora infestans',
    pathogenType: 'Fungus',
    stage: 'Early Stage (Inception)',
    confidence: 94.8,
    incubationPeriod: '3 - 7 Days',
    spreadRiskRate: 65,
    earlyWarningAlert: {
      en: 'High atmospheric moisture (>85%) has triggered early zoospore germination on leaves. Act within 48 hours to prevent stem blackening and total fruit rot.',
      hi: 'उच्च आर्द्रता (>85%) के कारण पत्तों पर कवक बीजाणु पनपने लगे हैं। अगले 48 घंटे में छिड़काव करें।',
      ta: 'அதிக காற்றில் ஈரப்பதம் (>85%) காரணமாக இலைகளில் பூஞ்சை வித்திகள் வளரத் தொடங்கியுள்ளன. 48 மணி நேரத்திற்குள் மருந்து தெளிக்க வேண்டும்.'
    },
    symptoms: {
      en: [
        'Water-soaked greenish-brown irregular spots on leaf edges',
        'Delicate white fungal growth on leaf undersides in humid mornings',
        'Brown greasy lesions on stems'
      ],
      hi: [
        'पत्तियों के किनारों पर पानी से भीगे हरे-भूरे अनियमित धब्बे',
        'सुबह के समय पत्तियों की निचली सतह पर सफेद रुई जैसी फफूंद',
        'तनों पर भूरे चिकने धब्बे'
      ],
      ta: [
        'இலை விளிம்புகளில் நீர் ஊறிய பச்சை-பழுப்பு நிற ஒழுங்கற்ற புள்ளிகள்',
        'ஈரப்பதமான காலையில் இலையின் அடிப்பகுதியில் மெல்லிய வெள்ளை பூஞ்சை வளர்ச்சி',
        'தண்டுகளில் பழுப்பு நிற கறை'
      ]
    },
    visualFeatures: ['Water-soaked edge lesions', 'Underside white fuzz', 'Stem dark streaks'],
    organicProtocol: {
      overview: {
        en: 'Protective organic bio-fungicide coating using Trichoderma harzianum and Bordeaux mixture formulation.',
        hi: 'ट्राइकोडर्मा और बोर्डो मिश्रण का सुरक्षात्मक जैविक स्प्रे जो फफूंद के बीजाणुओं को नष्ट करता है।',
        ta: 'டிரைக்கோடெர்மா மற்றும் போர்டோ கலவை மூலம் இயற்கை முறையில் பூஞ்சையைக் கட்டுப்படுத்துதல்.'
      },
      remedies: [
        {
          id: 'org-tricho-spray',
          name: 'Trichoderma harzianum (Bio-Fungicide)',
          dosageFormula: (acres) => ({
            amount: `${(acres * 1000).toFixed(0)} grams (1 kg/Acre)`,
            waterVolume: `${(acres * 150).toFixed(0)} Liters (8-10 Knapsack Tanks)`
          }),
          instructions: 'Mix 5-7g per liter in water with 20g jaggery solution to activate beneficial spores before foliar spray.',
          schedule: 'Apply thoroughly to plant crown and soil surface every 7 days.',
          safetyCaution: 'Do not combine in same tank with chemical fungicides.',
          phiDays: 0,
          productLinkIds: ['prod-tricho-bio', 'prod-knapsack-sprayer']
        }
      ]
    },
    chemicalProtocol: {
      overview: {
        en: 'Systemic and translaminar protection using Azoxystrobin + Mancozeb or Dimethomorph for immediate knockdown.',
        hi: 'एज़ोक्सीस्ट्रोबिन और मैंकोज़ेब का छिड़काव जो पौधे के अंदर जाकर फफूंद को समाप्त करता है।',
        ta: 'அசோக்ஸிஸ்ட்ரோபின் மற்றும் மேன்கோசெப் கலவை மூலம் உடனடி பூஞ்சை அழிப்பு.'
      },
      remedies: [
        {
          id: 'chem-azoxy-mancozeb',
          name: 'Azoxystrobin 18.2% + Difenoconazole 11.4% SC',
          activeIngredient: 'Azoxystrobin + Difenoconazole',
          dosageFormula: (acres) => ({
            amount: `${(acres * 200).toFixed(0)} ml (1 ml/Liter water)`,
            waterVolume: `${(acres * 200).toFixed(0)} Liters (12 Tanks)`
          }),
          instructions: 'Spray 1 ml per liter of water covering both foliage and developing fruit bunches.',
          schedule: 'Single application now; follow up with Mancozeb 75% WP @ 2.5g/L after 10 days.',
          safetyCaution: 'Maintain 5-day pre-harvest waiting period. Wear goggles & gloves.',
          phiDays: 5,
          productLinkIds: ['prod-azoxy-difeno', 'prod-mancozeb-75', 'prod-ppe-kit']
        }
      ]
    },
    preventativeTips: {
      en: [
        'Stake plants and prune lower suckers to improve air circulation and prevent soil contact.',
        'Use drip irrigation instead of overhead sprinklers to keep foliage dry.',
        'Destroy volunteer tomato or potato plants nearby that can harbor overwintering spores.'
      ],
      hi: [
        'पौधों को बांस के सहारे बांधें और निचली पत्तियों को काटें ताकि हवा का बहाव ठीक रहे।',
        'फव्वारे की जगह ड्रिप सिंचाई करें ताकि पत्तियां गीली न रहें।',
        'खेत के आसपास उगे अनचाहे जंगली टमाटर या आलू के पौधों को उखाड़ कर फेंक दें।'
      ],
      ta: [
        'செடிகளுக்கு குச்சி கட்டி முட்டுக் கொடுக்கவும், அடிப்பகுதி இலைகளை கவாத்து செய்யவும்.',
        'இலைகள் நனையாமல் இருக்க சொட்டு நீர் பாசனத்தைப் பயன்படுத்தவும்.',
        'வயலைச் சுற்றியுள்ள தேவையில்லாத களைச் செடிகளை அழிக்கவும்.'
      ]
    },
    recommendedProductIds: ['prod-azoxy-difeno', 'prod-tricho-bio', 'prod-mancozeb-75', 'prod-knapsack-sprayer', 'prod-ppe-kit'],
    sampleImage: '/images/dashboard-bg.jpg'
  },
  {
    id: 'rice-brown-spot',
    cropId: 'rice',
    cropName: {
      en: 'Paddy / Rice',
      hi: 'धान / चावल (Paddy Rice)',
      ta: 'நெல் (Paddy Rice)'
    },
    diseaseName: {
      en: 'Paddy Brown Spot & Early Blast',
      hi: 'धान का भूरा धब्बा एवं झुलसा रोग',
      ta: 'நெல் பழுப்பு புள்ளி மற்றும் குலை நோய்'
    },
    scientificName: 'Bipolaris oryzae / Magnaporthe oryzae',
    pathogenType: 'Fungus',
    stage: 'Early Stage (Inception)',
    confidence: 93.2,
    incubationPeriod: '4 - 8 Days',
    spreadRiskRate: 42,
    earlyWarningAlert: {
      en: 'Oval sesame-seed shaped lesions spotted on tillering leaves. High risk of grain discoloration and panicle blast during upcoming heading stage.',
      hi: 'धान की पत्तियों पर तिल के आकार के भूरे धब्बे दिखने लगे हैं। बालियां आने से पहले उपचार करना आवश्यक है।',
      ta: 'நெல் இலைகளில் எள் போன்ற பழுப்பு நிற புள்ளிகள் தென்படுகின்றன. கதிர் வரும் முன் உடனே மருந்து தெளிக்க வேண்டும்.'
    },
    symptoms: {
      en: [
        'Small, circular to oval sesame-shaped spots with gray-white centers',
        'Yellowish halo around older spots on flag leaves',
        'Leaf tip drying and seedling blight'
      ],
      hi: [
        'पत्तियों पर छोटे, गोल या अंडाकार तिल जैसे धब्बे जिनके केंद्र भूरे-सफेद होते हैं',
        'पुराने धब्बों के चारों ओर पीला छल्ला',
        'पत्तियों के सिरे सूखना और कमजोर तना'
      ],
      ta: [
        'இலைகளில் சிறிய, நீள்வட்ட எள் வடிவ பழுப்புப் புள்ளிகள்',
        'புள்ளிகளைச் சுற்றி மஞ்சள் நிற வளையம்',
        'இலை நுனி காய்ந்து போதல்'
      ]
    },
    visualFeatures: ['Sesame-seed lesion shape', 'Gray necrotic center', 'Yellow ring on blade'],
    organicProtocol: {
      overview: {
        en: 'Foliar application of fermented butter milk + asafoetida with Pseudomonas seed & canopy treatment.',
        hi: 'खट्टी छाछ और हींग के घोल के साथ स्यूडोमोनास का छिड़काव जो प्राकृतिक रूप से फफूंद को दबाता है।',
        ta: 'புளித்த மோர் மற்றும் பெருங்காயக் கரைசல் உடன் சியூடோமோனாஸ் தெளிப்பு.'
      },
      remedies: [
        {
          id: 'org-fermented-spray',
          name: 'Pseudomonas fluorescens + Fermented Sour Butter Milk Spray',
          dosageFormula: (acres) => ({
            amount: `Pseudomonas: ${(acres * 1000).toFixed(0)}g + Sour Buttermilk: ${(acres * 5).toFixed(0)} Liters`,
            waterVolume: `${(acres * 200).toFixed(0)} Liters`
          }),
          instructions: 'Mix 5g Pseudomonas per liter in diluted 5-day old sour butter milk.',
          schedule: 'Spray twice at 10-day intervals during tillering and panicle initiation.',
          safetyCaution: 'Prepare fresh formulation in shaded container.',
          phiDays: 0,
          productLinkIds: ['prod-pseudomonas-bio', 'prod-knapsack-sprayer']
        }
      ]
    },
    chemicalProtocol: {
      overview: {
        en: 'Broad-spectrum triazole fungicide (Tebuconazole + Trifloxystrobin) for curative and preventive action.',
        hi: 'टेबुकोनाज़ोल और ट्राइफ्लॉक्सीस्ट्रोबिन का छिड़काव जो रोग को पूरी तरह रोकता है।',
        ta: 'டெபுகோனசோல் மற்றும் ட்ரைஃப்ளோக்ஸிஸ்ட்ரோபின் தெளிப்பு மூலம் முழுமையான கட்டுப்பாடு.'
      },
      remedies: [
        {
          id: 'chem-tebu-trifloxy',
          name: 'Trifloxystrobin 25% + Tebuconazole 50% WG (Nativo formulation)',
          activeIngredient: 'Trifloxystrobin + Tebuconazole',
          dosageFormula: (acres) => ({
            amount: `${(acres * 80).toFixed(0)} grams (0.4g / Liter water)`,
            waterVolume: `${(acres * 200).toFixed(0)} Liters`
          }),
          instructions: 'Dissolve 80g per acre in 200 liters of water. Spray using hollow cone nozzle.',
          schedule: 'Apply once at maximum tillering and repeat at 5% panicle emergence if humidity persists.',
          safetyCaution: 'Wear full protective gear. Keep livestock away from field for 72 hours.',
          phiDays: 21,
          productLinkIds: ['prod-nativo-wg', 'prod-ppe-kit', 'prod-knapsack-sprayer']
        }
      ]
    },
    preventativeTips: {
      en: [
        'Apply balanced potassium fertilizer (MOP) to enhance silica cell wall strength against fungal penetration.',
        'Avoid excessive nitrogen top-dressing during high humidity periods.',
        'Ensure proper drainage to prevent water stagnation in nursery and main fields.'
      ],
      hi: [
        'पोटाश (MOP) खाद का संतुलित प्रयोग करें जिससे पौधों की कोशिकाएं मजबूत बनती हैं।',
        'अधिक नमी के दिनों में अधिक यूरिया (नाइट्रोजन) देने से बचें।',
        'खेत में पानी जमा न होने दें और जल निकासी की व्यवस्था रखें।'
      ],
      ta: [
        'செடியின் நோய் எதிர்ப்புத் திறனை அதிகரிக்க பொட்டாஷ் உரத்தை சரியான அளவில் இடவும்.',
        'அதிக ஈரப்பதம் உள்ள நாட்களில் அதிகப்படியான யூரியா இடுவதைத் தவிர்க்கவும்.',
        'வயலில் தேங்கும் தண்ணீரை வடிக்க வடிகால் வசதி செய்யவும்.'
      ]
    },
    recommendedProductIds: ['prod-nativo-wg', 'prod-pseudomonas-bio', 'prod-potash-mop', 'prod-knapsack-sprayer', 'prod-ppe-kit'],
    sampleImage: '/images/dashboard-bg.jpg'
  },
  {
    id: 'chilli-leaf-curl',
    cropId: 'chilli',
    cropName: {
      en: 'Chilli / Bell Pepper',
      hi: 'मिर्च / शिमला मिर्च',
      ta: 'மிளகாய் / குடைமிளகாய்'
    },
    diseaseName: {
      en: 'Chilli Leaf Curl & Thrips/Mite Infestation',
      hi: 'मिर्च का पत्ता मरोड़ रोग एवं थ्रिप्स/माइट्स प्रकोप',
      ta: 'மிளகாய் இலை சுருட்டு நோய் மற்றும் அசுவினி தாக்குதல்'
    },
    scientificName: 'Chilli Leaf Curl Virus (Begomovirus) + Polyphagotarsonemus latus',
    pathogenType: 'Virus',
    stage: 'Early Stage (Inception)',
    confidence: 95.1,
    incubationPeriod: '6 - 10 Days',
    spreadRiskRate: 52,
    earlyWarningAlert: {
      en: 'Upward boat-shaped curling and puckering observed on tender apical leaves. Vector whiteflies and thrips active in surrounding field.',
      hi: 'ऊपरी नई पत्तियों का नाव के आकार में ऊपर की ओर मुड़ना देखा गया है। रस चूसक कीटों को तुरंत नियंत्रित करें।',
      ta: 'மேல் இலைகள் படகு வடிவில் மேல்நோக்கி சுருண்டு காணப்படுகின்றன. சாறு உறிஞ்சும் பூச்சிகளை உடனடியாக கட்டுப்படுத்தவும்.'
    },
    symptoms: {
      en: [
        'Upward and downward curling and crinkling of leaf margins',
        'Stunted growth of apical shoots with shortened internodes',
        'Flower dropping and deformed small chillies'
      ],
      hi: [
        'पत्तियों का ऊपर या नीचे की ओर मुड़ना और सिकुड़ना',
        'पौधों की बढ़वार रुकना और टहनियों का छोटा रह जाना',
        'फूलों का गिरना और छोटी विकृत मिर्च आना'
      ],
      ta: [
        'இலைகள் மேல்நோக்கி மற்றும் கீழ்நோக்கி சுருட்டுதல்',
        'செடியின் வளர்ச்சி குன்றிப் போதல்',
        'பூக்கள் உதிர்தல் மற்றும் காய் சுருங்குதல்'
      ]
    },
    visualFeatures: ['Boat-shaped upward curl', 'Vein clearing', 'Stunted shoot apex'],
    organicProtocol: {
      overview: {
        en: 'Agniastra / Dashaparni herbal decoction with Yellow and Blue sticky traps to eliminate whitefly and thrips vectors naturally.',
        hi: 'अग्निअस्त्र / दशपर्णी काढ़ा और पीले-नीले चिपचिपे ट्रैप का उपयोग जो रस चूसक कीटों को प्राकृतिक रूप से समाप्त करते हैं।',
        ta: 'அக்னி அஸ்திரம் மற்றும் மஞ்சள்/நீல ஒட்டும் பொறிகளைப் பயன்படுத்தி பூச்சிகளை இயற்கை முறையில் கட்டுப்படுத்துதல்.'
      },
      remedies: [
        {
          id: 'org-sticky-neem',
          name: 'Yellow + Blue Sticky Traps (20 Traps/Acre) + Karanj/Neem Oil 2%',
          dosageFormula: (acres) => ({
            amount: `${(acres * 20).toFixed(0)} Sticky Traps + ${(acres * 1000).toFixed(0)} ml Bio-Insecticide Oil`,
            waterVolume: `${(acres * 150).toFixed(0)} Liters`
          }),
          instructions: 'Install yellow traps for whiteflies and blue traps for thrips at canopy height. Spray neem-karanj oil at 5ml/L.',
          schedule: 'Spray every 5 days for 2 cycles to disrupt pest reproduction cycles.',
          safetyCaution: 'Hang traps securely away from direct irrigation splashes.',
          phiDays: 0,
          productLinkIds: ['prod-sticky-traps', 'prod-neem-1500', 'prod-knapsack-sprayer']
        }
      ]
    },
    chemicalProtocol: {
      overview: {
        en: 'Dual-action vector control using Diafenthiuron or Fipronil + Imidacloprid for instant vector knockdown.',
        hi: 'रस चूसक कीटों को तुरंत समाप्त करने के लिए डायाफेनथियुरॉन या फिप्रोनिल का छिड़काव।',
        ta: 'டயாபென்துரான் அல்லது பிப்ரோனில் மருந்து தெளித்து சாறு உறிஞ்சும் பூச்சிகளை உடனடியாக அழித்தல்.'
      },
      remedies: [
        {
          id: 'chem-diafen-spray',
          name: 'Diafenthiuron 50% WP (Pegasus formulation)',
          activeIngredient: 'Diafenthiuron (50%)',
          dosageFormula: (acres) => ({
            amount: `${(acres * 250).toFixed(0)} grams (1.25g / Liter water)`,
            waterVolume: `${(acres * 200).toFixed(0)} Liters`
          }),
          instructions: 'Dissolve 1.25g per liter. Spray thoroughly under the leaf surface where thrips and mites shelter.',
          schedule: 'Apply during late afternoon (4:00 PM onwards) for maximum pesticide uptake.',
          safetyCaution: 'Toxic to bees. Do not spray during peak flowering & pollinator foraging hours.',
          phiDays: 7,
          productLinkIds: ['prod-diafen-50', 'prod-ppe-kit', 'prod-knapsack-sprayer']
        }
      ]
    },
    preventativeTips: {
      en: [
        'Plant 3-4 border rows of maize, sorghum, or pearl millet around chilli plot as barrier crops.',
        'Use silver reflective plastic mulch to repel flying insect vectors.',
        'Immediately rogue out and destroy severely virus-infected stunted plants.'
      ],
      hi: [
        'मिर्च के खेत के चारों ओर मक्का या ज्वार की 3-4 कतारें लगाएं जो कीटों को रोकती हैं।',
        'सिल्वर-ब्लैक प्लास्टिक मल्चिंग का उपयोग करें जिससे कीट परावर्तित होकर भागते हैं।',
        'गंभीर रूप से मुड़े हुए रोगी पौधों को उखाड़कर तुरंत नष्ट कर दें।'
      ],
      ta: [
        'மிளகாய் வயலைச் சுற்றி மக்காச்சோளம் அல்லது சோளத்தை தடுப்புப் பயிராக நடவும்.',
        'பூச்சிகளை விரட்ட வெள்ளி நிற பிளாஸ்டிக் மூடுதாள் (Mulching) பயன்படுத்தவும்.',
        'அதிகமாக பாதிக்கப்பட்ட செடிகளை உடனே பிடுங்கி எரிக்கவும்.'
      ]
    },
    recommendedProductIds: ['prod-diafen-50', 'prod-sticky-traps', 'prod-neem-1500', 'prod-knapsack-sprayer', 'prod-ppe-kit'],
    sampleImage: '/images/dashboard-bg.jpg'
  },
  {
    id: 'healthy-crop-check',
    cropId: 'all-crops',
    cropName: {
      en: 'Healthy Crop (General Maintenance)',
      hi: 'स्वस्थ फसल (सामान्य रखरखाव)',
      ta: 'ஆரோக்கியமான பயிர் (பொது பராமரிப்பு)'
    },
    diseaseName: {
      en: 'No Active Pathogen / Optimal Health Detected',
      hi: 'कोई रोग नहीं मिला / फसल पूर्णतः स्वस्थ है',
      ta: 'நோய் தொற்று இல்லை / பயிர் நலமாக உள்ளது'
    },
    scientificName: 'Optimal Chlorophyll Index & Leaf Turgidity',
    pathogenType: 'Nutrient Deficiency',
    stage: 'Early Stage (Inception)',
    confidence: 98.2,
    incubationPeriod: 'N/A',
    spreadRiskRate: 0,
    earlyWarningAlert: {
      en: 'Your crop shows healthy cellular structure and vigorous chlorophyll density. Apply maintenance bio-stimulant foliar nutrition to boost immunity against upcoming weather shifts.',
      hi: 'आपकी फसल बिल्कुल स्वस्थ है। मौसम के बदलाव से सुरक्षा के लिए जैविक टॉनिक और सूक्ष्म पोषक तत्वों का छिड़काव करें।',
      ta: 'உங்கள் பயிர் நல்ல ஆரோக்கியத்துடன் உள்ளது. வரும் வானிலை மாற்றத்தை தாங்க நுண்ணூட்டச் சத்து தெளிக்கவும்.'
    },
    symptoms: {
      en: [
        'Vibrant green color with uniform leaf lamina',
        'No visible fungal spores, necrosis, or bacterial lesions',
        'Strong shoot turgor and active root development'
      ],
      hi: [
        'गहरा हरा रंग और स्वस्थ पत्तियां',
        'कोई फफूंद, धब्बे या कीड़ों के निशान नहीं',
        'पौधों का मजबूत तना और अच्छी बढ़वार'
      ],
      ta: [
        'சீரான பச்சை நிற இலைகள்',
        'பூஞ்சை புள்ளிகள் அல்லது பூச்சி தாக்குதல்கள் இல்லை',
        'நல்ல செழிப்பான வளர்ச்சி'
      ]
    },
    visualFeatures: ['Uniform green chlorophyll', 'Smooth leaf margin', 'Intact stomatal health'],
    organicProtocol: {
      overview: {
        en: 'Seaweed extract + Humic acid foliar spray for enhanced root depth and abiotic stress tolerance.',
        hi: 'समुद्री शैवाल का अर्क (Seaweed Extract) और ह्यूमिक एसिड का स्प्रे जो पैदावार और चमक बढ़ाता है।',
        ta: 'கடற்பாசி சாறு மற்றும் ஹியூமிக் அமிலம் தெளித்து செடியின் நோய் எதிர்ப்புத் திறனை கூட்டுதல்.'
      },
      remedies: [
        {
          id: 'org-seaweed-tonic',
          name: 'Liquid Seaweed Extract Bio-Stimulant (Ascophyllum nodosum)',
          dosageFormula: (acres) => ({
            amount: `${(acres * 500).toFixed(0)} ml (2.5 ml / Liter water)`,
            waterVolume: `${(acres * 200).toFixed(0)} Liters`
          }),
          instructions: 'Mix 2.5ml per liter of water and spray during active vegetative or flowering phase.',
          schedule: 'Spray once every 20-25 days for robust canopy development.',
          safetyCaution: '100% natural and non-toxic. Safe for beneficial pollinators.',
          phiDays: 0,
          productLinkIds: ['prod-seaweed-extract', 'prod-knapsack-sprayer']
        }
      ]
    },
    chemicalProtocol: {
      overview: {
        en: 'Chelated Micronutrient mixture (Zinc, Boron, Iron, Manganese) to prevent hidden hunger.',
        hi: 'सूक्ष्म पोषक तत्व मिश्रण (जिंक, बोरॉन, आयरन) का छिड़काव जो पोषण की कमी नहीं होने देता।',
        ta: 'துத்தநாகம், போரான் கலந்த நுண்ணூட்டச் சத்து தெளிப்பு.'
      },
      remedies: [
        {
          id: 'chem-micronutrient-mix',
          name: 'Chelated Multi-Micronutrient Foliar Spray Grade 4',
          activeIngredient: 'Zn (3%), Fe (2.5%), Mn (1%), B (0.5%), Cu (0.2%)',
          dosageFormula: (acres) => ({
            amount: `${(acres * 400).toFixed(0)} grams (2g / Liter water)`,
            waterVolume: `${(acres * 200).toFixed(0)} Liters`
          }),
          instructions: 'Dissolve 2g per liter with a non-ionic spreader adjuvant.',
          schedule: 'Apply during early morning for maximum stomatal absorption.',
          safetyCaution: 'Avoid spraying under direct midday heat.',
          phiDays: 0,
          productLinkIds: ['prod-micronutrient-chelated', 'prod-knapsack-sprayer']
        }
      ]
    },
    preventativeTips: {
      en: [
        'Maintain soil moisture within 60-70% field capacity with timely irrigation cycles.',
        'Scout fields twice weekly using the AgriGuard scanner to catch any micro-infestation early.',
        'Keep field borders free of alternate weed hosts.'
      ],
      hi: [
        'खेत में पर्याप्त नमी बनाए रखें और समय पर सिंचाई करें।',
        'हफ्ते में दो बार एग्रीगार्ड ऐप से पत्तियों की जांच करते रहें ताकि कोई नया रोग न पनपे।',
        'खेत की मेड़ों को खरपतवार मुक्त रखें।'
      ],
      ta: [
        'வயலில் சரியான ஈரப்பதத்தை பராமரிக்கவும்.',
        'வாரத்திற்கு இருமுறை அக்ரிகார்ட் ஆப் மூலம் பயிர்களை தொடர்ந்து கண்காணிக்கவும்.',
        'வரப்புகளில் களைகள் இல்லாமல் சுத்தமாக வைத்திருக்கவும்.'
      ]
    },
    recommendedProductIds: ['prod-seaweed-extract', 'prod-micronutrient-chelated', 'prod-knapsack-sprayer'],
    sampleImage: '/images/auth-bg.png'
  }
];
