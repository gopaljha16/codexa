const redisClient = require('../config/redis');

const clearHeatmapCache = async (req, res, next) => {
    try {
        const userId = req.result._id;
        const cacheKey = `heatmap_${userId}`;
        
        console.log(`Clearing heatmap cache for user: ${userId}`);
        await redisClient.del(cacheKey);
        console.log(`Cache cleared for key: ${cacheKey}`);
        
        next();
    } catch (error) {
        console.error('Error clearing heatmap cache:', error);
        next(error);
    }
};

module.exports = {
    clearHeatmapCache,
};
