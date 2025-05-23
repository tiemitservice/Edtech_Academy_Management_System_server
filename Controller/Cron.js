const Student = require("../Models/Student");
const cron = require("node-cron");

// Every minute (for testing), with timezone
cron.schedule(
  "* * * * *",
  async () => {
    console.log("Resetting all student attendance...");
    try {
      await Student.updateMany(
        {},
        {
          attendence_enum: null,
          attendence_date: null,
          attendence: 0,
        }
      );
      console.log("All attendance reset!");
    } catch (err) {
      console.error("Error resetting attendance:", err);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Bangkok", // Match your system timezone (+07:00)
  }
);
