const Student = require("../Models/Student");
const Staff = require("../Models/Staff");
const cron = require("node-cron");

cron.schedule(
  "* * * * *",
  async () => {
    console.log("Resetting all student and staff attendance...");

    try {
      // Reset students
      await Student.updateMany(
        {},
        {
          attendence_enum: null,
          attendence_date: null,
          attendence: 0,
        }
      );
      console.log("All student attendance reset!");

      // Reset staff
      await Staff.updateMany(
        {},
        {
          attendance: null,
          entry_time: null,
          exit_time: null,
          note: null,
        }
      );
      console.log("All staff attendance reset!");
    } catch (err) {
      console.error("Error resetting attendance:", err);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Bangkok",
  }
);
