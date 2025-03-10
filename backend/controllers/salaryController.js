import Salary from "../models/Salary.js";
import Employee from "../models/Employee.js";

export const addSalary = async (req, res) => {
  try {
    const {
      employeeId,
      employeeType,
      grossSalary,
      basicSalary,
      payableDays,
      sundays,
      netPayableDays,
      allowances,
      deductions,
      paymentMonth,
      paymentYear,
    } = req.body;

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res
        .status(400)
        .json({ success: false, message: "Employee not found" });
    }

    const salary = await Salary.findOne({
      employeeId,
      paymentMonth,
      paymentYear,
    });

    if (salary) {
      return res.json({
        success: false,
        message: "Salary Details Already Available!",
      });
    }

    const newSalary = new Salary({
      employeeId,
      employeeType,
      grossSalary,
      basicSalary,
      payableDays,
      sundays,
      netPayableDays,
      allowances,
      deductions,
      paymentMonth,
      paymentYear,
    });

    await newSalary.save();

    res
      .status(201)
      .json({ success: true, message: "Salary Added Successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSalaryDetails = async (req, res) => {
  try {
    const { _id } = req.params; // Get employeeId from URL
    const { paymentMonth, paymentYear } = req.query; // Access from query instead of body
    const salary = await Salary.findOne({
      employeeId: _id,
      paymentMonth,
      paymentYear,
    }).populate("employeeId"); // Optional: populate employee details if needed

    if (!salary) {
      return res.status(404).json({ message: "Salary Details not found!" });
    }

    return res.json({ salary });
  } catch (error) {
    console.error("Error fetching salary details:", error);
    return res.status(500).json({ message: "Error fetching salary details." });
  }
};

// Update salary details for a specific employee
export const updateSalary = async (req, res) => {
  try {
    const { _id } = req.params; // Now we get employeeId from URL
    const {
      employeeType,
      grossSalary,
      basicSalary,
      payableDays,
      sundays,
      netPayableDays,
      paymentMonth,
      paymentYear,
      allowances,
      deductions,
    } = req.body;
    // Find the salary document for the given employeeId
    const salary = await Salary.findOne({
      employeeId: _id,
      paymentMonth,
      paymentYear,
    });

    if (!salary) {
      return res.status(404).json({ message: "Salary details not found" });
    }

    // Update the salary details
    if (employeeType !== undefined) salary.employeeType = employeeType;
    if (grossSalary !== undefined) salary.grossSalary = grossSalary;
    if (basicSalary !== undefined) salary.basicSalary = basicSalary;
    if (payableDays !== undefined) salary.payableDays = payableDays;
    if (sundays !== undefined) salary.sundays = sundays;
    if (netPayableDays !== undefined) salary.netPayableDays = netPayableDays;
    if (paymentMonth !== undefined) salary.paymentMonth = paymentMonth;
    if (paymentYear !== undefined) salary.paymentYear = paymentYear;
    if (allowances !== undefined) salary.allowances = allowances;
    if (deductions !== undefined) salary.deductions = deductions;
    // Save the updated salary
    await salary.save();

    res.json({ message: "Salary updated successfully", salary });
  } catch (error) {
    console.error("Error updating salary:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMonthWiseSalaries = async (req, res) => {
  try {
    const { month, year } = req.params;

    const salaries = await Salary.find({
      paymentMonth: month,
      paymentYear: year,
    }).populate("employeeId");

    res.status(200).json(salaries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch salaries", error });
  }
};

export const getEmployeeWiseSalaryDetails = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findOne({employeeId});
    if(!employee) {
      return res.json({success: false, message: "Employee not found"})
    }

    const empId = employee._id;

    const salary = await Salary.find({ employeeId: empId }).populate(
      "employeeId"
    );

    if (!salary) {
      return res.status(404).json({ message: "Salary details not found" });
    }

    res.status(200).json(salary);
  } catch (error) {
    console.error("Error fetching salary details:", error);
    res.status(500).json({ message: "Fetch Salary Server error" });
  }
};

export const getEmployeeSalaryDetails = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const salary = await Salary.find({ employeeId: employeeId }).populate(
      "employeeId"
    );

    if (!salary) {
      return res.status(404).json({ message: "Salary details not found" });
    }

    res.status(200).json(salary);
  } catch (error) {
    console.error("Error fetching salary details:", error);
    res.status(500).json({ message: "Fetch Salary Server error" });
  }
};
