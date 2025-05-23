// dynamicCrudController.js

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
    default:
      console.error(`Model for collection "${collection}" not found.`);
      return null;
  }
};

const dynamicCrudController = (collection) => {
  const model = loadModel(collection);
  if (!model) return null;

  return {
    create: async (req, res) => {
      upload.single("image")(req, res, async (err) => {
        if (err) {
          // Send error response and return to prevent further execution
          return res
            .status(400)
            .json({ error: "Image upload error", details: err.message });
        }

        try {
          if (!req.body.code) {
            req.body.code = "default_code_" + Date.now();
          }

          const data = { ...req.body };

          if (collection.toLowerCase() === "students") {
            data.teacher = Array.isArray(req.body.teacher)
              ? req.body.teacher
              : req.body.teacher
              ? [req.body.teacher]
              : [];
            data.teacher = data.teacher.filter((id) =>
              mongoose.Types.ObjectId.isValid(id)
            );

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

          const newItem = new model({
            ...data,
            image: req.file ? req.file.path : null,
          });
          const savedItem = await newItem.save();

          // Emit Socket.IO event
          const io = req.app.get("io");
          if (io) {
            io.to(collection).emit(`${collection}_created`, savedItem);
          } else {
            console.error("Socket.IO instance not found");
          }

          // Send success response
          return res.status(201).json(savedItem);
        } catch (err) {
          // Send error response only if no response has been sent
          return res
            .status(400)
            .json({ error: "Create failed", details: err.message });
        }
      });
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

        // controllers/dynamicCrudController.js
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
          } else if (!isNaN(value)) {
            queryConditions.push({ [key]: Number(value) });
          } else if (value === "true" || value === "false") {
            queryConditions.push({ [key]: value === "true" });
          } else if (mongoose.Types.ObjectId.isValid(value)) {
            queryConditions.push({ [key]: new mongoose.Types.ObjectId(value) });
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
            .limit(limitNumber);

          switch (collection.toLowerCase()) {
            case "staffs":
              query.populate("position").populate("department");
              break;
            case "classes":
              query
                .populate("students")
                .populate("staff")
                .populate({ path: "room", populate: ["booked_by", "section"] });
              break;
            case "books":
              query.populate("bookType", "name");
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
            case "attendances":
              query
                .populate("student_id", "eng_name")
                .populate("set_by", "name");
              break;
            // id only
            case "student_permissions":
              query
                .populate({ path: "studentId", select: "_id" }) // Populate only _id
                .populate({ path: "sent_to", select: "_id" }); // Populate only _id
              break;
          }

          totalItems = await model.countDocuments(
            queryConditions.length ? { $and: queryConditions } : {}
          );
        }

        const items = await query.exec();

        const io = req.app.get("io");
        if (io) {
          console.log(`Emitting ${collection}_fetched:`, items);
          io.to(collection).emit(`${collection}_fetched`, items);
        } else {
          console.error("Socket.IO instance not found in getAll");
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
    update: async (req, res) => {
      upload.single("image")(req, res, async (err) => {
        if (err) {
          return res
            .status(400)
            .json({ error: "Image upload error", details: err.message });
        }

        try {
          const updatedData = { ...req.body };
          if (req.file) updatedData.image = req.file.path;

          if (collection.toLowerCase() === "students") {
            updatedData.teacher = Array.isArray(req.body.teacher)
              ? req.body.teacher
              : req.body.teacher
              ? [req.body.teacher]
              : [];
            updatedData.teacher = updatedData.teacher.filter((id) =>
              mongoose.Types.ObjectId.isValid(id)
            );

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
          }

          const updatedItem = await model.findByIdAndUpdate(
            req.params.id,
            updatedData,
            { new: true }
          );

          if (!updatedItem) {
            return res.status(404).json({ error: "Item not found" });
          }

          // Emit Socket.IO event
          const io = req.app.get("io");
          if (io) {
            io.to(collection).emit(`${collection}_updated`, updatedItem);
          } else {
            console.error("Socket.IO instance not found");
          }

          return res.status(200).json(updatedItem);
        } catch (err) {
          return res
            .status(400)
            .json({ error: "Update failed", details: err.message });
        }
      });
    },

    delete: async (req, res) => {
      try {
        const deletedItem = await model.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
          return res.status(404).json({ error: "Item not found" });
        }

        // Emit Socket.IO event
        const io = req.app.get("io");
        if (io) {
          io.to(collection).emit(`${collection}_deleted`, deletedItem);
        } else {
          console.error("Socket.IO instance not found");
        }

        return res.status(200).json({ message: "Deleted successfully" });
      } catch (err) {
        return res
          .status(400)
          .json({ error: "Delete failed", details: err.message });
      }
    },
  };
};

module.exports = dynamicCrudController;
