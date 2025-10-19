import React, { useState, useEffect } from 'react';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/Dashboard';
import RatingForm from './components/rating/RatingForm';
import UserRegister from './components/UserRegister';
import ModelsView from './components/ModelsView';
import { Star, TrendingUp, Menu } from 'lucide-react';
import { visitTrack } from './lib/visitTrack';
import { getModels } from './lib/modelsApi';
import { generateUserID } from './lib/supabaseClient';

// Main App Component with Router
const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [modelNumber, setModelNumber] = useState(null);

  useEffect(() => {
    visitTrack();
    getModels();
    generateUserID();

    localStorage.setItem('latestVisit', new Date().toISOString());
    const handleLocationChange = () => {
      // First check for path-based route like /rating?id=1
      const { pathname, search, hash } = window.location;
      if (pathname && pathname.startsWith('/rating')) {
        const params = new URLSearchParams(search);
        const modelNumber = params.get('modelNumber');
        setModelNumber(modelNumber);
        setCurrentView('rating');
        return;
      }

      // Path-based admin route
      if (pathname === '/admin') {
        setCurrentView('admin');
        return;
      }

      if (pathname === '/dashboard') {
        setCurrentView('dashboard');
        return;
      }

      if (pathname === '/register') {
        setCurrentView('register');
        return;
      }

      if (pathname === '/models') {
        setCurrentView('models');
        return;
      }

      // Fallback to existing hash-based routes
      const hashPart = (hash || '').slice(1);
      const [view, params] = hashPart.split('?');
      if (view === 'rate' && params) {
        const urlParams = new URLSearchParams(params);
        const model = urlParams.get('model');
        setModelNumber(model);
        setCurrentView('rate');
      } else if (view === 'dashboard') {
        setCurrentView('dashboard');
      } else if (view === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('home');
      }
    };

    handleLocationChange();
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  if (currentView === 'rating' && modelNumber) {
    return (
      <RatingForm
        modelNumber={modelNumber}
        onSuccess={() => (window.location.hash = 'dashboard')}
      />
    );
  }

  if (currentView === 'dashboard') {
    return <Dashboard />;
  }

  if (currentView === 'admin') {
    return <AdminPanel />;
  }

  if (currentView === 'register') {
    return <UserRegister />;
  }

  if (currentView === 'models') {
    return <ModelsView />;
  }

  // Home Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Prophet Muhammad Exhibition
          </h1>
          <p className="text-xl text-gray-600">Life & Times Rating System</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <a
            href="/models"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <Star className="text-emerald-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Rate Models
            </h2>
            <p className="text-gray-600">
              Share your experience and rate the exhibition models
            </p>
          </a>

          <a
            href="#dashboard"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <TrendingUp className="text-blue-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Live Dashboard
            </h2>
            <p className="text-gray-600">
              View real-time rankings and statistics
            </p>
          </a>

          <a
            href="/"
            className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <Menu className="text-purple-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Admin Panel
            </h2>
            <p className="text-gray-600">
              Manage models, volunteers, and export data
            </p>
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            About the Exhibition
          </h3>
          <p className="text-gray-600 mb-4">
            Experience the life and times of Prophet Muhammad (peace be upon
            him) through meticulously crafted 3D models depicting historical
            places and structures from 7th century Arabia.
          </p>
          <p className="text-gray-600 mb-4">
            Each model is accompanied by knowledgeable volunteers who share the
            historical significance and Islamic context of these sacred sites.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600">100</div>
              <div className="text-sm text-gray-600">Models</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4</div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-600">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">10K</div>
              <div className="text-sm text-gray-600">Visitors</div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-600 text-sm">
          <p>May peace and blessings be upon Prophet Muhammad ﷺ</p>
        </div>
      </div>
    </div>
  );
};

export default App;
