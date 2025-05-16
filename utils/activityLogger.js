const ActivityLog = require('../models/ActivityLog');

const logActivity = async (type, action, details, userId = null, ipAddress = null) => {
    try {
        const activityLog = new ActivityLog({
            type,
            action,
            details,
            userId,
            ipAddress
        });
        
        await activityLog.save();
        return activityLog;
    } catch (error) {
        console.error('Error logging activity:', error);
    }
};

module.exports = {
    logActivity
};