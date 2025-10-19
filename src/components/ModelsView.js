import React, { useEffect, useState } from 'react';
import StarRating from './rating/StartRating';
import { getModels } from '../lib/modelsApi';
import { submitRating } from '../lib/ratingUtils';

const ModelsView = () => {
  const [exhibitData, setExhibitData] = useState([]);
  const [modelGroups, setModelGroups] = useState({});
  const [currentView, setCurrentView] = useState('groups');
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);

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
            // Initialize visited property if not present
            const dataWithVisited = data.map((item) => ({
              ...item,
              visited: item.visited || 0,
            }));
            localStorage.setItem(
              'modelsCache',
              JSON.stringify(dataWithVisited),
            );
            data = dataWithVisited;
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

  // Process exhibitData into model groups
  useEffect(() => {
    if (exhibitData.length === 0) return;

    const groups = {};

    exhibitData.forEach((model) => {
      const location = model.location;

      if (!groups[location]) {
        groups[location] = {
          totalModels: 0,
          visitedCount: 0,
          models: [],
        };
      }

      groups[location].models.push({
        id: model.model_number,
        name: model.name_en,
        desc: model.description_en,
        visited: model.visited || 0,
      });

      groups[location].totalModels++;

      if (model.visited) {
        groups[location].visitedCount++;
      }
    });

    // Calculate percentages
    Object.keys(groups).forEach((location) => {
      const group = groups[location];
      group.visitedPercent =
        group.totalModels > 0
          ? (group.visitedCount / group.totalModels) * 100
          : 0;
    });

    setModelGroups(groups);
  }, [exhibitData]);

  // Handle visit toggle
  const handleVisitToggle = (modelId, groupName) => {
    setExhibitData((prevData) => {
      const updatedData = prevData.map((model) =>
        model.model_number === modelId
          ? { ...model, visited: model.visited ? 0 : 1 } // Toggle between 0 and 1
          : model,
      );

      // Update localStorage
      localStorage.setItem('modelsCache', JSON.stringify(updatedData));

      return updatedData;
    });
  };

  // Handle group click with mobile-friendly touch feedback
  const handleGroupClick = (groupName) => {
    setSelectedGroup(groupName);
    setCurrentView('subModels');
  };

  const handleBackToGroups = () => {
    setCurrentView('groups');
    setSelectedGroup(null);
  };

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

  // Model Groups View - Mobile Optimized
  const ModelGroupsView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {Object.keys(modelGroups).map((groupName) => {
        const group = modelGroups[groupName];
        const isComplete = group.visitedPercent === 100;

        return (
          <div
            key={groupName}
            onClick={() => handleGroupClick(groupName)}
            className="bg-white p-4 md:p-6 rounded-xl shadow-lg border-t-4 cursor-pointer 
                      active:scale-95 transition-all duration-300 
                      hover:scale-105 hover:shadow-xl touch-manipulation
                      border-indigo-500"
          >
            {/* Header */}
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4 line-clamp-2">
              {groupName}
            </h2>

            {/* Stats - Stack on mobile, row on desktop */}
            <div className="space-y-2 md:space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600 text-xs md:text-sm">
                  Total:
                </span>
                <span className="text-gray-800 font-semibold text-sm md:text-base">
                  {group.totalModels}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600 text-xs md:text-sm">
                  Visited:
                </span>
                <span className="text-indigo-600 font-semibold text-sm md:text-base">
                  {group.visitedCount}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600 text-xs md:text-sm">
                  Complete:
                </span>
                <span
                  className={`font-semibold text-sm md:text-base ${
                    isComplete ? 'text-green-600' : 'text-indigo-600'
                  }`}
                >
                  {group.visitedPercent.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 md:mt-4 w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isComplete ? 'bg-green-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${group.visitedPercent}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Sub Models View - Mobile Optimized
  const SubModelsView = () => {
    const group = modelGroups[selectedGroup];
    if (!group) return null;

    return (
      <div>
        {/* Back Button and Header - Mobile responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
          <button
            onClick={handleBackToGroups}
            className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium 
                      transition-colors active:scale-95 w-fit px-3 py-2 rounded-lg
                      active:bg-indigo-50 touch-manipulation"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Groups
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex-1 text-center sm:text-left">
            {selectedGroup}
            <span className="text-indigo-600 ml-2">
              ({group.models.length})
            </span>
          </h1>
        </div>

        {/* Sub Models Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {group.models.map((model) => (
            <SubModelCard
              key={model.id}
              model={model}
              groupName={selectedGroup}
              onVisitToggle={handleVisitToggle}
            />
          ))}
        </div>
      </div>
    );
  };

  // Sub Model Card Component - Mobile Optimized
  const SubModelCard = ({ model, groupName, onVisitToggle }) => {
    const isVisited = model.visited === 1;
    const [isTapping, setIsTapping] = useState(false);

    const handleTapStart = () => setIsTapping(true);
    const handleTapEnd = () => setIsTapping(false);

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
        {/* Model ID */}
        <div className="text-center mb-3 md:mb-4">
          <span className="inline-block bg-indigo-100 text-indigo-800 text-xs md:text-sm font-mono px-2 md:px-3 py-1 rounded-full">
            {model.id}
          </span>
        </div>

        {/* Model Name */}
        <h3 className="text-base md:text-lg font-semibold text-gray-800 text-center mb-3 md:mb-4 leading-tight line-clamp-3">
          {model.name}
        </h3>

        {/* Visit Button - Full width on mobile */}
        <button
          onClick={() => onVisitToggle(model.id, groupName)}
          disabled={isVisited}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-300 
                     active:scale-95 touch-manipulation
                     ${
                       isVisited
                         ? 'bg-green-500 text-white cursor-not-allowed'
                         : 'bg-indigo-600 text-white active:bg-indigo-700 hover:bg-indigo-700'
                     }`}
        >
          {isVisited ? (
            <span className="flex items-center justify-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Already Visited
            </span>
          ) : (
            'Mark as Visited'
          )}
        </button>

        {/* Description if available */}
        {model.desc && (
          <p className="mt-3 text-xs md:text-sm text-gray-600 text-center line-clamp-2">
            {model.desc}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
            Exhibition Floor Plan
          </h1>
          <p className="text-emerald-100 text-sm md:text-base">
            Know the layout of the exhibition and navigate easily
          </p>
          {/* Quick Stats */}
          <div className="mt-2 text-emerald-200 text-xs md:text-sm flex gap-4">
            <span>{exhibitData.length} models</span>
            <span>{exhibitData.filter((m) => m.visited).length} visited</span>
            <span>{Object.keys(modelGroups).length} groups</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 md:py-6">
        <div className="bg-white p-4 md:p-6 rounded-lg shadow">
          {currentView === 'groups' ? <ModelGroupsView /> : <SubModelsView />}
        </div>
      </div>
    </div>
  );
};

export default ModelsView;
