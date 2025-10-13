import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function Skills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/skills");
        setSkills(res.data.data.skills);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load skills");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-oxford_blue-500">
        Skills
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {skills.map((s) => (
          <div
            key={s.id}
            className="bg-white rounded-lg p-4 shadow flex items-start justify-between"
          >
            <div>
              <div className="font-medium text-oxford_blue-500">{s.name}</div>
              <div className="text-sm text-black-800">
                Questions: {s._count?.questions || 0}
              </div>
            </div>
            <Link
              className="px-3 py-1 rounded bg-orange_web-500 text-black"
              to={`/quiz/start/${s.id}`}
            >
              Start
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
