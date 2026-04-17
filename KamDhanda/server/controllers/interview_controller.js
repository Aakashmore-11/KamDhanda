const Interview = require('../models/interview_model');
const Application = require('../models/applications_model');
const Job = require('../models/jobs_model');
const Notification = require('../models/notification_model');
const { v4: uuidv4 } = require('uuid');

// Helper: Create in-app notification
const createNotification = async (userId, title, message, type = 'info') => {
    try {
        await Notification.create({ userId, title, message, type });
    } catch (e) {
        console.error('Notification error:', e.message);
    }
};

// ─── Schedule an Interview ────────────────────────────────────────────────────
const scheduleInterview = async (req, res) => {
    try {
        const {
            jobId, applicationId, seekerId,
            title, date, time, duration, timezone,
            notes, questions, recordingConsent
        } = req.body;
        const clientId = req.user._id;

        const job = await Job.findById(jobId);
        if (!job || job.employerId.toString() !== clientId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to job' });
        }

        const roomId = uuidv4();

        const interview = await Interview.create({
            jobId, applicationId, clientId, seekerId,
            title, date, time,
            duration: duration || 45,
            timezone: timezone || 'Asia/Kolkata',
            notes, questions: questions || [],
            recordingConsent: recordingConsent || false,
            roomId
        });

        // Update application status to "Interview"
        await Application.findByIdAndUpdate(applicationId, { status: 'Interview' });

        // Notify the seeker
        await createNotification(
            seekerId,
            '📅 Interview Scheduled!',
            `You have a virtual interview scheduled: "${title}" on ${new Date(date).toDateString()} at ${time}. Join from your dashboard.`,
            'interview'
        );

        const populatedInterview = await Interview.findById(interview._id)
            .populate('jobId', 'title')
            .populate('clientId', 'fullName email profilePic')
            .populate('seekerId', 'fullName email profilePic');

        res.status(201).json({ success: true, message: 'Interview scheduled successfully', interview: populatedInterview });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error scheduling interview', error: error.message });
    }
};

// ─── Get interviews for logged-in user ───────────────────────────────────────
const getMyInterviews = async (req, res) => {
    try {
        const userId = req.user._id;
        const role = req.user.role;

        const query = role === 'Seeker' ? { seekerId: userId } : { clientId: userId };

        const interviews = await Interview.find(query)
            .populate('jobId', 'title location budget')
            .populate('clientId', 'fullName profilePic email')
            .populate('seekerId', 'fullName profilePic email resume')
            .sort({ date: 1, time: 1 });

        res.status(200).json({ success: true, interviews });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching interviews', error: error.message });
    }
};

// ─── Get single interview by ID ───────────────────────────────────────────────
const getInterviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const interview = await Interview.findById(id)
            .populate('jobId', 'title location budget')
            .populate('clientId', 'fullName profilePic email')
            .populate('seekerId', 'fullName profilePic email resume');

        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

        const isParticipant =
            interview.clientId._id.toString() === userId.toString() ||
            interview.seekerId._id.toString() === userId.toString();

        if (!isParticipant) return res.status(403).json({ success: false, message: 'Unauthorized' });

        res.status(200).json({ success: true, interview });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching interview', error: error.message });
    }
};

// ─── Get interview by roomId ──────────────────────────────────────────────────
const getInterviewByRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.user._id;

        const interview = await Interview.findOne({ roomId })
            .populate('jobId', 'title')
            .populate('clientId', 'fullName profilePic email')
            .populate('seekerId', 'fullName profilePic email resume');

        if (!interview) return res.status(404).json({ success: false, message: 'Interview room not found' });

        const isParticipant =
            interview.clientId._id.toString() === userId.toString() ||
            interview.seekerId._id.toString() === userId.toString();

        if (!isParticipant) return res.status(403).json({ success: false, message: 'Access denied' });

        res.status(200).json({ success: true, interview });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error', error: error.message });
    }
};

// ─── Update interview status ──────────────────────────────────────────────────
const updateInterviewStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user._id;

        const interview = await Interview.findById(id);
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

        const isParticipant =
            interview.clientId.toString() === userId.toString() ||
            interview.seekerId.toString() === userId.toString();

        if (!isParticipant) return res.status(403).json({ success: false, message: 'Unauthorized' });

        interview.status = status;
        if (status === 'Live') interview.actualStartTime = new Date();
        if (status === 'Completed') interview.actualEndTime = new Date();
        await interview.save();

        res.status(200).json({ success: true, message: 'Interview status updated', interview });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating interview', error: error.message });
    }
};

// ─── Reschedule interview ─────────────────────────────────────────────────────
const rescheduleInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, time, reason } = req.body;
        const userId = req.user._id;

        const interview = await Interview.findById(id);
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

        if (interview.clientId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Only the client can reschedule' });
        }

        interview.rescheduleHistory.push({
            previousDate: interview.date,
            previousTime: interview.time,
            reason: reason || ''
        });

        interview.date = date;
        interview.time = time;
        interview.status = 'Rescheduled';
        await interview.save();

        await createNotification(
            interview.seekerId,
            '🔄 Interview Rescheduled',
            `Your interview "${interview.title}" has been rescheduled to ${new Date(date).toDateString()} at ${time}.`,
            'interview'
        );

        res.status(200).json({ success: true, message: 'Interview rescheduled', interview });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error rescheduling', error: error.message });
    }
};

// ─── Cancel interview ─────────────────────────────────────────────────────────
const cancelInterview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const interview = await Interview.findById(id);
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

        const isParticipant =
            interview.clientId.toString() === userId.toString() ||
            interview.seekerId.toString() === userId.toString();

        if (!isParticipant) return res.status(403).json({ success: false, message: 'Unauthorized' });

        interview.status = 'Cancelled';
        await interview.save();

        const notifyId = req.user.role === 'Client' ? interview.seekerId : interview.clientId;
        await createNotification(
            notifyId,
            '❌ Interview Cancelled',
            `The interview "${interview.title}" has been cancelled.`,
            'interview'
        );

        res.status(200).json({ success: true, message: 'Interview cancelled', interview });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error cancelling interview', error: error.message });
    }
};

// ─── Submit Evaluation ────────────────────────────────────────────────────────
const submitEvaluation = async (req, res) => {
    try {
        const { id } = req.params;
        const { communication, technical, confidence, problemSolving, overallRating, feedback, decision } = req.body;
        const userId = req.user._id;

        const interview = await Interview.findById(id);
        if (!interview) return res.status(404).json({ success: false, message: 'Interview not found' });

        if (interview.clientId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: 'Only the client can evaluate' });
        }

        interview.evaluation = {
            communication, technical, confidence, problemSolving,
            overallRating, feedback, decision,
            evaluatedAt: new Date()
        };
        interview.status = 'Completed';
        await interview.save();

        // Update application status based on decision
        if (decision === 'Selected') {
            await Application.findByIdAndUpdate(interview.applicationId, { status: 'Hired' });
        } else if (decision === 'Rejected') {
            await Application.findByIdAndUpdate(interview.applicationId, { status: 'Rejected' });
        }

        // Notify seeker
        const decisionMsg = decision === 'Selected'
            ? '🎉 Congratulations! You have been Selected!'
            : decision === 'Rejected'
                ? 'Thank you for interviewing. Unfortunately you were not selected this time.'
                : 'Your interview result is on Hold. You will be notified soon.';

        await createNotification(interview.seekerId, `Interview Result: ${decision}`, decisionMsg, 'interview');

        res.status(200).json({ success: true, message: 'Evaluation submitted', interview });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error submitting evaluation', error: error.message });
    }
};

module.exports = {
    scheduleInterview,
    getMyInterviews,
    getInterviewById,
    getInterviewByRoom,
    updateInterviewStatus,
    rescheduleInterview,
    cancelInterview,
    submitEvaluation
};
