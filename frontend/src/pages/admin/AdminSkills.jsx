import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get("/skills");
      setSkills(res.data.data.skills);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to load skills");
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
    <div className="max-w-4xl mx-auto mt-10">
      <div className="mb-4">
        <Link
          to="/admin"
          className="text-sm text-oxford_blue-600 underline hover:text-oxford_blue-500 transition"
        >
          &larr; Back
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6 text-oxford_blue-500 text-center">
        Skills Management
      </h1>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 p-3 rounded-md text-center">
          {error}
        </div>
      )}

      {/* Create Skill Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-6 grid gap-4">
        <input
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-oxford_blue-500 transition"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-oxford_blue-500 transition"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button
          className="w-max px-4 py-2 rounded-lg font-medium bg-orange_web-500 text-black hover:bg-orange_web-400 transition"
          onClick={create}
        >
          Create Skill
        </button>
      </div>

      {/* Skills List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="text-gray-500 text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
          No skills available.
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex justify-between items-center hover:shadow-md transition-shadow duration-200"
            >
              <div>
                <div className="text-lg font-semibold text-oxford_blue-500">
                  {s.name}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Questions:{" "}
                  <span className="font-medium text-gray-800">
                    {s._count?.questions || 0}
                  </span>
                </div>
              </div>
              <button
                className="px-3 py-1 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
                onClick={() => remove(s.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
