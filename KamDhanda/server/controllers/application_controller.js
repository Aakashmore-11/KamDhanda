const Application = require('../models/applications_model');
const Job = require('../models/jobs_model');
const Notification = require('../models/notification_model');

const applyForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { coverLetter } = req.body;
        const seekerId = req.user._id;
        
        let resumeUrl = req.file ? (req.file.secure_url || req.file.path || req.file.url) : req.body.resumeUrl;

        if (!resumeUrl) {
            return res.status(400).json({ success: false, message: 'Please provide a resume (upload or profile link)' });
        }

        // Check if application already exists
        const existingApplication = await Application.findOne({ jobId, seekerId });

        if (existingApplication) {
            // Check if status is still 'Applied' (allow update only if it's in the initial stage)
            if (existingApplication.status !== 'Applied') {
                return res.status(400).json({ success: false, message: 'Application is already under review and cannot be updated.' });
            }
            
            existingApplication.coverLetter = coverLetter;
            existingApplication.resumeUrl = resumeUrl;
            await existingApplication.save();
            
            return res.status(200).json({ success: true, message: 'Application updated successfully!', application: existingApplication });
        }

        const application = await Application.create({
            jobId,
            seekerId,
            coverLetter,
            resumeUrl,
            status: 'Applied'
        });

        res.status(201).json({ success: true, message: 'Applied successfully', application });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error applying for job', error: error.message });
    }
};

const getSeekerApplications = async (req, res) => {
    try {
        const seekerId = req.user._id;
        const applications = await Application.find({ seekerId }).populate('jobId').sort({ createdAt: -1 });
        
        const enrichedApplications = await Promise.all(applications.map(async (app) => {
            const test = await MockTest.findOne({ jobId: app.jobId._id }).sort({ createdAt: -1 });
            let testResult = null;
            if (test) {
                testResult = await Result.findOne({ 
                    userId: seekerId, 
                    testId: test._id 
                });
            }
            return { ...app.toObject(), testResult };
        }));

        res.status(200).json({ success: true, applications: enrichedApplications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching applications', error: error.message });
    }
};

const Result = require('../models/result_model');
const MockTest = require('../models/mocktest_model');
const Interview = require('../models/interview_model');
const User = require('../models/users_model');
const { sendApplicationStatusEmail } = require('../config/emailConfig');


const getJobApplications = async (req, res) => {
    try {
        const { jobId } = req.params;
        const employerId = req.user._id;

        // Verify the employer owns the job
        const job = await Job.findById(jobId);
        if (!job || job.employerId.toString() !== employerId.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized access to job applications' });
        }

        const applications = await Application.find({ jobId }).populate('seekerId', 'fullName email profilePic skills resume').sort({ createdAt: -1 });
        
        // Find the most recent test for this job
        const test = await MockTest.findOne({ jobId }).sort({ createdAt: -1 });

        const enrichedApplications = await Promise.all(applications.map(async (app) => {
            let testResult = null;
            if (test && app.seekerId) {
                testResult = await Result.findOne({ 
                    userId: app.seekerId._id, 
                    testId: test._id 
                });
            }
            return { ...app.toObject(), testResult };
        }));

        res.status(200).json({ success: true, applications: enrichedApplications });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching applicants', error: error.message });
    }
};

const updateApplicationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const employerId = req.user._id;

        const application = await Application.findById(id).populate('jobId');
        if (!application || application.jobId.employerId.toString() !== employerId.toString()) {
             return res.status(403).json({ success: false, message: 'Unauthorized access' });
        }

        const oldStatus = application.status;
        application.status = status;
        await application.save();

        // Send System Notification & Emails to Seeker
        if (oldStatus !== status) {
            try {
                const seeker = await User.findById(application.seekerId);
                const employer = await User.findById(employerId);
                const jobTitle = application.jobId.title || 'Job Role';
                let emailSubject = '';
                let emailHtml = '';
                let shortMessage = '';

                if (status === 'MockTest') {
                    const test = await MockTest.findOne({ jobId: application.jobId._id }).sort({ createdAt: -1 });
                    const tDate = test ? new Date(test.startTime).toLocaleDateString() : 'TBD';
                    const tTime = test ? new Date(test.startTime).toLocaleTimeString() : 'TBD';
                    const tDuration = test ? `${test.duration} minutes` : 'TBD';

                    emailSubject = `Update on your application for ${jobTitle} - Mock Test Scheduled`;
                    emailHtml = `
                    <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#07070d;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                        <div style="padding:24px 32px;background:linear-gradient(135deg,#5828ff,#8b5cf6);">
                            <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.04em;color:#fff;">KamDhanda</h1>
                            <p style="margin:4px 0 0;font-size:13px;opacity:0.8;color:#fff;">Your Professional Hub</p>
                        </div>
                        <div style="padding:32px;">
                            <p style="color:rgba(255,255,255,0.6);font-size:15px;margin-top:0;">Dear <strong style="color:#fff;">${seeker.fullName}</strong>,</p>
                            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">We are pleased to inform you that your application for the position of <strong style="color:#fff;">${jobTitle}</strong> at <strong style="color:#fff;">${employer.fullName}</strong> has been shortlisted.</p>
                            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">As part of our selection process, you are invited to participate in the next phase:</p>
                            <div style="background:rgba(88,40,255,0.1);border-left:4px solid #8b5cf6;padding:16px;margin:24px 0;border-radius:0 8px 8px 0;">
                                <h3 style="margin:0 0 12px 0;color:#fff;font-size:16px;">Phase 1: Mock Test / Assessment</h3>
                                <ul style="margin:0;padding-left:20px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;">
                                    <li><strong style="color:#fff;">Date:</strong> ${tDate}</li>
                                    <li><strong style="color:#fff;">Time:</strong> ${tTime}</li>
                                    <li><strong style="color:#fff;">Duration:</strong> ${tDuration}</li>
                                    <li><strong style="color:#fff;">Mode:</strong> Online KamDhanda Portal</li>
                                </ul>
                            </div>
                            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Please ensure that you are prepared and available at the scheduled time. Candidates who successfully clear this stage will be invited to the next phase.</p>
                            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">We wish you the best of luck!</p>
                            <div style="margin-top:32px;margin-bottom:0px;">
                                <p style="color:rgba(255,255,255,0.4);font-size:14px;margin:0;">Best regards,</p>
                                <p style="color:#fff;font-weight:600;font-size:15px;margin:4px 0 0;">${employer.fullName}</p>
                            </div>
                        </div>
                        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                            <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">© 2025 KamDhanda. All rights reserved.</p>
                        </div>
                    </div>`;

                    shortMessage = `🎉 Congratulations ${seeker.fullName}!\n\nYou have been shortlisted for the **${jobTitle}** role.\n\n📌 Next Step: Mock Test / Assessment\n🗓 Date: ${tDate}\n⏰ Time: ${tTime}\n\nPlease be prepared and join on time.\n\nGood luck! 🚀`;
                } else if (status === 'Interview') {
                    const interview = await Interview.findOne({ applicationId: application._id }).sort({ createdAt: -1 });
                    const iDate = interview ? new Date(interview.date).toLocaleDateString() : 'TBD';
                    const iTime = interview ? interview.time : 'TBD';

                    emailSubject = `Stage 2: Virtual Interview Invitation for ${jobTitle}`;
                    emailHtml = `
                    <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#07070d;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                        <div style="padding:24px 32px;background:linear-gradient(135deg,#5828ff,#8b5cf6);">
                            <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.04em;color:#fff;">KamDhanda</h1>
                            <p style="margin:4px 0 0;font-size:13px;opacity:0.8;color:#fff;">Your Professional Hub</p>
                        </div>
                        <div style="padding:32px;">
                            <p style="color:rgba(255,255,255,0.6);font-size:15px;margin-top:0;">Dear <strong style="color:#fff;">${seeker.fullName}</strong>,</p>
                            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Congratulations! You have successfully cleared the initial assessment for the <strong style="color:#fff;">${jobTitle}</strong> position at <strong style="color:#fff;">${employer.fullName}</strong>.</p>
                            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">We are pleased to invite you to the next stage:</p>
                            <div style="background:rgba(88,40,255,0.1);border-left:4px solid #8b5cf6;padding:16px;margin:24px 0;border-radius:0 8px 8px 0;">
                                <h3 style="margin:0 0 12px 0;color:#fff;font-size:16px;">Phase 2: Virtual Interview</h3>
                                <ul style="margin:0;padding-left:20px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;">
                                    <li><strong style="color:#fff;">Date:</strong> ${iDate}</li>
                                    <li><strong style="color:#fff;">Time:</strong> ${iTime}</li>
                                </ul>
                            </div>
                            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Please ensure a stable internet connection and a quiet environment for the interview. We look forward to speaking with you.</p>
                            <div style="margin-top:32px;margin-bottom:0px;">
                                <p style="color:rgba(255,255,255,0.4);font-size:14px;margin:0;">Best regards,</p>
                                <p style="color:#fff;font-weight:600;font-size:15px;margin:4px 0 0;">${employer.fullName}</p>
                            </div>
                        </div>
                        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                            <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">© 2025 KamDhanda. All rights reserved.</p>
                        </div>
                    </div>`;

                    shortMessage = `🎯 Great news ${seeker.fullName}!\n\nYou passed the mock test ✅\nYou're invited for the **Virtual Interview**.\n\n🗓 Date: ${iDate}\n⏰ Time: ${iTime}\n\nBe ready and join on time. Best of luck!`;
                } else if (status === 'Hired') {
                    emailSubject = `Job Offer: ${jobTitle} at ${employer.fullName}`;
                    emailHtml = `
                    <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#07070d;color:#fff;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
                        <div style="padding:24px 32px;background:linear-gradient(135deg,#10b981,#047857);">
                            <h1 style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.04em;color:#fff;">KamDhanda</h1>
                            <p style="margin:4px 0 0;font-size:13px;opacity:0.8;color:#fff;">Your Professional Hub</p>
                        </div>
                        <div style="padding:32px;">
                            <p style="color:rgba(255,255,255,0.6);font-size:15px;margin-top:0;">Dear <strong style="color:#fff;">${seeker.fullName}</strong>,</p>
                            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Congratulations! We are delighted to offer you the position of <strong style="color:#fff;">${jobTitle}</strong> at <strong style="color:#fff;">${employer.fullName}</strong>.</p>
                            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Based on your performance throughout the selection process, we believe you will be a valuable addition to our team.</p>
                            <div style="background:rgba(16,185,129,0.1);border-left:4px solid #10b981;padding:16px;margin:24px 0;border-radius:0 8px 8px 0;">
                                <h3 style="margin:0 0 12px 0;color:#fff;font-size:16px;">Job Details:</h3>
                                <ul style="margin:0;padding-left:20px;color:rgba(255,255,255,0.6);font-size:14px;line-height:1.8;">
                                    <li><strong style="color:#fff;">Position:</strong> ${jobTitle}</li>
                                    <li><strong style="color:#fff;">Start Date:</strong> Upon Confirmation</li>
                                    <li><strong style="color:#fff;">Compensation:</strong> As per agreed terms</li>
                                    <li><strong style="color:#fff;">Work Type:</strong> Remote / Freelance</li>
                                </ul>
                            </div>
                            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">Please confirm your acceptance of this offer by replying directly via the platform messaging interface within 3 days.</p>
                            <p style="color:rgba(255,255,255,0.6);font-size:14px;line-height:1.6;">We look forward to working with you and wish you great success!</p>
                            <div style="margin-top:32px;margin-bottom:0px;">
                                <p style="color:rgba(255,255,255,0.4);font-size:14px;margin:0;">Warm regards,</p>
                                <p style="color:#fff;font-weight:600;font-size:15px;margin:4px 0 0;">${employer.fullName}</p>
                            </div>
                        </div>
                        <div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
                            <p style="color:rgba(255,255,255,0.2);font-size:12px;margin:0;">© 2025 KamDhanda. All rights reserved.</p>
                        </div>
                    </div>`;

                    shortMessage = `🎉 Congratulations ${seeker.fullName}!\n\nYou have been **selected and hired** for the **${jobTitle}** role.\n\n📩 Check your email for offer details.\n\nWelcome aboard! 🚀`;
                }

                if (emailHtml && shortMessage) {
                    await sendApplicationStatusEmail(seeker.email, emailSubject, emailHtml);
                    
                    await Notification.create({
                        recipient_id: application.seekerId,
                        sender_id: employerId,
                        message: shortMessage,
                        type: 'message'
                    });
                } else {
                    await Notification.create({
                        recipient_id: application.seekerId,
                        sender_id: employerId,
                        message: `Status update: Your application for "${application.jobId.title}" is now "${status}".`,
                        type: 'system'
                    });
                }
            } catch (notifErr) {
                console.error("Failed to send status notification:", notifErr);
            }
        }

        res.status(200).json({ success: true, message: 'Status updated successfully', application });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating status', error: error.message });
    }
};

module.exports = {
    applyForJob,
    getSeekerApplications,
    getJobApplications,
    updateApplicationStatus
};
