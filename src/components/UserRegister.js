import React, { useState } from 'react';
import { upsertUserByPhone } from '../lib/userApi';
import { CheckCircle } from 'lucide-react';
import { generateUserID } from '../lib/supabaseClient';
import { visitTrack } from '../lib/visitTrack';

const UserRegister = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    place: '',
    phone: '',
    email: '',
    visitor_count: 1,
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currUser, setCurrUser] = useState(() => {
    const saved = localStorage.getItem('current_user');
    return saved ? JSON.parse(saved) : {};
  });

  // Update form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      // Generate unique user_id if not set
      const user_id = await generateUserID();
      formData.user_id = user_id;
      const data = await upsertUserByPhone(formData);
      if (data) {
        setSuccess('User registered successfully!');
        setFormData({
          user_id: '',
          name: '',
          place: '',
          phone: '',
          email: '',
          visitor_count: 1,
        });
        onSuccess?.(data);
        localStorage.setItem('current_user', JSON.stringify(data));
        setCurrUser(data);
      } else {
        setError('Failed to register user');
      }
    } catch (err) {
      console.log(err);
      setError('Something went wrong');
    }

    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-2">Vistior Registration</h1>
          <p className="text-indigo-100">To make your experience better</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="space-x-1 px-2">
              <div className="max-w-1xl mx-auto mt-2 bg-white p-2 rounded-lg shadow-lg">
                {Object.keys(currUser).length !== 0 ? (
                  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                      {visitTrack() ? (
                        <div>
                          <CheckCircle
                            className="mx-auto text-green-500 mb-4"
                            size={64}
                          />
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Welcome back {currUser.name}!
                          </h2>
                          <p className="text-gray-600 mb-4">
                            Wish you to have a great experience today again!!!
                          </p>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                              <label className="block font-medium mb-1">
                                Visitor Count
                              </label>
                              <input
                                type="number"
                                name="visitor_count"
                                value={formData.visitor_count}
                                onChange={handleChange}
                                min={1}
                                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={submitting}
                              className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {submitting ? 'Registering...' : 'Register'}
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div>
                          {console.log('Current User Data:', currUser)}
                          <CheckCircle
                            className="mx-auto text-green-500 mb-4"
                            size={64}
                          />
                          <h2 className="text-2xl font-bold text-gray-800 mb-2">
                            Welcome dear {currUser.name}!
                          </h2>
                          <p className="text-gray-600 mb-4">
                            Wish you to have a great experience today!!!
                          </p>
                          <button
                            onClick={() => (window.location.href = '/models')}
                            className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
                          >
                            Review Navigation
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {success && (
                      <p className="text-green-500 mb-4">{success}</p>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label className="block font-medium mb-1">Name</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Your Full Name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-medium mb-1">Place</label>
                        <input
                          type="text"
                          name="place"
                          placeholder="Your Area/City"
                          value={formData.place}
                          onChange={handleChange}
                          required
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-medium mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          placeholder="Optional Phone Number"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-medium mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          placeholder="Optional Email Address"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-medium mb-1">
                          Visitor Count
                        </label>
                        <input
                          type="number"
                          name="visitor_count"
                          value={formData.visitor_count}
                          onChange={handleChange}
                          min={1}
                          className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Registering...' : 'Register'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
