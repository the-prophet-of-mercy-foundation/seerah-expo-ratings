import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Star, TrendingUp, Users, Award, Clock, CheckCircle, AlertCircle, Menu, X, Globe } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'URL',
    'KEY'
);

// Initialize with sample data
const initSampleData = () => {
    const models = Array.from({ length: 20 }, (_, i) => ({
        id: `model-${i + 1}`,
        model_number: i + 1,
        name_en: `Model ${i + 1}: Historical Site`,
        name_ur: `ماڈل ${i + 1}: تاریخی مقام`,
        name_kn: `ಮಾದರಿ ${i + 1}: ಐತಿಹಾಸಿಕ ಸ್ಥಳ`,
        description_en: `Detailed recreation of significant location from the Prophet's life`,
        location: `Hall ${String.fromCharCode(65 + Math.floor(i / 5))}, Stall ${(i % 5) + 1}`,
        volunteer_id: `vol-${(i % 5) + 1}`
    }));

    const volunteers = Array.from({ length: 5 }, (_, i) => ({
        id: `vol-${i + 1}`,
        name: `Volunteer ${i + 1}`,
        volunteer_code: `V${String(i + 1).padStart(3, '0')}`
    }));

    // Generate sample ratings
    const ratings = [];
    models.forEach(model => {
        const numRatings = Math.floor(Math.random() * 50) + 10;
        for (let i = 0; i < numRatings; i++) {
            ratings.push({
                id: `rating-${model.id}-${i}`,
                model_id: model.id,
                device_fingerprint: `device-${Math.floor(Math.random() * 1000)}`,
                rater_type: Math.random() > 0.2 ? 'visitor' : 'evaluator',
                design_craftsmanship: Math.floor(Math.random() * 2) + 4,
                historical_accuracy: Math.floor(Math.random() * 2) + 4,
                volunteer_explanation: Math.floor(Math.random() * 2) + 3,
                educational_value: Math.floor(Math.random() * 2) + 4,
                overall_experience: Math.floor(Math.random() * 2) + 4,
                rating_time: new Date(Date.now() - Math.random() * 86400000 * 4).toISOString(),
                language_used: ['en', 'ur', 'kn'][Math.floor(Math.random() * 3)]
            });
        }
    });

    supabase.from('models').select().then(({ data }) => {
        if (!data || data.length === 0) {
            models.forEach(m => supabase.from('models').insert(m).select());
            volunteers.forEach(v => supabase.from('volunteers').insert(v).select());
            ratings.forEach(r => supabase.from('ratings').insert(r).select());
        }
    });
};

// Device Fingerprinting
const generateDeviceFingerprint = async () => {
    const components = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        // eslint-disable-next-line no-restricted-globals
        colorDepth: screen.colorDepth,
        // eslint-disable-next-line no-restricted-globals
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    const hash = btoa(JSON.stringify(components));
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
        deviceId = `${Date.now()}-${Math.random().toString(36)}`;
        localStorage.setItem('device_id', deviceId);
    }

    return `${hash}_${deviceId}`;
};

// Star Rating Component
const StarRating = ({ rating, onRate, readonly = false }) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onRate(star)}
                    onMouseEnter={() => !readonly && setHover(star)}
                    onMouseLeave={() => !readonly && setHover(0)}
                    className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-transform hover:scale-110`}
                >
                    <Star
                        size={readonly ? 16 : 24}
                        fill={(hover || rating) >= star ? '#fbbf24' : 'none'}
                        stroke={(hover || rating) >= star ? '#fbbf24' : '#d1d5db'}
                        strokeWidth={2}
                    />
                </button>
            ))}
        </div>
    );
};

// Rating Form Component
const RatingForm = ({ modelNumber, onSuccess }) => {
    const [model, setModel] = useState(null);
    const [alreadyRated, setAlreadyRated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [language, setLanguage] = useState('en');
    const [ratings, setRatings] = useState({
        design_craftsmanship: 0,
        historical_accuracy: 0,
        volunteer_explanation: 0,
        educational_value: 0,
        overall_experience: 0
    });
    const [comments, setComments] = useState('');

    const translations = {
        en: {
            title: 'Rate This Model',
            design: 'Design & Craftsmanship',
            accuracy: 'Historical Accuracy',
            explanation: 'Volunteer Explanation',
            education: 'Educational Value',
            overall: 'Overall Experience',
            comments: 'Comments (Optional)',
            submit: 'Submit Rating',
            thanks: 'Thank you for rating!',
            alreadyRated: 'You have already rated this model',
            required: 'Please rate all categories',
            success: 'Your rating has been submitted successfully!'
        },
        ur: {
            title: 'اس ماڈل کی درجہ بندی کریں',
            design: 'ماڈل ڈیزائن اور کاریگری',
            accuracy: 'تاریخی درستگی',
            explanation: 'رضاکار کی وضاحت',
            education: 'تعلیمی قدر',
            overall: 'مجموعی تجربہ',
            comments: 'تبصرے (اختیاری)',
            submit: 'جمع کریں',
            thanks: 'شکریہ',
            alreadyRated: 'آپ پہلے ہی درجہ بندی کر چکے ہیں',
            required: 'براہ کرم تمام زمرے کی درجہ بندی کریں',
            success: 'آپ کی درجہ بندی کامیابی سے جمع ہوگئی!'
        },
        kn: {
            title: 'ಈ ಮಾದರಿಗೆ ರೇಟ್ ಮಾಡಿ',
            design: 'ವಿನ್ಯಾಸ ಮತ್ತು ಕರಕುಶಲತೆ',
            accuracy: 'ಐತಿಹಾಸಿಕ ನಿಖರತೆ',
            explanation: 'ಸ್ವಯಂಸೇವಕ ವಿವರಣೆ',
            education: 'ಶೈಕ್ಷಣಿಕ ಮೌಲ್ಯ',
            overall: 'ಒಟ್ಟಾರೆ ಅನುಭವ',
            comments: 'ಕಾಮೆಂಟ್ಗಳು (ಐಚ್ಛಿಕ)',
            submit: 'ಸಲ್ಲಿಸಿ',
            thanks: 'ಧನ್ಯವಾದ',
            alreadyRated: 'ನೀವು ಈಗಾಗಲೇ ರೇಟ್ ಮಾಡಿದ್ದೀರಿ',
            required: 'ದಯವಿಟ್ಟು ಎಲ್ಲಾ ವರ್ಗಗಳಿಗೆ ರೇಟ್ ಮಾಡಿ',
            success: 'ನಿಮ್ಮ ರೇಟಿಂಗ್ ಯಶಸ್ವಿಯಾಗಿ ಸಲ್ಲಿಸಲಾಗಿದೆ!'
        }
    };

    const t = translations[language];

    useEffect(() => {
        initSampleData();
        loadModel();
    }, [modelNumber]);

    const loadModel = async () => {
        setLoading(true);
        const { data: models } = await supabase.from('models').select();
        const foundModel = models?.find(m => m.model_number === parseInt(modelNumber));

        if (foundModel) {
            setModel(foundModel);
            await checkIfAlreadyRated(foundModel.id);
        }
        setLoading(false);
    };

    const checkIfAlreadyRated = async (modelId) => {
        const fingerprint = await generateDeviceFingerprint();
        const { data } = await supabase
            .from('ratings')
            .select()
            .eq('model_id', modelId)
            .eq('device_fingerprint', fingerprint)
            .single();

        setAlreadyRated(!!data);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (Object.values(ratings).some(r => r === 0)) {
            alert(t.required);
            return;
        }

        setSubmitting(true);
        const fingerprint = await generateDeviceFingerprint();

        const ratingData = {
            model_id: model.id,
            device_fingerprint: fingerprint,
            rater_type: 'visitor',
            ...ratings,
            comments: comments || null,
            language_used: language,
            rating_time: new Date().toISOString()
        };

        await supabase.from('ratings').insert(ratingData).select();

        setSubmitting(false);
        setAlreadyRated(true);
        if (onSuccess) onSuccess();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
                    <h2 className="text-xl font-bold text-gray-800">Model Not Found</h2>
                </div>
            </div>
        );
    }

    if (alreadyRated) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
                <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{t.thanks}</h2>
                    <p className="text-gray-600 mb-4">{t.alreadyRated}</p>
                    <button
                        onClick={() => window.location.href = '#dashboard'}
                        className="bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition"
                    >
                        View Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 p-4">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Header */}
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

                {/* Rating Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {[
                            { key: 'design_craftsmanship', label: t.design },
                            { key: 'historical_accuracy', label: t.accuracy },
                            { key: 'volunteer_explanation', label: t.explanation },
                            { key: 'educational_value', label: t.education },
                            { key: 'overall_experience', label: t.overall }
                        ].map(({ key, label }) => (
                            <div key={key} className="border-b border-gray-200 pb-4">
                                <label className="block text-gray-700 font-medium mb-2">{label}</label>
                                <StarRating
                                    rating={ratings[key]}
                                    onRate={(star) => setRatings({ ...ratings, [key]: star })}
                                />
                            </div>
                        ))}

                        <div>
                            <label className="block text-gray-700 font-medium mb-2">{t.comments}</label>
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

// Dashboard Component
const Dashboard = () => {
    const [rankings, setRankings] = useState([]);
    const [stats, setStats] = useState({ totalRatings: 0, avgScore: 0, uniqueVisitors: 0 });
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('rankings');

    useEffect(() => {
        initSampleData();
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        const { data: models } = await supabase.from('models').select();
        const { data: allRatings } = await supabase.from('ratings').select();

        if (!models || !allRatings) return;

        // Calculate rankings
        const modelRankings = models.map(model => {
            const modelRatings = allRatings.filter(r => r.model_id === model.id);
            const count = modelRatings.length;

            if (count === 0) {
                return {
                    ...model,
                    totalRatings: 0,
                    avgDesign: 0,
                    avgAccuracy: 0,
                    avgExplanation: 0,
                    avgEducation: 0,
                    avgOverall: 0,
                    compositeScore: 0
                };
            }

            const avgDesign = modelRatings.reduce((s, r) => s + r.design_craftsmanship, 0) / count;
            const avgAccuracy = modelRatings.reduce((s, r) => s + r.historical_accuracy, 0) / count;
            const avgExplanation = modelRatings.reduce((s, r) => s + r.volunteer_explanation, 0) / count;
            const avgEducation = modelRatings.reduce((s, r) => s + r.educational_value, 0) / count;
            const avgOverall = modelRatings.reduce((s, r) => s + r.overall_experience, 0) / count;
            const compositeScore = (avgDesign + avgAccuracy + avgExplanation + avgEducation + avgOverall) / 5;

            return {
                ...model,
                totalRatings: count,
                avgDesign: avgDesign.toFixed(2),
                avgAccuracy: avgAccuracy.toFixed(2),
                avgExplanation: avgExplanation.toFixed(2),
                avgEducation: avgEducation.toFixed(2),
                avgOverall: avgOverall.toFixed(2),
                compositeScore: compositeScore.toFixed(2)
            };
        }).sort((a, b) => b.compositeScore - a.compositeScore);

        setRankings(modelRankings);

        // Calculate stats
        const uniqueDevices = new Set(allRatings.map(r => r.device_fingerprint)).size;
        const totalScore = allRatings.reduce((s, r) =>
            s + (r.design_craftsmanship + r.historical_accuracy + r.volunteer_explanation +
                r.educational_value + r.overall_experience) / 5, 0
        );

        setStats({
            totalRatings: allRatings.length,
            avgScore: allRatings.length > 0 ? (totalScore / allRatings.length).toFixed(2) : 0,
            uniqueVisitors: uniqueDevices
        });

        // Generate trend data (hourly)
        const hourlyData = {};
        allRatings.forEach(r => {
            const hour = new Date(r.rating_time).getHours();
            if (!hourlyData[hour]) hourlyData[hour] = { hour, count: 0 };
            hourlyData[hour].count++;
        });

        setTrends(Object.values(hourlyData).sort((a, b) => a.hour - b.hour));
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold mb-2">Exhibition Live Dashboard</h1>
                    <p className="text-emerald-100">Real-time Model Rankings & Analytics</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Ratings</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.totalRatings}</p>
                            </div>
                            <Star className="text-emerald-600" size={40} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Unique Visitors</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.uniqueVisitors}</p>
                            </div>
                            <Users className="text-blue-600" size={40} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                                <p className="text-3xl font-bold text-gray-800">{stats.avgScore}</p>
                            </div>
                            <Award className="text-yellow-600" size={40} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Models Rated</p>
                                <p className="text-3xl font-bold text-gray-800">{rankings.filter(r => r.totalRatings > 0).length}</p>
                            </div>
                            <TrendingUp className="text-purple-600" size={40} />
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow mb-6">
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-8 px-6">
                            {['rankings', 'trends', 'categories'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                                        activeTab === tab
                                            ? 'border-emerald-600 text-emerald-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        {activeTab === 'rankings' && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Top Models</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ratings</th>
                                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Score</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categories</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {rankings.slice(0, 10).map((model, idx) => (
                                            <tr key={model.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                                idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                                    idx === 1 ? 'bg-gray-300 text-gray-700' :
                                        idx === 2 ? 'bg-orange-300 text-orange-900' :
                                            'bg-gray-100 text-gray-600'
                            }`}>
                              {idx + 1}
                            </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">Model #{model.model_number}</div>
                                                    <div className="text-sm text-gray-500">{model.name_en}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-600">{model.location}</td>
                                                <td className="px-4 py-3 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {model.totalRatings}
                            </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center">
                                                        <Star size={16} fill="#fbbf24" stroke="#fbbf24" className="mr-1" />
                                                        <span className="font-bold text-lg">{model.compositeScore}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2 text-xs">
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 bg-purple-500 rounded-full mr-1"></div>
                                                            {model.avgDesign}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                                                            {model.avgAccuracy}
                                                        </div>
                                                        <div className="flex items-center">
                                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                                                            {model.avgExplanation}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === 'trends' && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Hourly Rating Trends</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={trends}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="hour" label={{ value: 'Hour', position: 'insideBottom', offset: -5 }} />
                                        <YAxis label={{ value: 'Ratings', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} name="Ratings per Hour" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        {activeTab === 'categories' && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Category Leaders</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { key: 'avgDesign', label: 'Best Design & Craftsmanship', color: 'purple' },
                                        { key: 'avgAccuracy', label: 'Best Historical Accuracy', color: 'blue' },
                                        { key: 'avgExplanation', label: 'Best Volunteer Explanation', color: 'green' },
                                        { key: 'avgEducation', label: 'Best Educational Value', color: 'orange' }
                                    ].map(({ key, label, color }) => {
                                        const topModels = [...rankings]
                                            .filter(r => r.totalRatings > 0)
                                            .sort((a, b) => parseFloat(b[key]) - parseFloat(a[key]))
                                            .slice(0, 5);

                                        return (
                                            <div key={key} className="border rounded-lg p-4">
                                                <h4 className={`font-semibold mb-3 text-${color}-600`}>{label}</h4>
                                                <div className="space-y-2">
                                                    {topModels.map((model, idx) => (
                                                        <div key={model.id} className="flex items-center justify-between">
                                                            <div className="flex items-center">
                                                                <span className="text-sm font-medium text-gray-500 w-6">{idx + 1}.</span>
                                                                <span className="text-sm text-gray-700">Model #{model.model_number}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <StarRating rating={Math.round(parseFloat(model[key]))} readonly />
                                                                <span className="ml-2 text-sm font-semibold">{model[key]}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Admin Panel Component
const AdminPanel = () => {
    const [activeSection, setActiveSection] = useState('models');
    const [models, setModels] = useState([]);
    const [volunteers, setVolunteers] = useState([]);
    const [newModel, setNewModel] = useState({
        model_number: '',
        name_en: '',
        name_ur: '',
        name_kn: '',
        description_en: '',
        location: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const { data: modelsData } = await supabase.from('models').select();
        const { data: volunteersData } = await supabase.from('volunteers').select();
        setModels(modelsData || []);
        setVolunteers(volunteersData || []);
    };

    const handleAddModel = async (e) => {
        e.preventDefault();
        await supabase.from('models').insert(newModel).select();
        setNewModel({
            model_number: '',
            name_en: '',
            name_ur: '',
            name_kn: '',
            description_en: '',
            location: ''
        });
        loadData();
    };

    const generateQRCodes = () => {
        const baseURL = window.location.origin;
        models.forEach(model => {
            const url = `${baseURL}#rate?model=${model.model_number}`;
            console.log(`Model ${model.model_number}: ${url}`);
        });
        alert(`QR codes generated! Check console for URLs. Use qrcode.js or an online QR generator to create actual QR code images.`);
    };

    const exportData = async () => {
        const { data: ratingsData } = await supabase.from('ratings').select();
        const csv = [
            ['Model ID', 'Device', 'Design', 'Accuracy', 'Explanation', 'Education', 'Overall', 'Comments', 'Time'].join(','),
            ...ratingsData.map(r => [
                r.model_id,
                r.device_fingerprint.slice(0, 20),
                r.design_craftsmanship,
                r.historical_accuracy,
                r.volunteer_explanation,
                r.educational_value,
                r.overall_experience,
                r.comments || '',
                r.rating_time
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ratings_export.csv';
        a.click();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
                    <p className="text-indigo-100">Manage Exhibition Data</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <div className="flex space-x-8 px-6">
                            {['models', 'volunteers', 'qr-codes', 'export'].map(section => (
                                <button
                                    key={section}
                                    onClick={() => setActiveSection(section)}
                                    className={`py-4 px-2 border-b-2 font-medium text-sm transition ${
                                        activeSection === section
                                            ? 'border-indigo-600 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    {section.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6">
                        {activeSection === 'models' && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Add New Model</h3>
                                <form onSubmit={handleAddModel} className="space-y-4 mb-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="number"
                                            placeholder="Model Number (1-100)"
                                            value={newModel.model_number}
                                            onChange={(e) => setNewModel({...newModel, model_number: parseInt(e.target.value)})}
                                            className="border rounded px-3 py-2"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Location (e.g., Hall A, Stall 1)"
                                            value={newModel.location}
                                            onChange={(e) => setNewModel({...newModel, location: e.target.value})}
                                            className="border rounded px-3 py-2"
                                            required
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Name (English)"
                                        value={newModel.name_en}
                                        onChange={(e) => setNewModel({...newModel, name_en: e.target.value})}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Name (Urdu)"
                                        value={newModel.name_ur}
                                        onChange={(e) => setNewModel({...newModel, name_ur: e.target.value})}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Name (Kannada)"
                                        value={newModel.name_kn}
                                        onChange={(e) => setNewModel({...newModel, name_kn: e.target.value})}
                                        className="w-full border rounded px-3 py-2"
                                    />
                                    <textarea
                                        placeholder="Description (English)"
                                        value={newModel.description_en}
                                        onChange={(e) => setNewModel({...newModel, description_en: e.target.value})}
                                        className="w-full border rounded px-3 py-2"
                                        rows="3"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 transition"
                                    >
                                        Add Model
                                    </button>
                                </form>

                                <h3 className="text-xl font-bold mb-4">Existing Models ({models.length})</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Location</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                        {models.map(model => (
                                            <tr key={model.id}>
                                                <td className="px-4 py-3 text-sm">{model.model_number}</td>
                                                <td className="px-4 py-3 text-sm">{model.name_en}</td>
                                                <td className="px-4 py-3 text-sm">{model.location}</td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeSection === 'volunteers' && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Volunteers ({volunteers.length})</h3>
                                <div className="space-y-2">
                                    {volunteers.map(v => (
                                        <div key={v.id} className="border rounded p-3">
                                            <span className="font-semibold">{v.name}</span> - {v.volunteer_code}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'qr-codes' && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Generate QR Codes</h3>
                                <p className="text-gray-600 mb-4">
                                    Generate QR codes for all models. Each QR code will link to the rating form for that specific model.
                                </p>
                                <button
                                    onClick={generateQRCodes}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded hover:bg-indigo-700 transition"
                                >
                                    Generate All QR Codes
                                </button>
                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> This will output URLs to the console. Use an online QR code generator
                                        (like qr-code-generator.com) or install the qrcode library to generate actual images.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeSection === 'export' && (
                            <div>
                                <h3 className="text-xl font-bold mb-4">Export Data</h3>
                                <p className="text-gray-600 mb-4">
                                    Download all ratings data as CSV for further analysis in Excel or other tools.
                                </p>
                                <button
                                    onClick={exportData}
                                    className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
                                >
                                    Export Ratings to CSV
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main App Component with Router
const App = () => {
    const [currentView, setCurrentView] = useState('home');
    const [modelNumber, setModelNumber] = useState(null);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.slice(1);
            const [view, params] = hash.split('?');

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

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    if (currentView === 'rate' && modelNumber) {
        return <RatingForm modelNumber={modelNumber} onSuccess={() => window.location.hash = 'dashboard'} />;
    }

    if (currentView === 'dashboard') {
        return <Dashboard />;
    }

    if (currentView === 'admin') {
        return <AdminPanel />;
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
                        href="#rate?model=1"
                        className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
                    >
                        <Star className="text-emerald-600 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Rate Models</h2>
                        <p className="text-gray-600">Share your experience and rate the exhibition models</p>
                    </a>

                    <a
                        href="#dashboard"
                        className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
                    >
                        <TrendingUp className="text-blue-600 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Live Dashboard</h2>
                        <p className="text-gray-600">View real-time rankings and statistics</p>
                    </a>

                    <a
                        href="#admin"
                        className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition transform hover:-translate-y-1"
                    >
                        <Menu className="text-purple-600 mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Panel</h2>
                        <p className="text-gray-600">Manage models, volunteers, and export data</p>
                    </a>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4">About the Exhibition</h3>
                    <p className="text-gray-600 mb-4">
                        Experience the life and times of Prophet Muhammad (peace be upon him) through meticulously
                        crafted 3D models depicting historical places and structures from 7th century Arabia.
                    </p>
                    <p className="text-gray-600 mb-4">
                        Each model is accompanied by knowledgeable volunteers who share the historical significance
                        and Islamic context of these sacred sites.
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
                            <div className="text-3xl font-bold text-orange-600">20K</div>
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