import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, fetchProfile } = useAuth();

  useEffect(() => {
    if (!user) fetchProfile();
  }, []);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-semibold mb-4 text-oxford_blue-500">
        Profile
      </h1>
      <div className="bg-white rounded p-4 shadow">
        <div>
          <span className="font-medium">Name:</span> {user.fullName}
        </div>
        <div>
          <span className="font-medium">Email:</span> {user.email}
        </div>
        <div>
          <span className="font-medium">Role:</span> {user.role}
        </div>
      </div>
    </div>
  );
}
