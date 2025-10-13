import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

export default function QuizAttempt() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(location.state?.data);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!data) {
      // if page refreshed and state lost, cannot reconstruct questions; send user back
      navigate("/skills");
    }
  }, [data, navigate]);

  const submit = async () => {
    setError("");
    setSubmitting(true);
    try {
      const payload = {
        attemptId: Number(attemptId),
        answers: Object.entries(answers).map(
          ([questionId, selectedAnswer]) => ({
            questionId: Number(questionId),
            selectedAnswer,
          })
        ),
      };
      const res = await api.post("/quiz/submit", payload);
      navigate(`/results/${attemptId}`, { state: { result: res.data.data } });
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (!data) return null;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-oxford_blue-500">Quiz</h1>
      {error && <div className="mb-3 text-red-600">{error}</div>}
      <div className="space-y-4">
        {data.questions.map((q, idx) => (
          <div key={q.id} className="bg-white p-4 rounded shadow">
            <div className="font-medium mb-2">
              {idx + 1}. {q.questionText}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(q.options).map(([key, val]) => (
                <label
                  key={key}
                  className={`border rounded px-3 py-2 cursor-pointer ${
                    answers[q.id] === key ? "bg-orange_web-500 text-black" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    className="mr-2"
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: key }))
                    }
                  />
                  <span className="font-semibold mr-1">{key})</span>
                  {val}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button
          disabled={submitting}
          className="px-4 py-2 rounded bg-oxford_blue-500 text-white"
          onClick={submit}
        >
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
