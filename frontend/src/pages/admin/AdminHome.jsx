import { Link } from "react-router-dom";

export default function AdminHome() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4 text-oxford_blue-500">
        Admin
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/admin/skills" className="bg-white rounded p-4 shadow">
          Manage Skills
        </Link>
        <Link to="/admin/questions" className="bg-white rounded p-4 shadow">
          Manage Questions
        </Link>
      </div>
    </div>
  );
}
