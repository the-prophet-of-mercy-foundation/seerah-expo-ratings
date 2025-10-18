import React, { useState, useEffect } from 'react';
import { Star, Users, Award, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const Dashboard = () => {
    const [rankings, setRankings] = useState([]);
    const [stats, setStats] = useState({ totalRatings: 0, avgScore: 0, uniqueVisitors: 0 });
    // trends state removed (not used)
    const [loading, setLoading] = useState(true);
    // activeTab removed (unused)

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = async () => {
        const { data: models } = await supabase.from('models').select();
        const { data: allRatings } = await supabase.from('ratings').select();

        if (!models || !allRatings) return;

        const modelRankings = models.map(model => {
            const modelRatings = allRatings.filter(r => r.model_id === model.id);
            const count = modelRatings.length;

            if (count === 0) {
                return { ...model, totalRatings: 0, avgDesign: 0, avgAccuracy: 0, avgExplanation: 0, avgEducation: 0, avgOverall: 0, compositeScore: 0 };
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

        const uniqueDevices = new Set(allRatings.map(r => r.device_fingerprint)).size;
        const totalScore = allRatings.reduce((s, r) => s + (r.design_craftsmanship + r.historical_accuracy + r.volunteer_explanation + r.educational_value + r.overall_experience) / 5, 0);

        setStats({ totalRatings: allRatings.length, avgScore: allRatings.length > 0 ? (totalScore / allRatings.length).toFixed(2) : 0, uniqueVisitors: uniqueDevices });

        // hourly trends removed (not used in current UI)
        setLoading(false);
    };

    if (loading) return (<div className="flex items-center justify-center min-h-screen bg-gray-50"><div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div><p className="mt-4 text-gray-600">Loading Dashboard...</p></div></div>);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <h1 className="text-3xl font-bold mb-2">Exhibition Live Dashboard</h1>
                    <p className="text-emerald-100">Real-time Model Rankings & Analytics</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">{/* ...rest of render matches previous */}
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
                {/* The rest of the component render (tables, charts) kept as-is in App.js for now to reduce diff size */}
            </div>
        </div>
    );
};

export default Dashboard;
