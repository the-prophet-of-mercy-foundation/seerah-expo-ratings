import React, { useState } from 'react';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const FeedbackPage = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    name: '',
    place: '',
    mobile: '',
    email: '',
    professionType: '',
    accompanyingCount: '',

    // Questions with individual comments
    overallExperience: {
      selected: '',
      comment: '',
    },
    organization: {
      selected: '',
      comment: '',
    },
    movement: {
      selected: '',
      comment: '',
    },
    learning: {
      selected: '',
      comment: '',
    },
    improvements: {
      selected: '',
      comment: '',
    },

    // Overall additional comments
    additionalComments: '',
  });

  // Language translations
  const translations = {
    en: {
      personalInfo: 'Personal Information',
      shareExperience: 'Share Your Experience',
      exhibitionFeedback: 'Exhibition Feedback',
      backToExhibition: 'Back to Home',
      step: 'Step',
      of: 'of',
      next: 'Next',
      previous: 'Previous',
      submitFeedback: 'Submit Feedback',
      thankYou: 'Thank You!',
      shukran: 'Shukran!',
      feedbackComplete: 'Feedback Complete',

      // Personal info fields
      yourName: 'Your Name *',
      placeFrom: "Place you're from *",
      mobileNumber: 'Mobile Number',
      emailAddress: 'Email Address',
      professionType: 'What is your profession?',
      accompanyingCount: 'How many people accompanied you? *',

      // Questions
      overallExperience: 'Describe your overall experience',
      organization: 'How well was the exhibition organized and presented?',
      movement: 'How easy was it to move around and view all the models?',
      learning: 'What new things did you learn from this exhibition?',
      improvements:
        'What do you think could be improved for future exhibitions?',

      // Options
      options: {
        overallExperience: [
          'Extremely inspiring and unforgettable 🌙',
          'Very good — touched my heart and increased my love for the Prophet ﷺ',
          'Good — I liked it and learned something new',
          'Average — it was nice but could be more engaging',
          'Okay — I expected a bit more',
        ],
        organization: [
          'Very well organized — everything was clear and easy to follow 🌟',
          'Well organized — only minor delays or confusion',
          'Fairly organized — a few things could be improved',
          'Somewhat disorganized — I faced a few difficulties',
          'Not organized well — it was confusing at times',
        ],
        movement: [
          'Very easy to move and view all models comfortably 🚶‍♂️',
          'Easy — only a few areas were slightly crowded',
          'Manageable — I could move around but not freely everywhere',
          'A bit difficult — too many people or narrow space',
          'Hard to move — I couldn’t see some models properly',
        ],
        learning: [
          "Learned many new things about the Prophet's ﷺ life and message 📖",
          'Learned a few new lessons and reminders',
          'Mostly revised what I already knew',
          'Learned little new — presentation was more visual than informative',
          'Did not learn much new, but it was spiritually refreshing',
        ],
        improvements: [
          'Add more explanation boards or short summaries near each model',
          'Use short videos or audio for storytelling',
          'Provide more space and better visitor flow',
          'Add activities or quiz corners for children',
          'Everything was excellent — no changes needed 🌟',
        ],
      },

      // Additional text
      finalThoughts: 'Final Thoughts',
      thankYouMessage: 'Thank you for your valuable feedback!',
      successMessage:
        'Your feedback helps us improve and serve the community better. May Allah accept your efforts and bless you.',
      note: 'Note',
      redirectNote: 'You will be redirected to the home page shortly...',

      // Language selection
      selectLanguage: 'Select Language',
      english: 'English',
      urdu: 'Urdu',
      kannada: 'Kannada',
    },
    ur: {
      personalInfo: 'ذاتی معلومات',
      shareExperience: 'اپنا تجربہ شیئر کریں',
      exhibitionFeedback: 'نمائش کی رائے',
      backToExhibition: 'واپس جائیں',
      step: 'مرحلہ',
      of: 'میں سے',
      next: 'اگلا',
      previous: 'پچھلا',
      submitFeedback: 'رائے جمع کریں',
      thankYou: 'شکریہ!',
      shukran: 'شکران!',
      feedbackComplete: 'رائے مکمل',

      // Personal info fields
      yourName: 'آپ کا نام *',
      placeFrom: 'آپ کہاں سے آئے ہیں؟ *',
      mobileNumber: 'موبائل نمبر',
      emailAddress: 'ای میل پتہ',
      professionType: 'آپ کا پیشہ کیا ہے؟',
      accompanyingCount: 'آپ کے ساتھ کتنے لوگ آئے؟ *',

      // Questions
      overallExperience: 'اپنے مجموعی تجربے کی وضاحت کریں',
      organization: 'نمائش کس حد تک منظم اور پیش کی گئی تھی؟',
      movement: 'تمام ماڈلز دیکھنے میں کتنی آسانی تھی؟',
      learning: 'آپ نے اس نمائش سے کیا نیا سیکھا؟',
      improvements: 'آئندہ نمائش کے لیے آپ کے کیا مشورے ہیں؟',

      // Options
      options: {
        overallExperience: [
          'انتہائی متاثر کن اور ناقابل فراموش 🌙',
          'بہت اچھا — دل کو چھو گیا اور محبتِ نبی ﷺ میں اضافہ ہوا',
          'اچھا — کچھ نیا سیکھا اور لطف آیا',
          'درمیانہ — اچھا تھا مگر مزید دلچسپ ہو سکتا تھا',
          'ٹھیک — توقع سے کم محسوس ہوا',
        ],
        organization: [
          'انتہائی منظم — سب کچھ واضح اور آسان تھا 🌟',
          'منظم — معمولی تاخیر یا کنفیوژن تھا',
          'کافی منظم — چند چیزوں میں بہتری کی ضرورت ہے',
          'کچھ غیر منظم — چند مشکلات پیش آئیں',
          'غیر منظم — بعض اوقات سمجھنا مشکل تھا',
        ],
        movement: [
          'تمام ماڈلز دیکھنے میں بہت آسانی رہی 🚶‍♂️',
          'آسان — چند مقامات پر ہلکی بھیڑ تھی',
          'قابلِ انتظام — کچھ جگہوں پر مشکل تھی',
          'کچھ دشوار — جگہ کم یا بھیڑ زیادہ تھی',
          'مشکل — کچھ ماڈلز صحیح طرح نہیں دیکھ سکا',
        ],
        learning: [
          'نبی ﷺ کی زندگی اور پیغام کے بارے میں بہت کچھ نیا سیکھا 📖',
          'چند نئے اسباق اور یاد دہانیاں حاصل ہوئیں',
          'زیادہ تر وہی دہرایا جو پہلے سے معلوم تھا',
          'نیا کم سیکھا — زیادہ تر بصری نمائش تھی',
          'زیادہ نیا نہیں سیکھا مگر روحانی فائدہ ہوا',
        ],
        improvements: [
          'ہر ماڈل کے قریب مختصر وضاحت یا خلاصہ شامل کریں',
          'کہانی سنانے کے لیے ویڈیو یا آڈیو استعمال کریں',
          'مزید جگہ اور بہتر گزرگاہ فراہم کریں',
          'بچوں کے لیے سرگرمیاں یا کوئز شامل کریں',
          'سب کچھ بہترین تھا — کوئی تبدیلی کی ضرورت نہیں 🌟',
        ],
      },

      finalThoughts: 'آخری خیالات',
      thankYouMessage: 'آپ کے قیمتی تاثرات کا شکریہ!',
      successMessage:
        'آپ کی رائے سے ہمیں بہتری میں مدد ملتی ہے۔ اللہ آپ کے جذبے کو قبول فرمائے۔',
      note: 'نوٹ',
      redirectNote: 'آپ کو جلد ہی ہوم پیج پر منتقل کر دیا جائے گا...',

      selectLanguage: 'زبان منتخب کریں',
      english: 'انگریزی',
      urdu: 'اردو',
      kannada: 'کنڑ',
    },

    kn: {
      personalInfo: 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ',
      shareExperience: 'ನಿಮ್ಮ ಅನುಭವವನ್ನು ಹಂಚಿಕೊಳ್ಳಿ',
      exhibitionFeedback: 'ಪ್ರದರ್ಶನ ಪ್ರತಿಕ್ರಿಯೆ',
      backToExhibition: 'ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ',
      step: 'ಹಂತ',
      of: 'ರಲ್ಲಿ',
      next: 'ಮುಂದೆ',
      previous: 'ಹಿಂದೆ',
      submitFeedback: 'ಪ್ರತಿಕ್ರಿಯೆ ಸಲ್ಲಿಸಿ',
      thankYou: 'ಧನ್ಯವಾದಗಳು!',
      shukran: 'ಶುಕ್ರಾನ್!',
      feedbackComplete: 'ಪ್ರತಿಕ್ರಿಯೆ ಪೂರ್ಣಗೊಂಡಿದೆ',

      // Personal info fields
      yourName: 'ನಿಮ್ಮ ಹೆಸರು *',
      placeFrom: 'ನೀವು ಯಾವ ಸ್ಥಳದಿಂದ ಬಂದಿದ್ದೀರಿ? *',
      mobileNumber: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
      emailAddress: 'ಇಮೇಲ್ ವಿಳಾಸ',
      professionType: 'ನಿಮ್ಮ ವೃತ್ತಿ ಏನು?',
      accompanyingCount: 'ನಿಮ್ಮ ಜೊತೆ ಎಷ್ಟು ಜನರು ಬಂದಿದ್ದರು? *',

      // Questions
      overallExperience: 'ನಿಮ್ಮ ಒಟ್ಟು ಅನುಭವವನ್ನು ವಿವರಿಸಿ',
      organization: 'ಪ್ರದರ್ಶನವನ್ನು ಎಷ್ಟು ಚೆನ್ನಾಗಿ ಆಯೋಜಿಸಲಾಯಿತು?',
      movement: 'ಎಲ್ಲಾ ಮಾದರಿಗಳನ್ನು ನೋಡಲು ಎಷ್ಟು ಸುಲಭವಿತ್ತು?',
      learning: 'ಈ ಪ್ರದರ್ಶನದಿಂದ ನೀವು ಏನು ಹೊಸದಾಗಿ ಕಲಿತಿರಿ?',
      improvements:
        'ಭವಿಷ್ಯದ ಪ್ರದರ್ಶನಕ್ಕೆ ಯಾವ ಸುಧಾರಣೆಗಳನ್ನು ನೀವು ಸಲಹೆ ನೀಡುತ್ತೀರಿ?',

      // Options
      options: {
        overallExperience: [
          'ಅತ್ಯಂತ ಪ್ರೇರಣಾದಾಯಕ ಮತ್ತು ಮರೆಯಲಾಗದ ಅನುಭವ 🌙',
          'ಬಹಳ ಉತ್ತಮ — ಹೃದಯವನ್ನು ಸ್ಪರ್ಶಿಸಿತು ಮತ್ತು ಪ್ರವಾದಿಯ ﷺ ಪ್ರೀತಿ ಹೆಚ್ಚಿತು',
          'ಉತ್ತಮ — ನನಗೆ ಇಷ್ಟವಾಯಿತು ಮತ್ತು ಕೆಲವು ಹೊಸದಾಗಿ ಕಲಿತೆ',
          'ಸರಾಸರಿ — ಚೆನ್ನಾಗಿತ್ತು ಆದರೆ ಇನ್ನಷ್ಟು ಆಸಕ್ತಿದಾಯಕವಾಗಿರಬಹುದು',
          'ಸರಿಯಾಗಿದೆ — ಸ್ವಲ್ಪ ಹೆಚ್ಚು ನಿರೀಕ್ಷಿಸಿದ್ದೆ',
        ],
        organization: [
          'ಅತ್ಯುತ್ತಮವಾಗಿ ಆಯೋಜಿಸಲಾಗಿದೆ — ಎಲ್ಲವೂ ಸ್ಪಷ್ಟ ಮತ್ತು ಸುಲಭ 🌟',
          'ಚೆನ್ನಾಗಿ ಆಯೋಜಿಸಲಾಗಿದೆ — ಸಣ್ಣ ವಿಳಂಬಗಳು ಮಾತ್ರ',
          'ಸರಿಯಾಗಿ ಆಯೋಜಿಸಲಾಗಿದೆ — ಕೆಲವು ಭಾಗಗಳಲ್ಲಿ ಸುಧಾರಣೆ ಅಗತ್ಯ',
          'ಸ್ವಲ್ಪ ಅಸಮರ್ಪಕ — ಕೆಲವು ತೊಂದರೆಗಳನ್ನು ಎದುರಿಸಬೇಕಾಯಿತು',
          'ಅನಿಯೋಜಿತ — ಕೆಲವೆಡೆ ಗೊಂದಲ ಉಂಟಾಯಿತು',
        ],
        movement: [
          'ಎಲ್ಲಾ ಮಾದರಿಗಳನ್ನು ನೋಡಲು ತುಂಬಾ ಸುಲಭವಾಯಿತು 🚶‍♂️',
          'ಸುಲಭ — ಕೆಲವು ಭಾಗಗಳಲ್ಲಿ ಸ್ವಲ್ಪ ಜನಸಮೂಹವಿತ್ತು',
          'ನಿರ್ವಹಿಸಬಹುದಾದ — ಕೆಲವು ಕಡೆ ಸ್ವಲ್ಪ ಕಷ್ಟವಿತ್ತು',
          'ಸ್ವಲ್ಪ ಕಷ್ಟ — ಜನರು ಹೆಚ್ಚು ಅಥವಾ ಜಾಗ ಕಡಿಮೆ',
          'ಕಷ್ಟ — ಕೆಲವು ಮಾದರಿಗಳನ್ನು ಸರಿಯಾಗಿ ನೋಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
        ],
        learning: [
          'ಪ್ರವಾದಿಯ ﷺ ಜೀವನ ಮತ್ತು ಸಂದೇಶದ ಬಗ್ಗೆ ಅನೇಕ ಹೊಸ ವಿಷಯಗಳನ್ನು ಕಲಿತೆ 📖',
          'ಕೆಲವು ಹೊಸ ಪಾಠಗಳು ಮತ್ತು ನೆನಪುಗಳನ್ನು ಕಲಿತೆ',
          'ಹಳೆಯ ವಿಷಯಗಳನ್ನು ಪುನರಾವರ್ತಿಸಿದೆ',
          'ಹೊಸದಾಗಿ ಹೆಚ್ಚು ಕಲಿತಿಲ್ಲ — ದೃಶ್ಯರೂಪ ಹೆಚ್ಚು',
          'ಹೊಸ ವಿಷಯ ಹೆಚ್ಚು ಇರಲಿಲ್ಲ ಆದರೆ ಆತ್ಮೀಯ ಅನುಭವವಾಯಿತು',
        ],
        improvements: [
          'ಪ್ರತಿ ಮಾದರಿಯ ಬಳಿ ವಿವರಣೆ ಬೋರ್ಡ್ ಅಥವಾ ಸಾರಾಂಶ ಸೇರಿಸಿ',
          'ಕಥೆ ಹೇಳಲು ಚಿಕ್ಕ ವಿಡಿಯೋ ಅಥವಾ ಆಡಿಯೋ ಬಳಸಿ',
          'ಹೆಚ್ಚು ಜಾಗ ಮತ್ತು ಸುಗಮ ಸಂಚಾರ ಒದಗಿಸಿ',
          'ಮಕ್ಕಳಿಗಾಗಿ ಚಟುವಟಿಕೆಗಳು ಅಥವಾ ಪ್ರಶ್ನೋತ್ತರ ಸೇರಿಸಿ',
          'ಎಲ್ಲವೂ ಅತ್ಯುತ್ತಮ — ಯಾವುದೇ ಬದಲಾವಣೆ ಅಗತ್ಯವಿಲ್ಲ 🌟',
        ],
      },

      finalThoughts: 'ಕೊನೆಯ ಆಲೋಚನೆಗಳು',
      thankYouMessage: 'ನಿಮ್ಮ ಅಮೂಲ್ಯ ಪ್ರತಿಕ್ರಿಯೆಗೆ ಧನ್ಯವಾದಗಳು!',
      successMessage:
        'ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯಿಂದ ನಾವು ಇನ್ನಷ್ಟು ಉತ್ತಮವಾಗಿ ಸೇವೆ ಮಾಡಬಹುದು. ಅಲ್ಲಾಹ್ ನಿಮ್ಮ ಪ್ರಯತ್ನಗಳನ್ನು ಆಶೀರ್ವದಿಸಲಿ.',
      note: 'ಸೂಚನೆ',
      redirectNote: 'ನೀವು ಶೀಘ್ರದಲ್ಲೇ ಮುಖ್ಯ ಪುಟಕ್ಕೆ ಕರೆದೊಯ್ಯಲ್ಪಡುವಿರಿ...',

      selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      english: 'ಇಂಗ್ಲಿಷ್',
      urdu: 'ಉರ್ದು',
      kannada: 'ಕನ್ನಡ',
    },
    ru: {
      personalInfo: 'Zaati Maloomat',
      shareExperience: 'Apna Tajurba Share Karein',
      exhibitionFeedback: 'Namayish ki Feedback',
      backToExhibition: 'Wapas Ghar Jayen',
      step: 'Marhala',
      of: 'Mein se',
      next: 'Agla',
      previous: 'Pichla',
      submitFeedback: 'Feedback Jama Karein',
      thankYou: 'Shukriya!',
      shukran: 'Shukran!',
      feedbackComplete: 'Feedback Mukammal',

      // Personal info fields
      yourName: 'Aap ka Naam *',
      placeFrom: 'Aap kahan se aaye hain? *',
      mobileNumber: 'Mobile Number',
      emailAddress: 'Email Address',
      professionType: 'Aap kya kaam karthe hai?',
      accompanyingCount: 'Aap ke sath kitne log aaye? *',

      // Questions
      overallExperience: 'Apka overall experience kaisa raha?',
      organization: 'Models kitne achi tarah pesh kiye gaye the?',
      movement: 'Tamam models dekhne mein kitni asaani thi?',
      learning: 'Aap exhibition mein se kya naya seekha?',
      improvements: 'Aap kya feedback hai?',

      // Options
      options: {
        overallExperience: [
          'Bahut achcha raha - is ku bhool nahi sakte 🌙',
          'Acha — dil ko chu gaya aur muhabbat-e-Nabi ﷺ barh gayi',
          'Acha — kuch naya seekha aur maza aaya',
          'Darmiyana — acha tha magar aur behtar ho sakta tha',
          'Theek — thoda zyada umeed thi',
        ],
        organization: [
          'Intehai achi tarah munazzam — sab kuch wazeh aur asaan tha 🌟',
          'Achi tarah munazzam — chhoti moti deri hui',
          'Theek tha — kuch cheezon mein behtari ki zarurat hai',
          'Kuch be-tarteebi thi — thodi mushkil hui',
          'Munazzam nahi tha — kuch jagah uljhan mehsoos hui',
        ],
        movement: [
          'Sab models dekhna bohat asaan tha 🚶‍♂️',
          'Aasaan — kuch jagah thoda rush tha',
          'Manageable — kuch jagah thoda tang tha',
          'Thoda mushkil — jaga kam ya log zyada the',
          'Mushkil — kuch models ache se nahi dekh saka',
        ],
        learning: [
          'Nabi ﷺ ki zindagi aur paigham ke bare mein bohat kuch naya seekha 📖',
          'Kuch naye sabaq aur yaad dehani mili',
          'Zyada tar wohi dohraya jo pehle se maloom tha',
          'Naya kam seekha — zyada visual presentation thi',
          'Naya zyada nahi seekha, magar roohani sukoon mila',
        ],
        improvements: [
          'Har model ke paas chhoti wazahat ya summary lagai jaye',
          'Kahani sunane ke liye chhoti video ya audio shamil karein',
          'Zyada jaga aur behtar guzarne ka rasta banayein',
          'Bachon ke liye activities ya quiz shamil karein',
          'Sab kuch bohat acha tha — koi tabdeeli zaruri nahi 🌟',
        ],
      },

      finalThoughts: 'Aakhri Khayalat',
      thankYouMessage: 'Aap ke qeemati feedback ka shukriya!',
      successMessage:
        'Aap ki raye se humein behtari mein madad milti hai. Allah aap ke jazbe ko qubool kare.',
      note: 'Note',
      redirectNote: 'Aap ko jald hi home page par le jaya jayega...',

      selectLanguage: 'Zabaan ka select karein',
      english: 'English',
      urdu: 'Roman Urdu',
      kannada: 'Kannada',
    },
  };

  const t = translations[currentLanguage] || translations.en;

  const questions = [
    {
      id: 'overallExperience',
      question: t.overallExperience,
    },
    {
      id: 'organization',
      question: t.organization,
    },
    {
      id: 'movement',
      question: t.movement,
    },
    {
      id: 'learning',
      question: t.learning,
    },
    {
      id: 'improvements',
      question: t.improvements,
    },
  ];

  const totalSteps = questions.length + 2; // +1 for personal info, +1 for overall comments

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOptionSelect = (questionId, option) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selected: option,
      },
    }));
  };

  const handleCommentChange = (questionId, comment) => {
    setFormData((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        comment: comment,
      },
    }));
  };

  const nextStep = () => {
    if (currentStep === 0) {
      // Language selection step - no validation needed
      setCurrentStep((prev) => prev + 1);
      return;
    }

    if (currentStep === 1) {
      // Validate personal info before proceeding
      if (
        !formData.name.trim() ||
        !formData.place.trim() ||
        !formData.professionType ||
        !formData.accompanyingCount
      ) {
        alert(
          currentLanguage === 'en'
            ? 'Please provide all required information'
            : currentLanguage === 'ur'
            ? 'براہ کرم تمام ضروری معلومات فراہم کریں'
            : 'ದಯವಿಟ್ಟು ಎಲ್ಲಾ ಅಗತ್ಯ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸಿ',
        );
        return;
      }
    }

    if (currentStep > 1 && currentStep <= questions.length + 1) {
      // Validate that a selection was made for the current question
      const currentQuestion = questions[currentStep - 2];
      if (!formData[currentQuestion.id].selected) {
        alert(
          currentLanguage === 'en'
            ? `Please select an option for "${currentQuestion.question}"`
            : currentLanguage === 'ur'
            ? `براہ کرم "${currentQuestion.question}" کے لیے ایک آپشن منتخب کریں`
            : currentLanguage === 'kn'
            ? `ದಯವಿಟ್ಟು "${currentQuestion.question}" ಗಾಗಿ ಒಂದು ಆಯ್ಕೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ`
            : `Option select karo "${currentQuestion.question}"`,
        );
        return;
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep === 1) {
      // If going back from personal info to language selection, reset language
      setCurrentLanguage('');
    }
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    try {
      // Prepare data for submission
      const submissionData = {
        name: formData.name,
        place: formData.place,
        mobile: formData.mobile,
        email: formData.email,
        accompanying_type: formData.professionType,
        accompanying_count: parseInt(formData.accompanyingCount),

        // Questions - store in English
        overall_experience: formData.overallExperience.selected,
        overall_experience_comment: formData.overallExperience.comment,
        organization: formData.organization.selected,
        organization_comment: formData.organization.comment,
        movement: formData.movement.selected,
        movement_comment: formData.movement.comment,
        learning: formData.learning.selected,
        learning_comment: formData.learning.comment,
        improvements: formData.improvements.selected,
        improvements_comment: formData.improvements.comment,

        additional_comments: formData.additionalComments,
        submitted_at: new Date().toISOString(),
        submission_source: 'web',
        submission_language: currentLanguage,
      };

      // Submit to Supabase
      const { data, error } = await supabase
        .from('exhibition_feedback')
        .insert([submissionData]);

      if (error) {
        throw error;
      }

      console.log('Feedback submitted successfully:', data);
      setSubmitted(true);

      // Auto-redirect after 5 seconds
      setTimeout(() => {
        if (onBack) onBack();
      }, 5000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert(
        currentLanguage === 'en'
          ? 'There was an error submitting your feedback. Please try again.'
          : currentLanguage === 'ur'
          ? 'آپ کی رائے جمع کرانے میں خرابی آئی ہے۔ براہ کرم دوبارہ کوشش کریں۔'
          : currentLanguage === 'kn'
          ? 'ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಸಲ್ಲಿಸುವಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.'
          : 'Feedback submit karne mein error hai. Please dobara try karein.',
      );
    }
  };

  const getProgress = () => {
    return ((currentStep + 1) / (totalSteps + 1)) * 100; // +1 for language selection step
  };

  const getStepTitle = () => {
    if (currentStep === 0) return translations.en.selectLanguage;
    if (currentStep === 1) return t.personalInfo;
    if (currentStep === totalSteps) return t.finalThoughts;
    if (currentStep > 1 && currentStep <= questions.length + 1) {
      return questions[currentStep - 2].question;
    }
    return 'Feedback';
  };

  // Language Selection Step
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <img src="/logo.png" alt="Exhibition Logo" className="h-16 mx-auto" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {translations.en.shareExperience}
          </h1>
          <p className="text-gray-600 mb-8">Select your preferred language</p>

          <div className="space-y-4">
            <button
              onClick={() => {
                setCurrentLanguage('en');
                setCurrentStep(1);
              }}
              className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl hover:bg-emerald-700 transition font-semibold text-lg"
            >
              {translations.en.english}
            </button>

            <button
              onClick={() => {
                setCurrentLanguage('ru');
                setCurrentStep(1);
              }}
              className="w-full bg-pink-600 text-white py-4 px-6 rounded-xl hover:bg-pink-700 transition font-semibold text-lg"
              style={{ direction: 'rtl' }}
            >
              {translations.ru.urdu}
            </button>

            <button
              onClick={() => {
                setCurrentLanguage('ur');
                setCurrentStep(1);
              }}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition font-semibold text-lg"
              style={{ direction: 'rtl' }}
            >
              {translations.ur.urdu}
            </button>

            <button
              onClick={() => {
                setCurrentLanguage('kn');
                setCurrentStep(1);
              }}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl hover:bg-purple-700 transition font-semibold text-lg"
            >
              {translations.kn.kannada}
            </button>
          </div>

          <div className="mt-8">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition flex items-center justify-center mx-auto"
            >
              <ArrowLeft size={20} className="mr-2" />
              {translations.en.backToExhibition}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">{t.shukran}</h1>
          <p className="text-lg text-gray-600 mb-2">{t.thankYouMessage}</p>
          <p className="text-gray-500 mb-6">{t.successMessage}</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-700">
              <strong>{t.note}:</strong> {t.redirectNote}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t.step} {currentStep} {t.of} {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          {/* Personal Information Step */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {t.shareExperience}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.yourName}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.placeFrom}
                  </label>
                  <input
                    type="text"
                    value={formData.place}
                    onChange={(e) => handleInputChange('place', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.professionType}
                  </label>
                  <input
                    value={formData.professionType}
                    onChange={(e) =>
                      handleInputChange('professionType', e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  ></input>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.accompanyingCount}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.accompanyingCount}
                    onChange={(e) =>
                      handleInputChange('accompanyingCount', e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.mobileNumber}
                  </label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) =>
                      handleInputChange('mobile', e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.emailAddress}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Question Steps */}
          {currentStep > 1 && currentStep <= questions.length + 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {questions[currentStep - 2].question}
                </h2>
                <p className="text-gray-600">
                  {questions[currentStep - 2].description}
                </p>
              </div>

              <div className="space-y-4 mb-6">
                {t.options[questions[currentStep - 2].id].map(
                  (option, index) => (
                    <button
                      key={index}
                      onClick={() =>
                        handleOptionSelect(
                          questions[currentStep - 2].id,
                          option,
                        )
                      }
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        formData[questions[currentStep - 2].id].selected ===
                        option
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm'
                          : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-25'
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                            formData[questions[currentStep - 2].id].selected ===
                            option
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {formData[questions[currentStep - 2].id].selected ===
                            option && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="text-base font-medium">{option}</span>
                      </div>
                    </button>
                  ),
                )}
              </div>
            </div>
          )}

          {/* Overall Additional Comments Step */}
          {currentStep === totalSteps && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {t.finalThoughts}
                </h2>
              </div>

              <div>
                <textarea
                  value={formData.additionalComments}
                  onChange={(e) =>
                    handleInputChange('additionalComments', e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder={
                    currentLanguage === 'en'
                      ? "Any other feedback, suggestions, or experiences you'd like to share..."
                      : currentLanguage === 'ur'
                      ? 'کوئی دوسری رائے، تجاویز یا تجربات جو آپ شیئر کرنا چاہیں...'
                      : 'ನೀವು ಹಂಚಿಕೊಳ್ಳಲು ಬಯಸುವ ಯಾವುದೇ ಇತರ ಪ್ರತಿಕ್ರಿಯೆ, ಸಲಹೆಗಳು ಅಥವಾ ಅನುಭವಗಳು...'
                  }
                  rows={8}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center px-6 py-3 rounded-lg font-semibold ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <ArrowLeft size={20} className="mr-2" />
            {t.previous}
          </button>

          {currentStep < totalSteps ? (
            <button
              onClick={nextStep}
              className="flex items-center px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition"
            >
              {t.next}
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition"
            >
              <Send size={20} className="mr-2" />
              {t.submitFeedback}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
