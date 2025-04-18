import Allowance from "../models/Allowances.js";
import Employee from "../models/Employee.js";

const addAllowance = async (req, res) => {
  try {
    const { userId } = req.params;
    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const {
      allowanceMonth,
      allowanceYear,
      allowanceType,
      client,
      projectNo,
      allowanceAmount,
    } = req.body;

    const empId = employee._id;

    // Check if an allowance exists with the same employeeId, month, year, and type
    const existingAllowance = await Allowance.findOne({
      employeeId: empId,
      allowanceMonth,
      allowanceYear,
      client,
      projectNo,
      allowanceType,
      status: "pending",
    });

    if (existingAllowance) {
      // Update the specific allowance type's amount
      existingAllowance[allowanceAmount] += allowanceAmount;

      await existingAllowance.save();

      return res.status(200).json({
        message: "Allowance updated successfully",
        allowance: existingAllowance,
      });
    }

    // If not found, create a new allowance entry
    const newAllowance = new Allowance({
      employeeId: empId,
      client,
      projectNo,
      allowanceMonth,
      allowanceYear,
      allowanceType,
      allowanceAmount,
    });

    await newAllowance.save();

    res.status(201).json({
      message: "Allowance created successfully",
      allowance: newAllowance,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const addAllowanceAdmin = async (req, res) => {
  try {
    const { employeeId } = req.params;

    // Find the employee by employeeId
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const {
      allowanceMonth,
      allowanceYear,
      allowanceType,
      client,
      projectNo,
      allowanceAmount,
    } = req.body;

    // Check if an allowance already exists with the same details (excluding amount)
    const existingAllowance = await Allowance.findOne({
      employeeId: employee._id,
      client,
      projectNo,
      allowanceMonth,
      allowanceYear,
      allowanceType,
    });

    if (existingAllowance) {
      // Update the existing allowance by adding the new amount
      existingAllowance.allowanceAmount += parseFloat(allowanceAmount);
      await existingAllowance.save();

      return res.status(200).json({
        message: "Allowance updated successfully",
        allowance: existingAllowance,
      });
    }

    // If no existing allowance, create a new one
    const newAllowance = new Allowance({
      employeeId: employee._id,
      client,
      projectNo,
      allowanceMonth,
      allowanceYear,
      allowanceType,
      allowanceAmount,
      status: "approved",
    });

    await newAllowance.save();

    res.status(201).json({
      message: "Allowance created successfully",
      allowance: newAllowance,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

const getUserAllowance = async (req, res) => {
  try {
    const { userId } = req.params;
    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const allowances = await Allowance.find({ employeeId: employee._id });
    if (!allowances) {
      return res.status(404).json({ message: "No allowance history found" });
    }

    res.status(200).json(allowances); // Return the allowance data
  } catch (err) {
    console.error("Error fetching allowance history:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAllAllowance = async (req, res) => {
  try {
    const allowances = await Allowance.find()
      .populate("employeeId")
      .sort({ startDate: -1 });

    if (!allowances || allowances.length === 0) {
      return res.status(404).json({ message: "No allowances found" });
    }

    return res.status(200).json(allowances);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const approveOrReject = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, voucherNo } = req.body;
    const updatedAllowance = await Allowance.findByIdAndUpdate(
      id,
      { status, voucherNo },
      { new: true }
    );
    res.json(updatedAllowance);
  } catch (error) {
    res.status(500).json({ message: "Error updating allowance", error });
  }
};

const getAllowanceById = async (req, res) => {
  try {
    const { _id } = req.params;
    const allowance = await Allowance.findById(_id).populate("employeeId");
    if (!allowance) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found" });
    }

    res.status(200).json({
      success: true,
      allowance: allowance,
    });
    return allowance;
  } catch (error) {
    res.status(500).json({ message: "Error updating allowance", error });
  }
};

const updateAllowance = async (req, res) => {
  try {
    // Destructure the updated form data from the request body
    const { _id } = req.params;
    const {
      allowanceMonth,
      allowanceYear,
      allowanceType,
      client,
      projectNo,
      allowanceAmount,
    } = req.body;

    // Find the allowance record and update it
    const allowance = await Allowance.findByIdAndUpdate(
      _id,
      {
        allowanceMonth,
        allowanceYear,
        allowanceType,
        client,
        projectNo,
        allowanceAmount,
      },
      { new: true } // This returns the updated document
    );

    if (!allowance) {
      return res.status(404).json({ message: "Allowance not found" });
    }

    // Send the updated allowance data as response
    res
      .status(200)
      .json({ message: "Allowance updated successfully", allowance });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating allowance data", error: err });
  }
};

const updateAllowanceAdmin = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const {
      allowanceMonth,
      allowanceYear,
      allowanceType,
      client,
      projectNo,
      allowanceAmount,
    } = req.body;
    // Find the allowance record and update it
    const empId = employee._id;

    const searchAllowance = await Allowance.findOne({
      employeeId: empId,
      allowanceMonth,
      allowanceYear,
      allowanceType,
      client,
      projectNo,
    });

    if (!searchAllowance) {
      return res.json({
        success: false,
        message: "Allowance not found, kindly add first!",
      });
    }

    const allowance = await Allowance.findOneAndUpdate(
      {
        employeeId: empId,
        allowanceMonth,
        allowanceYear,
        allowanceType,
        client,
        projectNo,
        voucherNo: "",
      },
      {
        allowanceMonth,
        allowanceYear,
        allowanceType,
        client,
        projectNo,
        allowanceAmount,
      },
      { new: true } // This returns the updated document
    );

    if (!allowance) {
      return res.json({ success: false, message: "Allowance not found" });
    }

    return res.json({
      success: true,
      message: "Allowance updated successfully",
      allowance,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Error updating allowance data",
      error: err,
    });
  }
};

const deleteAllowance = async (req, res) => {
  try {
    const { _id } = req.params;

    const allowance = await Allowance.findByIdAndDelete(_id);

    if (!allowance) {
      return res.json({ message: "Allowance not found" });
    }
    res.status(200).json({ message: "Allowance deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting allowance", error: err });
  }
};

export {
  addAllowance,
  addAllowanceAdmin,
  getUserAllowance,
  getAllAllowance,
  approveOrReject,
  getAllowanceById,
  updateAllowance,
  updateAllowanceAdmin,
  deleteAllowance,
};
