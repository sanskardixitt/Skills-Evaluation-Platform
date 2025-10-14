import { useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, fetchProfile } = useAuth();

  useEffect(() => {
    if (!user) fetchProfile();
  }, []);

  if (!user)
    return (
      <div className="flex justify-center items-center h-64 text-gray-500 text-lg">
        Loading...
      </div>
    );

  return (
    <div className="max-w-md mx-auto mt-12 bg-gray-50 rounded-xl shadow-md p-6">
      <h1 className="text-3xl font-bold mb-6 text-oxford_blue-500 text-center">
        Profile
      </h1>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col gap-4">
          <div>
            <span className="block text-sm font-semibold text-gray-500 uppercase">
              Name
            </span>
            <p className="text-lg text-gray-800">{user.fullName}</p>
          </div>

          <div>
            <span className="block text-sm font-semibold text-gray-500 uppercase">
              Email
            </span>
            <p className="text-lg text-gray-800">{user.email}</p>
          </div>

          <div>
            <span className="block text-sm font-semibold text-gray-500 uppercase">
              Role
            </span>
            <p className="text-lg text-gray-800 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
