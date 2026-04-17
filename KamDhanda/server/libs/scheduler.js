// server/libs/scheduler.js
// Note: This script uses node-cron (npm install node-cron)
// For simplicity in this demo, let's assume we trigger it regularly

const cron = require('node-cron');
const Interview = require('../models/interview_model');
const Notification = require('../models/notification_model');

const startRemindersTask = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date();
            const oneDayLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
            const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

            // Find interviews scheduled in next 24 hours OR 1 hour
            const pendingInterviews = await Interview.find({
                status: 'Scheduled',
                date: { $gte: now, $lte: oneDayLater }
            }).populate('jobId', 'title');

            for (const interview of pendingInterviews) {
                const diffMs = new Date(interview.date).getTime() - now.getTime();
                const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

                if (diffHours === 24 || diffHours === 1) {
                    const msg = `Reminder: Your interview for ${interview.jobId.title} is in ${diffHours} hour(s)!`;
                    
                    // Notify seeker
                    await Notification.create({
                        recipient_id: interview.seekerId,
                        sender_id: interview.clientId,
                        message: msg,
                        type: 'system'
                    });

                    // Notify client
                    await Notification.create({
                        recipient_id: interview.clientId,
                        sender_id: interview.seekerId,
                        message: msg,
                        type: 'system'
                    });
                }
            }
        } catch (err) {
            console.error("Scheduler Error:", err);
        }
    });
};

module.exports = { startRemindersTask };
