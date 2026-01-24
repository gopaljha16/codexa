const Challenge = require("../models/challenge");
const Problem = require("../models/problem");
const { getLanguageById, SubmitBatch, submitToken } = require("../utils/problemUtility");
const { getIO } = require("../config/socket");

const createRoomCode = () => Math.random().toString(36).slice(2, 8).toUpperCase();

const mongoose = require("mongoose");

exports.createChallenge = async (req, res) => {
    try {
        const userId = req.result._id;
        const { problemId } = req.body; // can be ObjectId or title string

        let problem = null;
        if (problemId && mongoose.Types.ObjectId.isValid(problemId)) {
            problem = await Problem.findById(problemId);
        }
        if (!problem) {
            // Try lookup by title (case-insensitive)
            const titleQuery = typeof problemId === 'string' ? problemId.trim() : '';
            if (titleQuery.length > 0) {
                problem = await Problem.findOne({ title: { $regex: `^${titleQuery}$`, $options: 'i' } });
            }
        }
        if (!problem) return res.status(404).json({ success: false, message: "Problem not found. Use a valid problem ID or exact title." });

        const roomId = createRoomCode();
        const challenge = await Challenge.create({
            roomId,
            problemId,
            participants: [{ userId, username: req.result.firstName || "User" }],
            status: "waiting",
        });

        res.status(201).json({ success: true, challenge });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.joinChallenge = async (req, res) => {
    try {
        const userId = req.result._id;
        const { roomId } = req.params;
        const challenge = await Challenge.findOne({ roomId });
        if (!challenge) return res.status(404).json({ success: false, message: "Room not found" });
        if (challenge.status !== "waiting" && challenge.status !== "active") {
            return res.status(400).json({ success: false, message: "Challenge not joinable" });
        }
        const already = challenge.participants.some((p) => p.userId.toString() === userId.toString());
        if (!already) challenge.participants.push({ userId, username: req.result.firstName || "User" });

        // Auto start when two participants present
        if (challenge.participants.length >= 2 && challenge.status === "waiting") {
            challenge.status = "active";
            challenge.startedAt = new Date();
        }
        await challenge.save();

        // notify room via socket
        try {
            const io = getIO();
            io.to(`challenge:${challenge.roomId}`).emit("challenge:update", { roomId: challenge.roomId });
        } catch { }

        res.json({ success: true, challenge });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.getChallenge = async (req, res) => {
    try {
        const { roomId } = req.params;
        const challenge = await Challenge.findOne({ roomId }).populate("problemId", "title difficulty description startCode referenceSolution visibleTestCases");
        if (!challenge) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, challenge });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.submitBattleCode = async (req, res) => {
    try {
        const userId = req.result._id;
        const { roomId } = req.params;
        const { code, language } = req.body;

        const challenge = await Challenge.findOne({ roomId }).populate("problemId");
        if (!challenge) return res.status(404).json({ success: false, message: "Room not found" });
        if (challenge.status !== "active") return res.status(400).json({ success: false, message: "Challenge not active" });

        const participant = challenge.participants.find((p) => p.userId.toString() === userId.toString());
        if (!participant) return res.status(403).json({ success: false, message: "Not a participant" });

        // Judge0 run on hidden test cases of the problem
        const languageId = await getLanguageById(language === "cpp" ? "c++" : language);
        if (!languageId) return res.status(400).json({ success: false, message: "Invalid language" });

        const problem = challenge.problemId;
        const referenceSolution = problem.referenceSolution.find((rs) => rs.language.toLowerCase() === (language || "").toLowerCase());
        const startCode = problem.startCode.find((sc) => sc.language.toLowerCase() === (language || "").toLowerCase());
        let finalCode = code;
        if (referenceSolution && startCode) {
            finalCode = referenceSolution.completeCode.replace(startCode.initialCode, code);
        }

        const batch = problem.hiddenTestCases.map((tc) => ({
            source_code: finalCode,
            language_id: languageId,
            stdin: tc.input,
            expected_output: tc.output,
        }));
        const submitResult = await SubmitBatch(batch);
        const tokens = submitResult.map((v) => v.token);
        const results = await submitToken(tokens);

        let passed = 0;
        let runtime = 0;
        let memory = 0;
        let status = "accepted";
        for (const r of results) {
            const accepted = (r.status_id || r.status?.id) === 3;
            if (accepted) {
                passed++;
                runtime += parseFloat(r.time || 0);
                memory = Math.max(memory, parseInt(r.memory || 0));
            } else {
                status = (r.status_id || r.status?.id) === 4 ? "wrong" : "compiler_error";
            }
        }

        participant.code = code;
        participant.language = language;
        participant.status = status === "accepted" && passed === problem.hiddenTestCases.length ? "accepted" : status;
        participant.testCasesPassed = passed;
        participant.runtime = runtime;
        participant.memory = memory;
        participant.submittedAt = new Date();

        // If first to fully accept, mark winner
        if (participant.status === "accepted" && !challenge.winnerUserId) {
            challenge.winnerUserId = participant.userId;
            challenge.status = "finished";
            challenge.endedAt = new Date();
        }

        await challenge.save();

        try {
            const io = getIO();
            io.to(`challenge:${challenge.roomId}`).emit("challenge:update", { roomId: challenge.roomId });
        } catch { }

        res.json({ success: true, participant, finished: challenge.status === "finished", winnerUserId: challenge.winnerUserId });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};


