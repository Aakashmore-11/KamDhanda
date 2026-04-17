// server/controllers/mock_test_controller.js
const MockTest = require('../models/mocktest_model');
const Question = require('../models/question_model');
const Result = require('../models/result_model');
const Job = require('../models/jobs_model');
const Application = require('../models/applications_model');

const handleCreateTest = async (req, res) => {
    try {
        const { jobId, title, description, duration, totalMarks, passingCriteria, testType, startTime, endTime, rules } = req.body;
        const clientId = req.user._id;

        // Verify if job belongs to client
        const job = await Job.findById(jobId);
        if (!job || job.employerId.toString() !== clientId.toString()) {
            return res.status(403).json({ message: "Unauthorized to create test for this job." });
        }

        const newTest = await MockTest.create({
            jobId,
            clientId,
            title,
            description,
            duration,
            totalMarks,
            passingCriteria,
            testType,
            startTime,
            endTime,
            rules: rules || {}
        });

        res.status(201).json({ message: "Mock test created successfully", test: newTest });
    } catch (err) {
        console.error("Create Mock Test Error:", err);
        res.status(500).json({ message: `Internal Server Error: ${err.message}` });
    }
};

const handleAddQuestions = async (req, res) => {
    try {
        const { testId, questions } = req.body; // questions is an array
        const clientId = req.user._id;

        const test = await MockTest.findById(testId);
        if (!test || test.clientId.toString() !== clientId.toString()) {
            return res.status(403).json({ message: "Unauthorized access to this test." });
        }

        const questionsWithTestId = questions.map(q => ({ ...q, testId }));
        const createdQuestions = await Question.insertMany(questionsWithTestId);

        res.status(201).json({ message: `${createdQuestions.length} questions added successfully`, questions: createdQuestions });
    } catch (err) {
        console.error("Add Questions Error:", err);
        res.status(500).json({ message: `Internal Server Error: ${err.message}` });
    }
};

const handleGetTestsByJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        console.log(`[GET_TESTS] Searching for tests with jobId: ${jobId}`);
        const tests = await MockTest.find({ jobId }).sort({ createdAt: -1 });
        console.log(`[GET_TESTS] Tests found: ${tests.length}`);
        res.status(200).json({ tests });
    } catch (err) {
        console.error(`[GET_TESTS] Error: ${err.message}`);
        res.status(500).json({ message: `Failed to fetch tests: ${err.message}` });
    }
};

const handleGetTestDetails = async (req, res) => {
    try {
        const { testId } = req.params;
        const test = await MockTest.findById(testId);
        if (!test) return res.status(404).json({ message: "Test not found" });

        const questions = await Question.find({ testId }).select('-testCases -correctAnswer -keywords'); // Don't send everything to front if not needed
        res.status(200).json({ test, questions });
    } catch (err) {
        res.status(500).json({ message: `Failed to fetch test details: ${err.message}` });
    }
};

const handleSubmitTest = async (req, res) => {
    try {
        const { testId, answers, tabSwitchWarnings, timeTaken } = req.body;
        const userId = req.user._id;

        const test = await MockTest.findById(testId);
        if (!test) return res.status(404).json({ message: "Test not found" });

        const questions = await Question.find({ testId });
        let totalScore = 0;
        let correctCount = 0;
        const attemptDetails = [];

        questions.forEach(question => {
            const userAnswer = answers[question._id];
            let isCorrect = false;
            let questionScore = 0;

            if (question.type.startsWith('MCQ')) {
                const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.text);
                const userSelected = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
                isCorrect = correctOptions.length === userSelected.length && correctOptions.every(val => userSelected.includes(val));
                
                // Backup check: if the correctAnswer field exists, we should ensure it matches
                // This handles cases where the client might have manually edited the "Set Original Answer" field
                if (!isCorrect && typeof userAnswer === 'string' && question.correctAnswer) {
                    isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
                }

                if (isCorrect) {
                    questionScore = question.marks;
                    correctCount++;
                    totalScore += questionScore;
                } else if (test.rules.negativeMarking) {
                    questionScore = -(question.marks * 0.25);
                    totalScore += questionScore;
                }
            } else if (question.type === 'Coding') {
                // Basic comparison of user output with expected test cases
                const testCases = question.testCases;
                const userOutputs = userAnswer; 
                
                let passedTests = 0;
                if (Array.isArray(userOutputs) && testCases.length === userOutputs.length) {
                    testCases.forEach((tc, idx) => {
                        if (tc.output.trim() === userOutputs[idx]?.trim()) passedTests++;
                    });
                    
                    isCorrect = passedTests === testCases.length;
                    questionScore = (passedTests / testCases.length) * question.marks;
                    if (isCorrect) correctCount++;
                    totalScore += questionScore;
                }
            } else if (question.correctAnswer && typeof userAnswer === 'string') {
                // Generic string matching for other types (Short Answer / Subjective with auto-grade)
                isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
                if (isCorrect) {
                    questionScore = question.marks;
                    correctCount++;
                    totalScore += questionScore;
                }
            }

            attemptDetails.push({
                questionId: question._id,
                userAnswer,
                isCorrect,
                score: questionScore
            });
        });

        const accuracy = (correctCount / questions.length) * 100;
        const passingScore = (test.passingCriteria / 100) * test.totalMarks;
        const status = totalScore >= passingScore ? "Passed" : "Failed";

        const result = await Result.create({
            testId,
            userId,
            score: totalScore,
            totalMarks: test.totalMarks,
            timeTaken,
            accuracy,
            status,
            attemptDetails,
            tabSwitchWarnings
        });

        // Update application status based on result
        const application = await Application.findOne({ jobId: test.jobId, seekerId: userId });
        if (application) {
            application.status = status === 'Passed' ? 'Interview' : 'Rejected';
            await application.save();
        }

        res.status(201).json({ message: `Test submitted successfully. You have ${status}.`, result });
    } catch (err) {
        console.error("Submit Test Error:", err);
        res.status(500).json({ message: `Internal Server Error: ${err.message}` });
    }
};

const handleGetResult = async (req, res) => {
    try {
        const { testId } = req.params;
        const userId = req.user._id;
        const result = await Result.findOne({ testId, userId }).populate('testId');
        if (!result) return res.status(404).json({ message: "Result not found" });
        res.status(200).json({ result });
    } catch (err) {
        res.status(500).json({ message: `Failed to fetch result: ${err.message}` });
    }
};

const handleGetAnalytics = async (req, res) => {
    try {
        const { testId } = req.params;
        const results = await Result.find({ testId })
            .populate('userId', 'fullName email profilePic')
            .sort({ score: -1 });

        // Aggregate stats
        const totalAttempts = results.length;
        const passedCount = results.filter(r => r.status === "Passed").length;
        const averageScore = results.reduce((acc, r) => acc + r.score, 0) / totalAttempts || 0;

        res.status(200).json({ 
            results, 
            analytics: {
                totalAttempts,
                passedCount,
                failedCount: totalAttempts - passedCount,
                averageScore,
                passPercentage: (passedCount / totalAttempts) * 100 || 0
            }
        });
    } catch (err) {
        res.status(500).json({ message: `Failed to fetch analytics: ${err.message}` });
    }
};

module.exports = {
    handleCreateTest,
    handleAddQuestions,
    handleGetTestsByJob,
    handleGetTestDetails,
    handleSubmitTest,
    handleGetResult,
    handleGetAnalytics
};
