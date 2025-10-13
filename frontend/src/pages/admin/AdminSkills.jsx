import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    const res = await api.get("/skills");
    setSkills(res.data.data.skills);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async () => {
    try {
      setError("");
      await api.post("/skills", { name, description });
      setName("");
      setDescription("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to create skill");
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this skill? This will remove related data.")) return;
    await api.delete(`/skills/${id}`);
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
        Skills
      </h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}

      <div className="bg-white rounded p-4 shadow mb-4 grid gap-2">
        <input
          className="border rounded px-3 py-2"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          className="w-max px-3 py-1 rounded bg-orange_web-500 text-black"
          onClick={create}
        >
          Create
        </button>
      </div>

      <div className="space-y-2">
        {skills.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded p-3 shadow flex justify-between"
          >
            <div>
              <div className="font-medium">{s.name}</div>
              <div className="text-sm">
                Questions: {s._count?.questions || 0}
              </div>
            </div>
            <button
              className="px-3 py-1 rounded bg-red-600 text-white"
              onClick={() => remove(s.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
