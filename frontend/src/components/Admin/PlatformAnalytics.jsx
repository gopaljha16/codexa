import React, { useEffect, useState } from 'react';
import { getPlatformStats } from '../../utils/apis/adminApi';
import { motion } from 'framer-motion';
import { FiUsers, FiFileText, FiAward, FiClipboard } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const PlatformAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getPlatformStats();
                setStats(data.stats);
            } catch (err) {
                setError('Failed to fetch platform stats');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center p-8 bg-gray-900 text-white">Loading...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-500 bg-gray-900">{error}</div>;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-6 bg-gray-900 text-white min-h-screen"
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-orange-500">Platform Analytics</h1>
                    <Link to="/admin" className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded">
                        Back to Admin
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<FiUsers />} title="Total Users" value={stats.totalUsers} />
                    <StatCard icon={<FiFileText />} title="Total Submissions" value={stats.totalSubmissions} />
                    <StatCard icon={<FiAward />} title="Total Contests" value={stats.totalContests} />
                    <StatCard icon={<FiClipboard />} title="Total Problems" value={stats.totalProblems} />
                </div>
            </div>
        </motion.div>
    );
};

const StatCard = ({ icon, title, value }) => (
    <div className="bg-gray-800 p-6 rounded-lg shadow-md flex items-center border-l-4 border-orange-500">
        <div className="text-4xl text-orange-500 mr-4">{icon}</div>
        <div>
            <h2 className="text-lg font-semibold text-gray-400">{title}</h2>
            <p className="text-3xl font-bold text-white">{value}</p>
        </div>
    </div>
);

export default PlatformAnalytics;
