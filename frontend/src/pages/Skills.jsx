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

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-oxford_blue-500 text-center">
        Skills
      </h1>

      {error && (
        <div className="text-red-600 bg-red-50 border border-red-200 p-3 rounded-md text-center mb-4">
          {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg p-5 shadow-sm border border-gray-100 animate-pulse"
            >
              <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="mt-4 h-8 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {skills.map((s) => (
            <div
              key={s.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="text-lg font-semibold text-oxford_blue-500 mb-1">
                  {s.name}
                </div>
                <div className="text-sm text-gray-600">
                  Questions:{" "}
                  <span className="font-medium text-gray-800">
                    {s._count?.questions || 0}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <Link
                  className="inline-block px-4 py-2 rounded-md bg-orange_web-500 text-black font-medium hover:bg-orange_web-400 transition-colors"
                  to={`/quiz/start/${s.id}`}
                >
                  Start
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && skills.length === 0 && !error && (
        <div className="text-gray-500 text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
          No skills available.
        </div>
      )}
    </div>
  );
}
