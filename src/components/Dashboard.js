import React, { useState, useEffect, useRef, Children } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  Treemap,
  LabelList,
  ComposedChart,
} from 'recharts';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    totalReviewers: 0,
    averageRating: 0,
    trending1hr: { model: '', score: 0 },
    trending4hr: { model: '', score: 0 },
    trendingToday: { model: '', score: 0 },
    trendingOverall: { model: '', score: 0 },
    lastUpdated: null,
  });

  const [chartsData, setChartsData] = useState({
    treemap: [],
    topModels: [],
    ratingSum: [],
    hourlyReviewers: [],
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const carouselIntervalRef = useRef();

  const slides = [
    { id: 1, title: 'Hall Heat Map', type: 'treemap' },
    { id: 2, title: 'Top 10 Highly Rated Models', type: 'bayesian' },
    { id: 3, title: 'Top 10 Highly Visited Models', type: 'ratingSum' },
    { id: 4, title: 'Hourly Reviewers Count', type: 'hourly' },
  ];

  // Distinct gradient colors for first row tiles
  const tileGradients = [
    'bg-gradient-to-br from-blue-400 to-purple-600', // Total Reviewers
    'bg-gradient-to-br from-green-400 to-teal-600', // Average Rating
    'bg-gradient-to-br from-red-400 to-pink-600', // Trending 1hr
    'bg-gradient-to-br from-purple-400 to-indigo-600', // Trending 4hr
    'bg-gradient-to-br from-orange-400 to-red-500', // Trending Today
  ];

  // Gradient colors for charts

  const oceanTheme = [
    { id: 'ocean1', colors: ['#1a2980', '#26d0ce'] },
    { id: 'ocean2', colors: ['#2b5876', '#4e4376'] },
    { id: 'ocean3', colors: ['#0f3443', '#34e89e'] },
    { id: 'ocean4', colors: ['#2193b0', '#6dd5ed'] },
    { id: 'ocean5', colors: ['#00416a', '#e4e5e6'] },
    { id: 'ocean6', colors: ['#0052d4', '#4364f7', '#6fb1fc'] },
    { id: 'ocean7', colors: ['#1d2b64', '#f8cdda'] },
    { id: 'ocean8', colors: ['#4ca1af', '#2c3e50'] },
  ];

  const forestTheme = [
    { id: 'forest1', colors: ['#134e5e', '#71b280'] },
    { id: 'forest2', colors: ['#3a7bd5', '#00d2ff'] },
    { id: 'forest3', colors: ['#56ab2f', '#a8e6cf'] },
    { id: 'forest4', colors: ['#2e8b57', '#87ceeb'] },
    { id: 'forest5', colors: ['#1d976c', '#93f9b9'] },
    { id: 'forest6', colors: ['#283c86', '#45a247'] },
    { id: 'forest7', colors: ['#4da0ff', '#d39d38'] },
    { id: 'forest8', colors: ['#348f50', '#56b4d3'] },
  ];

  const mixedTheme = [
    { id: 'mixed1', colors: ['#1a2980', '#26d0ce'] },
    { id: 'mixed2', colors: ['#ff7e5f', '#feb47b'] },
    { id: 'mixed3', colors: ['#134e5e', '#71b280'] },
    { id: 'mixed4', colors: ['#8e2de2', '#4a00e0'] },
    { id: 'mixed5', colors: ['#a1c4fd', '#c2e9fb'] },
    { id: 'mixed6', colors: ['#4776e6', '#8e54e9'] },
    { id: 'mixed7', colors: ['#ff6a00', '#ee0979'] },
    { id: 'mixed8', colors: ['#56ab2f', '#a8e6cf'] },
  ];

  // Fixed Green to Blue gradient colors for treemap
  const G2BColors1 = [
    '#002f00ff', // Darkest green
    '#0e480eff', // Dark green
    '#006a00ff', // Green
    '#3f763fff', // Forest green
    '#058247ff', // Lime green
    '#068753ff', // Lawn green
    '#568f00ff', // Green yellow
    '#7f8600ff', // Yellow green
    '#00ced1', // Dark turquoise
    '#20b2aa', // Light sea green
    '#40e0d0', // Turquoise
    '#00ffff', // Aqua/Cyan
    '#87ceeb', // Sky blue
    '#87cefa', // Light sky blue
    '#b0e0e6', // Powder blue
  ];

  const G2BColors2 = [
    '#004d26',
    '#005233',
    '#005740',
    '#005c4d',
    '#006159',
    '#006666',
    '#006c73',
    '#007280',
    '#00778c',
    '#007d99',
    '#0083a6',
    '#0088b3',
    '#008ebf',
    '#0094cc',
    '#0099d9',
    '#009fe6',
    '#00a6e6',
    '#00ace0',
    '#00b3d9',
    '#00b8cc',
  ];

  const G2BColors3 = [
    '#003300',
    '#0a3f00',
    '#144a00',
    '#1e5500',
    '#296000',
    '#336600',
    '#3f7300',
    '#4a8000',
    '#558c00',
    '#669900',
    '#4f9900',
    '#339966',
    '#268c73',
    '#1a807f',
    '#0d738c',
    '#006680',
    '#006673',
    '#005c66',
    '#005259',
    '#00474d',
  ];

  const G2BColors4 = [
    '#013220', // Deep forest green
    '#024d26', // Dark jade
    '#036b34', // Rich dark green
    '#047c3f', // Lush green
    '#056f3a', // Moss green
    '#0b6b2f', // Deep leaf green
    '#145a32', // Earthy dark green
    '#1a7431', // Olive dark
    '#256d1b', // Warm forest
    '#3b7a1f', // Muted green-yellow
    '#4e944f', // Green with yellow tint
    '#3a9b7a', // Blue-green mix
    '#2a7f62', // Deep teal green
    '#1b6f63', // Muted ocean green
    '#155e63', // Seaweed dark
    '#114e60', // Deep teal blue
    '#0f4c5c', // Dark cyan-blue
    '#0a3d62', // Deep ocean blue
    '#083358', // Midnight teal-blue
    '#062743', // Navy bluish green
  ];

  const chartGradients = mixedTheme;
  const greenToBlueColors = G2BColors4;

  useEffect(() => {
    loadDashboardData();
    startCarousel();

    // Set up auto-refresh every 2 minutes
    const dataInterval = setInterval(() => {
      loadDashboardData(false);
    }, 120000);

    return () => {
      clearInterval(carouselIntervalRef.current);
      clearInterval(dataInterval);
    };
  }, []);

  const startCarousel = () => {
    carouselIntervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);
  };

  const loadDashboardData = async (isInitialLoad = true) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const cachedData = localStorage.getItem('dashboardData');
      const cachedCharts = localStorage.getItem('chartsData');
      const cacheTime = localStorage.getItem('cacheTime');

      const now = Date.now();
      const twoMinutes = 2 * 60 * 1000;

      if (
        cachedData &&
        cachedCharts &&
        cacheTime &&
        now - parseInt(cacheTime) < twoMinutes
      ) {
        setDashboardData(JSON.parse(cachedData));
        setChartsData(JSON.parse(cachedCharts));

        if (isInitialLoad) {
          setLoading(false);
        } else {
          setRefreshing(false);
        }
        return;
      }

      await Promise.all([fetchMetrics(), fetchChartsData()]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);

      const cachedData = localStorage.getItem('dashboardData');
      const cachedCharts = localStorage.getItem('chartsData');

      if (cachedData && cachedCharts) {
        setDashboardData(JSON.parse(cachedData));
        setChartsData(JSON.parse(cachedCharts));
      }
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  const fetchMetrics = async () => {
    try {
      // Get total reviewers (count distinct users)
      const { data: reviewersData } = await supabase
        .from('ratings')
        .select('user_id');

      const uniqueReviewers = new Set(
        reviewersData?.map((item) => item.user_id) || [],
      );
      const totalReviewers = uniqueReviewers.size;

      // Get average rating
      const { data: avgData } = await supabase
        .from('ratings')
        .select('star_rating');

      const averageRating =
        avgData && avgData.length > 0
          ? (
              avgData.reduce((sum, item) => sum + item.star_rating, 0) /
              avgData.length
            ).toFixed(2)
          : 0;

      // Get trending data
      const { data: trendingData } = await supabase
        .from('trending_summary')
        .select('*')
        .eq('id', 1)
        .single();

      const newDashboardData = {
        totalReviewers,
        averageRating: parseFloat(averageRating),
        trending1hr: {
          model: trendingData?.last_1hr_trending_model || 'No data',
          score: trendingData?.last_1hr_score || 0,
        },
        trending4hr: {
          model: trendingData?.last_4hr_trending_model || 'No data',
          score: trendingData?.last_4hr_score || 0,
        },
        trendingToday: {
          model: trendingData?.today_trending_model || 'No data',
          score: trendingData?.today_score || 0,
        },
        trendingOverall: {
          model: trendingData?.overall_trending_model || 'No data',
          score: trendingData?.overall_score || 0,
        },
        lastUpdated: new Date().toLocaleString(),
      };

      setDashboardData(newDashboardData);
      localStorage.setItem('dashboardData', JSON.stringify(newDashboardData));
      localStorage.setItem('cacheTime', Date.now().toString());
    } catch (error) {
      console.error('Error fetching metrics:', error);
      throw error;
    }
  };

  const fetchChartsData = async () => {
    try {
      // Get data for Hall Heat Map - group by location and sum rating_count
      const { data: locationData } = await supabase
        .from('ratings_summary')
        .select('location, model_number, rating_count')
        .order('rating_count', { ascending: false });

      console.log('Location Data:', locationData);

      // Transform data for Hall Heat Map - group by location and sum rating_count
      const transformedTreemapData = transformHallHeatMapData(
        locationData || [],
      );

      // Get top models by Bayesian score
      const { data: topModelsData } = await supabase
        .from('ratings_summary')
        .select('model_number, bayesian_score, rating_count, rating_avg')
        .order('bayesian_score', { ascending: false })
        .limit(10);

      // Get most visited models (by rating_count)
      const { data: ratingSumData } = await supabase
        .from('ratings_summary')
        .select('model_number, rating_count, location')
        .order('rating_count', { ascending: false })
        .limit(10);

      // Get hourly reviewers (last 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: hourlyData } = await supabase
        .from('ratings')
        .select('created_at')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      const hourlyReviewers = processHourlyData(hourlyData || []);

      const newChartsData = {
        treemap: transformedTreemapData,
        topModels: topModelsData || [],
        ratingSum: ratingSumData || [],
        hourlyReviewers: hourlyReviewers,
      };

      setChartsData(newChartsData);
      localStorage.setItem('chartsData', JSON.stringify(newChartsData));
    } catch (error) {
      console.error('Error fetching charts data:', error);
      throw error;
    }
  };

  const transformHallHeatMapData = (data) => {
    if (!data || data.length === 0) {
      return [
        {
          name: 'No Data',
          children: [{ name: 'No Models', rating_count: 1 }],
        },
      ];
    }

    // Group by location
    const locationMap = {};

    data.forEach((item) => {
      if (!item.location) return;

      // Initialize location if it doesn't exist
      if (!locationMap[item.location]) {
        locationMap[item.location] = {
          name: item.location,
          rating_count: 0,
          children: [],
        };
      }

      locationMap[item.location].children.push({
        name: item.model_number,
        rating_count: item.rating_count || 0,
      });
    });

    // Convert to array and filter out locations with no children
    const locations = Object.values(locationMap)
      .filter((location) => location.children.length > 0)
      .sort((a, b) => {
        // Sort by total rating_count in descending order
        const totalA = a.children.reduce(
          (sum, child) => sum + child.rating_count,
          0,
        );
        const totalB = b.children.reduce(
          (sum, child) => sum + child.rating_count,
          0,
        );
        return totalB - totalA;
      });

    // If no valid data, return default structure
    if (locations.length === 0) {
      return [
        {
          name: 'Sample Data',
          children: [
            { name: 'Model 1', rating_count: 0 },
            { name: 'Model 2', rating_count: 0 },
          ],
        },
      ];
    }

    return locations;
  };

  const processHourlyData = (data) => {
    // Create hours array from 9AM to 11PM (9 to 23)
    const hours = Array.from({ length: 15 }, (_, i) => {
      const hour = i + 9; // Start from 9AM
      const hourStr = hour.toString().padStart(2, '0');
      return {
        hour: `${hourStr}:00`,
        count: 0,
        cumulative: 0,
      };
    });

    let cumulativeCount = 0;

    data.forEach((item) => {
      const hour = new Date(item.created_at).getHours();
      let targetHour = hour;

      // Anything before 9AM counts as 9AM, anything after 11PM counts as 11PM
      if (hour < 9) targetHour = 9;
      if (hour > 23) targetHour = 23;

      const index = targetHour - 9; // Convert to array index (9AM = 0, 10AM = 1, ..., 11PM = 14)
      if (index >= 0 && index < hours.length) {
        hours[index].count++;
      }
    });

    // Calculate cumulative count
    hours.forEach((hour) => {
      cumulativeCount += hour.count;
      hour.cumulative = cumulativeCount;
    });

    return hours;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    resetCarousel();
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    resetCarousel();
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    resetCarousel();
  };

  const resetCarousel = () => {
    clearInterval(carouselIntervalRef.current);
    startCarousel();
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="text-yellow-400 text-lg">
          ★
        </span>,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="text-yellow-400 text-lg">
          ★
        </span>,
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="text-gray-300 text-lg">
          ★
        </span>,
      );
    }

    return stars;
  };

  // Fixed Custom Treemap Content

  // Custom tooltip for treemap
  // Fixed Custom Treemap Content
  // Fixed Custom Treemap Content
  const CustomTreemapContent = (props) => {
    const { root, depth, x, y, width, height, index, name, rating_count } =
      props;

    // Calculate color index safely
    let colorIndex = 0;
    if (root && root.children && root.children.length > 0) {
      colorIndex = Math.floor(
        (index / root.children.length) * (greenToBlueColors.length - 1),
      );
    }

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill:
              depth < 2
                ? greenToBlueColors[colorIndex]
                : 'rgba(183, 174, 6, 0)',
            stroke: '#fff',
            strokeWidth: 1,
            strokeOpacity: 0.7,
          }}
        />
        {depth === 1 ? (
          <text
            x={x + width / 2}
            y={y + height / 2 + 7}
            textAnchor="middle"
            fill="#ecd5d5ff"
            fontSize={Math.min(18, width / 8)}
            fontWeight="normal"
          >
            {name}
          </text>
        ) : null}
      </g>
    );
  };
  // Custom tooltip for treemap
  const CustomTreemapTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p>Rating Count: {data.rating_count || data.value}</p>
          {data.depth === 0 && (
            <p>Total Models: {data.children ? data.children.length : 0}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for hourly chart
  const CustomHourlyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Reviewers */}
          <div
            className={`text-white rounded-2xl shadow-xl p-4 transform transition-all duration-500 hover:scale-105 ${tileGradients[0]}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-100">
                  Total Reviewers
                </p>
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                  {dashboardData.totalReviewers.toLocaleString()}
                </h3>
              </div>
              <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <span className="text-xl">👥</span>
              </div>
            </div>
          </div>

          {/* Average Rating */}
          <div
            className={`text-white rounded-2xl shadow-xl p-4 transform transition-all duration-500 hover:scale-105 ${tileGradients[1]}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-100">Avg Rating</p>
                <h3 className="text-2xl font-bold text-white drop-shadow-lg">
                  {dashboardData.averageRating}
                </h3>
              </div>
              <div className="p-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                <span className="text-xl">⭐</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex text-yellow-300 text-sm">
                {renderStars(dashboardData.averageRating)}
              </div>
            </div>
          </div>

          {/* Trending 1hr */}
          <div
            className={`text-white rounded-2xl shadow-xl p-4 transform transition-all duration-500 hover:scale-105 ${tileGradients[2]}`}
          >
            <div className="w-full">
              <p className="text-xs font-medium text-red-100">Trending (1hr)</p>
              <h3
                className="text-lg font-bold text-white truncate drop-shadow-lg"
                title={dashboardData.trending1hr.model}
              >
                {dashboardData.trending1hr.model}
              </h3>
              <div className="flex items-center mt-1">
                <div className="w-full bg-white bg-opacity-30 rounded-full h-1">
                  <div
                    className="bg-white h-1 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        dashboardData.trending1hr.score * 20,
                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-white ml-1 drop-shadow-lg">
                  {dashboardData.trending1hr.score.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Trending 4hr */}
          <div
            className={`text-white rounded-2xl shadow-xl p-4 transform transition-all duration-500 hover:scale-105 ${tileGradients[3]}`}
          >
            <div className="w-full">
              <p className="text-xs font-medium text-purple-100">
                Trending (4hr)
              </p>
              <h3
                className="text-lg font-bold text-white truncate drop-shadow-lg"
                title={dashboardData.trending4hr.model}
              >
                {dashboardData.trending4hr.model}
              </h3>
              <div className="flex items-center mt-1">
                <div className="w-full bg-white bg-opacity-30 rounded-full h-1">
                  <div
                    className="bg-white h-1 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        dashboardData.trending4hr.score * 20,
                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-white ml-1 drop-shadow-lg">
                  {dashboardData.trending4hr.score.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Trending Today */}
          <div
            className={`text-white rounded-2xl shadow-xl p-4 transform transition-all duration-500 hover:scale-105 ${tileGradients[4]}`}
          >
            <div className="w-full">
              <p className="text-xs font-medium text-orange-100">
                Trending (Today)
              </p>
              <h3
                className="text-lg font-bold text-white truncate drop-shadow-lg"
                title={dashboardData.trendingToday.model}
              >
                {dashboardData.trendingToday.model}
              </h3>
              <div className="flex items-center mt-1">
                <div className="w-full bg-white bg-opacity-30 rounded-full h-1">
                  <div
                    className="bg-white h-1 rounded-full transition-all duration-1000"
                    style={{
                      width: `${Math.min(
                        dashboardData.trendingToday.score * 20,
                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-white ml-1 drop-shadow-lg">
                  {dashboardData.trendingToday.score.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Charts */}
        <div className="flex-1 flex flex-col bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-4 mb-4 border border-gray-100">
          <div className="relative overflow-hidden" style={{ height: '30rem' }}>
            {/* Slide 1: Hall Heat Map */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                currentSlide === 0 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Hall Heat Map
              </h3>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <Treemap
                    data={chartsData.treemap}
                    dataKey="rating_count"
                    strokeWidth={2}
                    animationDuration={1500}
                    content={<CustomTreemapContent />}
                  >
                    <Tooltip content={<CustomTreemapTooltip />} />
                    {/* REMOVE THIS ENTIRE BLOCK:
        {chartsData.treemap.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={entry.color} />
        ))}
        */}
                  </Treemap>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Slide 2: Top 10 Highly Rated Models - Fixed YAxis range */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                currentSlide === 1 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Top 10 Highly Rated Models
              </h3>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartsData.topModels}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="model_number"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis domain={[2, 5]} />
                    <Tooltip
                      formatter={(value, name) => [
                        value.toFixed(2),
                        'Bayesian Score',
                      ]}
                      labelFormatter={(label) => `Model: ${label}`}
                    />
                    <Bar
                      dataKey="bayesian_score"
                      name="Bayesian Score"
                      animationDuration={1500}
                    >
                      {chartsData.topModels.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={mixedTheme[index % mixedTheme.length].colors[0]}
                        />
                      ))}
                      <LabelList
                        dataKey="bayesian_score"
                        position="top"
                        fontSize={12}
                        fill="#666"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Slide 3: Top 10 Highly Visited Models - Adjusted bottom margin */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                currentSlide === 2 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Top 10 Highly Visited Models
              </h3>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartsData.ratingSum}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="model_number"
                      angle={-45}
                      textAnchor="end"
                      height={60}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value, name) => [value, 'Visit Count']}
                      labelFormatter={(label) => `Model: ${label}`}
                    />
                    <Bar
                      dataKey="rating_count"
                      name="Visit Count"
                      animationDuration={1500}
                    >
                      {chartsData.ratingSum.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={oceanTheme[index % oceanTheme.length].colors[0]}
                        />
                      ))}
                      <LabelList
                        dataKey="rating_count"
                        position="top"
                        fontSize={12}
                        fill="#374151"
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Slide 4: Hourly Reviewers Count - Updated colors and time range */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                currentSlide === 3 ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Hourly Reviewers Count (9AM - 11PM)
              </h3>
              <div className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartsData.hourlyReviewers}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="hour" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomHourlyTooltip />} />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey="count"
                      name="Hourly Count"
                      fill="#FF6B6B" // Red color for bars
                      barSize={20}
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="cumulative"
                      name="Cumulative Count"
                      stroke="#4ECDC4" // Teal color for area
                      fill="#4ECDC4"
                      fillOpacity={0.6}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Carousel Indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-6 shadow-lg'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
