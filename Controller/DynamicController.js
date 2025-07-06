const upload = require("../upload/upload");
const mongoose = require("mongoose");
const User = require("../Models/User");
const Book = require("../Models/Book");
const Staff = require("../Models/Staff");
const BookCategory = require("../Models/BookCategory");
const Class = require("../Models/Class");
const Cours = require("../Models/Cours");
const Section = require("../Models/Section");
const Student = require("../Models/Student");
const Department = require("../Models/Department");
const Room = require("../Models/Room");
const Position = require("../Models/Posistion");
const Attendance = require("../Models/Attendace");
const StudentCategory = require("../Models/StudentCategory");
const StudentPermission = require("../Models/StudentPermission");
const StudentPayment = require("../Models/StudentPayment");
const StaffPermission = require("../Models/StaffPermission");
const StaffAttendance = require("../Models/StaffAttendance");
const Subject = require("../Models/Subject");
const Company = require("../Models/Company");
const { hashPassword } = require("./authHelper");
const getImageFields = (schema) => {
  const imageFields = [];
  for (const [fieldName, field] of Object.entries(schema.paths)) {
    if (
      field.instance === "String" &&
      (fieldName === "image" || fieldName === "document_image")
    ) {
      imageFields.push(fieldName);
    }
  }
  return imageFields;
};

const loadModel = (collection) => {
  switch (collection.toLowerCase()) {
    case "users":
      return User;
    case "staffs":
      return Staff;
    case "books":
      return Book;
    case "book_categories":
      return BookCategory;
    case "students":
      return Student;
    case "classes":
      return Class;
    case "cours":
      return Cours;
    case "sections":
      return Section;
    case "departments":
      return Department;
    case "positions":
      return Position;
    case "rooms":
      return Room;
    case "attendances":
      return Attendance;
    case "student_categories":
      return StudentCategory;
    case "student_permissions":
      return StudentPermission;
    case "student_payments":
      return StudentPayment;
    case "staffpermissions":
      return StaffPermission;
    case "staffattendances":
      return StaffAttendance;
    case "subjects":
      return Subject;
    case "companies":
      return Company;
    default:
      console.error(`Model for collection "${collection}" not found.`);
      return null;
  }
};

const deletionDependencies = {
  staffs: [
    { model: Class, field: "staff" },
    { model: Class, field: "staff._id" },
  ],
  classes: [
    { model: Staff, field: "staff._id" },
    { model: Section, field: "duration" },
  ],
  books: [{ model: Student, field: "rental_book" }],
  students: [
    { model: Class, field: "students" },
    { model: Class, field: "students._id" },
    { model: Attendance, field: "student_id" },
  ],
  positions: [{ model: Staff, field: "position" }],
  departments: [{ model: Staff, field: "department" }],
  sections: [{ model: Class, field: "duration" }],
  book_categories: [{ model: Book, field: "bookType" }],
  rooms: [{ model: Class, field: "room" }],
  subjects: [{ model: Class, field: "subject" }],
};

const dynamicCrudController = (collection) => {
  const model = loadModel(collection);
  if (!model) return null;

  return {
    create: async (req, res) => {
      try {
        // Get image fields from the schema
        const imageFields = getImageFields(model.schema);

        // If no image fields, process without file upload
        if (imageFields.length === 0) {
          try {
            if (!req.body.code) {
              req.body.code = "default_code_" + Date.now();
            }

            const data = { ...req.body };

            if (collection.toLowerCase() === "students") {
              const teacherId = req.body.teacher;

              data.teacher = mongoose.Types.ObjectId.isValid(teacherId)
                ? teacherId
                : null;

              data.rental_book = Array.isArray(req.body.rental_book)
                ? req.body.rental_book
                : req.body.rental_book
                ? [req.body.rental_book]
                : [];
              data.rental_book = data.rental_book.filter((id) =>
                mongoose.Types.ObjectId.isValid(id)
              );

              data.status =
                req.body.status === "true" || req.body.status === true;
              data.score = parseInt(req.body.score) || 0;
              data.attendance = parseInt(req.body.attendance) || 0;
            }

            const newItem = new model(data);
            const savedItem = await newItem.save();

            const io = req.app.get("io");
            if (io) {
              io.to(collection).emit(`${collection}_created`, savedItem);
            }

            return res.status(201).json(savedItem);
          } catch (err) {
            return res
              .status(400)
              .json({ error: "Create failed", details: err.message });
          }
        }

        // Configure Multer for dynamic image fields
        const uploadFields = imageFields.map((field) => ({
          name: field,
          maxCount: 1,
        }));
        upload.fields(uploadFields)(req, res, async (err) => {
          if (err) {
            return res
              .status(400)
              .json({ error: "Image upload error", details: err.message });
          }

          try {
            if (!req.body.code) {
              req.body.code = "default_code_" + Date.now();
            }

            // Clean req.body to remove invalid image fields
            const data = { ...req.body };
            imageFields.forEach((field) => {
              if (data[field] && typeof data[field] === "object") {
                delete data[field]; // Prevent validation errors
              }
            });

            // staff and department
            if (collection.toLowerCase() === "staffs") {
              data.position = mongoose.Types.ObjectId.isValid(req.body.position)
                ? req.body.position
                : null;
              data.department = mongoose.Types.ObjectId.isValid(
                req.body.department
              )
                ? req.body.department
                : null;
            }

            if (collection.toLowerCase() === "students") {
              const teacherId = req.body.teacher;

              data.teacher = mongoose.Types.ObjectId.isValid(teacherId)
                ? teacherId
                : null;

              data.rental_book = Array.isArray(req.body.rental_book)
                ? req.body.rental_book
                : req.body.rental_book
                ? [req.body.rental_book]
                : [];
              data.rental_book = data.rental_book.filter((id) =>
                mongoose.Types.ObjectId.isValid(id)
              );

              data.status =
                req.body.status === "true" || req.body.status === true;
              data.score = parseInt(req.body.score) || 0;
              data.attendance = parseInt(req.body.attendance) || 0;
            }
            // ✅ Handle users
            if (collection.toLowerCase() === "users") {
              if (!data.password || data.password.trim() === "") {
                return res.status(400).json({ error: "Password is required." });
              }
              data.password = await hashPassword(data.password);
            }
            // Map uploaded file URLs to schema fields
            const fileData = {};
            if (req.files) {
              imageFields.forEach((field) => {
                fileData[field] = req.files[field]
                  ? req.files[field][0].path
                  : null;
              });
            }

            const newItem = new model({
              ...data,
              ...fileData,
            });
            const savedItem = await newItem.save();

            const io = req.app.get("io");
            if (io) {
              io.to(collection).emit(`${collection}_created`, savedItem);
              console.log(`[SOCKET] ${collection}_created emitted`);
            }

            return res.status(201).json(savedItem);
          } catch (err) {
            return res
              .status(400)
              .json({ error: "Create failed", details: err.message });
          }
        });
      } catch (err) {
        return res
          .status(500)
          .json({ error: "Server error", details: err.message });
      }
    },

    getAll: async (req, res) => {
      try {
        const {
          page = 1,
          limit = 10,
          searchColumn = [],
          ...filters
        } = req.query;

        const searchCols = Array.isArray(searchColumn)
          ? searchColumn
          : searchColumn.split(",").filter((col) => col);

        const pageNumber = Math.max(parseInt(page, 10), 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10), 1), 100);

        const queryConditions = [];

        for (const [key, value] of Object.entries(filters)) {
          if (!value) continue;

          if (key === "search" && searchCols.length > 0) {
            const or = searchCols.map((col) => ({
              [col]: { $regex: value, $options: "i" },
            }));
            queryConditions.push({ $or: or });
          } else if (key === "dateFrom") {
            if (collection.toLowerCase() === "student_permissions") {
              queryConditions.push({ start_date: { $gte: new Date(value) } });
            } else {
              queryConditions.push({ date: { $gte: new Date(value) } });
            }
          } else if (key === "dateTo") {
            if (collection.toLowerCase() === "student_permissions") {
              queryConditions.push({ end_date: { $lte: new Date(value) } });
            } else {
              queryConditions.push({ date: { $lte: new Date(value) } });
            }
          } else if (key === "status") {
            if (collection.toLowerCase() === "student_permissions") {
              queryConditions.push({ permissent_status: value });
            } else {
              queryConditions.push({ [key]: value });
            }
          }
          if (key === "studentId") {
            if (!mongoose.Types.ObjectId.isValid(value)) {
              console.error(`Invalid studentId: ${value}`);
              continue;
            }
            queryConditions.push({
              studentId: new mongoose.Types.ObjectId(value),
            });
          } else if (!isNaN(value)) {
            queryConditions.push({ [key]: Number(value) });
          } else if (value === "true" || value === "false") {
            queryConditions.push({ [key]: value === "true" });
          } else if (mongoose.Types.ObjectId.isValid(value)) {
            queryConditions.push({ [key]: new mongoose.Types.ObjectId(value) });
          } else if (typeof value === "string") {
            queryConditions.push({ [key]: { $regex: value, $options: "i" } });
          } else if (value === "email") {
            queryConditions.push({ [key]: { $regex: value, $options: "i" } });
          } else {
            queryConditions.push({ [key]: value });
          }
        }

        let query;
        let totalItems;

        if (
          collection.toLowerCase() === "attendances" &&
          filters.search &&
          searchCols.length > 0
        ) {
          const pipeline = [];

          if (searchCols.includes("student_id.eng_name")) {
            pipeline.push({
              $lookup: {
                from: "students",
                localField: "student_id",
                foreignField: "_id",
                as: "student",
              },
            });
            pipeline.push({ $unwind: "$student" });
          }
          if (searchCols.includes("set_by.name")) {
            pipeline.push({
              $lookup: {
                from: "users",
                localField: "set_by",
                foreignField: "_id",
                as: "set_by",
              },
            });
            pipeline.push({ $unwind: "$set_by" });
          }

          const searchConditions = searchCols.map((col) => {
            if (col === "student_id.eng_name") {
              return {
                "student.eng_name": { $regex: filters.search, $options: "i" },
              };
            } else if (col === "set_by.name") {
              return {
                "set_by.name": { $regex: filters.search, $options: "i" },
              };
            }
            return { [col]: { $regex: filters.search, $options: "i" } };
          });
          pipeline.push({ $match: { $or: searchConditions } });

          if (queryConditions.length > 0) {
            pipeline.push({ $match: { $and: queryConditions } });
          }

          pipeline.push({ $skip: (pageNumber - 1) * limitNumber });
          pipeline.push({ $limit: limitNumber });

          pipeline.push({
            $set: {
              student_id: { _id: "$student_id", eng_name: "$student.eng_name" },
              set_by: { _id: "$set_by", name: "$set_by.name" },
            },
          });

          query = model.aggregate(pipeline);
          totalItems =
            (
              await model.aggregate([
                ...pipeline.slice(0, -2),
                { $count: "total" },
              ])
            )[0]?.total || 0;
        } else {
          query = model
            .find(queryConditions.length ? { $and: queryConditions } : {})
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .lean();

          switch (collection.toLowerCase()) {
            case "staffs":
              // // only positio: '6455233greye2114'n and department: '6455233greye2114'n
              // query
              //   .populate({ path: "position" })
              //   .populate({ path: "department" });
              break;
            case "classes":
              query
                .populate("students.student")

                .populate({
                  path: "room",
                  populate: ["booked_by", "section"],
                });
              break;

            case "books":
              // query.populate("bookType", "name");
              break;
            case "rooms":
              query.populate("section").populate("booked_by");
              break;
            case "students":
              // query.populate({
              //   path: "teacher",
              //   populate: ["position", "department"],
              // });
              break;
            case "users":
              const excludedFields = " -token";
              query.select(excludedFields);
              break;

            case "attendances":
              query
                .populate("student_id", "eng_name")
                .populate("set_by", "name");
              break;
            case "student_permissions":
              break;
          }

          totalItems = await model.countDocuments(
            queryConditions.length ? { $and: queryConditions } : {}
          );
        }

        const items = await query.exec();

        const io = req.app.get("io");
        if (io) {
          const safeItems = JSON.parse(JSON.stringify(items));
          io.to(collection).emit(`${collection}_fetched`, safeItems);
        }

        res.status(200).json({
          data: items,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalItems / limitNumber),
          totalItems,
        });
      } catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: "Fetch failed", details: err.message });
      }
    },

    getOne: async (req, res) => {},

    // update: async (req, res) => {
    //   try {
    //     // Get image fields from the schema
    //     const imageFields = getImageFields(model.schema);

    //     // If no image fields, process without file upload
    //     if (imageFields.length === 0) {
    //       try {
    //         const updatedData = { ...req.body };

    //         if (collection.toLowerCase() === "students") {
    //           updatedData.teacher = req.body.teacher
    //             ? mongoose.Types.ObjectId.isValid(req.body.teacher)
    //               ? req.body.teacher
    //               : null
    //             : null;

    //           updatedData.rental_book = Array.isArray(req.body.rental_book)
    //             ? req.body.rental_book
    //             : req.body.rental_book
    //             ? [req.body.rental_book]
    //             : [];
    //           updatedData.rental_book = updatedData.rental_book.filter((id) =>
    //             mongoose.Types.ObjectId.isValid(id)
    //           );

    //           updatedData.status =
    //             req.body.status === "true" || req.body.status === true;
    //           updatedData.score = parseInt(req.body.score) || 0;
    //           updatedData.attendance = parseInt(req.body.attendance) || 0;

    //           const attendanceRecord = await model.findById(req.params.id);
    //           if (!attendanceRecord) {
    //             return res.status(404).json({ error: "Attendance not found" });
    //           }

    //           const scoreStatus = req.body.score_status || "insert_more";
    //           const incomingScore = {
    //             quiz_score: Number(req.body.quiz_score) || 0,
    //             midterm_score: Number(req.body.midterm_score) || 0,
    //             final_score: Number(req.body.final_score) || 0,
    //           };

    //           if (scoreStatus === "insert_more") {
    //             updatedData.quiz_score =
    //               (attendanceRecord.quiz_score || 0) + incomingScore.quiz_score;
    //             updatedData.midterm_score =
    //               (attendanceRecord.midterm_score || 0) +
    //               incomingScore.midterm_score;
    //             updatedData.final_score =
    //               (attendanceRecord.final_score || 0) +
    //               incomingScore.final_score;
    //             updatedData.total_attendance_score =
    //               (attendanceRecord.total_attendance_score || 0) +
    //               incomingScore.quiz_score +
    //               incomingScore.midterm_score +
    //               incomingScore.final_score;
    //           } else if (scoreStatus === "replace") {
    //             const oldQuiz = Number(req.body.old_quiz_score) || 0;
    //             const oldMidterm = Number(req.body.old_midterm_score) || 0;
    //             const oldFinal = Number(req.body.old_final_score) || 0;

    //             updatedData.quiz_score = incomingScore.quiz_score;
    //             updatedData.midterm_score = incomingScore.midterm_score;
    //             updatedData.final_score = incomingScore.final_score;
    //             updatedData.total_attendance_score =
    //               (attendanceRecord.total_attendance_score || 0) -
    //               oldQuiz -
    //               oldMidterm -
    //               oldFinal +
    //               incomingScore.quiz_score +
    //               incomingScore.midterm_score +
    //               incomingScore.final_score;
    //           }

    //           delete updatedData.score_status;
    //         }

    //         const updatedItem = await model.findByIdAndUpdate(
    //           req.params.id,
    //           updatedData,
    //           { new: true }
    //         );

    //         if (!updatedItem) {
    //           return res.status(404).json({ error: "Item not found" });
    //         }

    //         const io = req.app.get("io");
    //         if (io) {
    //           io.to(collection).emit(`${collection}_updated`, updatedItem);
    //           console.log(`[SOCKET] ${collection}_updated emitted`);
    //         }

    //         return res.status(200).json(updatedItem);
    //       } catch (err) {
    //         return res
    //           .status(400)
    //           .json({ error: "Update failed", details: err.message });
    //       }
    //     }

    //     // Configure Multer for dynamic image fields
    //     const uploadFields = imageFields.map((field) => ({
    //       name: field,
    //       maxCount: 1,
    //     }));
    //     upload.fields(uploadFields)(req, res, async (err) => {
    //       if (err) {
    //         return res
    //           .status(400)
    //           .json({ error: "Image upload error", details: err.message });
    //       }

    //       try {
    //         const updatedData = { ...req.body };

    //         // Clean req.body to remove invalid image fields
    //         imageFields.forEach((field) => {
    //           if (
    //             updatedData[field] &&
    //             typeof updatedData[field] === "object"
    //           ) {
    //             delete updatedData[field]; // Prevent validation errors
    //           }
    //         });

    //         // Map uploaded file URLs to schema fields
    //         if (req.files) {
    //           imageFields.forEach((field) => {
    //             if (req.files[field]) {
    //               updatedData[field] = req.files[field][0].path;
    //             }
    //           });
    //         }

    //         if (collection.toLowerCase() === "students") {
    //           updatedData.teacher = req.body.teacher
    //             ? mongoose.Types.ObjectId.isValid(req.body.teacher)
    //               ? req.body.teacher
    //               : null
    //             : null;

    //           updatedData.rental_book = Array.isArray(req.body.rental_book)
    //             ? req.body.rental_book
    //             : req.body.rental_book
    //             ? [req.body.rental_book]
    //             : [];
    //           updatedData.rental_book = updatedData.rental_book.filter((id) =>
    //             mongoose.Types.ObjectId.isValid(id)
    //           );

    //           updatedData.status =
    //             req.body.status === "true" || req.body.status === true;
    //           updatedData.score = parseInt(req.body.score) || 0;
    //           updatedData.attendance = parseInt(req.body.attendance) || 0;

    //           const attendanceRecord = await model.findById(req.params.id);
    //           if (!attendanceRecord) {
    //             return res.status(404).json({ error: "Attendance not found" });
    //           }

    //           const scoreStatus = req.body.score_status || "insert_more";
    //           const incomingScore = {
    //             quiz_score: Number(req.body.quiz_score) || 0,
    //             midterm_score: Number(req.body.midterm_score) || 0,
    //             final_score: Number(req.body.final_score) || 0,
    //           };

    //           if (scoreStatus === "insert_more") {
    //             updatedData.quiz_score =
    //               (attendanceRecord.quiz_score || 0) + incomingScore.quiz_score;
    //             updatedData.midterm_score =
    //               (attendanceRecord.midterm_score || 0) +
    //               incomingScore.midterm_score;
    //             updatedData.final_score =
    //               (attendanceRecord.final_score || 0) +
    //               incomingScore.final_score;
    //             updatedData.total_attendance_score =
    //               (attendanceRecord.total_attendance_score || 0) +
    //               incomingScore.quiz_score +
    //               incomingScore.midterm_score +
    //               incomingScore.final_score;
    //           } else if (scoreStatus === "replace") {
    //             const oldQuiz = Number(req.body.old_quiz_score) || 0;
    //             const oldMidterm = Number(req.body.old_midterm_score) || 0;
    //             const oldFinal = Number(req.body.old_final_score) || 0;

    //             updatedData.quiz_score = incomingScore.quiz_score;
    //             updatedData.midterm_score = incomingScore.midterm_score;
    //             updatedData.final_score = incomingScore.final_score;
    //             updatedData.total_attendance_score =
    //               (attendanceRecord.total_attendance_score || 0) -
    //               oldQuiz -
    //               oldMidterm -
    //               oldFinal +
    //               incomingScore.quiz_score +
    //               incomingScore.midterm_score +
    //               incomingScore.final_score;
    //           }

    //           delete updatedData.score_status;
    //         }

    //         const updatedItem = await model.findByIdAndUpdate(
    //           req.params.id,
    //           updatedData,
    //           { new: true }
    //         );

    //         if (!updatedItem) {
    //           return res.status(404).json({ error: "Item not found" });
    //         }

    //         const io = req.app.get("io");
    //         if (io) {
    //           io.to(collection).emit(`${collection}_updated`, updatedItem);
    //         }

    //         return res.status(200).json(updatedItem);
    //       } catch (err) {
    //         return res
    //           .status(400)
    //           .json({ error: "Update failed", details: err.message });
    //       }
    //     });
    //   } catch (err) {
    //     return res
    //       .status(500)
    //       .json({ error: "Server error", details: err.message });
    //   }
    // },

    update: async (req, res) => {
      try {
        const imageFields = getImageFields(model.schema);

        if (imageFields.length === 0) {
          try {
            const updatedData = { ...req.body };

            // Handle specific collections
            if (collection.toLowerCase() === "students") {
              updatedData.teacher = req.body.teacher
                ? mongoose.Types.ObjectId.isValid(req.body.teacher)
                  ? req.body.teacher
                  : null
                : null;

              updatedData.rental_book = Array.isArray(req.body.rental_book)
                ? req.body.rental_book
                : req.body.rental_book
                ? [req.body.rental_book]
                : [];
              updatedData.rental_book = updatedData.rental_book.filter((id) =>
                mongoose.Types.ObjectId.isValid(id)
              );

              updatedData.status =
                req.body.status === "true" || req.body.status === true;
              updatedData.score = parseInt(req.body.score) || 0;
              updatedData.attendance = parseInt(req.body.attendance) || 0;

              const attendanceRecord = await model.findById(req.params.id);
              if (!attendanceRecord) {
                return res.status(404).json({ error: "Attendance not found" });
              }

              const scoreStatus = req.body.score_status || "insert_more";
              const incomingScore = {
                quiz_score: Number(req.body.quiz_score) || 0,
                midterm_score: Number(req.body.midterm_score) || 0,
                final_score: Number(req.body.final_score) || 0,
              };

              if (scoreStatus === "insert_more") {
                updatedData.quiz_score =
                  (attendanceRecord.quiz_score || 0) + incomingScore.quiz_score;
                updatedData.midterm_score =
                  (attendanceRecord.midterm_score || 0) +
                  incomingScore.midterm_score;
                updatedData.final_score =
                  (attendanceRecord.final_score || 0) +
                  incomingScore.final_score;
                updatedData.total_attendance_score =
                  (attendanceRecord.total_attendance_score || 0) +
                  incomingScore.quiz_score +
                  incomingScore.midterm_score +
                  incomingScore.final_score;
              } else if (scoreStatus === "replace") {
                const oldQuiz = Number(req.body.old_quiz_score) || 0;
                const oldMidterm = Number(req.body.old_midterm_score) || 0;
                const oldFinal = Number(req.body.old_final_score) || 0;

                updatedData.quiz_score = incomingScore.quiz_score;
                updatedData.midterm_score = incomingScore.midterm_score;
                updatedData.final_score = incomingScore.final_score;
                updatedData.total_attendance_score =
                  (attendanceRecord.total_attendance_score || 0) -
                  oldQuiz -
                  oldMidterm -
                  oldFinal +
                  incomingScore.quiz_score +
                  incomingScore.midterm_score +
                  incomingScore.final_score;
              }

              delete updatedData.score_status;
            } else if (collection.toLowerCase() === "classes") {
              const allowedFields = [
                "name",
                "duration",
                "students",
                "staff",
                "room",
                "day_class",
                "mark_as_completed",
                "status",
                "subject",
              ];

              Object.keys(updatedData).forEach((key) => {
                if (!allowedFields.includes(key)) {
                  delete updatedData[key];
                }
              });

              // Handle students field
              if (updatedData.students && Array.isArray(updatedData.students)) {
                updatedData.students = updatedData.students
                  .filter(
                    (s) =>
                      s &&
                      s.student &&
                      mongoose.Types.ObjectId.isValid(s.student)
                  )
                  .map((s) => {
                    const class_practice = Number(s.class_practice) || 0;
                    const home_work = Number(s.home_work) || 0;
                    const assignment_score = Number(s.assignment_score) || 0;
                    const presentation = Number(s.presentation) || 0;
                    const revision_test = Number(s.revision_test) || 0;
                    const final_exam = Number(s.final_exam) || 0;
                    const work_book = Number(s.work_book) || 0;

                    const total_score =
                      class_practice +
                      home_work +
                      assignment_score +
                      presentation +
                      revision_test +
                      final_exam +
                      work_book;

                    const studentData = {
                      student: new mongoose.Types.ObjectId(s.student),
                      attendance_score: Number(s.attendance_score) || 0,
                      class_practice,
                      home_work,
                      assignment_score,
                      presentation,
                      revision_test,
                      final_exam,
                      work_book,
                      total_score,
                      note: s.note || "",
                      exit_time: s.exit_time || "",
                      entry_time: s.entry_time || "",
                      checking_at: s.checking_at || "",
                      comments: total_score >= 50 ? "passed" : "failed",
                    };

                    // Add `attendance` only if it's valid
                    const validAttendance = [
                      "present",
                      "absent",
                      "late",
                      "permission",
                    ];
                    if (validAttendance.includes(s.attendance)) {
                      studentData.attendance = s.attendance;
                    }

                    return studentData;
                  });
              }

              // Validate ObjectId fields
              if (
                updatedData.staff &&
                !mongoose.Types.ObjectId.isValid(updatedData.staff)
              ) {
                updatedData.staff = null;
              }

              if (
                updatedData.room &&
                !mongoose.Types.ObjectId.isValid(updatedData.room)
              ) {
                updatedData.room = null;
              }
            }

            const updatedItem = await model.findByIdAndUpdate(
              req.params.id,
              updatedData,
              { new: true, runValidators: true }
            );

            if (!updatedItem) {
              return res.status(404).json({ error: "Item not found" });
            }

            const io = req.app.get("io");
            if (io) {
              io.to(collection).emit(`${collection}_updated`, updatedItem);
              console.log(
                `[SOCKET] ${collection}_updated emitted:`,
                updatedItem
              );
            }

            return res.status(200).json(updatedItem);
          } catch (err) {
            console.error(`Update error for ${collection}:`, err);
            return res
              .status(400)
              .json({ error: "Update failed", details: err.message });
          }
        }

        // Handle collections with image fields
        const uploadFields = imageFields.map((field) => ({
          name: field,
          maxCount: 1,
        }));
        upload.fields(uploadFields)(req, res, async (err) => {
          if (err) {
            return res
              .status(400)
              .json({ error: "Image upload error", details: err.message });
          }

          try {
            const updatedData = { ...req.body };

            // Clean req.body to remove invalid image fields
            imageFields.forEach((field) => {
              if (
                updatedData[field] &&
                typeof updatedData[field] === "object"
              ) {
                delete updatedData[field];
              }
            });

            // Map uploaded file URLs to schema fields
            if (req.files) {
              imageFields.forEach((field) => {
                if (req.files[field]) {
                  updatedData[field] = req.files[field][0].path;
                }
              });
            }
            // staff and department
            if (collection.toLowerCase() === "staffs") {
              updatedData.department = req.body.department
                ? mongoose.Types.ObjectId.isValid(req.body.department)
                  ? req.body.department
                  : null
                : null;
              updatedData.position = req.body.position
                ? mongoose.Types.ObjectId.isValid(req.body.position)
                  ? req.body.position
                  : null
                : null;
            }

            if (collection.toLowerCase() === "students") {
              // Same student-specific logic as above
              updatedData.teacher = req.body.teacher
                ? mongoose.Types.ObjectId.isValid(req.body.teacher)
                  ? req.body.teacher
                  : null
                : null;

              updatedData.rental_book = Array.isArray(req.body.rental_book)
                ? req.body.rental_book
                : req.body.rental_book
                ? [req.body.rental_book]
                : [];
              updatedData.rental_book = updatedData.rental_book.filter((id) =>
                mongoose.Types.ObjectId.isValid(id)
              );

              updatedData.status =
                req.body.status === "true" || req.body.status === true;
              updatedData.score = parseInt(req.body.score) || 0;
              updatedData.attendance = parseInt(req.body.attendance) || 0;

              const attendanceRecord = await model.findById(req.params.id);
              if (!attendanceRecord) {
                return res.status(404).json({ error: "Attendance not found" });
              }

              const scoreStatus = req.body.score_status || "insert_more";
              const incomingScore = {
                quiz_score: Number(req.body.quiz_score) || 0,
                midterm_score: Number(req.body.midterm_score) || 0,
                final_score: Number(req.body.final_score) || 0,
              };

              if (scoreStatus === "insert_more") {
                updatedData.quiz_score =
                  (attendanceRecord.quiz_score || 0) + incomingScore.quiz_score;
                updatedData.midterm_score =
                  (attendanceRecord.midterm_score || 0) +
                  incomingScore.midterm_score;
                updatedData.final_score =
                  (attendanceRecord.final_score || 0) +
                  incomingScore.final_score;
                updatedData.total_attendance_score =
                  (attendanceRecord.total_attendance_score || 0) +
                  incomingScore.quiz_score +
                  incomingScore.midterm_score +
                  incomingScore.final_score;
              } else if (scoreStatus === "replace") {
                const oldQuiz = Number(req.body.old_quiz_score) || 0;
                const oldMidterm = Number(req.body.old_midterm_score) || 0;
                const oldFinal = Number(req.body.old_final_score) || 0;

                updatedData.quiz_score = incomingScore.quiz_score;
                updatedData.midterm_score = incomingScore.midterm_score;
                updatedData.final_score = incomingScore.final_score;
                updatedData.total_attendance_score =
                  (attendanceRecord.total_attendance_score || 0) -
                  oldQuiz -
                  oldMidterm -
                  oldFinal +
                  incomingScore.quiz_score +
                  incomingScore.midterm_score +
                  incomingScore.final_score;
              }

              delete updatedData.score_status;
            } else if (collection.toLowerCase() === "classes") {
              // Ensure only valid fields are updated
              const allowedFields = [
                "name",
                "duration",
                "students",
                "staff",
                "room",
                "day_class",
                "status",
                "mark_as_completed",
                "subject",
              ];
              Object.keys(updatedData).forEach((key) => {
                if (!allowedFields.includes(key)) {
                  delete updatedData[key];
                }
              });

              // Validate ObjectId fields
              if (updatedData.students && Array.isArray(updatedData.students)) {
                updatedData.students = updatedData.students
                  .filter(
                    (s) =>
                      s &&
                      s.student &&
                      mongoose.Types.ObjectId.isValid(s.student)
                  )
                  .map((s) => ({
                    student: new mongoose.Types.ObjectId(s.student),
                    attendance_score: Number(s.attendance_score) || 0,
                    class_practice: Number(s.class_practice) || 0,
                    home_work: Number(s.home_work) || 0,
                    assignment_score: Number(s.assignment_score) || 0,
                    presentation: Number(s.presentation) || 0,
                    revision_test: Number(s.revision_test) || 0,
                    final_exam: Number(s.final_exam) || 0,
                    total_score: Number(s.total_score) || 0,
                    note: s.note || "",
                    exit_time: s.exit_time || "",
                    entry_time: s.entry_time || "",
                    checking_at: s.checking_at || "",
                    attendance: [
                      "present",
                      "absent",
                      "late",
                      "permission",
                    ].includes(s.attendance)
                      ? s.attendance
                      : undefined,
                  }));
              }

              if (
                updatedData.staff &&
                !mongoose.Types.ObjectId.isValid(updatedData.staff)
              ) {
                updatedData.staff = null;
              }
              if (
                updatedData.room &&
                !mongoose.Types.ObjectId.isValid(updatedData.room)
              ) {
                updatedData.room = null;
              }
            }
            if (collection.toLowerCase() === "users") {
              if (req.body.password && req.body.password.trim() !== "") {
                updatedData.password = await hashPassword(req.body.password);
              } else {
                delete updatedData.password;
              }
            }
            const updatedItem = await model.findByIdAndUpdate(
              req.params.id,
              updatedData,
              { new: true, runValidators: true }
            );

            if (!updatedItem) {
              return res.status(404).json({ error: "Item not found" });
            }

            const io = req.app.get("io");
            if (io) {
              io.to(collection).emit(`${collection}_updated`, updatedItem);
              console.log(
                `[SOCKET] ${collection}_updated emitted:`,
                updatedItem
              );
            }

            return res.status(200).json(updatedItem);
          } catch (err) {
            console.error(`Update error for ${collection}:`, err);
            return res
              .status(400)
              .json({ error: "Update failed", details: err.message });
          }
        });
      } catch (err) {
        console.error(`Server error for ${collection}:`, err);
        return res
          .status(500)
          .json({ error: "Server error", details: err.message });
      }
    },
    // delete: async (req, res) => {
    //   try {
    //     const itemId = req.params.id;

    //     // Validate ObjectId for MongoDB collections
    //     if (!mongoose.Types.ObjectId.isValid(itemId)) {
    //       return res.status(400).json({ error: "Invalid ID" });
    //     }

    //     const deps = deletionDependencies[collection.toLowerCase()] || [];

    //     for (const dep of deps) {
    //       const query = {};

    //       // Check if this field expects an ObjectId
    //       // (ends with ._id, is "_id", or contains "id")
    //       const isObjectIdField =
    //         dep.field.endsWith("._id") ||
    //         dep.field === "_id" ||
    //         dep.field.toLowerCase().includes("id");

    //       if (isObjectIdField) {
    //         query[dep.field] = new mongoose.Types.ObjectId(itemId);
    //       } else {
    //         query[dep.field] = itemId;
    //       }

    //       const isReferenced = await dep.model.exists(query);
    //       if (isReferenced) {
    //         return res.status(400).json({
    //           error: "Delete failed",
    //           details: `Cannot delete ${collection} because it is referenced in ${dep.model.collection.name}`,
    //         });
    //       }
    //     }

    //     // Attempt to delete the item
    //     const deletedItem = await model.findByIdAndDelete(itemId);

    //     if (!deletedItem) {
    //       return res.status(404).json({ error: "Item not found" });
    //     }

    //     // Emit via Socket.IO if available
    //     const io = req.app.get("io");
    //     if (io) {
    //       io.to(collection).emit(`${collection}_deleted`, deletedItem);
    //       console.log(`[SOCKET] ${collection}_deleted emitted`);
    //     }

    //     return res.status(200).json({ message: "Deleted successfully" });
    //   } catch (err) {
    //     console.error("Delete error:", err);
    //     return res
    //       .status(400)
    //       .json({ error: "Delete failed", details: err.message });
    //   }
    // },

    delete: async (req, res) => {
      try {
        const itemId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(itemId)) {
          return res.status(400).json({ error: "Invalid ID" });
        }

        const deps = deletionDependencies[collection.toLowerCase()] || [];

        for (const dep of deps) {
          const query = {};
          const isObjectIdField =
            dep.field.endsWith("._id") ||
            dep.field === "_id" ||
            dep.field.toLowerCase().includes("id");

          if (isObjectIdField) {
            query[dep.field] = new mongoose.Types.ObjectId(itemId);
          } else {
            query[dep.field] = itemId;
          }

          const isReferenced = await dep.model.exists(query);
          if (isReferenced) {
            return res.status(400).json({
              error: "Delete failed",
              details: `Cannot delete ${collection} because it is referenced in ${dep.model.collection.name}`,
            });
          }
        }

        const deletedItem = await model.findByIdAndDelete(itemId);

        if (!deletedItem) {
          return res.status(404).json({ error: "Item not found" });
        }

        const io = req.app.get("io");
        if (io) {
          io.to(collection).emit(`${collection}_deleted`, deletedItem);
          console.log(`[SOCKET] ${collection}_deleted emitted:`, deletedItem);
        }

        return res.status(200).json({ message: "Deleted successfully" });
      } catch (err) {
        console.error("Delete error:", err);
        return res
          .status(400)
          .json({ error: "Delete failed", details: err.message });
      }
    },
  };
};

module.exports = dynamicCrudController;
