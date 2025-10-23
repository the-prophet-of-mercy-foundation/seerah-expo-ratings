import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X } from 'lucide-react';

const ResetPasswordModal = ({ isOpen, onClose, onResetSuccess }) => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Check for password reset token when modal opens
  useEffect(() => {
    if (isOpen) {
      checkForResetToken();
    }
  }, [isOpen]);

  const checkForResetToken = async () => {
    console.log('Checking for reset token...');

    // Get the current URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const type = urlParams.get('type');

    console.log('URL params:', { token, type });

    if (type === 'recovery' && token) {
      console.log('Reset token detected, verifying OTP...');
      setLoading(true);

      try {
        // Use verifyOtp for password reset instead of setSession
        const { error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'recovery',
        });

        if (verifyError) {
          console.error('OTP verification error:', verifyError);
          setError('Invalid or expired reset link. Please request a new one.');
        } else {
          console.log('OTP verified successfully');

          // Get the current user after OTP verification
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            console.error('Error getting user:', userError);
            setError('Failed to get user information.');
          } else if (user) {
            console.log('User found:', user.email);
            setEmail(user.email || '');

            // Clean up URL
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname,
            );

            setMessage('Please set your new password below.');
          } else {
            setError('No user found. Please request a new reset link.');
          }
        }
      } catch (err) {
        console.error('Error processing reset:', err);
        setError('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      console.log('No reset token found in URL');
      // Check if user is already authenticated (edge case)
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        setMessage('Please set your new password below.');
      }
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // Validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Update user password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(`Password update failed: ${updateError.message}`);
      } else {
        setMessage(
          '✅ Password updated successfully! You can now login with your new password.',
        );
        setNewPassword('');
        setConfirmPassword('');

        // Sign out after password reset for security
        await supabase.auth.signOut();

        // Call success callback and close modal after delay
        setTimeout(() => {
          if (onResetSuccess) {
            onResetSuccess();
          }
          onClose();
        }, 3000);
      }
    } catch (err) {
      setError('An unexpected error occurred while updating password.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {email ? 'Set New Password' : 'Reset Password'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {loading && !email ? (
          <div className="text-center py-8">
            <p>Checking reset token...</p>
          </div>
        ) : email ? (
          // Reset form
          <form onSubmit={handleResetPassword} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                {message}
              </div>
            )}

            <div>
              <p className="text-sm text-gray-600 mb-4">
                Setting new password for: <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter new password"
                minLength="6"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Confirm new password"
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        ) : (
          // No token or error state
          <div className="text-center py-8">
            {error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm mb-4">
                {error}
              </div>
            ) : (
              <p className="text-gray-600 mb-4">
                No valid reset token found. Please use the password reset link
                from your email.
              </p>
            )}
            <button
              onClick={handleClose}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
