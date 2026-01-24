import React from 'react';
import { motion } from 'framer-motion';
import { FiAward } from 'react-icons/fi';

const GlobalLeaderboard = ({ leaderboard }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800 p-6 rounded-2xl shadow-lg"
        >
            <h2 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
                <FiAward className="mr-2" />
                Global Leaderboard
            </h2>
            <ul className="space-y-4">
                {leaderboard.map((user, index) => (
                    <li key={user._id} className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-lg font-bold text-gray-400 mr-4">{index + 1}</span>
                            <img
                                src={user.profileImage}
                                alt={user.firstName}
                                className="w-10 h-10 rounded-full mr-4"
                            />
                            <div>
                                <p className="font-semibold text-white">{user.firstName}</p>
                                <p className="text-sm text-gray-400">{user.problemsSolved} problems solved</p>
                            </div>
                        </div>
                        <span className="text-lg font-bold text-orange-400">{user.rank}</span>
                    </li>
                ))}
            </ul>
        </motion.div>
    );
};

export default GlobalLeaderboard;
