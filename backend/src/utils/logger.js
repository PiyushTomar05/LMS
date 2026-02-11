const SystemLog = require('../models/SystemLog');

/**
 * Logs a system action to the database.
 * @param {string} action - The action type (e.g., 'LOGIN', 'IMPORT')
 * @param {Object} actor - The user performing the action { id, email, role, ip }
 * @param {string} target - Description of what was acted upon
 * @param {Object} details - Additional metadata
 * @param {string} status - 'SUCCESS', 'FAILURE', or 'WARNING'
 */
const logAction = async (action, actor, target, details = {}, status = 'SUCCESS') => {
    try {
        await SystemLog.create({
            action,
            actor: {
                id: actor?.id || actor?._id,
                email: actor?.email || 'SYSTEM',
                role: actor?.role || 'SYSTEM',
                ip: actor?.ip || '0.0.0.0'
            },
            target,
            details,
            status
        });
    } catch (error) {
        console.error('Failed to write audit log:', error.message);
        // Do not throw; logging failure should not break the main flow
    }
};

module.exports = { logAction };
