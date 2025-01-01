import React, { useState, useEffect } from "react";
import {
  fetchDepartments,
  fetchEmployees,
  addSalaries,
} from "../../utils/SalaryHelper";
import Footer from "../HeaderFooter/Footer";
import Header from "../HeaderFooter/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const AddSalary = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [grossSalary, setGrossSalary] = useState("");
  const [paymentMonth, setPaymentMonth] = useState("");
  const [paymentYear, setPaymentYear] = useState("");
  const [allowances, setAllowances] = useState([
    { name: "HRA", amount: 0 },
    { name: "Food Allowance", amount: 0 },
    { name: "Medical Allowance", amount: 0 },
    { name: "Transport Allowance", amount: 0 },
  ]);
  const [deductions, setDeductions] = useState([
    { name: "EPF", amount: 0 },
    { name: "ESI", amount: 0 },
    { name: "Advance Deduction", amount: 0 },
    { name: "Tax Deduction", amount: 0 },
  ]);
  const [basicSalary, setBasicSalary] = useState(0);

  useEffect(() => {
    const getDepartments = async () => {
      const departments = await fetchDepartments();
      setDepartments(departments);
    };

    getDepartments();
  }, []);

  useEffect(() => {
    if (grossSalary) {
      const basic = (grossSalary * 0.45).toFixed(2);
      setBasicSalary(basic);

      const updatedAllowances = [
        { name: "HRA", amount: (grossSalary * 0.27).toFixed(2) },
        { name: "Food Allowance", amount: (grossSalary * 0.1).toFixed(2) },
        { name: "Medical Allowance", amount: (grossSalary * 0.08).toFixed(2) },
        { name: "Transport Allowance", amount: (grossSalary * 0.1).toFixed(2) },
      ];
      setAllowances(updatedAllowances);

      const updatedDeductions = [
        { name: "EPF", amount: (basic * 0.12).toFixed(2) },
        { name: "ESI", amount: (grossSalary * 0.0075).toFixed(2) },
        { name: "Advance Deduction", amount: 0 },
        { name: "Tax Deduction", amount: 0 },
      ];
      setDeductions(updatedDeductions);
    }
  }, [grossSalary]);

  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;
    setSelectedDepartment(departmentId);
    const employees = await fetchEmployees(departmentId);
    setEmployees(employees);
  };

  const addField = (type) => {
    const target = type === "allowances" ? [...allowances] : [...deductions];
    target.push({ name: "", amount: "" });
    type === "allowances" ? setAllowances(target) : setDeductions(target);
  };

  const removeField = (index, type) => {
    const target = type === "allowances" ? [...allowances] : [...deductions];
    target.splice(index, 1);
    type === "allowances" ? setAllowances(target) : setDeductions(target);
  };

  const handleFieldChange = (index, type, field, value) => {
    const target = type === "allowances" ? [...allowances] : [...deductions];
    target[index][field] = value;
    type === "allowances" ? setAllowances(target) : setDeductions(target);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      employeeId: selectedEmployee,
      grossSalary,
      basicSalary,
      paymentMonth,
      paymentYear, // Combine month and year
      allowances,
      deductions,
    };

    try {
      const result = await addSalaries(payload);
      navigate(`/${user.role}-dashboard/salary`);
    } catch (error) {
      console.error("Error submitting salary:", error);
      alert("Error adding salary.");
    }
  };

  // Find the selected employee's name based on the selectedEmployee ID
  const selectedEmployeeDetails = employees.find(
    (emp) => emp._id === selectedEmployee
  );

  const currentYear = new Date().getFullYear() - 1;
  const years = Array.from({ length: 21 }, (_, i) => currentYear + i); // Generate years from current year to 20 years ahead

  // List of month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl p-6 space-y-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-center text-2xl font-bold">
            Enter Salary Details
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Department Selection */}
            <div>
              <label className="block font-medium mb-2">Department</label>
              <select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.departmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Selection */}
            <div>
              <label className="block font-medium mb-2">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                disabled={!selectedDepartment}
              >
                <option value="">Select Employee By Id</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.employeeId}
                  </option>
                ))}
              </select>

              {/* Display selected employee name below the dropdown */}
              {selectedEmployee && selectedEmployeeDetails && (
                <input
                  type="text"
                  value={`Employee Name: ${selectedEmployeeDetails.name}`}
                  readOnly
                  className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                />
              )}
            </div>

            {/* Payment Month and Year (Separate Fields) */}
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block font-medium mb-2">Payment Month</label>
                <select
                  value={paymentMonth}
                  onChange={(e) => setPaymentMonth(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                  required
                >
                  <option value="">Select Month</option>
                  {months.map((month, index) => (
                    <option key={index} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-1/2">
                <label className="block font-medium mb-2">Payment Year</label>
                <select
                  value={paymentYear}
                  onChange={(e) => setPaymentYear(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                  required
                >
                  <option value="">Select Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Gross Salary */}
            <div>
              <label className="block font-medium mb-2">Gross Salary</label>
              <input
                type="number"
                value={grossSalary}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setGrossSalary(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                placeholder="Enter gross salary"
                required
              />
            </div>

            {/* Basic Salary (Readonly) */}
            <div>
              <label className="block font-medium mb-2">Basic Salary</label>
              <input
                type="number"
                value={basicSalary}
                onWheel={(e) => e.target.blur()}
                readOnly
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
              />
            </div>

            {/* Allowances */}
            <div>
              <label className="block font-medium mb-2">Allowances</label>
              {allowances.map((allowance, index) => (
                <div key={index} className="flex items-center space-x-4 mb-2">
                  <input
                    type="text"
                    value={allowance.name}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "allowances",
                        "name",
                        e.target.value
                      )
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Allowance Name"
                  />
                  <input
                    type="number"
                    value={allowance.amount}
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "allowances",
                        "amount",
                        e.target.value
                      )
                    }
                    className="w-32 px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Amount"
                  />
                  <button
                    type="button"
                    onClick={() => removeField(index, "allowances")}
                    className="px-2 py-1 bg-red-500 text-white rounded-md"
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField("allowances")}
                className="px-4 py-2 bg-blue-500 text-white rounded-md mt-2"
              >
                Add Allowance
              </button>
            </div>

            {/* Deductions */}
            <div>
              <label className="block font-medium mb-2">Deductions</label>
              {deductions.map((deduction, index) => (
                <div key={index} className="flex items-center space-x-4 mb-2">
                  <input
                    type="text"
                    value={deduction.name}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "deductions",
                        "name",
                        e.target.value
                      )
                    }
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Deduction Name"
                  />
                  <input
                    type="number"
                    value={deduction.amount}
                    onWheel={(e) => e.target.blur()}
                    onChange={(e) =>
                      handleFieldChange(
                        index,
                        "deductions",
                        "amount",
                        e.target.value
                      )
                    }
                    className="w-32 px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="Amount"
                  />
                  <button
                    type="button"
                    onClick={() => removeField(index, "deductions")}
                    className="px-2 py-1 bg-red-500 text-white rounded-md"
                  >
                    Delete
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField("deductions")}
                className="px-4 py-2 bg-blue-500 text-white rounded-md mt-2"
              >
                Add Deduction
              </button>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="w-full px-6 py-2 bg-green-500 text-white rounded-md"
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AddSalary;
