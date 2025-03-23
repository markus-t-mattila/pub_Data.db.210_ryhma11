import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="bg-gray-100 min-h-screen flex justify-center items-center p-4">
      <Outlet />
    </div>
  );
}
