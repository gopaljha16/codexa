const Problem = require("../models/problem")
const Submission = require("../models/submission")
const User = require("../models/user")
const { getLanguageById, submitToken, SubmitBatch } = require("../utils/problemUtility")
const { getIO } = require('../config/socket');
const redisWrapper = require("../config/redis");



const submitCode = async (req, res) => {
    try {

        const userId = req.result._id;
        const problemId = req.params.id;

        let { code, language } = req.body;

        if (!userId || !problemId || !code || !language) {
            return res.status(401).send("Fields Are Missing");
        }

        if (language === 'cpp')
            language = 'c++';

        //fetch the problem from database
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).send("Problem not found");
        }

        // first saving into the database if there is an issue in the judge0 first it should be saved as an pending
        const submittedResult = await Submission.create({
            userId,
            problemId,
            code,
            language,
            status: "Pending",
            totalTestCases: problem.hiddenTestCases.length,
        });

        // Emit immediate update so heatmap updates right after user submits
        try {
            const io = getIO();
            if (io) {
                io.to(userId.toString()).emit('userStatsUpdate', { userId, source: 'submissionCreated' });
            }
        } catch (emitErr) {
            console.warn("submitCode: Unable to emit userStatsUpdate after initial create:", emitErr.message);
        }

        //now judge0 code submit 
        const languageId = getLanguageById(language);
        if (!languageId) {
            return res.status(404).send("Invalid Language Id");
        }

        if (!problem.hiddenTestCases || problem.hiddenTestCases.length === 0) {
            return res.status(400).json({
                success: false,
                message: "This problem has no hidden test cases and cannot be submitted."
            });
        }

        const referenceSolution = problem.referenceSolution.find(rs => rs.language.toLowerCase() === language.toLowerCase());
        const startCode = problem.startCode.find(sc => sc.language.toLowerCase() === language.toLowerCase());

        let finalCode = code;
        if (referenceSolution && startCode) {
            if (referenceSolution.completeCode.includes(startCode.initialCode)) {
                finalCode = referenceSolution.completeCode.replace(startCode.initialCode, code);
            } else {
                console.warn(`submitCode: Could not find exact startCode match for language ${language} in problem ${problemId}. Using raw code.`);
            }
        }

        const submission = problem.hiddenTestCases.map((testcase) => ({
            source_code: finalCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        const testResult = await SubmitBatch(submission);

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let errorMessage = null;
        let status = "Accepted";

        for (const test of testResult) {
            if (test.status_id == 3) {
                testCasesPassed++;
                // Defensive additions for runtime and memory
                runtime = runtime + parseFloat(test.time || 0);
                memory = Math.max(memory, test.memory || 0);
            } else {
                if (test.status_id == 4) {
                    status = "Wrong Answer";
                    errorMessage = test.stderr;
                } else {
                    status = "Compiler Error";
                    errorMessage = test.stderr;
                }
            }
        }

        // update to the database submission store into the database which previous stored as pending if it's wrong answer that will also be stored 
        submittedResult.status = status;
        submittedResult.runtime = runtime;
        submittedResult.testCasesPassed = testCasesPassed;
        submittedResult.memory = memory;
        submittedResult.errorMessage = errorMessage;

        await submittedResult.save();

        // after submission saving it to the problem Id - only if status is Accepted

        if (status === 'Accepted') {
            try {
                const updatedUser = await User.findByIdAndUpdate(
                    userId,
                    { $addToSet: { problemSolved: problemId } },
                    { new: true }
                );
                if (updatedUser) {
                        const io = getIO();
                        if (io) {
                            io.to(userId.toString()).emit('userStatsUpdate', { userId });
                    }
                } else {
                }
            } catch (userUpdateError) {
                console.error("submitCode: Error updating user's solved problems:", userUpdateError);
                // Decide if this should be a critical error. For now, we'll just log it
                // and allow the submission to be considered successful.
            }
        }

        // Emit a real-time update for this user's dashboard regardless of verdict
        try {
            const io = getIO();
            if (io) {
                io.to(userId.toString()).emit('userStatsUpdate', { userId });
            }
        } catch (emitErr) {
            console.warn("submitCode: Failed to emit userStatsUpdate:", emitErr?.message || emitErr);
        }

        const accepted = (status == 'Accepted');
        res.status(201).json({
            success: true,
            message: accepted ? "Submission accepted" : "Submission processed",
            accepted,
            status,
            errorMessage,
            totalTestCases: submittedResult.totalTestCases,
            passedTestCases: testCasesPassed,
            testCasesPassed,
            runtime,
            memory,
            submissionId: submittedResult._id
        });

    } catch (err) {
        console.error("Error in submitCode:", err);
        try {
            res.status(500).send("Internal Server Error " + err.message || err);
        } catch (sendErr) {
            console.error("Error sending error response:", sendErr);
        }
    }
}


const runCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const { id } = req.params;
        const problemId = id;

        let { code, language } = req.body;
        if (language === 'cpp')
            language = 'c++';

        if (!userId || !problemId || !code || !language) {
            return res.status(401).send("Fields Are Missing");
        }

        // fetch the problem from database
        const problem = await Problem.findById(problemId);
        if (!problem) {
            return res.status(404).send("Problem not found");
        }

        // now judge0 code submit 
        const languageId = getLanguageById(language);
        if (!languageId) {
            return res.status(404).send("Invalid Language Id");
        }

        const referenceSolution = problem.referenceSolution.find(rs => rs.language.toLowerCase() === language.toLowerCase());
        const startCode = problem.startCode.find(sc => sc.language.toLowerCase() === language.toLowerCase());

        let finalCode = code;
        if (referenceSolution && startCode) {
            // Robust replacement: verify if startCode exists within completeCode
            if (referenceSolution.completeCode.includes(startCode.initialCode)) {
                finalCode = referenceSolution.completeCode.replace(startCode.initialCode, code);
            } else {
                console.warn(`runCode: Could not find exact startCode match for language ${language} in problem ${problemId}. Using raw code.`);
            }
        }

        const submission = problem.visibleTestCases.map((testcase) => ({
            source_code: finalCode,
            language_id: languageId,
            stdin: testcase.input,
            expected_output: testcase.output,
        }));

        const testResult = await SubmitBatch(submission);

        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = true;
        let errorMessage = null;

        for (const test of testResult) {
            if (test.status_id == 3) {
                testCasesPassed++;
                // Handle potential null/undefined time or memory
                runtime = runtime + parseFloat(test.time || 0);
                memory = Math.max(memory, test.memory || 0);
            } else {
                status = false;
                errorMessage = test.stderr || "Execution Error";
            }
        }

        res.status(201).json({
            success: status,
            testCases: testResult,
            runtime,
            memory,
            errorMessage
        });
    } catch (err) {
        console.error("Error in runCode:", err);
        res.status(500).send("Internal Server Error: " + (err.message || err));
    }
}




module.exports = { submitCode, runCode }
