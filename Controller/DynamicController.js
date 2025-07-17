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
const PaymentType = require("../Models/PaymentType");
const CourseInvoice = require("../Models/CourseInvoce");
const BookPayment = require("../Models/BookPayment");
const Discound = require("../Models/Discound");
const StudentInvoiceGenerate = require("../Models/StudentInvoiceGenerate");
const Holiday = require("../Models/Holiday");
// report
const MarkClassReport = require("../Report/MarkClassReport");
const RemarkClassReport = require("../Report/RemarkClassReport");
const ScoreReport = require("../Report/ScoreReport");
const AttendanceReport = require("../Report/AttendanceReport");
const BookPaymentReport = require("../Report/BookPaymentReport");
const StudentPaymentReport = require("../Report/StudentPaymentReport");
const StockHistoryReport = require("../Report/StockHistoryReport");
const StudentCompletePaymentReport = require("../Report/StudentCompletePaymentReport");
const TeacherAttendanceReport = require("../Report/TeacherAttendanceReport");
const TeacherPermissionReport = require("../Report/TeacherPermissionReport");
const PromoteStudentReport = require("../Report/PromoteStudentReport");
const StudentPermissionReport = require("../Report/StudentPermissionReport");
const StudentTermReport = require("../Report/StudentTermReport");
const Feedback = require("../Models/feedback");
const ScoreReportCompleted = require("../Report/StudentCompletedScore");
const StudentPaymentTracking = require("../Models/StudentPaymentTracking");
const { hashPassword } = require("./authHelper");
const getImageFields = (schema) => {
  const imageFields = [];
  for (const [fieldName, field] of Object.entries(schema.paths)) {
    if (
      field.instance === "String" &&
      (fieldName === "image" ||
        fieldName === "document_image" ||
        fieldName === "invoice_logo")
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
    case "paymenttypes":
      return PaymentType;
    case "courseinvoices":
      return CourseInvoice;
    case "bookpayments":
      return BookPayment;
    case "discounts":
      return Discound;
    case "markclassreports":
      return MarkClassReport;
    case "remarkclassreports":
      return RemarkClassReport;
    case "scorereports":
      return ScoreReport;
    case "attendancereports":
      return AttendanceReport;
    case "bookpaymentreports":
      return BookPaymentReport;
    case "studentpaymentreports":
      return StudentPaymentReport;
    case "stockhistoryreports":
      return StockHistoryReport;
    case "studentcompletepaymentreports":
      return StudentCompletePaymentReport;
    case "teacherattendancereports":
      return TeacherAttendanceReport;
    case "teacherpermissionreports":
      return TeacherPermissionReport;
    case "promotestudentreports":
      return PromoteStudentReport;
    case "studentpermissionreports":
      return StudentPermissionReport;
    case "studenttermreports":
      return StudentTermReport;
    case "studentinvoicegenerates":
      return StudentInvoiceGenerate;
    case "holidays":
      return Holiday;
    case "feedbacks":
      return Feedback;
    case "scorereportcompleteds":
      return ScoreReportCompleted;
    case "trackingspayments":
      return StudentPaymentTracking;
    default:
      console.error(`Model for collection "${collection}" not found.`);
      return null;
  }
};

const deletionDependencies = {
  staffs: [
    { model: Class, field: "staff" },
    { model: TeacherAttendanceReport, field: "teacher_id" },
    { model: TeacherPermissionReport, field: "approve_by" },
    { model: StudentPermissionReport, field: "approve_by" },
  ],
  classes: [
    { model: StudentInvoiceGenerate, field: "course_id" },
    { model: StudentPaymentReport, field: "course_id" },
    { model: ScoreReport, field: "class_id" },
    { model: AttendanceReport, field: "class_id" },
    { model: MarkClassReport, field: "class_id" },
    { model: PromoteStudentReport, field: "from_class_id" },
    { model: PromoteStudentReport, field: "class_id" },
    { model: StudentTermReport, field: "classes.class_id" },
  ],
  books: [
    { model: Student, field: "rental_book" },
    { model: BookPaymentReport, field: "book_id" },
    { model: StockHistoryReport, field: "book_id" },
  ],
  students: [
    { model: Class, field: "students.student" },
    { model: Attendance, field: "student_id" },
    { model: StudentInvoiceGenerate, field: "student_id" },
    { model: StudentPaymentReport, field: "student_id" },
    { model: ScoreReport, field: "student_id" },
    { model: AttendanceReport, field: "students.student" },
    { model: StudentCompletePaymentReport, field: "student_id" },
    { model: StudentPermissionReport, field: "student_id" },
    { model: PromoteStudentReport, field: "students.student" },
    { model: StudentTermReport, field: "student_id" },
  ],
  positions: [{ model: Staff, field: "position" }],
  departments: [{ model: Staff, field: "department" }],
  sections: [
    { model: Class, field: "duration" },
    { model: ScoreReport, field: "duration" },
    { model: AttendanceReport, field: "duration" },
  ],
  book_categories: [{ model: Book, field: "bookType" }],
  rooms: [{ model: Class, field: "room" }],
  subjects: [
    { model: Class, field: "subject" },
    { model: ScoreReport, field: "subject_id" },
    { model: AttendanceReport, field: "subject_id" },
    { model: MarkClassReport, field: "subject_id" },
  ],
  holidays: [{ model: Class, field: "holiday" }],
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
        // Destructure query parameters, adding defaults for sorting
        const {
          page = 1,
          limit = 10000,
          searchColumn = [],
          sortField = "_id", // Default sort field is the document ID
          sortOrder = "desc", // Default sort order is descending (newest first)
          ...filters
        } = req.query;

        // Create the sort options object for Mongoose
        const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

        const searchCols = Array.isArray(searchColumn)
          ? searchColumn
          : searchColumn.split(",").filter((col) => col);

        const pageNumber = Math.max(parseInt(page, 10), 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10), 1), 1000); // Increased max limit for safety

        const queryConditions = [];

        // --- FILTERING LOGIC (Identical to your original code) ---
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
          } else if (key === "studentId") {
            if (!mongoose.Types.ObjectId.isValid(value)) {
              console.error(`Invalid studentId: ${value}`);
              continue;
            }
            queryConditions.push({
              studentId: new mongoose.Types.ObjectId(value),
            });
          } else if (mongoose.Types.ObjectId.isValid(value)) {
            // This check should come before general string/number checks
            queryConditions.push({ [key]: new mongoose.Types.ObjectId(value) });
          } else if (!isNaN(value) && value.trim() !== "") {
            queryConditions.push({ [key]: Number(value) });
          } else if (value === "true" || value === "false") {
            queryConditions.push({ [key]: value === "true" });
          } else if (typeof value === "string") {
            queryConditions.push({ [key]: { $regex: value, $options: "i" } });
          } else {
            queryConditions.push({ [key]: value });
          }
        }

        let query;
        let totalItems;

        // --- AGGREGATION PATH for 'attendances' (with sorting) ---
        if (
          collection.toLowerCase() === "attendances" &&
          filters.search &&
          searchCols.length > 0
        ) {
          const pipeline = [];

          // Lookups for relational search
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
                as: "set_by_user",
              },
            });
            pipeline.push({ $unwind: "$set_by_user" });
          }

          // Match stage for search terms
          const searchConditions = searchCols.map((col) => {
            if (col === "student_id.eng_name") {
              return {
                "student.eng_name": { $regex: filters.search, $options: "i" },
              };
            } else if (col === "set_by.name") {
              return {
                "set_by_user.name": { $regex: filters.search, $options: "i" },
              };
            }
            return { [col]: { $regex: filters.search, $options: "i" } };
          });
          pipeline.push({ $match: { $or: searchConditions } });

          // Match stage for other filters
          if (queryConditions.length > 0) {
            pipeline.push({ $match: { $and: queryConditions } });
          }

          // Add sorting, pagination
          pipeline.push({ $sort: sortOptions }); // <-- APPLIED SORTING
          pipeline.push({ $skip: (pageNumber - 1) * limitNumber });
          pipeline.push({ $limit: limitNumber });

          // Reshape data for response
          pipeline.push({
            $set: {
              student_id: { _id: "$student_id", eng_name: "$student.eng_name" },
              set_by: { _id: "$set_by", name: "$set_by_user.name" },
            },
          });

          query = model.aggregate(pipeline);

          // Get total count for pagination
          const countPipeline = pipeline.slice(
            0,
            pipeline.findIndex((p) => p.$sort)
          ); // Get pipeline before sort/skip/limit
          countPipeline.push({ $count: "total" });
          totalItems = (await model.aggregate(countPipeline))[0]?.total || 0;
        } else {
          // --- STANDARD FIND PATH for all other collections (with sorting) ---
          const findQuery = queryConditions.length
            ? { $and: queryConditions }
            : {};

          query = model
            .find(findQuery)
            .sort(sortOptions) // <-- APPLIED SORTING
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .lean();

          // Population logic (Identical to your original code)
          switch (collection.toLowerCase()) {
            case "staffs":
              // query
              //   .populate({ path: "position" })
              //   .populate({ path: "department" });
              break;
            case "classes":
              query.populate("students.student").populate({
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
              query.populate({
                path: "teacher",
                populate: ["position", "department"],
              });
              break;
            case "users":
              query.select("-token"); // Exclude sensitive fields
              break;
            case "attendances":
              query
                .populate("student_id", "eng_name")
                .populate("set_by", "name");
              break;
          }

          totalItems = await model.countDocuments(findQuery);
        }

        const items = await query.exec();

        // Socket emission (Identical to your original code)
        const io = req.app.get("io");
        if (io) {
          const safeItems = JSON.parse(JSON.stringify(items));
          io.to(collection).emit(`${collection}_fetched`, safeItems);
        }

        // Final JSON response
        res.status(200).json({
          data: items,
          currentPage: pageNumber,
          totalPages: Math.ceil(totalItems / limitNumber),
          totalItems,
        });
      } catch (err) {
        console.error(`Fetch error for collection "${collection}":`, err);
        res.status(500).json({ error: "Fetch failed", details: err.message });
      }
    },

    getOne: async (req, res) => {},

    update: async (req, res) => {
      try {
        // Helper to get schema fields that are supposed to be images
        const imageFields = getImageFields(model.schema);

        // ========================================================================
        //  PATH 1: NO IMAGE UPLOAD
        //  Handles updates for collections without image fields or when no
        //  image is being uploaded.
        // ========================================================================
        if (imageFields.length === 0) {
          try {
            // --- Logic for 'students' collection ---
            if (collection.toLowerCase() === "students") {
              const updatedData = { ...req.body };
              const studentRecord = await model.findById(req.params.id);
              if (!studentRecord) {
                return res.status(404).json({ error: "Student not found" });
              }

              // Validate and format ObjectId for teacher
              updatedData.teacher =
                req.body.teacher &&
                mongoose.Types.ObjectId.isValid(req.body.teacher)
                  ? req.body.teacher
                  : null;

              // Ensure rental_book is a valid array of ObjectIds
              let rentalBook = Array.isArray(req.body.rental_book)
                ? req.body.rental_book
                : req.body.rental_book
                ? [req.body.rental_book]
                : [];
              updatedData.rental_book = rentalBook.filter((id) =>
                mongoose.Types.ObjectId.isValid(id)
              );

              // Handle boolean and numeric conversions
              updatedData.status =
                req.body.status === "true" || req.body.status === true;
              updatedData.score = parseInt(req.body.score) || 0;
              updatedData.attendance = parseInt(req.body.attendance) || 0;

              // Handle score updates based on score_status
              const scoreStatus = req.body.score_status || "insert_more";
              const incomingScore = {
                quiz_score: Number(req.body.quiz_score) || 0,
                midterm_score: Number(req.body.midterm_score) || 0,
                final_score: Number(req.body.final_score) || 0,
              };

              if (scoreStatus === "insert_more") {
                updatedData.quiz_score =
                  (studentRecord.quiz_score || 0) + incomingScore.quiz_score;
                updatedData.midterm_score =
                  (studentRecord.midterm_score || 0) +
                  incomingScore.midterm_score;
                updatedData.final_score =
                  (studentRecord.final_score || 0) + incomingScore.final_score;
              } else if (scoreStatus === "replace") {
                updatedData.quiz_score = incomingScore.quiz_score;
                updatedData.midterm_score = incomingScore.midterm_score;
                updatedData.final_score = incomingScore.final_score;
              }
              // Recalculate total score regardless of status
              updatedData.total_attendance_score =
                (updatedData.quiz_score || 0) +
                (updatedData.midterm_score || 0) +
                (updatedData.final_score || 0);

              delete updatedData.score_status; // Clean up the status field

              const updatedItem = await model.findByIdAndUpdate(
                req.params.id,
                updatedData,
                { new: true, runValidators: true }
              );
              if (!updatedItem)
                return res.status(404).json({ error: "Item not found" });

              // Emit socket event and respond
              const io = req.app.get("io");
              if (io)
                io.to(collection).emit(`${collection}_updated`, updatedItem);
              return res.status(200).json(updatedItem);

              // --- Logic for 'classes' collection (Fetch, Modify, Save) ---
            } else if (collection.toLowerCase() === "classes") {
              const classToUpdate = await model.findById(req.params.id);
              if (!classToUpdate) {
                return res.status(404).json({ error: "Class not found" });
              }

              // Whitelist of fields allowed for direct update
              const allowedFields = [
                "name",
                "duration",
                "staff",
                "room",
                "day_class",
                "mark_as_completed",
                "status",
                "subject",
                "holiday",
              ];
              allowedFields.forEach((field) => {
                if (req.body.hasOwnProperty(field)) {
                  // For ObjectId fields, validate or set to null
                  if (
                    [
                      "staff",
                      "room",
                      "subject",
                      "holiday",
                      "duration",
                    ].includes(field) &&
                    !mongoose.Types.ObjectId.isValid(req.body[field])
                  ) {
                    classToUpdate[field] = null;
                  } else {
                    classToUpdate[field] = req.body[field];
                  }
                }
              });

              // Handle the nested 'students' array update
              if (req.body.students && Array.isArray(req.body.students)) {
                classToUpdate.students = req.body.students
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

              const updatedItem = await classToUpdate.save({
                runValidators: true,
              });

              // Emit socket event and respond
              const io = req.app.get("io");
              if (io)
                io.to(collection).emit(`${collection}_updated`, updatedItem);
              return res.status(200).json(updatedItem);
            } else {
              // --- Generic logic for all other collections ---
              const updatedItem = await model.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true, runValidators: true }
              );
              if (!updatedItem)
                return res.status(404).json({ error: "Item not found" });

              // Emit socket event and respond
              const io = req.app.get("io");
              if (io)
                io.to(collection).emit(`${collection}_updated`, updatedItem);
              return res.status(200).json(updatedItem);
            }
          } catch (err) {
            console.error(`Update error for ${collection}:`, err);
            return res
              .status(400)
              .json({ error: "Update failed", details: err.message });
          }
        }

        // ========================================================================
        //  PATH 2: WITH IMAGE UPLOAD
        //  Handles multipart/form-data requests using multer for file uploads.
        // ========================================================================
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

            // Add uploaded file paths to the data object
            if (req.files) {
              imageFields.forEach((field) => {
                if (req.files[field]) {
                  updatedData[field] = req.files[field][0].path;
                }
              });
            }

            // --- Logic for 'staffs' collection ---
            if (collection.toLowerCase() === "staffs") {
              updatedData.department =
                req.body.department &&
                mongoose.Types.ObjectId.isValid(req.body.department)
                  ? req.body.department
                  : null;
              updatedData.position =
                req.body.position &&
                mongoose.Types.ObjectId.isValid(req.body.position)
                  ? req.body.position
                  : null;
            }

            // --- Logic for 'users' collection (password hashing) ---
            if (collection.toLowerCase() === "users") {
              if (req.body.password && req.body.password.trim() !== "") {
                updatedData.password = await hashPassword(req.body.password);
              } else {
                delete updatedData.password; // Don't update password if it's empty
              }
            }

            // NOTE: The logic for 'students' and 'classes' is duplicated here.
            // In a real-world app, you would refactor this into shared helper functions
            // to avoid repetition. For clarity here, it's shown inline.

            // --- Logic for 'students' collection (with potential image) ---
            if (collection.toLowerCase() === "students") {
              const studentRecord = await model.findById(req.params.id);
              if (!studentRecord) {
                return res.status(404).json({ error: "Student not found" });
              }
              // All the same student logic from Path 1...
              updatedData.teacher =
                req.body.teacher &&
                mongoose.Types.ObjectId.isValid(req.body.teacher)
                  ? req.body.teacher
                  : null;
              let rentalBook = Array.isArray(req.body.rental_book)
                ? req.body.rental_book
                : req.body.rental_book
                ? [req.body.rental_book]
                : [];
              updatedData.rental_book = rentalBook.filter((id) =>
                mongoose.Types.ObjectId.isValid(id)
              );
              updatedData.status =
                req.body.status === "true" || req.body.status === true;
              updatedData.score = parseInt(req.body.score) || 0;
              updatedData.attendance = parseInt(req.body.attendance) || 0;
              const scoreStatus = req.body.score_status || "insert_more";
              const incomingScore = {
                quiz_score: Number(req.body.quiz_score) || 0,
                midterm_score: Number(req.body.midterm_score) || 0,
                final_score: Number(req.body.final_score) || 0,
              };
              if (scoreStatus === "insert_more") {
                updatedData.quiz_score =
                  (studentRecord.quiz_score || 0) + incomingScore.quiz_score;
                updatedData.midterm_score =
                  (studentRecord.midterm_score || 0) +
                  incomingScore.midterm_score;
                updatedData.final_score =
                  (studentRecord.final_score || 0) + incomingScore.final_score;
              } else if (scoreStatus === "replace") {
                updatedData.quiz_score = incomingScore.quiz_score;
                updatedData.midterm_score = incomingScore.midterm_score;
                updatedData.final_score = incomingScore.final_score;
              }
              updatedData.total_attendance_score =
                (updatedData.quiz_score || 0) +
                (updatedData.midterm_score || 0) +
                (updatedData.final_score || 0);
              delete updatedData.score_status;
            }

            // --- Logic for 'classes' collection (Fetch, Modify, Save) ---
            if (collection.toLowerCase() === "classes") {
              const classToUpdate = await model.findById(req.params.id);
              if (!classToUpdate) {
                return res.status(404).json({ error: "Class not found" });
              }
              // All the same class logic from Path 1...
              const allowedFields = [
                "name",
                "duration",
                "staff",
                "room",
                "day_class",
                "mark_as_completed",
                "status",
                "subject",
                "holiday",
              ];
              allowedFields.forEach((field) => {
                if (updatedData.hasOwnProperty(field)) {
                  if (
                    [
                      "staff",
                      "room",
                      "subject",
                      "holiday",
                      "duration",
                    ].includes(field) &&
                    !mongoose.Types.ObjectId.isValid(updatedData[field])
                  ) {
                    classToUpdate[field] = null;
                  } else {
                    classToUpdate[field] = updatedData[field];
                  }
                }
              });
              if (updatedData.students && Array.isArray(updatedData.students)) {
                classToUpdate.students = updatedData.students
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
              const updatedItem = await classToUpdate.save({
                runValidators: true,
              });

              const io = req.app.get("io");
              if (io)
                io.to(collection).emit(`${collection}_updated`, updatedItem);
              return res.status(200).json(updatedItem);
            }

            // --- Final update for all other collections with images ---
            const updatedItem = await model.findByIdAndUpdate(
              req.params.id,
              updatedData,
              { new: true, runValidators: true }
            );
            if (!updatedItem) {
              return res.status(404).json({ error: "Item not found" });
            }

            // Emit socket event and respond
            const io = req.app.get("io");
            if (io) {
              io.to(collection).emit(`${collection}_updated`, updatedItem);
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
