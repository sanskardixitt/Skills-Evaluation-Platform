import { useEffect, useState } from "react";
import api from "../services/api";

export default function History() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/quiz/history?page=1&limit=10");
        setItems(res.data.data.attempts);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load history");
      }
    })();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-oxford_blue-500">
        History
      </h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <div className="space-y-2">
        {items.map((a) => (
          <div
            key={a.id}
            className="bg-white rounded p-3 shadow flex justify-between"
          >
            <div>
              <div className="font-medium">{a.skill?.name}</div>
              <div className="text-sm">
                {a.percentage} • {new Date(a.completedAt).toLocaleString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
