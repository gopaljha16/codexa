import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { getChallenge, submitBattleCode } from "../utils/apis/userApi";
import { getSocket } from "../utils/socket";

const languages = ["javascript", "c++", "java", "cpp"]; // mapped in backend

const ChallengeRoom = () => {
  const { roomId } = useParams();
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const { data } = await getChallenge(roomId);
      setChallenge(data.challenge);
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenge();
  }, [roomId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("join-challenge", roomId);
    const onUpdate = (payload) => {
      if (payload?.roomId === roomId) fetchChallenge();
    };
    socket.on("challenge:update", onUpdate);
    return () => {
      socket.emit("leave-challenge", roomId);
      socket.off("challenge:update", onUpdate);
    };
  }, [roomId]);

  const onSubmit = async () => {
    try {
      setError(null);
      await submitBattleCode(roomId, { code, language });
      await fetchChallenge();
    } catch (e) {
      setError(e.response?.data?.message || e.message);
    }
  };

  const me = useMemo(() => {
    // This is a simple view; backend returns participants with userId; frontend doesn't decode self id here.
    return null;
  }, [challenge]);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar />
        <div className="p-6">Loading...</div>
      </div>
    );
  if (!challenge)
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100">
        <Navbar />
        <div className="p-6">Not found</div>
      </div>
    );

  const finished = challenge.status === "finished";

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <Navbar />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Room {challenge.roomId}</h1>
          <div className="text-sm text-gray-400">
            Status: {challenge.status}
          </div>
        </div>
        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex gap-3">
              <select
                className="p-2 bg-gray-800 border border-gray-700 rounded"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <button
                onClick={onSubmit}
                disabled={finished}
                className="px-4 py-2 bg-orange-600 rounded hover:bg-orange-500 disabled:opacity-50"
              >
                {finished ? "Finished" : "Submit"}
              </button>
            </div>
            <textarea
              className="w-full h-96 p-3 bg-gray-800 border border-gray-700 rounded font-mono"
              placeholder="Write your solution here..."
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
              <h2 className="font-semibold mb-2">Participants</h2>
              <div className="space-y-2">
                {challenge.participants.map((p) => (
                  <div key={p.userId} className="flex justify-between text-sm">
                    <span>{p.username || p.userId}</span>
                    <span className="text-gray-400">
                      {p.status}
                      {p.status === "accepted" ? ` (${p.testCasesPassed})` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 bg-gray-800/50 rounded border border-gray-700">
              <h2 className="font-semibold mb-2">Problem</h2>
              <div className="text-sm text-gray-300">
                {challenge.problemId?.title}
              </div>
              <div className="text-xs text-gray-400">
                {challenge.problemId?.difficulty}
              </div>
            </div>
            {finished && (
              <div className="p-4 bg-green-900/30 border border-green-700 rounded">
                Winner: {challenge.winnerUserId}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeRoom;
