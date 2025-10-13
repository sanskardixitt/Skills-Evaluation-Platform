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

  const load = async () => {
    const skillsRes = await api.get("/skills");
    setSkills(skillsRes.data.data.skills);
    const qRes = await api.get("/questions?limit=50");
    setList(qRes.data.data.questions);
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
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/admin" className="text-sm text-oxford_blue-600 underline">
          Back
        </Link>
      </div>
      <h1 className="text-2xl font-semibold mb-4 text-oxford_blue-500">
        Questions
      </h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}

      <div className="bg-white rounded p-4 shadow mb-4 grid gap-2">
        <select
          className="border rounded px-3 py-2"
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
          className="border rounded px-3 py-2"
          placeholder="Question"
          value={form.questionText}
          onChange={(e) =>
            setForm((f) => ({ ...f, questionText: e.target.value }))
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="Option A"
            value={form.optionA}
            onChange={(e) =>
              setForm((f) => ({ ...f, optionA: e.target.value }))
            }
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Option B"
            value={form.optionB}
            onChange={(e) =>
              setForm((f) => ({ ...f, optionB: e.target.value }))
            }
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Option C"
            value={form.optionC}
            onChange={(e) =>
              setForm((f) => ({ ...f, optionC: e.target.value }))
            }
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Option D"
            value={form.optionD}
            onChange={(e) =>
              setForm((f) => ({ ...f, optionD: e.target.value }))
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            className="border rounded px-3 py-2"
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
            className="border rounded px-3 py-2"
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
          className="w-max px-3 py-1 rounded bg-orange_web-500 text-black"
          onClick={create}
        >
          Create
        </button>
      </div>

      <div className="space-y-2">
        {list.map((q) => (
          <div key={q.id} className="bg-white rounded p-3 shadow">
            <div className="text-sm text-black-800">{q.skill?.name}</div>
            <div className="font-medium">{q.questionText}</div>
            <div className="text-sm">Answer: {q.correctAnswer}</div>
            <div className="mt-2">
              <button
                className="px-3 py-1 rounded bg-red-600 text-white"
                onClick={() => remove(q.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
