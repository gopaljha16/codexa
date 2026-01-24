const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProblemSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        required: true,
    },
    tags: {
        type: [String],
        enum: ["array", "linkedList", "graph", "dp", "function", "stack", "string", "number manipulation", "tree", "binary search", "greedy", "sorting", "searching", "loop", "recursion", "bit manipulation", "hashing", "dynamic programming", "backtracking", "combinatorics", "geometry", "bitwise operations", "game theory", "number theory", "combinatorial optimization", "probability", "data structures", "algorithms", "optimization", "parallel processing", "distributed systems", "networking", "security", "cryptography", "machine learning", "artificial intelligence", "natural language processing", "computer vision", "deep learning", "reinforcement learning", "string", "hashmap", "math", "searching", "queue", "heap", "priority queue", "binary tree", "binary search tree", "AVL tree", "red-black tree", "B-tree", "segment tree", "Fenwick tree", "trie", "disjoint set union", "data structure", "set", "sliding window", "expand around center", "two pointers", "conditional", "comparison", "digits", "conditions", "character", "hashmap", "frequency", "prefix sum", "positive integers", "iteration", "bfs", "missing number"],
        required: true
    },
    visibleTestCases: [
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            },
            explanation: {
                type: String,
                required: true,
            },
        }
    ],
    hiddenTestCases: [
        {
            input: {
                type: String,
                required: true,
            },
            output: {
                type: String,
                required: true,
            }
        }
    ],
    startCode: [
        {
            language: {
                type: String,
                required: true,
            },
            initialCode: {
                type: String,
                required: true,
            },
        }
    ],

    referenceSolution: [  // actual solution.
        {
            language: {
                type: String,
                required: true,
            },
            completeCode: {
                type: String,
                required: true,
            },
            default: []
        }

    ],

    secureUrl: {
        type: String,
        required: false,
    },
    thumbnailUrl: {
        type: String,
        required: false,
    },
    duration: {
        type: Number,
        required: false,
    },

    problemCreator: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true,
    }
}, { Timestamp: true })

const Problem = mongoose.model("problem", ProblemSchema);
module.exports = Problem;