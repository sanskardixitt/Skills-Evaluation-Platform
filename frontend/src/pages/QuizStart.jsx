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
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-4 text-oxford_blue-500">
        Start Quiz
      </h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <div className="space-y-3 bg-white p-4 rounded shadow">
        <label className="block text-sm">Number of questions</label>
        <input
          className="w-full border rounded px-3 py-2"
          type="number"
          min="1"
          max="50"
          value={questionCount}
          onChange={(e) => setQuestionCount(e.target.value)}
        />
        <button
          disabled={loading}
          className="px-4 py-2 rounded bg-orange_web-500 text-black"
          onClick={start}
        >
          {loading ? "Starting..." : "Start quiz"}
        </button>
      </div>
    </div>
  );
}
