const mongoose = require("mongoose");
const { Schema } = mongoose;

const participantSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
    username: { type: String },
    language: { type: String, default: "javascript" },
    code: { type: String, default: "" },
    status: {
        type: String,
        enum: ["idle", "running", "accepted", "wrong", "compiler_error"],
        default: "idle",
    },
    testCasesPassed: { type: Number, default: 0 },
    runtime: { type: Number, default: 0 },
    memory: { type: Number, default: 0 },
    submittedAt: { type: Date },
});

const challengeSchema = new Schema(
    {
        roomId: { type: String, unique: true, index: true },
        problemId: { type: Schema.Types.ObjectId, ref: "problem", required: true },
        participants: { type: [participantSchema], default: [] },
        status: {
            type: String,
            enum: ["waiting", "active", "finished", "cancelled"],
            default: "waiting",
        },
        winnerUserId: { type: Schema.Types.ObjectId, ref: "user" },
        startedAt: { type: Date },
        endedAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model("challenge", challengeSchema);


