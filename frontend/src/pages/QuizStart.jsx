import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";

export default function QuizStart() {
  const { skillId } = useParams();
  const navigate = useNavigate();
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const start = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/quiz/start", {
        skillId: Number(skillId),
        questionCount: Number(questionCount),
      });
      const attemptId = res.data.data.attemptId;
      navigate(`/quiz/attempt/${attemptId}`, {
        state: { data: res.data.data },
      });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to start quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <h1 className="text-3xl font-bold mb-6 text-oxford_blue-500 text-center">
        Start Quiz
      </h1>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 p-3 rounded-md text-center">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Number of questions
          </label>
          <input
            type="number"
            min="1"
            max="50"
            value={questionCount}
            onChange={(e) => setQuestionCount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-oxford_blue-500 focus:border-oxford_blue-500 transition"
          />
        </div>

        <button
          disabled={loading}
          onClick={start}
          className={`w-full px-4 py-2 rounded-lg font-semibold text-black ${
            loading
              ? "bg-orange_web-400 cursor-not-allowed"
              : "bg-orange_web-500 hover:bg-orange_web-400 transition-colors"
          }`}
        >
          {loading ? "Starting..." : "Start Quiz"}
        </button>
      </div>
    </div>
  );
}
