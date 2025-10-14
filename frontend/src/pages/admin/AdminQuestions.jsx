import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminQuestions() {
  const [skills, setSkills] = useState([]);
  const [list, setList] = useState([]);
  const [form, setForm] = useState({
    skillId: "",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
    difficulty: "MEDIUM",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const skillsRes = await api.get("/skills");
      setSkills(skillsRes.data.data.skills);
      const qRes = await api.get("/questions?limit=50");
      setList(qRes.data.data.questions);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    try {
      setError("");
      const payload = { ...form, skillId: Number(form.skillId) };
      await api.post("/questions", payload);
      setForm({
        skillId: "",
        questionText: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correctAnswer: "A",
        difficulty: "MEDIUM",
      });
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create question");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this question?")) return;
    await api.delete(`/questions/${id}`);
    await load();
  };

  return (
    <div className="max-w-5xl mx-auto mt-10">
      {/* Back Link */}
      <div className="mb-4">
        <Link
          to="/admin"
          className="text-sm text-oxford_blue-600 underline hover:text-oxford_blue-500 transition"
        >
          &larr; Back
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-oxford_blue-500 text-center">
        Questions Management
      </h1>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 p-3 rounded-md text-center">
          {error}
        </div>
      )}

      {/* Create Question Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6 space-y-4">
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-oxford_blue-500 w-full"
          value={form.skillId}
          onChange={(e) => setForm((f) => ({ ...f, skillId: e.target.value }))}
        >
          <option value="">Select skill</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <textarea
          className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-oxford_blue-500"
          placeholder="Question"
          value={form.questionText}
          onChange={(e) =>
            setForm((f) => ({ ...f, questionText: e.target.value }))
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {["A", "B", "C", "D"].map((opt) => (
            <input
              key={opt}
              className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-oxford_blue-500"
              placeholder={`Option ${opt}`}
              value={form[`option${opt}`]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [`option${opt}`]: e.target.value }))
              }
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-oxford_blue-500"
            value={form.correctAnswer}
            onChange={(e) =>
              setForm((f) => ({ ...f, correctAnswer: e.target.value }))
            }
          >
            {["A", "B", "C", "D"].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>

          <select
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-oxford_blue-500"
            value={form.difficulty}
            onChange={(e) =>
              setForm((f) => ({ ...f, difficulty: e.target.value }))
            }
          >
            {["EASY", "MEDIUM", "HARD"].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <button
          className="w-max px-4 py-2 rounded-lg font-medium bg-orange_web-500 text-black hover:bg-orange_web-400 transition"
          onClick={create}
        >
          Create Question
        </button>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="text-gray-500 text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
          No questions available.
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((q) => (
            <div
              key={q.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="text-sm text-gray-500">{q.skill?.name}</div>
              <div className="font-medium text-oxford_blue-500 mt-1">
                {q.questionText}
              </div>
              <div className="text-sm mt-1">Answer: {q.correctAnswer}</div>
              <div className="mt-3">
                <button
                  className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
                  onClick={() => remove(q.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
