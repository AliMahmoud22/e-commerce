import React from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  ArrowLeftIcon,
  UserIcon,
  ShoppingBagIcon,
  StarIcon,
  CubeIcon,
} from "@heroicons/react/24/outline";
import Header from "../../components/Header";

const sections = [
  {
    name: "Users",
    icon: <UserIcon className="h-8 w-8 text-blue-500" />,
    path: "/admin/users",
    color: "bg-blue-100 hover:bg-primary-200",
  },
  {
    name: "Orders",
    icon: <ShoppingBagIcon className="h-8 w-8 text-green-500" />,
    path: "/admin/orders",
    color: "bg-dark hover:bg-dark-200 text-white",
  },
  {
    name: "Reviews",
    icon: <StarIcon className="h-8 w-8 text-yellow-500" />,
    path: "/admin/reviews",
    color: "bg-yellow-100 hover:bg-yellow-200",
  },
  {
    name: "Products",
    icon: <CubeIcon className="h-8 w-8 text-purple-500" />,
    path: "/admin/products",
    color: "bg-purple-100 hover:bg-purple-200",
  },
];

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Show dashboard only on /admin, otherwise show nested page
  const isDashboard = location.pathname === "/admin";

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeftIcon className="h-6 w-6 mr-2" />
            Back
          </button>
          <h1 className="text-2xl px-4 font-bold ml-10">Admin Dashboard</h1>
        </div>
        {isDashboard ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
            {sections.map((section) => (
              <div
                key={section.name}
                onClick={() => navigate(section.path)}
                className={`cursor-pointer rounded-xl shadow-md p-10 flex flex-col items-center transition ${section.color}`}
              >
                {section.icon}
                <span className="mt-4 text-lg font-semibold">
                  {section.name}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </>
  );
}
