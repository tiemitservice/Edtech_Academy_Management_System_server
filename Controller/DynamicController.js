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

// Helper function to get image fields from a Mongoose schema
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

// Function to load the correct Mongoose model based on the collection name
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

// Defines which collections are referenced by others, to prevent deletion of used documents.
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

// Main controller factory
const dynamicCrudController = (collection) => {
  const model = loadModel(collection);
  if (!model) return null;

  return {
    // CREATE a new document
    create: async (req, res) => {
      // This function remains the same as your original code.
      // It's already well-structured to handle both image and non-image creations.
      try {
        const imageFields = getImageFields(model.schema);

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

            const data = { ...req.body };
            imageFields.forEach((field) => {
              if (data[field] && typeof data[field] === "object") {
                delete data[field];
              }
            });

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

            if (collection.toLowerCase() === "users") {
              if (!data.password || data.password.trim() === "") {
                return res.status(400).json({ error: "Password is required." });
              }
              data.password = await hashPassword(data.password);
            }

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

    // GET ALL documents with filtering, sorting, and pagination
    getAll: async (req, res) => {
      // This function also remains the same as your original.
      // It handles fetching data correctly.
      try {
        const {
          page = 1,
          limit = 10000,
          searchColumn = [],
          sortField = "_id",
          sortOrder = "desc",
          ...filters
        } = req.query;

        const sortOptions = { [sortField]: sortOrder === "asc" ? 1 : -1 };

        const searchCols = Array.isArray(searchColumn)
          ? searchColumn
          : searchColumn.split(",").filter((col) => col);

        const pageNumber = Math.max(parseInt(page, 10), 1);
        const limitNumber = Math.min(Math.max(parseInt(limit, 10), 1), 1000);

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
          } else if (key === "studentId") {
            if (!mongoose.Types.ObjectId.isValid(value)) {
              console.error(`Invalid studentId: ${value}`);
              continue;
            }
            queryConditions.push({
              studentId: new mongoose.Types.ObjectId(value),
            });
          } else if (mongoose.Types.ObjectId.isValid(value)) {
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
                as: "set_by_user",
              },
            });
            pipeline.push({ $unwind: "$set_by_user" });
          }

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

          if (queryConditions.length > 0) {
            pipeline.push({ $match: { $and: queryConditions } });
          }

          pipeline.push({ $sort: sortOptions });
          pipeline.push({ $skip: (pageNumber - 1) * limitNumber });
          pipeline.push({ $limit: limitNumber });

          pipeline.push({
            $set: {
              student_id: { _id: "$student_id", eng_name: "$student.eng_name" },
              set_by: { _id: "$set_by", name: "$set_by_user.name" },
            },
          });

          query = model.aggregate(pipeline);

          const countPipeline = pipeline.slice(
            0,
            pipeline.findIndex((p) => p.$sort)
          );
          countPipeline.push({ $count: "total" });
          totalItems = (await model.aggregate(countPipeline))[0]?.total || 0;
        } else {
          const findQuery = queryConditions.length
            ? { $and: queryConditions }
            : {};

          query = model
            .find(findQuery)
            .sort(sortOptions)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber)
            .lean();

          switch (collection.toLowerCase()) {
            case "staffs":
              break;
            case "classes":
              query.populate("students.student").populate({
                path: "room",
                populate: ["booked_by", "section"],
              });
              break;
            case "books":
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
              query.select("-token");
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
        console.error(`Fetch error for collection "${collection}":`, err);
        res.status(500).json({ error: "Fetch failed", details: err.message });
      }
    },

    getOne: async (req, res) => {
      // Placeholder for getOne, you can implement this if needed.
      try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: "Invalid ID format." });
        }

        const item = await model.findById(id);

        if (!item) {
          return res.status(404).json({ error: "Item not found." });
        }

        return res.status(200).json(item);
      } catch (err) {
        console.error(`GetOne error for collection "${collection}":`, err);
        res.status(500).json({ error: "Fetch failed", details: err.message });
      }
    },

    // UPDATE a document
    update: async (req, res) => {
      try {
        const imageFields = getImageFields(model.schema);
        const uploadFields = imageFields.map((field) => ({
          name: field,
          maxCount: 1,
        }));

        // Use multer to process the request, which handles both JSON and form-data
        upload.fields(uploadFields)(req, res, async (err) => {
          if (err) {
            return res
              .status(400)
              .json({ error: "Image upload error", details: err.message });
          }

          try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
              return res.status(400).json({ error: "Invalid ID" });
            }

            // Start with the request body
            const updatedData = { ...req.body };

            // Add any uploaded image paths to the data
            if (req.files) {
              imageFields.forEach((field) => {
                if (req.files[field] && req.files[field][0]) {
                  updatedData[field] = req.files[field][0].path;
                }
              });
            }

            // --- UPDATED: Handle User and Staff Status Updates with Booleans ---
            const collectionName = collection.toLowerCase();
            if (collectionName === "users" || collectionName === "staffs") {
              // Handle password update
              if (updatedData.password && updatedData.password.trim() !== "") {
                updatedData.password = await hashPassword(updatedData.password);
              } else {
                delete updatedData.password; // Don't update password if empty
              }

              // Handle status update (boolean true/false)
              if (updatedData.hasOwnProperty("status")) {
                // Convert string 'true'/'false' from form data to a real boolean
                if (updatedData.status === "true") {
                  updatedData.status = true;
                } else if (updatedData.status === "false") {
                  updatedData.status = false;
                }

                // If after conversion it's still not a boolean, ignore it.
                if (typeof updatedData.status !== "boolean") {
                  console.warn(
                    `Invalid status value "${updatedData.status}" received. It must be a boolean (true/false). Ignoring.`
                  );
                  delete updatedData.status;
                }
              }
            }

            // --- Special handling for other collections (Refactored) ---
            if (collectionName === "staffs") {
              if (
                updatedData.department &&
                !mongoose.Types.ObjectId.isValid(updatedData.department)
              ) {
                updatedData.department = null;
              }
              if (
                updatedData.position &&
                !mongoose.Types.ObjectId.isValid(updatedData.position)
              ) {
                updatedData.position = null;
              }
            }

            // Find the item and update it with the prepared data
            const updatedItem = await model.findByIdAndUpdate(
              id,
              { $set: updatedData }, // Use $set to prevent replacing the whole document
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

    // DELETE a document
    delete: async (req, res) => {
      // This function remains the same as your original.
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
