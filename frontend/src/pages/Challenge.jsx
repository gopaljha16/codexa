import React, { useState } from "react";
import Navbar from "../components/common/Navbar";
import { createChallenge, joinChallenge } from "../utils/apis/userApi";
import { useNavigate } from "react-router-dom";

const Challenge = () => {
  const [problemId, setProblemId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onCreate = async () => {
    try {
      setError(null);
      const { data } = await createChallenge(problemId);
      navigate(`/challenge/${data.challenge.roomId}`);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const onJoin = async () => {
    try {
      setError(null);
      await joinChallenge(roomId);
      navigate(`/challenge/${roomId}`);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-bold">Real-time Coding Battle</h1>
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded border border-gray-700 bg-gray-800/50">
            <h2 className="font-semibold mb-2">Create Battle</h2>
            <input
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 mb-2"
              placeholder="Problem ID or exact Title"
              value={problemId}
              onChange={(e) => setProblemId(e.target.value)}
            />
            <div className="text-xs text-gray-400 mb-3">
              Tip: you can paste the problem ObjectId or type the exact problem
              title.
            </div>
            <button
              onClick={onCreate}
              className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-500"
            >
              Create
            </button>
          </div>
          <div className="p-4 rounded border border-gray-700 bg-gray-800/50">
            <h2 className="font-semibold mb-2">Join Battle</h2>
            <input
              className="w-full p-2 rounded bg-gray-800 border border-gray-700 mb-3"
              placeholder="Room Code"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button
              onClick={onJoin}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
            >
              Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Challenge;
