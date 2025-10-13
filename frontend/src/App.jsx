import { Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Skills from "./pages/Skills.jsx";
import QuizStart from "./pages/QuizStart.jsx";
import QuizAttempt from "./pages/QuizAttempt.jsx";
import Results from "./pages/Results.jsx";
import History from "./pages/History.jsx";
import Profile from "./pages/Profile.jsx";
import AdminHome from "./pages/admin/AdminHome.jsx";
import AdminSkills from "./pages/admin/AdminSkills.jsx";
import AdminQuestions from "./pages/admin/AdminQuestions.jsx";

function PrivateRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  const { token, logout } = useAuth();
  const { user } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="bg-oxford_blue-500 text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="font-semibold">
            Skill Portal
          </Link>
          <nav className="flex gap-3 text-sm">
            {token && <Link to="/skills">Skills</Link>}
            {token && <Link to="/history">History</Link>}
            {token && <Link to="/profile">Profile</Link>}
            {token && user?.role === "ADMIN" && <Link to="/admin">Admin</Link>}
          </nav>
          <div className="ml-auto">
            {!token ? (
              <div className="flex gap-2">
                <Link
                  className="px-3 py-1 rounded bg-orange_web-500 text-black"
                  to="/login"
                >
                  Login
                </Link>
                <Link
                  className="px-3 py-1 rounded bg-platinum-500 text-black"
                  to="/register"
                >
                  Register
                </Link>
              </div>
            ) : (
              <button
                className="px-3 py-1 rounded bg-orange_web-500 text-black"
                onClick={logout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/skills" />} />
          <Route
            path="/skills"
            element={
              <PrivateRoute>
                <Skills />
              </PrivateRoute>
            }
          />
          <Route
            path="/quiz/start/:skillId"
            element={
              <PrivateRoute>
                <QuizStart />
              </PrivateRoute>
            }
          />
          <Route
            path="/quiz/attempt/:attemptId"
            element={
              <PrivateRoute>
                <QuizAttempt />
              </PrivateRoute>
            }
          />
          <Route
            path="/results/:attemptId"
            element={
              <PrivateRoute>
                <Results />
              </PrivateRoute>
            }
          />
          <Route
            path="/history"
            element={
              <PrivateRoute>
                <History />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                {user?.role === "ADMIN" ? <AdminHome /> : <Navigate to="/" />}
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/skills"
            element={
              <PrivateRoute>
                {user?.role === "ADMIN" ? <AdminSkills /> : <Navigate to="/" />}
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <PrivateRoute>
                {user?.role === "ADMIN" ? (
                  <AdminQuestions />
                ) : (
                  <Navigate to="/" />
                )}
              </PrivateRoute>
            }
          />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}
