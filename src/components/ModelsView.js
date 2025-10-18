import React, { useEffect, useState, useMemo } from 'react';
import { getModels } from '../lib/modelsApi';

const ModelsView = () => {
  const [exhibitData, setExhibitData] = useState([]);
  const [currentView, setCurrentView] = useState('locations');
  const [selectedLocation, setSelectedLocation] = useState(null);

  useEffect(() => {
    const load = async () => {
      const saved = localStorage.getItem('modelsCache');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setExhibitData(parsed);
            return;
          }
          // if saved object contains models array
          const models = await getModels();
          setExhibitData(models || []);
        } catch (err) {
          console.warn('Failed to parse saved exhibit data', err);
        }
      }
    };
    load();
  }, []);

  const locationStats = useMemo(() => {
    const stats = {};

    exhibitData?.forEach((model) => {
      const location = model.location;
      if (!stats[location]) {
        stats[location] = {
          totalModels: 0,
          visitedCount: 0,
          models: [],
        };
      }
      stats[location].totalModels++;
      stats[location].models.push({
        id: model.model_number,
        name: model.name_en,
        desc: model.description_en,
        visted: model.visited || 0,
      });

      // Check if the current user has visited this model
      if (model.visited) {
        stats[location].visitedCount++;
      }
    });

    Object.keys(stats).forEach((location) => {
      const stat = stats[location];
      stat.visitedPercent = (stat.visitedCount / stat.totalModels) * 100;
    });
    console.log('Location Stats:', stats);

    return stats;
  }, [exhibitData]);

  const navigateToModels = (location) => {
    setSelectedLocation(location);
    setCurrentView('models');
  };

  const navigateToLocations = () => {
    setCurrentView('locations');
    setSelectedLocation(null);
  };

  const LocationView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Object.keys(locationStats).map((location) => {
        const stats = locationStats[location];
        const isComplete = stats.visitedPercent === 100;

        return (
          <div
            key={location}
            onClick={() => navigateToModels(location)}
            className={`bg-white p-6 rounded-xl shadow-lg border-t-4 cursor-pointer transition transform hover:scale-[1.02] ${
              isComplete ? 'border-green-500' : 'border-indigo-500'
            }`}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-3 flex justify-between items-center">
              <span>{location}</span>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  isComplete
                    ? 'bg-green-100 text-green-700'
                    : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {isComplete ? 'Complete' : 'In Progress'}
              </span>
            </h2>

            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex justify-between">
                <span className="font-medium">Total Models:</span>
                <span className="text-gray-800">{stats.totalModels}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">Models Visited (You):</span>
                <span className="text-indigo-600 font-semibold">
                  {stats.visitedCount}
                </span>
              </p>
              <p className="flex justify-between">
                <span className="font-medium">% Seen (You):</span>
                <span className="text-indigo-600 font-semibold">
                  {stats.visitedPercent.toFixed(0)}%
                </span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  const ChildView = () => {
    const models = locationStats[selectedLocation]?.models || [];

    return (
      <div>
        <button
          onClick={navigateToLocations}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-6 font-medium transition"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
          Back to Locations
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Models in {selectedLocation} ({models.length})
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {models.map((model) => {
            const isVisited = model.isVisited || false;
            const rating = model.rating || 0;
            const globalVisits = model.visitors_count || 0;

            return (
              <div
                key={model.id}
                className={`bg-white p-4 rounded-xl shadow-lg border-2 transition ${
                  isVisited ? 'border-green-400' : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {model.id}
                    </h3>
                    <p className="text-sm font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {model.name}
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center space-x-2">
                  <button
                    // onClick={() => handleToggleVisited(model.id)}
                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                      isVisited
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {isVisited
                      ? 'Visited (Toggle OFF)'
                      : 'Not Visited (Toggle ON)'}
                  </button>

                  <button
                    // onClick={() => handleOpenRatingModal(model.id)}
                    disabled={!isVisited}
                    className={`w-1/3 px-2 py-2 text-sm font-medium rounded-lg transition-colors shadow-sm ${
                      isVisited
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Give Rating
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Exhibition Floor Plan</h1>
          <p className="text-emerald-100">
            Know the layout of the exhibition and navigate easily
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-center justify-between">
            {currentView === 'locations' ? <LocationView /> : <ChildView />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelsView;
