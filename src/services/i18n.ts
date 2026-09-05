import { useState, useEffect } from 'react';

export type Language = 'en' | 'hi' | 'bn';

export const LANGUAGES: { code: Language; label: string; nativeName: string }[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिंदी' },
  { code: 'bn', label: 'Bengali', nativeName: 'বাংলা' },
];

const STORAGE_LANG_KEY = 'kishan_seva_lang_pref';

type Translations = Record<string, Record<Language, string>>;

export const translations: Translations = {
  // Top Govt Bar
  govt_initiative: {
    en: 'Govt of India Initiative',
    hi: 'भारत सरकार की पहल',
    bn: 'ভারত সরকারের উদ্যোগ',
  },
  dept_title: {
    en: 'Department of Agriculture & Farmers Welfare • Ministry of Agriculture',
    hi: 'कृषि एवं किसान कल्याण विभाग • कृषि मंत्रालय',
    bn: 'কৃষি ও কৃষক কল্যাণ বিভাগ • কৃষি মন্ত্রণালয়',
  },
  call_centre: {
    en: 'Kisan Call Centre (Toll Free):',
    hi: 'किसान कॉल सेंटर (टोल फ्री):',
    bn: 'কিষাণ কল সেন্টার (টোল ফ্রি):',
  },
  
  // Navigation
  brand_subtitle: {
    en: 'Digital MSP Procurement & Queue Portal',
    hi: 'डिजिटल एमएसपी खरीद एवं कतार प्रबंधन पोर्टल',
    bn: 'ডিজিটাল এমএসপি সংগ্রহ ও কিউ ব্যবস্থাপনা পোর্টাল',
  },
  nav_home: {
    en: 'Home',
    hi: 'मुख्य पृष्ठ',
    bn: 'মূল পাতা',
  },
  nav_centres: {
    en: 'Procurement Centres',
    hi: 'खरीद केंद्र',
    bn: 'ক্রয় কেন্দ্র (মন্ডি)',
  },
  nav_msp: {
    en: 'MSP Rates 2026',
    hi: 'एमएसपी दरें 2026',
    bn: 'এমএসপি সরকারি দর ২০২৬',
  },
  nav_how_it_works: {
    en: 'How It Works',
    hi: 'कार्यप्रणाली',
    bn: 'কীভাবে কাজ করে',
  },
  nav_faqs: {
    en: 'FAQs & Help',
    hi: 'सहायता एवं सवाल',
    bn: 'প্রশ্নোত্তর ও সহায়তা',
  },
  find_mandi_btn: {
    en: 'Find Mandi',
    hi: 'मंडी खोजें',
    bn: 'মন্ডি খুঁজুন',
  },
  login_btn: {
    en: 'Login / Portals',
    hi: 'लॉग इन / पोर्टल',
    bn: 'লগইন / পোর্টাল',
  },

  // MSP Marquee
  msp_ticker_label: {
    en: 'Govt. MSP Rates (2026 Season):',
    hi: 'सरकारी एमएसपी दरें (2026 सत्र):',
    bn: 'সরকারি নির্ধারিত ন্যূনতম সহায়ক মূল্য (২০২৬):',
  },

  // Hero Section
  hero_badge: {
    en: 'Direct Benefit Transfer (DBT) Assured',
    hi: 'प्रत्यक्ष लाभ अंतरण (DBT) सुनिश्चित',
    bn: 'সরাসরি ব্যাংক অ্যাকাউন্টে টাকা (DBT) নিশ্চিত',
  },
  hero_title_1: {
    en: 'Empowering Farmers,',
    hi: 'किसानों का सशक्तिकरण,',
    bn: 'কৃষকের ক্ষমতায়ন,',
  },
  hero_title_2: {
    en: 'Strengthening Bharat',
    hi: 'सशक्त भारत का निर्माण',
    bn: 'সমৃদ্ধ ভারতের নির্মাণ',
  },
  hero_subtitle: {
    en: 'Smart Agricultural Procurement & Live Token Queue Platform',
    hi: 'स्मार्ट कृषि खरीद एवं डिजिटल टोकन कतार प्रबंधन प्रणाली',
    bn: 'স্মার্ট কৃষি সংগ্রহ ও ডিজিটাল টোকেন কিউ ব্যবস্থাপনা পোর্টাল',
  },
  hero_desc: {
    en: 'Book your procurement slot, skip endless physical mandi queues, receive automated fair moisture testing, and track DBT payments directly into your bank account within 48 hours.',
    hi: 'अपनी सुविधानुसार खरीद स्लॉट बुक करें, मंडी की लंबी कतारों से बचें, डिजिटल गुणवत्ता प्रमाणन प्राप्त करें और 48 घंटों में सीधा बैंक भुगतान पाएं।',
    bn: 'আপনার সুবিধামতো ফসল বিক্রির স্লট বুক করুন, মন্ডির দীর্ঘ লাইন এড়ান, সঠিক আর্দ্রতা পরীক্ষা পান এবং ৪৮ ঘণ্টার মধ্যে সরাসরি ব্যাংক অ্যাকাউন্টে টাকা বুঝে নিন।',
  },
  book_slot_now: {
    en: 'Book a Slot Now',
    hi: 'अभी स्लॉट बुक करें',
    bn: 'এখনই স্লট বুক করুন',
  },
  watch_tour: {
    en: 'Watch System Tour',
    hi: 'वीडियो निर्देशिका देखें',
    bn: 'ভিডিও সহায়িকা দেখুন',
  },

  // Feature Badges
  feat_msp: {
    en: 'Guaranteed MSP',
    hi: 'न्यूनतम समर्थन मूल्य',
    bn: 'নিশ্চিত সরকারি দর (MSP)',
  },
  feat_waiting: {
    en: 'Zero Wait Time',
    hi: 'शून्य प्रतीक्षा समय',
    bn: 'শূন্য অপেক্ষার সময়',
  },
  feat_weight: {
    en: 'Digital Weight',
    hi: 'कंप्यूटरीकृत तौल',
    bn: 'ডিজিটাল সঠিক ওজন',
  },
  feat_dbt: {
    en: 'Direct DBT',
    hi: 'सीधा बैंक खाता',
    bn: 'সরাসরি ব্যাংক পেমেন্ট',
  },

  // Hero Tagline on Image
  hero_overlay_tagline: {
    en: 'Samay ki bachat, Kisano ki unnati',
    hi: 'समय की बचत, किसानों की उन्नति',
    bn: 'সময়ের সাশ্রয়, কৃষকের উন্নতি',
  },
  hero_portal_year: {
    en: 'Kishan Seva Portal 2026',
    hi: 'किशन सेवा पोर्टल 2026',
    bn: 'কিষাণ সেবা পোর্টাল ২০২৬',
  },

  // Stats
  stat_farmers: {
    en: 'Registered Farmers',
    hi: 'पंजीकृत किसान',
    bn: 'নিবন্ধিত কৃষক',
  },
  stat_centres: {
    en: 'Procurement Centres',
    hi: 'खरीद केंद्र',
    bn: 'সক্রিয় ক্রয় কেন্দ্র',
  },
  stat_dbt: {
    en: 'DBT Disbursed',
    hi: 'डीबीटी भुगतान',
    bn: 'সরাসরি ব্যাংক প্রদান',
  },
  stat_transparent: {
    en: 'Transparent & Digital',
    hi: 'पारदर्शी एवं डिजिटल',
    bn: '১০০% ডিজিটাল ও স্বচ্ছ',
  },

  // Mandi Discovery
  mandi_title: {
    en: 'Find Your Nearest Procurement Centre',
    hi: 'अपने निकटतम खरीद केंद्र का पता लगाएं',
    bn: 'আপনার নিকটবর্তী ফসল ক্রয় কেন্দ্র (মন্ডি) খুঁজুন',
  },
  mandi_subtitle: {
    en: 'Real-time queue depth, daily capacity, and accepted crop status across Mandis.',
    hi: 'वास्तविक समय में कतार, दैनिक क्षमता एवं स्वीकृत फसलों की स्थिति देखें।',
    bn: 'রিয়েল-টাইম লাইনের চাপ, দৈনিক ধারণক্ষমতা এবং ফসল গ্রহণের তথ্য দেখুন।',
  },
  search_placeholder: {
    en: 'Search centre, district, block...',
    hi: 'केंद्र या जिला खोजें...',
    bn: 'কেন্দ্র বা জেলার নাম দিয়ে খুঁজুন...',
  },
  all_crops: {
    en: 'All',
    hi: 'सभी',
    bn: 'সব ফসল',
  },
  paddy: {
    en: 'Paddy',
    hi: 'धान',
    bn: 'ধান',
  },
  wheat: {
    en: 'Wheat',
    hi: 'गेहूं',
    bn: 'গম',
  },
  mustard: {
    en: 'Mustard',
    hi: 'सरसों',
    bn: 'সরিষা',
  },
  maize: {
    en: 'Maize',
    hi: 'मक्का',
    bn: 'ভুট্টা',
  },
  open_status: {
    en: 'Open',
    hi: 'खुला है',
    bn: 'চালু আছে',
  },
  distance_label: {
    en: 'Distance',
    hi: 'दूरी',
    bn: 'দূরত্ব',
  },
  in_queue_label: {
    en: 'In Queue',
    hi: 'कतार में',
    bn: 'লাইনে গাড়ি',
  },
  est_wait_label: {
    en: 'Est. Wait',
    hi: 'अनुमानित समय',
    bn: 'অপেক্ষার সময়',
  },
  accepted_crops_label: {
    en: 'Accepted Crops',
    hi: 'स्वीकृत फसलें',
    bn: 'গৃহীত ফসলসমূহ',
  },
  daily_cap_label: {
    en: 'Capacity:',
    hi: 'दैनिक क्षमता:',
    bn: 'দৈনিক ক্ষমতা:',
  },
  book_slot_here: {
    en: 'Book Slot Here',
    hi: 'यहाँ स्लॉट बुक करें',
    bn: 'এখানে স্লট বুক করুন',
  },
  view_all_mandis: {
    en: 'View All Mandis & Live Interactive Map →',
    hi: 'सभी मंडियां और लाइव नक्शा देखें →',
    bn: 'সকল মন্ডি এবং মানচিত্র দেখুন →',
  },

  // 4 Steps
  steps_badge: {
    en: '4-Step Transparent Journey',
    hi: '4-चरणीय पारदर्शी प्रक्रिया',
    bn: '৪টি সহজ ধাপে সম্পূর্ণ সংগ্রহ',
  },
  steps_title: {
    en: 'From Harvest to Direct Payment in 48 Hours',
    hi: 'खेत से सीधे बैंक खाते तक आसान प्रक्रिया',
    bn: 'ফসল কাটা থেকে ৪৮ ঘণ্টার মধ্যে সরাসরি ব্যাংক পেমেন্ট',
  },
  steps_subtitle: {
    en: 'A fully computerized, transparent, middleman-free procurement system designed for every Indian farmer.',
    hi: 'पूरी तरह से कंप्यूटरीकृत, पारदर्शी और बिचौलिया-मुक्त खरीद प्रक्रिया।',
    bn: 'সম্পূর্ণ কম্পিউটারাইজড, স্বচ্ছ এবং মধ্যস্বত্বভোগী-মুক্ত সরকারি ক্রয় ব্যবস্থা।',
  },
  step1_title: {
    en: 'Book Time Slot',
    hi: 'स्लॉट बुक करें',
    bn: '১. সময় ও স্লট বুকিং',
  },
  step1_desc: {
    en: 'Select nearby centre, crop, date, and preferred morning or afternoon window.',
    hi: 'निकटतम केंद्र, फसल और अपनी सुविधानुसार समय चुनें।',
    bn: 'নিকটস্থ ক্রয় কেন্দ্র, ফসল এবং আপনার সুবিধাজনক সময় বেছে নিন।',
  },
  step2_title: {
    en: 'Fast Gate Entry',
    hi: 'गेट एंट्री टोकन',
    bn: '২. গেট এন্ট্রি টোকেন',
  },
  step2_desc: {
    en: 'Arrive at the scheduled time. Scan your digital QR token and skip physical queues.',
    hi: 'मंडी गेट पर डिजिटल टोकन दिखाएं और लंबी लाइनों से बचें।',
    bn: 'নির্ধারিত সময়ে পৌঁছান। ডিজিটাল কিউআর কোড স্ক্যান করে সরাসরি প্রবেশ করুন।',
  },
  step3_title: {
    en: 'Automated Assay',
    hi: 'पारदर्शी गुणवत्ता जांच',
    bn: '৩. ডিজিটাল গুণমান ও আর্দ্রতা পরীক্ষা',
  },
  step3_desc: {
    en: 'Computerized moisture meter & foreign matter check with instant digital QC report.',
    hi: 'कंप्यूटरीकृत नमी मीटर और तत्काल डिजिटल गुणवत्ता प्रमाणपत्र।',
    bn: 'কম্পিউটারাইজড আর্দ্রতা মিটার এবং অনলাইনেই ন্যায্য গ্রেড সার্টিফিকেট।',
  },
  step4_title: {
    en: 'Weigh & Direct DBT',
    hi: 'तौल और सीधा भुगतान',
    bn: '৪. ইলেকট্রনিক ওজন ও সরাসরি ব্যাংক পেমেন্ট',
  },
  step4_desc: {
    en: 'Certified weighbridge gross/tare recording. e-J-Form issued with payment in 48 hrs.',
    hi: 'इलेक्ट्रॉनिक धर्मकांटा तौल। तुरंत ई-जे-फॉर्म पर्ची और 48 घंटे में बैंक में राशि।',
    bn: 'ডিজিটাল ধর্মকাঁটায় সঠিক ওজন। ই-জে-ফর্ম রসিদ এবং ৪৮ ঘণ্টায় অ্যাকাউন্টে টাকা।',
  },

  // Role Selection
  roles_header_badge: {
    en: 'Select Your Access Portal',
    hi: 'अपना पोर्टल चुनें',
    bn: 'আপনার পোর্টাল বেছে নিন',
  },
  roles_title: {
    en: 'Choose Your Role to Continue',
    hi: 'आगे बढ़ने के लिए अपनी भूमिका चुनें',
    bn: 'এগিয়ে যাওয়ার জন্য আপনার পরিচয় নির্বাচন করুন',
  },
  roles_subtitle: {
    en: 'Dedicated interfaces tailored for farmers, mandi operators, and government supervisors.',
    hi: 'किसानों, मंडी ऑपरेटरों और सरकारी अधिकारियों के लिए समर्पित इंटरफ़ेस।',
    bn: 'কৃষক, মন্ডি কর্মকর্তা এবং প্রশাসনিক আধিকারিকদের জন্য আলাদা ইন্টারফেস।',
  },
  role_farmer_title: {
    en: 'Farmer Portal',
    hi: 'किसान सेवा पोर्टल',
    bn: 'কৃষক সেবা পোর্টাল',
  },
  role_farmer_subtitle: {
    en: 'Primary Producers',
    hi: 'प्राथमिक उत्पादक',
    bn: 'কৃষক ও চাষী ভাইদের জন্য',
  },
  role_farmer_desc: {
    en: 'Book procurement slots, monitor live queue status, inspect automated quality grades, and track bank payouts.',
    hi: 'खरीद स्लॉट बुक करें, लाइव कतार देखें, गुणवत्ता ग्रेड जांचें और बैंक भुगतान ट्रैक करें।',
    bn: 'ফসল বিক্রির স্লট বুক করুন, লাইভ টোকেন ট্র্যাক করুন, আর্দ্রতা রিপোর্ট ও ব্যাংক পেমেন্ট দেখুন।',
  },
  role_operator_title: {
    en: 'Centre Operator',
    hi: 'मंडी ऑपरेटर पोर्टल',
    bn: 'মন্ডি ক্রয় কেন্দ্র অপারেটর',
  },
  role_operator_subtitle: {
    en: 'Procurement Centres',
    hi: 'खरीद केंद्र कर्मचारी',
    bn: 'ক্রয় কেন্দ্র কর্মী ও পরিদর্শক',
  },
  role_operator_desc: {
    en: 'Call tokens, verify farmer credentials, execute moisture lab assays, record weighbridge weights, and disburse receipts.',
    hi: 'टोकन बुलाएं, किसान सत्यापन करें, नमी परीक्षण करें और इलेक्ट्रॉनिक तौल पर्ची जारी करें।',
    bn: 'টোকেন ডাকুন, কিউ পরিচালনা করুন, আর্দ্রতা পরীক্ষা করুন এবং ইলেকট্রনিক ওজন রসিদ প্রদান করুন।',
  },
  role_admin_title: {
    en: 'State Admin',
    hi: 'राज्य प्रशासनिक पोर्टल',
    bn: 'রাজ্য প্রশাসনিক পোর্টাল',
  },
  role_admin_subtitle: {
    en: 'State Oversight',
    hi: 'राज्य निगरानी केंद्र',
    bn: 'রাজ্য কৃষি দপ্তর ও খাদ্য সরবরাহ',
  },
  role_admin_desc: {
    en: 'District-wise procurement metrics, live target fulfillment, centre capacity toggling, and exportable financial logs.',
    hi: 'जिलावार खरीद आंकड़े, लाइव लक्ष्य पूर्ति, केंद्र क्षमता प्रबंधन और वित्तीय ऑडिट रिपोर्ट।',
    bn: 'জেলা ভিত্তিক সংগ্রহ লক্ষ্যমাত্রা, মন্ডি নিয়ন্ত্রণ, তহবিল পর্যবেক্ষণ ও অডিট রিপোর্ট ডাউনলোড।',
  },

  // FAQs
  faq_heading: {
    en: 'Frequently Asked Questions',
    hi: 'अक्सर पूछे जाने वाले सवाल',
    bn: 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)',
  },
  faq_badge: {
    en: 'Farmer Helpdesk',
    hi: 'किसान सहायता केंद्र',
    bn: 'কৃষক সহায়তা ডেস্ক',
  },

  // Footer
  footer_initiative: {
    en: 'A flagship initiative by the Ministry of Agriculture & Farmers Welfare, Government of India. Ensuring MSP assurance, transparent electronic weighing, and timely Direct Benefit Transfer for millions of farmers across Bharat.',
    hi: 'कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार की एक प्रमुख पहल। देश भर के करोड़ों किसानों के लिए एमएसपी की गारंटी, पारदर्शी इलेक्ट्रॉनिक तौल और समय पर प्रत्यक्ष लाभ अंतरण।',
    bn: 'ভারত সরকারের কৃষি ও কৃষক কল্যাণ মন্ত্রণালয়ের একটি যুগান্তকারী উদ্যোগ। ভারত জুড়ে কোটি কোটি কৃষকদের জন্য নিশ্চিত এমএসপি, নির্ভুল ডিজিটাল ওজন এবং সরাসরি ব্যাংক একাউন্টে টাকা।',
  },
  footer_tag1: {
    en: '🌾 100% MSP Assured',
    hi: '🌾 100% एमएसपी गारंटी',
    bn: '🌾 ১০০% নিশ্চিত সরকারি দর (MSP)',
  },
  footer_tag2: {
    en: '⚡ 48-Hour DBT',
    hi: '⚡ 48 घंटे में डीबीटी',
    bn: '⚡ ৪৮ ঘণ্টার মধ্যে সরাসরি ব্যাংক পেমেন্ট',
  },
  footer_tag3: {
    en: '📱 Zero Middlemen',
    hi: '📱 बिचौलिया-मुक्त प्रणाली',
    bn: '📱 মধ্যস্বত্বভোগী ছাড়া সম্পূর্ণ স্বচ্ছ',
  },
  footer_rights: {
    en: '© 2026 Government of India — Kishan Seva Portal. All rights reserved.',
    hi: '© 2026 भारत सरकार — किशन सेवा पोर्टल। सर्वाधिकार सुरक्षित।',
    bn: '© ২০২৬ ভারত সরকার — কিষাণ সেবা পোর্টাল। সর্বস্বত্ব সংরক্ষিত।',
  },

  // Role Selection & Auth
  back_to_home: {
    en: 'Back to Kishan Seva Home',
    hi: 'किशन सेवा मुख्य पृष्ठ पर वापस',
    bn: 'কিষাণ সেবা মূল পাতায় ফিরুন',
  },
  sso_gateway: {
    en: 'Single Sign-On Access Gateway',
    hi: 'सिंगल साइन-ऑन प्रवेश द्वार',
    bn: 'একক সাইন-অন নিরাপদ প্রবেশদ্বার',
  },
  enter_farmer_portal: {
    en: 'Enter Farmer Portal →',
    hi: 'किसान पोर्टल में प्रवेश करें →',
    bn: 'কৃষক পোর্টালে প্রবেশ করুন →',
  },
  enter_operator_portal: {
    en: 'Enter Operator Console →',
    hi: 'ऑपरेटर कंसोल में प्रवेश करें →',
    bn: 'অপারেটর কনসোলে প্রবেশ করুন →',
  },
  enter_admin_portal: {
    en: 'Enter Admin Portal →',
    hi: 'प्रशासनिक पोर्टल में प्रवेश करें →',
    bn: 'প্রশাসনিক পোর্টালে প্রবেশ করুন →',
  },
  f_check_1: {
    en: 'Quick OTP & Aadhaar Verification',
    hi: 'त्वरित ओटीपी एवं आधार सत्यापन',
    bn: 'সহজ ওটিপি এবং আধার যাচাইকরণ',
  },
  f_check_2: {
    en: 'Guaranteed MSP Slot Booking',
    hi: 'न्यूनतम समर्थन मूल्य (MSP) स्लॉट बुकिंग',
    bn: 'নিশ্চিত সরকারি মূল্যে (MSP) স্লট বুকিং',
  },
  f_check_3: {
    en: 'Live Token & Wait Time Counter',
    hi: 'लाइव टोकन एवं प्रतीक्षा समय',
    bn: 'লাইভ টোকেন নম্বর ও অপেক্ষার সময়',
  },
  f_check_4: {
    en: 'e-J-Form Digital Weighment Slip',
    hi: 'ई-जे-फॉर्म डिजिटल तौल पर्ची',
    bn: 'ডিজিটাল ই-জে-ফর্ম ওজন রসিদ',
  },
  op_check_1: {
    en: 'Fast Gate Check-In & Token Calling',
    hi: 'गेट एंट्री एवं टोकन पुकार',
    bn: 'গেট এন্ট্রি ও টোকেন কলিং',
  },
  op_check_2: {
    en: 'Digital Moisture Testing Module',
    hi: 'डिजिटल नमी एवं गुणवत्ता परीक्षण',
    bn: 'ডিজিটাল আর্দ্রতা ও মান পরীক্ষা',
  },
  op_check_3: {
    en: 'Gross/Tare Weighbridge Recorder',
    hi: 'धर्मकांटा सकल/खाली तौल रिकॉर्ड',
    bn: 'ইলেকট্রনিক ধর্মকাঁটা ওজন পরিমাপ',
  },
  op_check_4: {
    en: 'Automated MSP Payout Calculation',
    hi: 'स्वचालित एमएसपी भुगतान गणना',
    bn: 'স্বয়ংক্রিয় সরকারি মূল্য নির্ধারণ',
  },
  adm_check_1: {
    en: 'Live District Procurement Targets',
    hi: 'लाइव जिलावार खरीद लक्ष्य',
    bn: 'জেলা ভিত্তিক লাইভ সংগ্রহ লক্ষ্যমাত্রা',
  },
  adm_check_2: {
    en: 'Mandi Status & Quota Controls',
    hi: 'मंडी स्थिति एवं कोटा नियंत्रण',
    bn: 'ক্রয় কেন্দ্র নিয়ন্ত্রণ ও ক্ষমতা ব্যবস্থাপনা',
  },
  adm_check_3: {
    en: 'Total Crores DBT Disbursed Ticker',
    hi: 'करोड़ों डीबीटी भुगतान ट्रैकर',
    bn: 'মোট ব্যাংক অ্যাকাউন্টে জমা হওয়া তহবিল',
  },
  adm_check_4: {
    en: 'Export Audit CSV & PDF Reports',
    hi: 'ऑडिट रिपोर्ट CSV एवं PDF डाउनलोड',
    bn: 'অডিট রিপোর্ট CSV এবং PDF ডাউনলোড',
  },
  need_help: {
    en: 'Need technical assistance? Call Toll-Free Helpline:',
    hi: 'तकनीकी सहायता चाहिए? टोल-फ्री हेल्पलाइन:',
    bn: 'কোনো সহায়তার প্রয়োজন? টোল-ফ্রি কিষাণ হেল্পলাইন:',
  },

  // Farmer Login
  login_auth_badge: {
    en: 'Aadhaar / Mobile OTP Authentication',
    hi: 'आधार / मोबाइल ओटीपी सत्यापन',
    bn: 'আধার / মোবাইল ওটিপি যাচাইকরণ',
  },
  farmer_login_title: {
    en: 'Farmer Secure Login',
    hi: 'किसान सुरक्षित लॉगिन',
    bn: 'কৃষক ভাইদের সুরক্ষিত লগইন',
  },
  farmer_login_subtitle: {
    en: 'Access slot booking, live queue tickets, and DBT status.',
    hi: 'स्लॉट बुकिंग, लाइव कतार टोकन और डीबीटी भुगतान देखें।',
    bn: 'স্লট বুকিং, লাইভ টোকেন কিউ এবং ব্যাংক পেমেন্ট দেখুন।',
  },
  demo_account: {
    en: 'Demo Farmer Account',
    hi: 'डेमो किसान खाता',
    bn: 'ডেমো কৃষক অ্যাকাউন্ট',
  },
  one_click_login: {
    en: '1-Click Login',
    hi: '1-क्लिक लॉगिन',
    bn: '১-ক্লিকে লগইন',
  },
  email_label: {
    en: 'Registered Email Address',
    hi: 'पंजीकृत ईमेल पता',
    bn: 'নিবন্ধিত ইমেল ঠিকানা',
  },
  email_placeholder: {
    en: 'Enter your email address',
    hi: 'अपना ईमेल पता दर्ज करें',
    bn: 'আপনার ইমেল ঠিকানা লিখুন',
  },
  change_email: {
    en: 'Change Email',
    hi: 'ईमेल बदलें',
    bn: 'ইমেল পরিবর্তন করুন',
  },
  mobile_label: {
    en: 'Mobile Number',
    hi: 'मोबाइल नंबर',
    bn: 'মোবাইল নম্বর',
  },
  mobile_placeholder: {
    en: 'Enter 10-digit mobile number',
    hi: '10 अंकों का मोबाइल नंबर दर्ज करें',
    bn: '১০ সংখ্যার মোবাইল নম্বর লিখুন',
  },
  send_otp_btn: {
    en: 'Send Verification Code (OTP) →',
    hi: 'सत्यापन कोड (OTP) भेजें →',
    bn: 'যাচাইকরণ কোড (ওটিপি) পাঠান →',
  },
  enter_otp: {
    en: 'Enter 6-Digit Verification Code',
    hi: '6 अंकों का ओटीपी दर्ज करें',
    bn: '৬ সংখ্যার ওটিপি কোড লিখুন',
  },
  otp_desc: {
    en: 'Sent via SMS to',
    hi: 'एसएमएस द्वारा भेजा गया:',
    bn: 'এসএমএস মারফত পাঠানো হয়েছে:',
  },
  verify_continue_btn: {
    en: 'Verify & Enter Portal →',
    hi: 'सत्यापित करें और प्रवेश करें →',
    bn: 'যাচাই করে পোর্টালে প্রবেশ করুন →',
  },
  resend_otp: {
    en: 'Resend Code',
    hi: 'कोड पुनः भेजें',
    bn: 'কোড পুনরায় পাঠান',
  },
  change_number: {
    en: 'Change Number',
    hi: 'नंबर बदलें',
    bn: 'নম্বর পরিবর্তন করুন',
  },
  login_gov_footer: {
    en: 'Official Government of India Direct Benefit Transfer (DBT) secured platform.',
    hi: 'भारत सरकार प्रत्यक्ष लाभ अंतरण (DBT) सुरक्षित मंच।',
    bn: 'ভারত সরকার অনুমোদিত সরাসরি ব্যাংক সহায়তা (DBT) সুরক্ষিত পোর্টাল।',
  },

  // Layouts & Nav Menus
  nav_dashboard: {
    en: 'Dashboard',
    hi: 'डैशबोर्ड',
    bn: 'ড্যাশবোর্ড',
  },
  nav_book_slot: {
    en: 'Book Slot',
    hi: 'स्लॉट बुक करें',
    bn: 'স্লট বুকিং',
  },
  nav_live_queue: {
    en: 'Live Queue',
    hi: 'लाइव कतार',
    bn: 'লাইভ কিউ',
  },
  nav_my_tokens: {
    en: 'My Tokens & Slips',
    hi: 'मेरे टोकन व पर्चियां',
    bn: 'আমার টোকেন ও রসিদ',
  },
  nav_payments: {
    en: 'Payment History',
    hi: 'भुगतान इतिहास',
    bn: 'পেমেন্ট ইতিহাস',
  },
  nav_logout: {
    en: 'Logout',
    hi: 'लॉग आउट',
    bn: 'লগআউট',
  },
  nav_switch_role: {
    en: 'Switch Portal Role',
    hi: 'पोर्टल भूमिका बदलें',
    bn: 'পোর্টাল পরিবর্তন করুন',
  },
  operator_console_title: {
    en: 'Mandi Operator Console',
    hi: 'मंडी ऑपरेटर कंसोल',
    bn: 'মন্ডি ক্রয় কেন্দ্র কনসোল',
  },
  admin_portal_title: {
    en: 'State Admin Portal',
    hi: 'राज्य प्रशासनिक पोर्टल',
    bn: 'রাজ্য প্রশাসনিক পোর্টাল',
  },
  queue_management: {
    en: 'Token Queue',
    hi: 'टोकन कतार',
    bn: 'টোকেন কিউ ব্যবস্থাপনা',
  },
  moisture_assay: {
    en: 'Moisture Assay',
    hi: 'नमी परीक्षण',
    bn: 'আর্দ্রতা ও মান পরীক্ষা',
  },
  weighbridge_tab: {
    en: 'Weighbridge Scale',
    hi: 'इलेक्ट्रॉनिक धर्मकांटा',
    bn: 'ডিজিটাল ধর্মকাঁটা ওজন',
  },
  settlement_tab: {
    en: 'Settlement & Slips',
    hi: 'भुगतान व पर्चियां',
    bn: 'পেমেন্ট ও রসিদ',
  },
};

export class LanguageManager {
  private currentLang: Language = 'en';
  private listeners: Set<(lang: Language) => void> = new Set();

  constructor() {
    const saved = localStorage.getItem(STORAGE_LANG_KEY) as Language;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'bn')) {
      this.currentLang = saved;
    }
  }

  public getLanguage(): Language {
    return this.currentLang;
  }

  public setLanguage(lang: Language): void {
    this.currentLang = lang;
    localStorage.setItem(STORAGE_LANG_KEY, lang);
    this.listeners.forEach((fn) => fn(lang));
  }

  public subscribe(listener: (lang: Language) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public t(key: string): string {
    const entry = translations[key];
    if (!entry) return key;
    return entry[this.currentLang] || entry['en'] || key;
  }
}

export const languageManager = new LanguageManager();

export function useLanguage() {
  const [lang, setLangState] = useState<Language>(languageManager.getLanguage());

  useEffect(() => {
    const unsubscribe = languageManager.subscribe((newLang) => {
      setLangState(newLang);
    });
    return unsubscribe;
  }, []);

  const setLanguage = (newLang: Language) => {
    languageManager.setLanguage(newLang);
  };

  const t = (key: string): string => {
    return languageManager.t(key);
  };

  return {
    lang,
    setLanguage,
    t,
    languages: LANGUAGES,
  };
}
