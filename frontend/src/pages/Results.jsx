import { useLocation, useParams } from "react-router-dom";

export default function Results() {
  const { attemptId } = useParams();
  const location = useLocation();
  const result = location.state?.result;

  if (!result)
    return (
      <div className="text-sm">
        No result data. Go to history to view past attempts.
      </div>
    );

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold mb-4 text-oxford_blue-500">
        Results
      </h1>
      <div className="bg-white rounded p-4 shadow">
        <div>Attempt #{attemptId}</div>
        <div>Skill: {result.skill?.name}</div>
        <div>Total: {result.totalQuestions}</div>
        <div>Correct: {result.correctAnswers}</div>
        <div>Score: {result.percentage}</div>
        <div>Status: {result.passed ? "Passed" : "Failed"}</div>
      </div>
    </div>
  );
}
