import React, { useState, useEffect } from 'react';
import AdminPanel from './components/AdminPanel';
import Dashboard from './components/Dashboard';
import RatingForm from './components/rating/RatingForm';
import UserRegister from './components/UserRegister';
import ModelsView from './components/ModelsView';
import LoginModal from './components/LoginModal';
import ResetPasswordModal from './components/ResetPasswordModal';
import { Star, TrendingUp, Menu, MicVocal } from 'lucide-react';
import { visitTrack } from './lib/visitTrack';
import { getModels } from './lib/modelsApi';
import { generateUserID, supabase } from './lib/supabaseClient';
import FeedbackPage from './components/FeedbackPage';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [modelNumber, setModelNumber] = useState(null);
  const [user, setUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [pendingAdminView, setPendingAdminView] = useState(false);

  // Check for existing session and reset tokens on mount
  useEffect(() => {
    const initializeApp = async () => {
      // Check auth session
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // Check for reset token in URL
      const urlParams = new URLSearchParams(window.location.search);
      const type = urlParams.get('type');
      const accessToken = urlParams.get('access_token');
      console.log('App initialized with URL params:', {
        type,
        accessToken,
        urlParams,
      });

      if (type === 'recovery' && accessToken) {
        console.log('Reset token found on app load');
        setShowResetModal(true);
      }

      visitTrack();
      getModels();
      generateUserID();
      localStorage.setItem('latestVisit', new Date().toISOString());
    };

    initializeApp();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);

      if (event === 'SIGNED_OUT' && currentView === 'admin') {
        setCurrentView('home');
      }
    });

    return () => subscription.unsubscribe();
  }, [currentView]);

  useEffect(() => {
    const handleLocationChange = () => {
      const { pathname, search, hash } = window.location;

      // Check for reset token in any navigation
      const urlParams = new URLSearchParams(search);
      const type = urlParams.get('type');
      const accessToken = urlParams.get('email');
      console.log('Location changed with URL params:', {
        type,
        accessToken,
      });
      if (type === 'recovery') {
        setShowResetModal(true);
        return;
      }

      // Existing route handling
      if (pathname && pathname.startsWith('/rating')) {
        const params = new URLSearchParams(search);
        const modelNumber = params.get('modelNumber');
        setModelNumber(modelNumber);
        setCurrentView('rating');
        return;
      }

      if (pathname === '/admin') {
        if (user) {
          setCurrentView('admin');
        } else {
          setPendingAdminView(true);
          setShowLoginModal(true);
          setCurrentView('home');
        }
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

      if (pathname === '/feedback') {
        setCurrentView('feedback');
        return;
      }

      // Fallback to hash-based routes
      const hashPart = (hash || '').slice(1);
      const [view, params] = hashPart.split('?');
      if (view === 'rate' && params) {
        const urlParams = new URLSearchParams(params);
        const model = urlParams.get('model');
        setModelNumber(model);
        setCurrentView('rate');
      } else if (view === 'dashboard') {
        setCurrentView('dashboard');
      } else if (view === 'feedback') {
        setCurrentView('feedback');
      } else if (view === 'admin') {
        if (user) {
          setCurrentView('admin');
        } else {
          setPendingAdminView(true);
          setShowLoginModal(true);
          setCurrentView('home');
        }
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
  }, [user]);

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Handles a successful login by updating the user state and
   * redirecting to the admin view if the user was attempting to
   * access the admin view before logging in.
   * @param {Object} user The user object returned by Supabase
   */
  /*******  518a21ae-b643-413d-b425-ca3fdc38a7a4  *******/ const handleLoginSuccess =
    (user) => {
      setUser(user);
      if (pendingAdminView) {
        setCurrentView('admin');
        setPendingAdminView(false);
      }
    };

  const handleResetSuccess = () => {
    // Optional: You can automatically open login modal after successful reset
    // setShowLoginModal(true);
  };

  const handleAdminClick = (e) => {
    e.preventDefault();
    if (user) {
      setCurrentView('admin');
      window.history.pushState({}, '', '/admin');
    } else {
      setPendingAdminView(true);
      setShowLoginModal(true);
    }
  };

  // Render current view
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

  if (currentView === 'admin' && user) {
    return <AdminPanel user={user} />;
  }

  if (currentView === 'register') {
    return <UserRegister />;
  }

  if (currentView === 'models') {
    return <ModelsView />;
  }

  if (currentView === 'feedback') {
    return (
      <FeedbackPage
        onBack={() => {
          setCurrentView('home');
          window.history.pushState({}, '', '/');
        }}
      />
    );
  }

  // Home Page
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
        {/* Your existing home page JSX */}
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <a
              href="/"
              className="inline-flex items-center justify-center space-x-4"
            >
              <img src="/logo.png" alt="Exhibition Logo" className="h-16" />
              <div className="text-left">
                <h1 className="text-4xl font-bold text-gray-800 mb-0">
                  Seerah Exhibition
                </h1>
              </div>
            </a>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <a
              href="/models"
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <Star className="text-emerald-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                View Models
              </h2>
              <p className="text-gray-600">
                Track your visit and rate the exhibition models
              </p>
            </a>

            <a
              href="/feedback"
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView('feedback');
                window.history.pushState({}, '', '/feedback');
              }}
            >
              <MicVocal className="text-red-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Feedback
              </h2>
              <p className="text-gray-600">
                Your feedback helps us improve the experience
              </p>
            </a>

            <a
              href="/dashboard"
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

            <button
              onClick={handleAdminClick}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1 text-left cursor-pointer"
            >
              <Menu className="text-purple-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Admin Panel
              </h2>
              <p className="text-gray-600">
                Manage models, volunteers, and export data
              </p>
            </button>
          </div>

          {/* Rest of your home page content */}
        </div>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPendingAdminView(false);
        }}
        onLoginSuccess={handleLoginSuccess}
      />

      <ResetPasswordModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onResetSuccess={handleResetSuccess}
      />
    </>
  );
};

export default App;
