import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ email, password, fullName });
      navigate("/skills");
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white rounded-lg p-6 shadow">
      <h1 className="text-xl font-semibold mb-4 text-oxford_blue-500">
        Create account
      </h1>
      {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full bg-orange_web-500 text-black rounded py-2"
        >
          {loading ? "Creating..." : "Create account"}
        </button>
      </form>
      <div className="mt-3 text-sm">
        Have an account?{" "}
        <Link className="text-oxford_blue-600 underline" to="/login">
          Login
        </Link>
      </div>
    </div>
  );
}
