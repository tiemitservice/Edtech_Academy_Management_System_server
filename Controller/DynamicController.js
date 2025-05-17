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
const Attendance = require("../Models/Attendace")
const loadModel = (collection) => {
    switch (collection.toLowerCase()) {
        case "users": return User;
        case "staffs": return Staff;
        case "books": return Book;
        case "book_categories": return BookCategory;
        case "students": return Student;
        case "classes": return Class;
        case "cours": return Cours;
        case "sections": return Section;
        case "departments": return Department;
        case "positions": return Position;
        case "rooms": return Room;
        case "attendances": return Attendance;
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
                if (err) return res.status(400).json({ error: "Image upload error", details: err.message });

                try {
                    if (!req.body.code) {
                        req.body.code = "default_code_" + Date.now();
                    }

                    const data = { ...req.body };

                    if (collection.toLowerCase() === "students") {
                        data.teacher = Array.isArray(req.body.teacher) ? req.body.teacher : req.body.teacher ? [req.body.teacher] : [];
                        data.teacher = data.teacher.filter(id => mongoose.Types.ObjectId.isValid(id));

                        data.rental_book = Array.isArray(req.body.rental_book) ? req.body.rental_book : req.body.rental_book ? [req.body.rental_book] : [];
                        data.rental_book = data.rental_book.filter(id => mongoose.Types.ObjectId.isValid(id));

                        data.status = req.body.status === "true" || req.body.status === true;
                        data.score = parseInt(req.body.score) || 0;
                        data.attendance = parseInt(req.body.attendance) || 0;
                    }

                    const newItem = new model({ ...data, image: req.file ? req.file.path : null });
                    const savedItem = await newItem.save();

                    res.status(201).json(savedItem);
                } catch (err) {
                    res.status(400).json({ error: "Create failed", details: err.message });
                }
            });
        },

        getAll: async (req, res) => {
            try {
                const { page = 1, limit = 10, searchColumn = [], ...filters } = req.query;
                const searchCols = Array.isArray(searchColumn) ? searchColumn : searchColumn.split(",");
                const pageNumber = Math.max(parseInt(page, 10), 1);
                const limitNumber = Math.min(Math.max(parseInt(limit, 10), 1), 100);

                const queryConditions = [];
                for (const [key, value] of Object.entries(filters)) {
                    if (!value) continue;
                    if (key === "search" && searchCols.length > 0) {
                        const or = searchCols.map(col => ({ [col]: { $regex: value, $options: "i" } }));
                        queryConditions.push({ $or: or });
                    } else if (!isNaN(value)) {
                        queryConditions.push({ [key]: Number(value) });
                    } else if (value === "true" || value === "false") {
                        queryConditions.push({ [key]: value === "true" });
                    } else {
                        queryConditions.push({ [key]: { $regex: value, $options: "i" } });
                    }
                }

                const query = model.find(queryConditions.length ? { $and: queryConditions } : {})
                    .skip((pageNumber - 1) * limitNumber)
                    .limit(limitNumber);

                if (collection.toLowerCase() === "staffs") {
                    query.populate("position").populate("department");
                } else if (collection.toLowerCase() === "classes") {
                    query.populate("students").populate("staff").populate({ path: "room", populate: ["booked_by", "section"] });
                } else if (collection.toLowerCase() === "books") {
                    query.populate("bookType", "name");
                } else if (collection.toLowerCase() === "rooms") {
                    query.populate("section").populate("booked_by");
                } else if (collection.toLowerCase() === "students") {
                    query.populate({ path: "teacher", populate: ["position", "department"] });
                }
                else if (collection.toLowerCase() === "attendances") {
                    query.populate("student_id", "eng_name").populate("set_by", "name");
                }
                const items = await query.exec();
                const totalItems = await model.countDocuments(queryConditions.length ? { $and: queryConditions } : {});

                res.status(200).json({
                    data: items,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalItems / limitNumber),
                    totalItems,
                });
            } catch (err) {
                res.status(500).json({ error: "Fetch failed", details: err.message });
            }
        },

        getOne: async (req, res) => {
            try {
                let query = model.findById(req.params.id);
                if (collection.toLowerCase() === "staffs") {
                    query.populate("position").populate("department");
                } else if (collection.toLowerCase() === "classes") {
                    query.populate("students").populate("staff");
                } else if (collection.toLowerCase() === "books") {
                    query.populate("bookType", "name");
                } else if (collection.toLowerCase() === "rooms") {
                    query.populate("section").populate("booked_by");
                } else if (collection.toLowerCase() === "students") {
                    query.populate({ path: "teacher", populate: ["position", "department"] });
                }
                else if (collection.toLowerCase() === "attendances") {
                    query.populate("student_id", "eng_name").populate("set_by", "name");
                }
                const item = await query.exec();
                if (!item) return res.status(404).json({ error: "Item not found" });
                res.status(200).json(item);
            } catch (err) {
                res.status(500).json({ error: "Fetch failed", details: err.message });
            }
        },

        update: async (req, res) => {
            upload.single("image")(req, res, async (err) => {
                if (err) return res.status(400).json({ error: "Image upload error", details: err.message });

                try {
                    const updatedData = { ...req.body };
                    if (req.file) updatedData.image = req.file.path;

                    if (collection.toLowerCase() === "students") {
                        updatedData.teacher = Array.isArray(req.body.teacher) ? req.body.teacher : req.body.teacher ? [req.body.teacher] : [];
                        updatedData.teacher = updatedData.teacher.filter(id => mongoose.Types.ObjectId.isValid(id));

                        updatedData.rental_book = Array.isArray(req.body.rental_book) ? req.body.rental_book : req.body.rental_book ? [req.body.rental_book] : [];
                        updatedData.rental_book = updatedData.rental_book.filter(id => mongoose.Types.ObjectId.isValid(id));

                        updatedData.status = req.body.status === "true" || req.body.status === true;
                        updatedData.score = parseInt(req.body.score) || 0;
                        updatedData.attendance = parseInt(req.body.attendance) || 0;
                    }

                    const updatedItem = await model.findByIdAndUpdate(req.params.id, updatedData, { new: true });
                    if (!updatedItem) return res.status(404).json({ error: "Item not found" });
                    res.status(200).json(updatedItem);
                } catch (err) {
                    res.status(400).json({ error: "Update failed", details: err.message });
                }
            });
        },

        delete: async (req, res) => {
            try {
                const deletedItem = await model.findByIdAndDelete(req.params.id);
                if (!deletedItem) return res.status(404).json({ error: "Item not found" });
                res.status(200).json({ message: "Deleted successfully" });
            } catch (err) {
                res.status(400).json({ error: "Delete failed", details: err.message });
            }
        },
    };
};

module.exports = dynamicCrudController;