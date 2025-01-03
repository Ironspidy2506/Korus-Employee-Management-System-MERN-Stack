import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { fetchDepartments } from "../../utils/EmployeeHelper";
import Header from "../HeaderFooter/Header";
import Footer from "../HeaderFooter/Footer";
import { useAuth } from "../../context/authContext";

const EditEmployee = () => {
  const { user } = useAuth();
  const { _id } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState({
    employeeId: "",
    name: "",
    email: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    aadharNo: "",
    designation: "",
    department: "",
    password: "",
    role: "",
    pan: "",
    uan: "",
    pfNo: "",
    esiNo: "",
    bankName: "",
    accountNo: "",
  });
  const [empLoading, setEmpLoading] = useState(false);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const getDepartments = async () => {
      const departments = await fetchDepartments();
      setDepartments(departments);
    };

    getDepartments();
  }, []);

  useEffect(() => {
    const fetchEmployee = async () => {
      setEmpLoading(true);
      try {
        const response = await axios.get(
          `https://employee-management-system-backend-objq.onrender.com/api/employees/${_id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (response.data.success) {
          const employeeData = response.data.employee;
          setEmployee({
            ...employeeData,
            department: employeeData.department.departmentId, // Use department ID for the dropdown
          });
        }
      } catch (error) {
        if (error.response && error.response.data.error) {
          alert(error.response.data.error);
        }
      } finally {
        setEmpLoading(false);
      }
    };

    fetchEmployee();
  }, [_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployee((employee) => ({ ...employee, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `https://employee-management-system-backend-objq.onrender.com/api/employees/${_id}`,
        employee,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        navigate(`/${user.role}-dashboard/employees`);
      }
    } catch (error) {
      if (error.response && error.response.data.error) {
        alert(error.response.data.error);
      }
    }
  };

  const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <>
      {empLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          <Header />
          <div className="max-w-full mx-auto p-6 bg-white shadow-md rounded-md mt-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Update Employee
            </h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="employeeId"
                  >
                    Employee ID
                  </label>
                  <input
                    type="text"
                    name="employeeId"
                    id="employeeId"
                    value={employee.employeeId}
                    placeholder="Enter Employee ID"
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="name"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={employee.name}
                    placeholder="Enter Employee Name"
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={employee.email}
                    placeholder="Enter Employee Email"
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="dob"
                  >
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    id="dob"
                    value={employee.dob || ""}
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="gender"
                  >
                    Gender
                  </label>
                  <select
                    name="gender"
                    id="gender"
                    value={employee.gender}
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    required
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="maritalStatus"
                  >
                    Marital Status
                  </label>
                  <select
                    name="maritalStatus"
                    id="maritalStatus"
                    value={employee.maritalStatus}
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    required
                    onChange={handleChange}
                  >
                    <option value="">Select Marital Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="designation"
                  >
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    id="designation"
                    value={employee.designation}
                    placeholder="Enter Designation"
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    required
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="department"
                  >
                    Department
                  </label>
                  <select
                    name="department"
                    id="department"
                    value={employee.department}
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    required
                    onChange={handleChange}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dep) => (
                      <option key={dep._id} value={dep._id}>
                        {dep.departmentName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="qualification"
                  >
                    Qualification
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    id="qualification"
                    value={employee.qualification || ""}
                    placeholder="Enter Qualification"
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="contactNo"
                  >
                    Contact No.
                  </label>
                  <input
                    type="number"
                    name="contactNo"
                    id="contactNo"
                    value={employee.contactNo || ""}
                    placeholder="Enter Contact No."
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="aadharNo"
                  >
                    Aadhar No.
                  </label>
                  <input
                    type="text"
                    name="aadharNo"
                    id="aadharNo"
                    value={employee.aadharNo || ""}
                    placeholder="Enter Aadhar No."
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="pan"
                  >
                    PAN No.
                  </label>
                  <input
                    type="text"
                    name="pan"
                    id="pan"
                    value={employee.pan}
                    placeholder="Enter PAN No."
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>

                {/* New Fields */}
                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="uan"
                  >
                    UAN No.
                  </label>
                  <input
                    type="text"
                    name="uan"
                    id="uan"
                    value={employee.uan}
                    placeholder="Enter UAN No."
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="pfNo"
                  >
                    PF No.
                  </label>
                  <input
                    type="text"
                    name="pfNo"
                    id="pfNo"
                    value={employee.pfNo}
                    placeholder="Enter PF No."
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="esiNo"
                  >
                    ESI No.
                  </label>
                  <input
                    type="text"
                    name="esiNo"
                    id="esiNo"
                    value={employee.esiNo}
                    placeholder="Enter ESI No."
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="bank"
                  >
                    Bank Name
                  </label>
                  <input
                    type="text"
                    name="bank"
                    id="bank"
                    value={employee.bank}
                    placeholder="Enter Bank Name"
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="accountNo"
                  >
                    Account No.
                  </label>
                  <input
                    type="text"
                    name="accountNo"
                    id="accountNo"
                    value={employee.accountNo}
                    placeholder="Enter Account No."
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="role"
                  >
                    Role
                  </label>
                  <select
                    name="role"
                    id="role"
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    required
                    value={capitalizeFirstLetter(employee.role)}
                    onChange={handleChange}
                  >
                    <option value="">Select Role</option>
                    <option value="Admin">Admin</option>
                    <option value="Accounts">Accounts</option>
                    <option value="HR">HR</option>
                    <option value="Employee">Employee</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-gray-700 font-medium mb-2"
                    htmlFor="doj"
                  >
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    name="doj"
                    id="doj"
                    value={employee.doj || ""}
                    className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-300 focus:outline-none"
                    required
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 transition duration-300"
              >
                Update Employee
              </button>
            </form>
          </div>
          <Footer />
        </>
      )}
    </>
  );
};

export default EditEmployee;
