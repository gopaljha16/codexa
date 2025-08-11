const express = require("express");
const { userMiddleware } = require("../middleware/userMiddleware");
const ctrl = require("../controllers/challengeController");

const router = express.Router();

router.post("/challenge", userMiddleware, ctrl.createChallenge);
router.post("/challenge/join/:roomId", userMiddleware, ctrl.joinChallenge);
router.get("/challenge/:roomId", userMiddleware, ctrl.getChallenge);
router.post("/challenge/:roomId/submit", userMiddleware, ctrl.submitBattleCode);

module.exports = router;


