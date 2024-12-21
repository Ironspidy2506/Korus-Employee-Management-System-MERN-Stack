import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext"; // Assuming this provides the logged-in user's data
import axios from "axios";
import { Link } from "react-router-dom";

const ViewEmployeeAllowance = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Assuming this provides the logged-in user's data
  const [allowanceHistory, setAllowanceHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "" });

  // Fetch allowance history data
  useEffect(() => {
    const fetchAllowanceData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/allowances/history/${user._id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAllowanceHistory(response.data);
        setFilteredHistory(response.data);
      } catch (error) {
        console.error("Error fetching allowance data:", error);
      }
    };
    fetchAllowanceData();
  }, [user._id]);

  // Handle project number search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value) {
      const filtered = allowanceHistory.filter((allowance) =>
        allowance.projectNo.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(allowanceHistory);
    }
  };

  // Sorting function
  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });

    const sortedData = [...filteredHistory].sort((a, b) => {
      if (key === "startDate" || key === "endDate") {
        const dateA = new Date(a[key]);
        const dateB = new Date(b[key]);
        return direction === "ascending" ? dateA - dateB : dateB - dateA;
      }
      return 0;
    });
    setFilteredHistory(sortedData);
  };

  // Get status color helper
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "text-yellow-500";
      case "approved":
        return "text-green-500";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0"); // Ensure two digits
    const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleDelete = async (_id) => {
    // Confirm deletion action
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/allowances/delete/${_id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 200) {
        // Update UI by removing the deleted allowance from the filtered history
        setFilteredHistory((prevAllowances) =>
          prevAllowances.filter((allowance) => allowance._id !== _id)
        );
      }
    } catch (err) {
      console.error("Error deleting allowance:", err);
      alert("There was an error deleting the allowance.");
    }
  };

  return (
    <div className="p-6 space-y-6 bg-white">
      {/* Allowance History Section */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-sm shadow-md p-5">
        <input
          type="search"
          placeholder="Search Department"
          className="w-full md:w-auto flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={handleSearch}
        />
        <Link
          to="/employee-dashboard/allowances/add"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          Add New Allowance
        </Link>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <h2 className="text-2xl font-bold mb-4">Allowance History</h2>
        <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
          <thead className="bg-gray-200 border-b">
            <tr>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                S. No.
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                Project No.
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                Allowance Type
              </th>
              <th
                className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort("startDate")}
              >
                Start Date
                {sortConfig.key === "startDate" &&
                  (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
              </th>
              <th
                className="px-4 py-2 text-center text-sm font-medium text-gray-700 cursor-pointer"
                onClick={() => handleSort("endDate")}
              >
                End Date
                {sortConfig.key === "endDate" &&
                  (sortConfig.direction === "ascending" ? " ▲" : " ▼")}
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                Location
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                Total Allowances
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                Status
              </th>
              <th className="px-4 py-2 text-center text-sm font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.map((allowance, index) => (
              <tr key={allowance._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-center text-sm text-gray-800">
                  {index + 1}
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-800">
                  {allowance.projectNo}
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-800 capitalize">
                  {allowance.allowanceType}
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-800">
                  {formatDate(allowance.startDate)}
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-800">
                  {formatDate(allowance.endDate)}
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-800">
                  {allowance.placeOfVisit} {/* Location column */}
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-800">
                  {allowance.allowances.reduce(
                    (sum, item) => sum + item.amount,
                    0
                  )}
                </td>
                <td
                  className={`px-4 py-2 text-center text-sm font-semibold ${getStatusColor(
                    allowance.status
                  )}`}
                >
                  {allowance.status.charAt(0).toUpperCase() +
                    allowance.status.slice(1)}
                </td>
                <td className="px-4 py-2 text-center text-sm text-gray-800 space-x-2">
                  {allowance.status !== "approved" &&
                  allowance.status !== "rejected" ? (
                    <>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/employee-dashboard/allowances/edit/${allowance._id}`
                            )
                          }
                          className="px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 w-full sm:w-auto"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(allowance._id)}
                          className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 w-full sm:w-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewEmployeeAllowance;