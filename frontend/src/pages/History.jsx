import { useEffect, useState } from "react";
import api from "../services/api";

export default function History() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/quiz/history?page=1&limit=10");
        setItems(res.data.data.attempts);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-oxford_blue-500 text-center">
        Quiz History
      </h1>

      {error && (
        <div className="mb-4 text-red-600 bg-red-50 border border-red-200 p-3 rounded-md text-center">
          {error}
        </div>
      )}

      {/* Loading shimmer */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-2 w-2/3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && (
        <div className="space-y-4">
          {items.length === 0 && !error && (
            <div className="text-gray-500 text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
              No history found.
            </div>
          )}

          {items.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold text-oxford_blue-500">
                    {a.skill?.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Completed on{" "}
                    <span className="font-medium text-gray-700">
                      {new Date(a.completedAt).toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      a.percentage >= 75
                        ? "bg-green-100 text-green-700"
                        : a.percentage >= 50
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {a.percentage}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
