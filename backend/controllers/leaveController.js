import Employee from "../models/Employee.js";
import Leave from "../models/Leave.js";

const getLeaveHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const leaveHistory = await Leave.find({ employeeId: employee._id })
      .populate({
        path: "employeeId",
      })
      .sort({ startDate: -1 });

    res.status(200).json(leaveHistory);
  } catch (error) {
    console.error("Error fetching leave history:", error);
    res.status(500).json({ error: "Failed to fetch leave history" });
  }
};

const applyForLeave = async (req, res) => {
  try {
    const { userId } = req.params;
    const { startDate, startTime, endDate, endTime, reason, leaveType, days } =
      req.body;

    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const leaveBalance = employee.leaveBalance[leaveType];
    if (leaveBalance < days) {
      return res.status(400).json({ message: "Not enough leave balance" });
    }

    const newLeave = new Leave({
      employeeId: employee._id,
      startDate,
      startTime,
      endDate,
      endTime,
      reason,
      type: leaveType,
      days,
    });

    await newLeave.save();
    await employee.save();

    res
      .status(201)
      .json({ message: "Leave applied successfully", leave: newLeave });
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getLeaveById = async (req, res) => {
  try {
    const { _id } = req.params;
    const leaveHistory = await Leave.findById({ _id });
    res.status(200).json(leaveHistory);
  } catch (error) {
    console.error("Error fetching leave history:", error);
    res.status(500).json({ error: "Failed to fetch leave history" });
  }
};

const updateLeaveById = async (req, res) => {
  try {
    const { _id } = req.params;
    const { leaveType, startDate, startTime, endDate, endTime, days, reason } =
      req.body;

    const leaveHistory = await Leave.findById(_id);
    if (!leaveHistory) {
      return res.status(404).json({ error: "Leave record not found" });
    }

    leaveHistory.type = leaveType;
    leaveHistory.startDate = startDate;
    leaveHistory.startTime = startTime;
    leaveHistory.endDate = endDate;
    leaveHistory.endTime = endTime;
    leaveHistory.days = days;
    leaveHistory.reason = reason;

    const updatedLeave = await leaveHistory.save();
    res.status(200).json(updatedLeave);
  } catch (error) {
    console.error("Error updating leave record:", error);
    res.status(500).json({ error: "Failed to update leave record" });
  }
};

const deleteLeaveById = async (req, res) => {
  try {
    const { _id } = req.params;
    const leave = await Leave.findById(_id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave record not found",
      });
    }

    await Leave.findByIdAndDelete(_id);

    res.status(200).json({
      success: true,
      message: "Leave record deleted successfully and leave balance updated",
    });
  } catch (error) {
    console.error("Error deleting leave:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting leave record",
    });
  }
};

const getLeaveBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    const employee = await Employee.findOne({ userId });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    res.status(200).json({
      success: true,
      leaveBalance: employee.leaveBalance,
    });
  } catch (error) {
    console.error("Error fetching leave balance:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching leave balance",
    });
  }
};

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate("employeeId");
    res.status(200).json(leaves);
  } catch (error) {
    console.error("Error fetching all leaves:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching leaves" });
  }
};

const approveOrReject = async (req, res) => {
  try {
    const { leaveId, action } = req.params;

    if (!["approved", "rejected"].includes(action)) {
      return res
        .status(400)
        .json({ error: "Invalid action. Must be 'approve' or 'reject'." });
    }

    const leave = await Leave.findById(leaveId).populate("employeeId");
    if (!leave) {
      return res.status(404).json({ error: "Leave request not found." });
    }

    if (leave.status !== "pending") {
      return res
        .status(400)
        .json({ error: "Only pending leave requests can be updated." });
    }

    const employee = leave.employeeId;

    if (action === "approved") {
      const leaveType = leave.type.toLowerCase();
      if (employee.leaveBalance[leaveType] < leave.days) {
        return res.status(400).json({ error: "Insufficient leave balance." });
      }

      employee.leaveBalance[leaveType] -= leave.days;
      leave.status = "approved";

      await employee.save();
    } else if (action === "rejected") {
      leave.status = "rejected";
    }

    await leave.save();

    res.status(200).json({ message: `Leave successfully ${action}d.`, leave });
  } catch (error) {
    console.error(`Error while ${action}ing leave:`, error);
    res.status(500).json({ error: "Internal server error." });
  }
};

const getSummary = async (req, res) => {
  try {
    const leaveApplied = await Leave.countDocuments();
    const leaveApproved = await Leave.countDocuments({ status: "approved" });
    const leavePending = await Leave.countDocuments({ status: "pending" });
    const leaveRejected = await Leave.countDocuments({ status: "rejected" });

    return res.json({
      success: true,
      leaveApplied,
      leaveApproved,
      leavePending,
      leaveRejected,
    });
  } catch (error) {
    console.error("Error fetching leave summary:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export {
  getLeaveHistory,
  applyForLeave,
  getLeaveById,
  updateLeaveById,
  deleteLeaveById,
  getLeaveBalance,
  getAllLeaves,
  approveOrReject,
  getSummary,
};
