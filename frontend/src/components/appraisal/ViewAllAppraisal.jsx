import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../../context/authContext";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const ViewAllAppraisal = () => {
  const { user } = useAuth();
  const [appraisals, setAppraisals] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [searchEmployeeId, setSearchEmployeeId] = useState("");
  const navigate = useNavigate();

  const handleDownloadExcel = () => {
    const worksheetData = filteredAppraisals.map((item) => ({
      "Employee ID": item.employeeId?.employeeId || "",
      "Employee Name": item.employeeId?.name || "",
      Department: item.department?.departmentName || "",
      Supervisor: Array.isArray(item.supervisor)
        ? item.supervisor.map((s) => s.name).join(", ")
        : "N/A",
      "Total Rating": `${item.totalRating}/100`,
      "Added Date": formatDate(item.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Appraisals");
    XLSX.writeFile(workbook, "All_Appraisals.xlsx");
  };

  useEffect(() => {
    const fetchAppraisals = async () => {
      try {
        const { data } = await axios.get(
          "https://korus-employee-management-system-mern-stack.vercel.app/api/appraisals/view-all-appraisals",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (data.success) {
          setAppraisals(data.appraisals);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Failed to fetch appraisals");
      }
    };

    fetchAppraisals();
  }, []);

  const handleEdit = (id) => {
    navigate(`/${user.role === "Lead" ? 'employee' : user.role}-dashboard/appraisal/edit-appraisal/${id}`);
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(
        `https://korus-employee-management-system-mern-stack.vercel.app/api/appraisals/delete-appraisal/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (data.success) {
        toast.success(data.message);
        setAppraisals((prev) =>
          prev.filter((appraisal) => appraisal._id !== id)
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    return `${year - 1}-${year}`;
  };

  const latestYear =
    appraisals.length > 0
      ? Math.max(
        ...appraisals.map((item) => new Date(item.createdAt).getFullYear())
      )
      : new Date().getFullYear();

  const years = Array.from({ length: 5 }, (_, i) => latestYear + i);

  const filteredAppraisals = appraisals.filter((item) => {
    const yearMatch =
      selectedYear === "All" ||
      new Date(item.createdAt).getFullYear().toString() === selectedYear;

    const idMatch = item.employeeId?.employeeId
      ?.toString()
      .includes(searchEmployeeId);

    return yearMatch && idMatch;
  });


  return (
    <>
      <ToastContainer />
      <div className="mx-auto p-6 bg-white shadow-lg rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">All Appraisals</h2>
          <div className="flex gap-1">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              onClick={() =>
                navigate(`/${user.role === "Lead" ? 'employee' : user.role}-dashboard/appraisal/add-appraisal`)
              }
            >
              <FaPlus /> Add Appraisal
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              onClick={handleDownloadExcel}
            >
              Download Excel
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-4 gap-2">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="All">All Years</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search by Employee ID"
            value={searchEmployeeId}
            onChange={(e) => setSearchEmployeeId(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>


        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
              <tr>
                <th className="px-6 py-3 text-center text-sm font-semibold tracking-wider">
                  S. No.
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold tracking-wider">
                  Employee ID
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold tracking-wider">
                  Employee Name
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold tracking-wider">
                  Supervisor
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold tracking-wider">
                  Total Rating
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold tracking-wider">
                  Appraisal Year
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAppraisals.length > 0 ? (
                filteredAppraisals.map((appraisal, index) => (
                  <tr
                    key={appraisal._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-center text-gray-800 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-800 font-medium">
                      {appraisal.employeeId?.employeeId}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-800 font-medium">
                      {appraisal.employeeId?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">
                      {appraisal.department?.departmentName}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-700">
                      {Array.isArray(appraisal.supervisor) &&
                        appraisal.supervisor.length > 0
                        ? appraisal.supervisor.map((sup, index) => (
                          <div key={sup._id || index}>{sup.name}</div>
                        ))
                        : "N/A"}
                    </td>

                    <td className="px-6 py-4 font-semibold text-center text-blue-600 text-sm">
                      {appraisal.totalRating}/100
                    </td>
                    <td className="px-6 py-4 font-semibold text-center text-blue-600 text-sm">
                      {formatDate(appraisal.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-3">
                        <button
                          className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
                          onClick={() =>
                            navigate(
                              `/${user.role === "Lead" ? 'employee' : user.role}-dashboard/appraisal/view-appraisal/${appraisal._id}`
                            )
                          }
                        >
                          <FaEye />
                        </button>
                        <button
                          className="p-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition"
                          onClick={() => handleEdit(appraisal._id)}
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                          onClick={() => handleDelete(appraisal._id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center px-6 py-4 text-gray-500"
                  >
                    No appraisals found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ViewAllAppraisal;
