import React, { useEffect, useState } from 'react';
import StarRating from './rating/StartRating';
import { getModels } from '../lib/modelsApi';
import { submitRating } from '../lib/ratingUtils';
import { supabase } from '../lib/supabaseClient';

const ModelsView = () => {
  const [exhibitData, setExhibitData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [descriptionModal, setDescriptionModal] = useState({
    isOpen: false,
    model: null,
    loading: false,
    descriptions: { en: '', ur: '', kn: '' },
    activeTab: 'en',
  });

  // Load data from localStorage or API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const saved = localStorage.getItem('modelsCache');
        let data = [];

        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
              data = parsed;
            }
          } catch (err) {
            console.warn('Failed to parse localStorage data:', err);
          }
        }

        if (data.length === 0) {
          data = await getModels();
          if (data && Array.isArray(data)) {
            const dataWithDefaults = data.map((item) => ({
              ...item,
              visited: item.visited || 0,
              user_rating: item.user_rating || 0,
              rating_submitted: item.rating_submitted || false,
            }));
            localStorage.setItem(
              'modelsCache',
              JSON.stringify(dataWithDefaults),
            );
            data = dataWithDefaults;
          }
        }

        setExhibitData(data || []);
      } catch (error) {
        console.error('Error loading exhibit data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle visit toggle
  const handleVisitToggle = (modelId) => {
    setExhibitData((prevData) => {
      const updatedData = prevData.map((model) =>
        model.model_number === modelId
          ? { ...model, visited: model.visited ? 0 : 1 }
          : model,
      );
      localStorage.setItem('modelsCache', JSON.stringify(updatedData));
      return updatedData;
    });
  };

  // Handle rating submission
  const handleSubmitRating = async (modelId, rating) => {
    try {
      const user_id = localStorage.getItem('user_id');
      if (!user_id) {
        alert('User not found. Please log in again.');
        return;
      }

      const ratingData = {
        user_id: user_id,
        model_number: modelId,
        star_rating: rating,
      };

      const response = await submitRating(ratingData);
      if (response && Array.isArray(response) && response.length > 0) {
        setExhibitData((prevData) => {
          const updatedData = prevData.map((model) =>
            model.model_number === modelId
              ? {
                  ...model,
                  user_rating: rating,
                  rating_submitted: true,
                }
              : model,
          );
          localStorage.setItem('modelsCache', JSON.stringify(updatedData));
          return updatedData;
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Failed to submit rating. Please try again.');
    }
  };

  // Fetch description data for a specific model
  const fetchModelDescription = async (modelNumber) => {
    setDescriptionModal((prev) => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase
        .from('models')
        .select('description_en, description_ur, description_kn')
        .eq('model_number', modelNumber)
        .single();

      if (error) {
        console.error('Error fetching description:', error);
        throw error;
      }

      setDescriptionModal((prev) => ({
        ...prev,
        descriptions: {
          en: data.description_en || 'No description available in English.',
          ur: data.description_ur || 'اردو میں تفصیل دستیاب نہیں ہے۔',
          kn: data.description_kn || 'ಕನ್ನಡದಲ್ಲಿ ವಿವರಣೆ ಲಭ್ಯವಿಲ್ಲ.',
        },
        loading: false,
      }));
    } catch (error) {
      console.error('Failed to fetch description:', error);
      setDescriptionModal((prev) => ({
        ...prev,
        descriptions: {
          en: 'Failed to load description.',
          ur: 'تفصیل لوڈ کرنے میں ناکامی۔',
          kn: 'ವಿವರಣೆಯನ್ನು ಲೋಡ್ ಮಾಡಲು ವಿಫಲವಾಗಿದೆ.',
        },
        loading: false,
      }));
    }
  };

  // Handle opening description modal
  const handleOpenDescription = async (model) => {
    setDescriptionModal({
      isOpen: true,
      model: model,
      loading: true,
      descriptions: { en: '', ur: '', kn: '' },
      activeTab: 'en',
    });

    await fetchModelDescription(model.model_number);
  };

  // Handle closing description modal
  const handleCloseDescription = () => {
    setDescriptionModal({
      isOpen: false,
      model: null,
      loading: false,
      descriptions: { en: '', ur: '', kn: '' },
      activeTab: 'en',
    });
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setDescriptionModal((prev) => ({ ...prev, activeTab: tab }));
  };

  // Calculate rated percentage for progress bar
  const ratedPercentage =
    exhibitData.length > 0
      ? (exhibitData.filter((m) => m.rating_submitted).length /
          exhibitData.length) *
        100
      : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exhibition data...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (exhibitData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-gray-400 text-6xl mb-4">🏛️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            No Exhibition Data
          </h2>
          <p className="text-gray-600">No models or exhibits found.</p>
        </div>
      </div>
    );
  }

  // Sub Model Card Component
  const SubModelCard = ({
    model,
    onVisitToggle,
    onSubmitRating,
    onViewDescription,
  }) => {
    const isVisited = model.visited === 1;
    const [isTapping, setIsTapping] = useState(false);
    const [currentRating, setCurrentRating] = useState(model.user_rating || 0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTapStart = () => setIsTapping(true);
    const handleTapEnd = () => setIsTapping(false);

    const handleRate = (rating) => {
      setCurrentRating(rating);
    };

    const handleSubmit = async () => {
      if (currentRating === 0) {
        alert('Please select a rating before submitting.');
        return;
      }
      setIsSubmitting(true);
      try {
        await onSubmitRating(model.model_number, currentRating);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div
        className={`bg-white p-4 md:p-6 rounded-xl shadow-lg border-2 transition-all duration-300 
                 ${
                   isVisited
                     ? 'border-green-400 bg-green-50'
                     : 'border-gray-200'
                 }
                 ${isTapping ? 'scale-95' : 'hover:shadow-xl'}`}
        onTouchStart={handleTapStart}
        onTouchEnd={handleTapEnd}
        onMouseDown={handleTapStart}
        onMouseUp={handleTapEnd}
        onMouseLeave={handleTapEnd}
      >
        {/* Model ID and Location - Top Left */}
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs md:text-sm font-mono px-2 md:px-3 py-1 rounded-full">
            {model.model_number}
          </span>
          {model.location && (
            <>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600 text-xs md:text-sm">
                {model.location}
              </span>
            </>
          )}
        </div>

        {/* Model Name */}
        <h3 className="text-base md:text-lg font-semibold text-gray-800 text-center mb-3 md:mb-4 leading-tight line-clamp-3">
          {model.name_en}
        </h3>
        {model.name_ur && (
          <h3 className="text-base md:text-lg font-semibold text-gray-800 text-center mb-3 md:mb-4 leading-tight line-clamp-3">
            {model.name_ur}
          </h3>
        )}

        {/* Conditional Rendering based on visited status */}
        {!isVisited ? (
          /* Not Visited - Show Visit Button */
          <button
            onClick={() => onVisitToggle(model.model_number)}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 
                     active:scale-95 touch-manipulation
                     bg-indigo-600 text-white active:bg-indigo-700 hover:bg-indigo-700`}
          >
            Mark as Visited
          </button>
        ) : (
          /* Visited - Show Rating Section */
          <div className="space-y-4">
            {/* Star Rating Component */}
            <div className="text-center">
              {!model.rating_submitted && (
                <p className="text-sm text-gray-600 mb-2">Rate this model:</p>
              )}
              <StarRating
                rating={currentRating}
                onRate={handleRate}
                readonly={model.rating_submitted}
                size={32}
              />
            </div>

            {/* Submit Rating Button or Status */}
            {!model.rating_submitted && (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || currentRating === 0}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 
                         active:scale-95 touch-manipulation
                         ${
                           isSubmitting || currentRating === 0
                             ? 'bg-gray-400 cursor-not-allowed'
                             : 'bg-green-600 text-white active:bg-green-700 hover:bg-green-700'
                         }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </span>
                ) : (
                  'Submit Rating'
                )}
              </button>
            )}
          </div>
        )}

        {/* View Description Button - Always visible */}
        <button
          onClick={() => onViewDescription(model)}
          className="w-full mt-4 py-2 px-4 border border-blue-600 text-blue-600 rounded-lg font-semibold transition-all duration-300 
                   active:scale-95 touch-manipulation hover:bg-blue-50 active:bg-blue-100"
        >
          View Description
        </button>
      </div>
    );
  };

  // Description Modal Component
  const DescriptionModal = () => {
    if (!descriptionModal.isOpen) return null;

    const { model, loading, descriptions, activeTab } = descriptionModal;
    const tabLabels = {
      en: 'English',
      ur: 'اردو', // Urdu in Urdu script
      kn: 'ಕನ್ನಡ', // Kannada in Kannada script
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={handleCloseDescription}
        style={{ overflow: 'hidden' }}
      >
        <div
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {model?.model_number} - {model?.name_en}
              </h2>
              <p className="text-sm text-gray-600 mt-1">Model Description</p>
            </div>
            <button
              onClick={handleCloseDescription}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-lg hover:bg-gray-100 active:scale-95"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {Object.entries(tabLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleTabChange(key)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap
                           ${
                             activeTab === key
                               ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                               : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                           }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading description...
                </span>
              </div>
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {descriptions[activeTab]}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-xl">
            <button
              onClick={handleCloseDescription}
              className="w-full py-3 px-4 bg-gray-600 text-white rounded-lg font-semibold transition-all duration-300 
                       active:scale-95 touch-manipulation hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const visitedCount = exhibitData.filter((m) => m.visited).length;
  const reviewedCount = exhibitData.filter((m) => m.rating_submitted).length;
  const notVisitedCount = exhibitData.length - visitedCount;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-40">
        {/* Header Content */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              {/* Visited - Success State */}
              <div className="bg-white rounded-lg shadow-md p-2 text-center border border-emerald-100">
                <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                  Visited
                </div>
                <div className="text-7xl font-bold text-emerald-600">
                  {visitedCount}
                </div>
              </div>

              {/* Not Visited - Warning State */}
              <div className="bg-white rounded-lg shadow-md p-2 text-center border border-red-100">
                <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                  Not Visited
                </div>
                <div className="text-7xl font-bold text-red-500">
                  {notVisitedCount}
                </div>
              </div>

              {/* Reviewed - Success State */}
              <div className="bg-white rounded-lg shadow-md p-2 text-center border border-emerald-100">
                <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-2">
                  Reviewed
                </div>
                <div className="text-7xl font-bold text-emerald-600">
                  {reviewedCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ultra-thin Progress Bar - Attached to header */}
        <div
          className="w-full bg-white h-[0.4rem]"
          style={{ margin: 0, padding: 0, border: 'none' }}
        >
          <div
            className="bg-[#182d24] h-[0.4rem] transition-all duration-500 ease-out"
            style={{
              width: `${ratedPercentage}%`,
              margin: 0,
              padding: 0,
              border: 'none',
            }}
          ></div>
        </div>
      </div>

      {/* Main Content - Adjusted for fixed header */}
      <div className="pt-48">
        {' '}
        {/* Increased padding to account for fixed header */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-6">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow">
            {/* Models Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {exhibitData.map((model) => (
                <SubModelCard
                  key={model.model_number}
                  model={model}
                  onVisitToggle={handleVisitToggle}
                  onSubmitRating={handleSubmitRating}
                  onViewDescription={handleOpenDescription}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Description Modal */}
      <DescriptionModal />
    </div>
  );
};

export default ModelsView;
