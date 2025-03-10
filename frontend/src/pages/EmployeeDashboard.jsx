import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/authContext.jsx";
import EmployeeSidebar from "../components/employee-dashboard/EmployeeSidebar.jsx";
import EmployeeNavbar from "../components/employee-dashboard/EmployeeNavbar.jsx";
import { Outlet } from "react-router-dom";

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Ref for sidebar to detect outside clicks
  const sidebarRef = useRef(null);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    // Function to handle outside clicks
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest(".hamburger-btn")
      ) {
        setIsSidebarOpen(false);
      }
    };

    // Add event listener for outside clicks
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <EmployeeSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        sidebarRef={sidebarRef}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-0 lg:ml-64">
        {/* Navbar */}
        <EmployeeNavbar user={user} toggleSidebar={toggleSidebar} />

        {/* Dashboard Content */}
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome to the Employee Dashboard, {user?.name || "User"}!
          </h1>

          <Outlet />
          {/* Add any other relevant content or components here */}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
