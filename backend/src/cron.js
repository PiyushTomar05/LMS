const cron = require('node-cron');
const University = require('./models/University');

const startCronJobs = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Running subscription check...');
        try {
            const today = new Date();
            const result = await University.updateMany(
                {
                    subscriptionEndDate: { $lt: today },
                    subscriptionStatus: { $ne: 'INACTIVE' } // Only update if not already inactive
                },
                {
                    $set: { subscriptionStatus: 'INACTIVE' }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`Deactivated ${result.modifiedCount} expired universities.`);
            } else {
                console.log('No expired universities found.');
            }
        } catch (error) {
            console.error('Error running subscription check:', error);
        }
    });

    console.log('Cron jobs started: Subscription Check scheduled for midnight.');
};

module.exports = startCronJobs;
