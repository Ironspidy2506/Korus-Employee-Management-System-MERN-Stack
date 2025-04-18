import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import Header from "../HeaderFooter/Header";
import Footer from "../HeaderFooter/Footer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const ratingScale = {
  Failed: 25,
  "Needs Improvement": 50,
  "Adequate/Fair": 75,
  Excellent: 100,
};

const ratingFields = [
  {
    key: "Punctuality",
    label: "Punctuality",
    description: "Reports to work on time.",
  },
  {
    key: "Attendance",
    label: "Attendance",
    description:
      "Regularly attends office and gives prior intimation in case of leave.",
  },
  {
    key: "JobKnowledge",
    label: "Job Knowledge",
    description: "Does work without assistance.",
  },
  {
    key: "HumanRelations",
    label: "Human Relations",
    description: "Helps others when their workload increases.",
  },
  {
    key: "QualityOfWork",
    label: "Quality of Work",
    description: "Does work consistently without errors.",
  },
  {
    key: "Performance",
    label: "Performance",
    description: "Consistently meets schedule.",
  },
  {
    key: "ProfessionalDevelopment",
    label: "Professional Development",
    description: "Seeks keen interest to acquire new skills for upgradation.",
  },
  {
    key: "Dedication",
    label: "Dedication",
    description: "Available to work especially during demanding situations.",
  },
  {
    key: "WorkHabits",
    label: "Work Habits",
    description: "Uses work time appropriately.",
  },
  {
    key: "Initiative",
    label: "Initiative",
    description: "Regularly volunteers for additional tasks and projects.",
  },
];

const AnnualAppraisalForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalRating, setTotalRating] = useState(0);

  const [formData, setFormData] = useState({
    employeeId: "",
    department: "",
    accomplishments: "",
    supervisorComments: "",
    leadIds: [],
  });

  const leads = employees
    .filter((emp) => emp.role === "Lead")
    .sort((a, b) => a.employeeId - b.employeeId);

  const [ratings, setRatings] = useState(
    ratingFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {})
  );

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("https://korus-employee-management-system-mern-stack.vercel.app/api/employees", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setEmployees(response.data.employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to load employees.");
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get("https://korus-employee-management-system-mern-stack.vercel.app/api/department", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setDepartments(response.data.departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("Failed to load departments.");
    }
  };

  const handleEmployeeChange = (selectedOption) => {
    const selectedEmployee = employees.find(
      (emp) => emp._id === selectedOption.value
    );

    if (selectedEmployee) {
      setFormData({
        ...formData,
        employeeId: selectedEmployee._id, // include _id
        department: selectedEmployee.department?._id || "",
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (e) => {
    const { name, value } = e.target;
    setRatings((prevRatings) => {
      const updatedRatings = { ...prevRatings, [name]: value };
      calculateTotalRating(updatedRatings);
      return updatedRatings;
    });
  };

  const calculateTotalRating = (data) => {
    let total = 0;
    let count = 0;

    Object.keys(data).forEach((key) => {
      if (ratingScale[data[key]]) {
        total += ratingScale[data[key]];
        count++;
      }
    });

    setTotalRating(count > 0 ? (total / count).toFixed(2) : 0);
  };

  const getPerformanceMessage = (rating) => {
    if (rating < 65) {
      return { text: "Unsatisfactory", color: "text-red-500" };
    } else if (rating < 70) {
      return { text: "Needs Improvement", color: "text-orange-500" };
    } else if (rating < 85) {
      return { text: "Average", color: "text-yellow-500" };
    } else if (rating < 95) {
      return { text: "Very Good", color: "text-blue-500" };
    } else {
      return { text: "Excellent", color: "text-green-500" };
    }
  };

  const performanceMessage = getPerformanceMessage(totalRating);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      ratings,
      totalRating,
    };

    try {
      const response = await axios.post(
        "https://korus-employee-management-system-mern-stack.vercel.app/api/appraisals/add-appraisal",
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setTimeout(() => {
          navigate(`/${user.role}-dashboard/appraisal`);
        }, 500);
        setFormData({
          employeeName: "",
          department: "",
          accomplishments: "",
          leadId: [],
          supervisorComments: "",
        });
        setRatings(
          ratingFields.reduce((acc, field) => ({ ...acc, [field]: "" }), {})
        );
        setTotalRating(0);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error submitting appraisal:", error);
      toast.error(error.message);
    }
  };

  return (
    <>
      <Header />
      <ToastContainer />
      <div className="mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          Annual Appraisal Form
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee Info */}
          <div className="grid grid-cols-2 gap-4">
            {/* Employee Selection */}
            <div>
              <label className="text-lg font-semibold text-gray-700 capitalize mb-1 block">
                Employee
              </label>
              <Select
                options={employees
                  .sort((a, b) => a.employeeId - b.employeeId)
                  .map((employee) => ({
                    value: employee._id,
                    label: `${employee.employeeId} - ${employee.name}`,
                  }))}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select Employee"
                onChange={handleEmployeeChange}
              />
            </div>

            {/* Department Selection (Auto-updated) */}
            <div>
              <label className="text-lg font-semibold text-gray-700 capitalize mb-1 block">
                Department
              </label>
              <Select
                options={departments.map((dep) => ({
                  value: dep._id,
                  label: `${dep.departmentId} ${dep.departmentName}`,
                }))}
                value={
                  departments.find((dep) => dep._id === formData.department)
                    ? {
                        value: formData.department,
                        label: departments.find(
                          (dep) => dep._id === formData.department
                        )?.departmentName,
                      }
                    : null
                }
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select Department"
                isDisabled={true} // Department auto-filled
              />
            </div>
          </div>

          <div>
            <label className="text-lg font-semibold text-gray-700 capitalize mb-1 block">
              Supervisor
            </label>
            <Select
              options={leads.map((lead) => ({
                value: lead._id,
                label: `${lead.employeeId} - ${lead.name}`,
              }))}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select Lead(s)"
              isMulti
              onChange={(selectedOptions) =>
                setFormData({
                  ...formData,
                  leadIds: selectedOptions.map((opt) => opt.value),
                })
              }
              value={leads
                .filter((lead) => formData.leadIds.includes(lead._id))
                .map((lead) => ({
                  value: lead._id,
                  label: `${lead.employeeId} - ${lead.name}`,
                }))}
            />
          </div>

          <div>
            <label className="text-lg font-semibold text-gray-700 capitalize mb-1 block">
              Supervisor Comments
            </label>
            <textarea
              name="supervisorComments"
              placeholder="Supervisor Comments"
              value={formData.supervisorComments}
              onChange={handleChange}
              className="p-2 border rounded w-full h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Accomplishments */}
          <div>
            <label className="text-lg font-semibold text-gray-700 capitalize mb-1 block">
              Accomplishments
            </label>
            <textarea
              name="accomplishments"
              placeholder="Accomplishments of Position Duties"
              value={formData.accomplishments}
              onChange={handleChange}
              className="p-2 border rounded w-full h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ratings Section */}
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Performance Ratings
          </h3>
          {ratingFields.map(({ key, label, description }) => (
            <div key={key} className="p-4 bg-gray-100 rounded-lg shadow">
              <label className="text-lg font-semibold text-gray-700 capitalize">
                {label}:
              </label>
              <p className="text-sm text-gray-600 mt-1">{description}</p>
              <div className="flex gap-4 mt-2">
                {[
                  "Failed",
                  "Needs Improvement",
                  "Adequate/Fair",
                  "Excellent",
                ].map((rating) => (
                  <label
                    key={rating}
                    className="flex items-center gap-2 bg-gray-200 px-3 py-2 rounded-lg shadow cursor-pointer hover:bg-gray-300 transition"
                  >
                    <input
                      type="radio"
                      name={key}
                      value={rating}
                      checked={ratings[key] === rating}
                      onChange={handleRatingChange}
                      className="w-5 h-5 accent-blue-500 cursor-pointer"
                    />
                    <span className="text-gray-800">{rating}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Display Total Rating */}
          <div className="text-center text-xl font-extrabold mt-4">
            Total Rating Score:{" "}
            <span className="text-blue-500">{totalRating}/100</span>
            <p
              className={`mt-2 text-lg font-semibold ${performanceMessage.color}`}
            >
              ({performanceMessage.text})
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center items-center">
            <button
              type="submit"
              className="max-w-sm w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Submit Appraisal
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default AnnualAppraisalForm;
