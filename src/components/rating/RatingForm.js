import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Star } from 'lucide-react';
import StarRating from './StartRating';
import { generateUserID } from '../../lib/supabaseClient';
import { getModels } from '../../lib/modelsApi';
import { checkIfAlreadyRated, submitRating } from '../../lib/ratingUtils';

/* ----------------------------- RatingForm Component ----------------------------- */
const RatingForm = ({ modelNumber, onSuccess }) => {
  const [model, setModel] = useState(null);
  const [alreadyRated, setAlreadyRated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [language, setLanguage] = useState('en');
  const [ratings, setRatings] = useState(0);
  const [comments, setComments] = useState('');

  const translations = {
    en: {
      title: 'Rate This Model',
      comments: 'Comments (Optional)',
      submit: 'Submit Rating',
      thanks: 'Thank you for rating!',
      alreadyRated: 'You have already rated this model',
      required: 'Please rate all categories',
      success: 'Your rating has been submitted successfully!',
      loading: 'Loading...',
      modelNotFound: 'Model Not Found',
      viewDashboard: 'View Dashboard',
    },
    ur: {
      title: 'اس ماڈل کی درجہ بندی کریں',
      comments: 'تبصرے (اختیاری)',
      submit: 'جمع کریں',
      thanks: 'شکریہ',
      alreadyRated: 'آپ پہلے ہی درجہ بندی کر چکے ہیں',
      required: 'براہ کرم درجہ بندی کریں',
      success: 'آپ کی درجہ بندی کامیابی سے جمع ہوگئی!',
      loading: 'لوڈ ہو رہا ہے...',
      modelNotFound: 'ماڈل نہیں ملا',
      viewDashboard: 'ڈیش بورڈ دیکھیں',
    },
    kn: {
      title: 'ಈ ಮಾದರಿಗೆ ರೇಟ್ ಮಾಡಿ',
      comments: 'ಕಾಮೆಂಟ್‌ಗಳು (ಐಚ್ಛಿಕ)',
      submit: 'ಸಲ್ಲಿಸಿ',
      thanks: 'ಧನ್ಯವಾದ',
      alreadyRated: 'ನೀವು ಈಗಾಗಲೇ ರೇಟ್ ಮಾಡಿದ್ದೀರಿ',
      required: 'ದಯವಿಟ್ಟು ರೇಟ್ ಮಾಡಿ',
      success: 'ನಿಮ್ಮ ರೇಟಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!',
      loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      modelNotFound: 'ಮಾದರಿ ಕಂಡುಬಂದಿಲ್ಲ',
      viewDashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ನೋಡಿ',
    },
  };

  const t = translations[language];

  useEffect(() => {
    const loadModel = async () => {
      setLoading(true);
      const models = await getModels();
      const foundModel = models?.find((m) => m.model_number === modelNumber);
      if (foundModel) {
        setModel(foundModel);
        const rated = await checkIfAlreadyRated(foundModel.model_number);
        setAlreadyRated(rated);
      }
      setLoading(false);
    };

    loadModel();
  }, [modelNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ratings === 0) return alert(t.required);

    setSubmitting(true);
    const ratingData = {
      user_id: await generateUserID(),
      model_number: modelNumber,
      star_rating: ratings,
      comments: comments || null,
    };
    await submitRating(ratingData);

    setSubmitting(false);
    setAlreadyRated(true);
    onSuccess?.();
  };

  /* ----------------------------- Conditional Renders ----------------------------- */
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t.loading}</p>
        </div>
      </div>
    );

  if (!model)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800">{t.modelNotFound}</h2>
        </div>
      </div>
    );

  if (alreadyRated)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.thanks}</h2>
          <p className="text-gray-600 mb-4">{t.alreadyRated}</p>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            {t.viewDashboard}
          </button>
        </div>
      </div>
    );

  /* ----------------------------- Rating Form UI ----------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">{t.title}</h1>
              <p className="text-emerald-100">Model #{model.model_number}</p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded px-3 py-1 text-sm"
            >
              <option value="en">English</option>
              <option value="ur">اردو</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>
          </div>
          <h2 className="text-xl font-semibold">{model[`name_${language}`]}</h2>
          <p className="text-sm text-emerald-100 mt-1">{model.location}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <StarRating rating={ratings} onRate={setRatings} />
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {t.comments}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                rows="3"
                placeholder="Share your thoughts..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingForm;
