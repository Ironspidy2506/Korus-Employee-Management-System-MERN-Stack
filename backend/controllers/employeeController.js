import path from "path";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import multer from "multer";
import Department from "../models/Department.js";
import Salary from "../models/Salary.js";
import Leave from "../models/Leave.js";
import Allowance from "../models/Allowances.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

const addEmployee = async (req, res) => {
  try {
    const {
      employeeId,
      name,
      email,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      qualification,
      contactNo,
      password,
      role,
      aadharNo,
      pan,
      uan,
      pfNo,
      esiNo,
      bank,
      accountNo,
      doj,
    } = req.body;

    // Check if the email already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        error: "Email already exists",
      });
    }

    // Hash the password before saving
    const hashPassword = await bcrypt.hash(password, 10);

    // Create new User
    const newUser = new User({
      name,
      email,
      password: hashPassword,
      role: role.toLowerCase(),
      profileImage: req.file ? req.file.filename : "",
    });

    const savedUser = await newUser.save();

    // Create new Employee
    const newEmployee = new Employee({
      userId: savedUser._id,
      employeeId,
      name,
      email,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      qualification,
      contactNo,
      aadharNo,
      pan,
      uan,
      pfNo,
      esiNo,
      bank,
      password: hashPassword,
      accountNo,
      doj,
      role: role ? role.toLowerCase() : undefined,
    });

    await newEmployee.save();

    return res.status(200).json({ success: true, message: "Employee Created" });
  } catch (error) {
    console.error("Error in addEmployee:", error); // Log the error for debugging
    return res
      .status(500)
      .json({ success: false, error: "Add Employee Server Error" });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", { password: 0 })
      .populate("department");
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    console.error("Error in getEmployees:", error);
    return res
      .status(500)
      .json({ success: false, error: "Get Employee Server Error" });
  }
};

const getEmployee = async (req, res) => {
  try {
    const { _id } = req.params;
    const employee = await Employee.findById(_id)
      .populate("userId", { password: 0 })
      .populate("department");
    return res.status(200).json({ success: true, employee });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const getEmployeeForSummary = async (req, res) => {
  try {
    const { _id } = req.params;

    const employee = await Employee.findOne({ userId: _id })
      .populate("userId", { password: 0 })
      .populate("department");

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const { _id } = req.params;

    // Destructure all possible fields from req.body
    const {
      name,
      email,
      employeeId,
      dob,
      gender,
      maritalStatus,
      designation,
      department,
      qualification,
      contactNo,
      role,
      aadharNo,
      pan,
      uan,
      pfNo,
      esiNo,
      bank,
      accountNo,
      doj,
      leaveBalance, // Optional: If updating leave balances directly
    } = req.body;

    const profileImage = req.file ? req.file.path : null;

    // Find the employee document by ID
    const employee = await Employee.findById(_id);
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee Not Found" });
    }

    // Find the associated user document
    const user = await User.findById(employee.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User Not Found" });
    }

    // Update the user document
    const updatedUserFields = {
      ...(name && { name }),
      ...(role && { role }),
      ...(profileImage && { profileImage }),
    };

    if (Object.keys(updatedUserFields).length > 0) {
      await User.findByIdAndUpdate(employee.userId, updatedUserFields);
    }

    // Prepare updated fields for the employee document
    const updatedEmployeeFields = {
      ...(name && { name }),
      ...(email && { email }),
      ...(employeeId && { employeeId }),
      ...(dob && { dob }),
      ...(gender && { gender }),
      ...(maritalStatus && { maritalStatus }),
      ...(designation && { designation }),
      ...(department && { department }),
      ...(qualification && { qualification }),
      ...(contactNo && { contactNo }),
      ...(role && { role }),
      ...(aadharNo && { aadharNo }),
      ...(pan && { pan }),
      ...(uan && { uan }),
      ...(pfNo && { pfNo }),
      ...(esiNo && { esiNo }),
      ...(bank && { bank }), // Match frontend "bankName" with backend "bank"
      ...(accountNo && { accountNo }),
      ...(doj && { doj }),
    };

    // If leaveBalance is provided, merge it with the existing leave balance
    if (leaveBalance) {
      updatedEmployeeFields.leaveBalance = {
        el:
          leaveBalance.el !== undefined
            ? leaveBalance.el
            : employee.leaveBalance.el,
        sl:
          leaveBalance.sl !== undefined
            ? leaveBalance.sl
            : employee.leaveBalance.sl,
        cl:
          leaveBalance.cl !== undefined
            ? leaveBalance.cl
            : employee.leaveBalance.cl,
      };
    }

    // Update the employee document
    const updatedEmployee = await Employee.findByIdAndUpdate(
      _id,
      updatedEmployeeFields,
      { new: true } // Return the updated document
    );

    if (!updatedEmployee) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to update employee" });
    }

    return res.status(200).json({
      success: true,
      message: "Employee Updated",
      data: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return res
      .status(500)
      .json({ success: false, error: "Edit Employee Server Error" });
  }
};

const fetchEmployeesByDepId = async (req, res) => {
  try {
    const { _id } = req.params;
    const employees = await Employee.find({ department: _id }).populate(
      "employeeId"
    );
    return res.status(200).json({ success: true, employees });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Get Employees by Department Id Server Error",
    });
  }
};

const getSalaryDetailsOfEmployee = async (req, res) => {
  const { userId } = req.params; // Extract userId from request parameters
  const { paymentMonth, paymentYear } = req.query; // Access from query instead of body

  try {
    // Find employee by userId (adjust query if needed)
    const employee = await Employee.findOne({ userId: userId });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }

    const empId = employee._id;

    // Find the salary record based on employeeId, paymentMonth, and paymentYear
    const salary = await Salary.findOne({
      employeeId: empId,
      paymentMonth,
      paymentYear,
    }).populate("employeeId"); // Optional: populate employee details if needed

    if (!salary) {
      return res.status(404).json({ message: "Salary record not found." });
    }

    // Fetch approved allowances for the same employee, month, and year
    const approvedAllowances = await Allowance.find({
      employeeId: empId,
      allowanceMonth: paymentMonth,
      allowanceYear: paymentYear,
      status: "approved",
    });

    // Combine the default allowances from salary and approved allowances separately
    const defaultAllowances = salary.allowances;
    const approvedAllowancesList = approvedAllowances.map((allowance) => ({
      name: allowance.allowanceType,
      amount: allowance.allowanceAmount,
      voucherNo: allowance.voucherNo,
    }));

    // Return salary details with both default and approved allowances separately
    return res.json({
      grossSalary: salary.grossSalary,
      basicSalary: salary.basicSalary,
      defaultAllowances: defaultAllowances, // Default allowances from salary
      approvedAllowances: approvedAllowancesList, // Approved allowances from the Allowance model
      deductions: salary.deductions,
      paymentMonth: salary.paymentMonth,
      paymentYear: salary.paymentYear,
    });
  } catch (error) {
    console.error("Error fetching salary details:", error);
    return res.status(500).json({ message: "Error fetching salary details." });
  }
};

const getEmployeeLeaves = async (req, res) => {
  const { _id } = req.params;

  try {
    // Fetch leaves for the given employee ID
    const leaves = await Leave.find({ employeeId: _id }).sort({
      startDate: -1,
    }); // Sort by latest start date
    res.status(200).json(leaves);
  } catch (error) {
    console.error("Error fetching leave history:", error);
    res.status(500).json({ error: "Failed to fetch leave history" });
  }
};

const deleteEmployee = async (req, res) => {
  try {
    const { _id } = req.params;

    const employee = await Employee.findOne({ _id });
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    await employee.deleteOne();

    res
      .status(200)
      .json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getEmployeeSummaryForAllowances = async (req, res) => {
  const { employeeId } = req.params;

  try {
    const employee = await Employee.findOne({ employeeId }).populate(
      "department"
    );

    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    return res.status(200).json({ success: true, employee });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server Error" });
  }
};

const updateEmployeeLeaveBalance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { el, cl, sl } = req.body;

    const employee = await Employee.findOne({ employeeId: employeeId });
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, error: "Employee not found" });
    }

    const updatedLeaveBalance = {
      el: el !== undefined ? el : employee.leaveBalance.el,
      cl: cl !== undefined ? cl : employee.leaveBalance.cl,
      sl: sl !== undefined ? sl : employee.leaveBalance.sl,
    };

    employee.leaveBalance = updatedLeaveBalance;

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Leave balance updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Error updating leave balance:", error);
    return res.status(500).json({
      success: false,
      error: "Server error while updating leave balance",
    });
  }
};

export {
  addEmployee,
  upload,
  getEmployees,
  getEmployee,
  updateEmployee,
  fetchEmployeesByDepId,
  getEmployeeForSummary,
  getSalaryDetailsOfEmployee,
  getEmployeeLeaves,
  deleteEmployee,
  getEmployeeSummaryForAllowances,
  updateEmployeeLeaveBalance,
};
