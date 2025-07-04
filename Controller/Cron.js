const Staff = require("../Models/Staff");
const Class = require("../Models/Class");
const cron = require("node-cron");

cron.schedule(
  "* * * * *", // every 1 minute
  async () => {
    console.log("⏳ Resetting all student and staff attendance...");

    try {
      // ✅ Reset staff attendance
      await Staff.updateMany(
        {},
        {
          attendance: null,
          entry_time: null,
          exit_time: null,
          note: null,
        }
      );
      console.log("✅ All staff attendance reset!");

      // ✅ Reset student attendance inside classes
      await Class.updateMany(
        {},
        {
          $set: {
            "students.$[elem].attendance": null,
            "students.$[elem].checking_at": null,
            "students.$[elem].note": null,
          },
        },
        {
          arrayFilters: [{ "elem.attendance": { $exists: true } }],
        }
      );
      console.log("✅ All student attendance reset inside classes!");
    } catch (err) {
      console.error("❌ Error resetting attendance:", err);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Bangkok",
  }
);
