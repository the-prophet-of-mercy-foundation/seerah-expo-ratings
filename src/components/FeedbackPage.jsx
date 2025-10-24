import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, CheckCircle, Edit } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { generateUserID } from '../lib/supabaseClient';

const FeedbackPage = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
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
      updateFeedback: 'Update Feedback',
      thankYou: 'Thank You!',
      shukran: 'Shukran!',
      feedbackComplete: 'Feedback Complete',
      editingFeedback: 'Editing Your Feedback',

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
          'Everything was well presented and worth visiting',
          'Displays were interesting and I learned useful things',
          'Some parts were informative and enjoyable',
          'Certain sections could be improved for clarity',
          'Content did not meet my expectations',
        ],

        organization: [
          'Entry, exit, and guidance were clear throughout',
          'Mostly smooth, with minor delays or confusion',
          'Some areas needed better coordination',
          'Directions or crowd management could be improved',
          'Layout was confusing and lacked assistance',
        ],

        movement: [
          'Easy to walk and view all sections comfortably',
          'Mostly easy, with minor crowded spots',
          'Movement was slow in certain areas',
          'Crowded or narrow in several sections',
          'Difficult to move and view some displays',
        ],

        learning: [
          'Gained a clear understanding of key lessons from Seerah',
          'Learned many new and useful things',
          'Learned a few new things; mostly familiar content',
          'Mostly visual presentation with limited explanation',
          'Not much new learning, mostly review',
        ],

        improvements: [
          'Add short videos or audio explanations near displays',
          'Provide simple summary boards for each section',
          'Increase space and improve visitor movement',
          'Include a children’s learning or quiz corner',
          'No changes needed; everything was well arranged',
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
      updateFeedback: 'رائے اپ ڈیٹ کریں',
      thankYou: 'شکریہ!',
      shukran: 'شکران!',
      feedbackComplete: 'رائے مکمل',
      editingFeedback: 'اپنی رائے میں ترمیم',

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
          'سب کچھ اچھی طرح پیش کیا گیا اور دیکھنے کے قابل تھا',
          'نمائش دلچسپ تھی اور میں نے مفید باتیں سیکھی',
          'کچھ حصے معلوماتی اور لطف اندوز تھے',
          'کچھ حصوں کو وضاحت کے لیے بہتر بنایا جا سکتا تھا',
          'مواد میری توقعات پر پورا نہیں اترا',
        ],

        organization: [
          'داخلہ، خروج اور رہنمائی ہر جگہ واضح تھی',
          'زیادہ تر سب اچھا تھا، کچھ چھوٹی تاخیر یا الجھن تھی',
          'کچھ علاقوں میں بہتر ہم آہنگی کی ضرورت تھی',
          'راستے یا ہجوم کا انتظام بہتر ہو سکتا تھا',
          'لے آؤٹ الجھا ہوا تھا اور مدد نہیں تھی',
        ],

        movement: [
          'سب حصے آرام سے دیکھنے اور چلنے میں آسان تھے',
          'زیادہ تر آسان، کچھ جگہیں ہجوم والی تھیں',
          'کچھ علاقوں میں چلنے کی رفتار سست تھی',
          'کئی حصے بھیڑ یا تنگ تھے',
          'کچھ نمائشیں دیکھنا اور حرکت کرنا مشکل تھا',
        ],

        learning: [
          'سیرت کے اہم سبق کی واضح سمجھ حاصل ہوئی',
          'بہت ساری نئی اور مفید باتیں سیکھی',
          'کچھ نئی باتیں سیکھی، زیادہ تر مواد معلوم تھا',
          'زیادہ تر بصری نمائش تھی، وضاحت محدود تھی',
          'زیادہ نئی باتیں نہیں سیکھی، زیادہ تر نظرثانی تھی',
        ],

        improvements: [
          'نمائش کے قریب مختصر ویڈیوز یا صوتی وضاحتیں شامل کریں',
          'ہر سیکشن کے لیے سادہ خلاصہ بورڈز فراہم کریں',
          'جگہ بڑھائیں اور وزیٹر کی حرکت کو بہتر کریں',
          'بچوں کے لیے سیکھنے یا کوئز کا حصہ شامل کریں',
          'کسی تبدیلی کی ضرورت نہیں؛ سب کچھ اچھے طریقے سے ترتیب دیا گیا تھا',
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
      updateFeedback: 'ಪ್ರತಿಕ್ರಿಯೆ ನವೀಕರಿಸಿ',
      thankYou: 'ಧನ್ಯವಾದಗಳು!',
      shukran: 'ಶುಕ್ರಾನ್!',
      feedbackComplete: 'ಪ್ರತಿಕ್ರಿಯೆ ಪೂರ್ಣಗೊಂಡಿದೆ',
      editingFeedback: 'ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಸಂಪಾದಿಸಲಾಗುತ್ತಿದೆ',

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
          'ಎಲ್ಲವೂ ಚೆನ್ನಾಗಿ ಪ್ರದರ್ಶಿಸಲ್ಪಟ್ಟಿದ್ದು ವೀಕ್ಷಿಸಲು ಯೋಗ್ಯವಾಗಿತ್ತು',
          'ಪ್ರದರ್ಶನಗಳು ಆಸಕ್ತಿದಾಯಕವಾಗಿದ್ದು ಉಪಯುಕ್ತ ವಿಷಯಗಳನ್ನು ಕಲಿತೆನು',
          'ಕೆಲವು ಭಾಗಗಳು ಮಾಹಿತಿ ನೀಡುವಂತಾಗಿತ್ತು ಮತ್ತು ಆಸ್ವಾದನೀಯವಾಗಿತ್ತು',
          'ಕೆಲವು ವಿಭಾಗಗಳನ್ನು ಸ್ಪಷ್ಟತೆಗೆ ಸುಧಾರಿಸಬಹುದು',
          'ವಿಷಯವು ನನ್ನ ನಿರೀಕ್ಷೆಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗಲಿಲ್ಲ',
        ],

        organization: [
          'ಪ್ರವೇಶ, ನಿರ್ಗಮನ ಮತ್ತು ಮಾರ್ಗದರ್ಶನ ಎಲ್ಲಿಯೂ ಸ್ಪಷ್ಟವಾಗಿತ್ತು',
          'ಬಹುತೇಕ ಸುಗಮವಾಗಿತ್ತು, ಸ್ವಲ್ಪ ವಿಳಂಬ ಅಥವಾ ಗೊಂದಲವಿತ್ತು',
          'ಕೆಲವು ಪ್ರದೇಶಗಳಿಗೆ ಉತ್ತಮ ಸಂಯೋಜನೆಯ ಅಗತ್ಯವಿತ್ತು',
          'ಮಾರ್ಗದರ್ಶನ ಅಥವಾ ಜನಸಾಗಣೆ ನಿರ್ವಹಣೆ ಸುಧಾರಿಸಬಹುದು',
          'ರಚನೆ ಗೊಂದಲಮಯವಾಗಿತ್ತು ಮತ್ತು ಸಹಾಯವಿಲ್ಲದೆ ಇತ್ತು',
        ],

        movement: [
          'ಎಲ್ಲಾ ವಿಭಾಗಗಳನ್ನು ಸುಲಭವಾಗಿ ನೋಡುವುದು ಮತ್ತು ನಡೆಯುವುದು ಸುಲಭವಾಗಿತ್ತು',
          'ಬಹುತೇಕ ಸುಲಭ, ಸ್ವಲ್ಪ ಗದ್ದಲವಾದ ಸ್ಥಳಗಳು ಇದ್ದವು',
          'ಕೆಲವು ಪ್ರದೇಶಗಳಲ್ಲಿ ನಡೆಯುವ ವೇಗ ನಿಧಾನವಾಗಿತ್ತು',
          'ಕೆಲವು ವಿಭಾಗಗಳು ಗದ್ದಲ ಅಥವಾ ಸಣ್ಣವಾಗಿದ್ದವು',
          'ಕೆಲವು ಪ್ರದರ್ಶನಗಳನ್ನು ನೋಡುವುದು ಮತ್ತು ನಡೆಯುವುದು ಕಷ್ಟವಾಗಿತ್ತು',
        ],

        learning: [
          'ಸೀರಾ‌ನ ಪ್ರಮುಖ ಪಾಠಗಳನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ಅರ್ಥಮಾಡಿಕೊಂಡೆನು',
          'ಬಹುತೇಕ ಹೊಸ ಮತ್ತು ಉಪಯುಕ್ತ ವಿಷಯಗಳನ್ನು ಕಲಿತೆನು',
          'ಕೆಲವು ಹೊಸ ವಿಷಯಗಳನ್ನು ಕಲಿತೆನು; ಬಹುತೇಕ ವಿಷಯ ತಿಳಿದಿತ್ತು',
          'ಬಹುತೇಕ ದೃಶ್ಯಾತ್ಮಕ ಪ್ರದರ್ಶನ, ನಿರ್ಧಿಷ್ಟ ವಿವರಣೆ',
          'ಹೊಸ ವಿಷಯ ಹೆಚ್ಚು ಕಲಿತಿಲ್ಲ, ಬಹುತೇಕ ಪುನರಾವೃತ್ತಿ',
        ],

        improvements: [
          'ಪ್ರದರ್ಶನಗಳ ಹತ್ತಿರ ಚಿಕ್ಕ ವೀಡಿಯೋಗಳು ಅಥವಾ ಧ್ವನಿ ವಿವರಣೆಗಳನ್ನು ಸೇರಿಸಿ',
          'ಪ್ರತಿ ವಿಭಾಗಕ್ಕಾಗಿ ಸರಳ ಸಾರಾಂಶ ಫಲಕಗಳನ್ನು ಒದಗಿಸಿ',
          'ಆಕರ್ಷಕ ಸ್ಥಳವನ್ನು ವಿಸ್ತರಿಸಿ ಮತ್ತು ಭೇಟಿ ಮಾಡುವವರ ಚಲನವಲನ ಸುಧಾರಿಸಿ',
          'ಮಕ್ಕಳ ಕಲಿಕೆ ಅಥವಾ ಕ್ವಿಜ್ ಕೋಣೆಯನ್ನು ಸೇರಿಸಿ',
          'ಯಾವುದೇ ಬದಲಾವಣೆ ಅಗತ್ಯವಿಲ್ಲ; ಎಲ್ಲವೂ ಚೆನ್ನಾಗಿ ಏರ್ಪಡಿಸಲಾಗಿದೆ',
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
      shareExperience: 'Apna Tajurba Share Karo',
      exhibitionFeedback: 'Namaysh ka Feedback',
      backToExhibition: 'Wapas Ghar Chalein',
      step: 'Marhala',
      of: 'Mein se',
      next: 'Next',
      previous: 'Previous',
      submitFeedback: 'Feedback Jama Karo',
      updateFeedback: 'Feedback Update Karo',
      thankYou: 'Shukriya!',
      shukran: 'Shukran!',
      feedbackComplete: 'Feedback Mukammal',
      editingFeedback: 'Apni Feedback mein Thodi Tarmeem',

      // Personal info fields
      yourName: 'Aap ka Naam *',
      placeFrom: 'Aap kahan se aaye the? *',
      mobileNumber: 'Mobile Number',
      emailAddress: 'Email Address',
      professionType: 'Aap ka kaam kya hai?',
      accompanyingCount: 'Aap ke sath kitne log aaye? *',

      // Questions
      overallExperience: 'Apka overall experience kaisa raha?',
      organization: 'Models kitne acche tareeke se paish kiye gaye the?',
      movement: 'Tamam models dekhne mein kitni aasanthi thi?',
      learning: 'Aap exhibition se kya naya seekhe?',
      improvements: 'Aap ka kya feedback hai?',

      // Options
      options: {
        overallExperience: [
          'Sab kuch achhi tarah paish hua aur dekhne layak tha',
          'Namaysh dilchasp thi aur main ne kaam ki baatein seekhi',
          'Kuch hisse maloomati aur mazedaar the',
          'Kuch hisson ko wazahat ke liye thoda behtar kar sakte the',
          'Mawad meri umeed ke mutabiq nahi tha',
        ],

        organization: [
          'Dakhla, khurooj aur rehnumai har jagah wazeh tha',
          'Zyada tar smooth tha, kuch chhoti der ya thodi uljhan thi',
          'Kuch jagah behtar tanzeem ki zarurat thi',
          'Raste ya bheed ka intizam thoda behtar ho sakta tha',
          'Layout uljha hua tha aur madad kam thi',
        ],

        movement: [
          'Sab hisse aaram se dekhne aur chalne me aasaan the',
          'Zyada tar aasaan, kuch jagah bheed zyada thi',
          'Kuch jagah chalne me dheemi speed thi',
          'Kai hisse bheed ya tang the',
          'Kuch displays dekhna aur chalna mushkil tha',
        ],

        learning: [
          'Seerat ke aham sabaq ko achhi tarah samjha',
          'Bohot si nai aur kaam ki baatein seekhi',
          'Kuch nai baatein seekhi; zyada tar maloom content tha',
          'Zyada tar visual thi, wazahat kam thi',
          'Nai baatein zyada nahi seekhi, mostly review thi',
        ],

        improvements: [
          'Displays ke paas chhoti videos ya audio explanations add karo',
          'Har section ke liye simple summary board rakho',
          'Jagah zyada karo aur visitor ki movement behtar karo',
          'Bachchon ke liye learning ya quiz corner add karo',
          'Koi tabdeeli nahi chahiye; sab kuch achhi tarah arrange tha',
        ],
      },

      finalThoughts: 'Aakhri Khayalat',
      thankYouMessage: 'Aap ke qeemati feedback ka shukriya!',
      successMessage:
        'Aap ki raye se humein behtari mein madad milegi. Allah aap ke jazbe ko qubool kare.',
      note: 'Note',
      redirectNote: 'Aap ko jald hi home page par le jaya jayega...',

      selectLanguage: 'Zabaan select karo',
      english: 'English',
      urdu: 'Roman Dhakni Urdu',
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

  // Function to check for existing feedback
  const checkExistingFeedback = async (language) => {
    setLoading(true);
    try {
      const user_id = await generateUserID();

      const { data, error } = await supabase
        .from('exhibition_feedback')
        .select('*')
        .eq('user_id', user_id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 means no rows returned
        console.error('Error fetching feedback:', error);
        return false;
      }

      if (data) {
        // Pre-populate form with existing data
        setFormData({
          name: data.name || '',
          place: data.place || '',
          mobile: data.mobile || '',
          email: data.email || '',
          professionType: data.professionType || '',
          accompanyingCount: data.accompanying_count
            ? data.accompanying_count.toString()
            : '',

          overallExperience: {
            selected: data.overall_experience || '',
            comment: data.overall_experience_comment || '',
          },
          organization: {
            selected: data.organization || '',
            comment: data.organization_comment || '',
          },
          movement: {
            selected: data.movement || '',
            comment: data.movement_comment || '',
          },
          learning: {
            selected: data.learning || '',
            comment: data.learning_comment || '',
          },
          improvements: {
            selected: data.improvements || '',
            comment: data.improvements_comment || '',
          },

          additionalComments: data.additional_comments || '',
        });

        setIsEditMode(true);
        return true;
      }

      setIsEditMode(false);
      return false;
    } catch (error) {
      console.error('Error checking existing feedback:', error);
      setIsEditMode(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Handle language selection
  const handleLanguageSelect = async (language) => {
    setCurrentLanguage(language);

    // Check for existing feedback
    const hasExistingFeedback = await checkExistingFeedback(language);

    // Move to next step regardless of whether feedback exists
    setCurrentStep(1);
  };

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
      return;
    }

    if (currentStep === 1) {
      // Validate personal info before proceeding
      if (!formData.name.trim() || !formData.place.trim()) {
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
        user_id: await generateUserID(),
        name: formData.name,
        place: formData.place,
        mobile: formData.mobile,
        email: formData.email,
        professionType: formData.professionType,
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
        submission_language: currentLanguage,
      };

      // Use upsert to handle both insert and update
      const { data, error } = await supabase
        .from('exhibition_feedback')
        .upsert([submissionData], {
          onConflict: 'user_id',
          ignoreDuplicates: false,
        });

      if (error) {
        console.log('Error submitting feedback:', error);
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

          {loading && (
            <div className="mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">
                Checking for existing feedback...
              </p>
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={() => handleLanguageSelect('en')}
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-4 px-6 rounded-xl hover:bg-emerald-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {translations.en.english}
            </button>

            <button
              onClick={() => handleLanguageSelect('ru')}
              disabled={loading}
              className="w-full bg-pink-600 text-white py-4 px-6 rounded-xl hover:bg-pink-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ direction: 'rtl' }}
            >
              {translations.ru.urdu}
            </button>

            <button
              onClick={() => handleLanguageSelect('ur')}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ direction: 'rtl' }}
            >
              {translations.ur.urdu}
            </button>

            <button
              onClick={() => handleLanguageSelect('kn')}
              disabled={loading}
              className="w-full bg-purple-600 text-white py-4 px-6 rounded-xl hover:bg-purple-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
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
            {isEditMode && (
              <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center">
                <Edit size={14} className="mr-1" />
                {t.editingFeedback}
              </span>
            )}
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
          {/* Header with edit mode indicator */}
          {isEditMode && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center">
                <Edit size={20} className="text-emerald-600 mr-2" />
                <p className="text-emerald-700 font-medium">
                  {currentLanguage === 'en'
                    ? 'Editing your existing feedback'
                    : currentLanguage === 'ur'
                    ? 'آپ اپنی موجودہ رائے میں ترمیم کر رہے ہیں'
                    : currentLanguage === 'kn'
                    ? 'ನಿಮ್ಮ ಅಸ್ತಿತ್ವದಲ್ಲಿರುವ ಪ್ರತಿಕ್ರಿಯೆಯನ್ನು ಸಂಪಾದಿಸಲಾಗುತ್ತಿದೆ'
                    : 'Aap apni mojooda feedback mein tarmeem kar rahe hain'}
                </p>
              </div>
            </div>
          )}

          {/* Personal Information Step */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {isEditMode ? t.editingFeedback : t.shareExperience}
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
                  />
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
              {isEditMode ? (
                <>
                  <Edit size={20} className="mr-2" />
                  {t.updateFeedback}
                </>
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  {t.submitFeedback}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;
