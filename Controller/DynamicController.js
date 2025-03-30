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
const Position = require("../Models/Posistion");
const Room = require("../Models/Room");
// Dynamically load the model for the collection

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
        default:
            console.error(`Model for collection "${collection}" not found.`);
            return null;
    }
};

// Dynamic CRUD operations for any collection
const dynamicCrudController = (collection) => {
    const model = loadModel(collection);
    if (!model) return null;

    return {
        // Create a new item
        create: async (req, res) => {
            upload.single("image")(req, res, async (err) => {
                if (err) {
                    return res
                        .status(400)
                        .json({ error: "Error uploading image", details: err.message });
                }

                try {
                    if (!req.body.code) {
                        req.body.code = "default_code_" + Date.now();
                    }

                    const newItem = new model({
                        ...req.body,
                        image: req.file ? req.file.path : null,
                    });

                    const savedItem = await newItem.save();
                    res.status(201).json(savedItem);
                } catch (err) {
                    console.error("Error creating item:", err);
                    res
                        .status(400)
                        .json({ error: "Error creating item", details: err.message });
                }
            });
        },

        // Get all items
        getAll: async (req, res) => {
            try {
                const { page = 1, limit = 10, searchColumn = [], ...filters } = req.query;

                const searchColumnArray = Array.isArray(searchColumn) ? searchColumn : searchColumn.split(",");
                const pageNumber = Math.max(parseInt(page, 10), 1);
                const limitNumber = Math.min(Math.max(parseInt(limit, 10), 1), 100);

                const queryConditions = [];
                for (const [key, value] of Object.entries(filters)) {
                    if (value) {
                        // Hardcode ObjectId fields for known collections
                        const objectIdFields = {
                            staffs: ["_id", "position", "department"],
                            classes: ["_id", "staff", "section", "students"],
                        }[collection.toLowerCase()] || ["_id"];

                        if (objectIdFields.includes(key)) {
                            if (mongoose.Types.ObjectId.isValid(value)) {
                                // Use 'new' keyword for ObjectId instantiation
                                queryConditions.push({ [key]: new mongoose.Types.ObjectId(value) });
                            } else {
                                console.warn(`Invalid ObjectId for ${key}: ${value}`);
                            }
                        } else if (key === "search" && searchColumnArray.length > 0) {
                            const searchQuery = String(value).trim();
                            if (searchQuery) {
                                const orConditions = searchColumnArray.map((column) => ({
                                    [column]: { $regex: searchQuery, $options: "i" },
                                }));
                                queryConditions.push({ $or: orConditions });
                            }
                        } else if (value === "true" || value === "false") {
                            queryConditions.push({ [key]: value === "true" });
                        } else if (!isNaN(value)) {
                            queryConditions.push({ [key]: Number(value) });
                        } else {
                            queryConditions.push({ [key]: { $regex: String(value), $options: "i" } });
                        }
                    }
                }

                const finalQuery = queryConditions.length > 0 ? { $and: queryConditions } : {};
                console.log("Final Query:", JSON.stringify(finalQuery, null, 2));

                let query = model
                    .find(finalQuery)
                    .skip((pageNumber - 1) * limitNumber)
                    .limit(limitNumber);

                // Populate references based on collection
                if (collection.toLowerCase() === "staffs") {
                    query = query.populate("position").populate("department");
                }
                if (collection.toLowerCase() === "classes") {
                    query = query
                        .populate("students") // Populate students
                        .populate("staff")   // Populate staff
                        .populate({
                            path: "room",    // Populate room
                            populate: [
                                { path: "booked_by" }, // Deep populate booked_by (User)
                                { path: "section" }    // Deep populate section (Section)
                            ]
                        });
                }
                if (collection.toLowerCase() === "books") {
                    query = query.populate("bookType", "name");
                }
                if (collection.toLowerCase() === "rooms") {
                    query = query.populate("section").populate("booked_by");
                }

                const items = await query.exec();
                const totalItems = await model.countDocuments(finalQuery);

                res.status(200).json({
                    data: items,
                    currentPage: pageNumber,
                    totalPages: Math.ceil(totalItems / limitNumber),
                    totalItems,
                });
            } catch (err) {
                console.error("Error in getAll:", err.message);
                res.status(500).json({ error: "Error fetching items", details: err.message });
            }
        },

        // Get a single item by ID (uncomment and use if needed)
        getOne: async (req, res) => {
            try {
                let query = model.findById(req.params.id);

                if (collection.toLowerCase() === "books") {
                    query = query.populate("bookType", "name");
                }
                if (collection.toLowerCase() === "staffs") {
                    query = query.populate("position").populate("department");
                }
                if (collection.toLowerCase() === "classes") {
                    query = query.populate("students").populate("staff")
                }

                const item = await query.exec();
                if (!item) return res.status(404).json({ error: "Item not found" });
                res.status(200).json(item);
            } catch (err) {
                res
                    .status(500)
                    .json({ error: "Error fetching item", details: err.message });
            }
        },

        // Update an item by ID
        update: async (req, res) => {
            upload.single("image")(req, res, async (err) => {
                if (err) {
                    return res
                        .status(400)
                        .json({ error: "Error uploading image", details: err.message });
                }

                try {
                    const updatedData = req.body;
                    if (req.file) {
                        updatedData.image = req.file.path;
                    }

                    const updatedItem = await model.findByIdAndUpdate(
                        req.params.id,
                        updatedData,
                        { new: true }
                    );

                    if (!updatedItem)
                        return res.status(404).json({ error: "Item not found" });

                    res.status(200).json(updatedItem);
                } catch (err) {
                    res
                        .status(400)
                        .json({ error: "Error updating item", details: err.message });
                }
            });
        },

        // Delete an item by ID
        delete: async (req, res) => {
            try {
                const itemId = req.params.id;

                // Special handling for 'classes' collection
                if (collection.toLowerCase() === "classes") {
                    // Fetch the class with populated references
                    const classDoc = await model
                        .findById(itemId)
                        .populate("students")
                        .populate("staff")
                        .exec();

                    if (!classDoc) {
                        return res.status(404).json({ error: "Class not found" });
                    }

                    // Check for blocking references
                    const blockingReferences = [];

                    // Check students (array of references)
                    if (classDoc.students && classDoc.students.length > 0) {
                        blockingReferences.push({
                            field: "students",
                            ids: classDoc.students.map((student) => student._id.toString()),
                            collection: "students",
                        });
                    }

                    // Check staff (single reference)
                    if (classDoc.staff) {
                        blockingReferences.push({
                            field: "staff",
                            id: classDoc.staff._id.toString(),
                            collection: "staffs",
                        });
                    }

                    // Check section (single reference)
                    if (classDoc.section) {
                        blockingReferences.push({
                            field: "section",
                            id: classDoc.section._id.toString(),
                            collection: "sections",
                        });
                    }

                    // If there are blocking references, prevent deletion
                    if (blockingReferences.length > 0) {
                        const reasons = blockingReferences
                            .map((ref) => {
                                if (ref.ids) {
                                    // For arrays like 'students'
                                    return `Field "${ref.field}" with IDs [${ref.ids.join(
                                        ", "
                                    )}] is referenced in "${ref.collection}"`;
                                }
                                return `Field "${ref.field}" with ID "${ref.id}" is referenced in "${ref.collection}"`;
                            })
                            .join("; ");

                        const errorMessage = `Cannot delete this class because: ${reasons}. Please remove these references first.`;
                        console.error(`Deletion blocked for class ID ${itemId}:`, {
                            message: errorMessage,
                            blockingReferences,
                        });

                        return res.status(400).json({
                            error: errorMessage,
                            blockingReferences,
                        });
                    }
                }
                if (collection.toLowerCase() === "staffs") {
                    const staffDoc = await model.findById(itemId).populate("position").populate("department").exec();
                    if (!staffDoc) {
                        return res.status(404).json({ error: "Staff not found" });
                    }
                    if (staffDoc.position) {
                        return res.status(400).json({
                            error: "Cannot delete this staff because it is referenced in 'positions'. Please remove this reference first.",
                        });
                    }
                    if (staffDoc.department) {
                        return res.status(400).json({
                            error: "Cannot delete this staff because it is referenced in 'departments'. Please remove this reference first.",
                        });
                    }

                }
                // Proceed with deletion if no blocking references or not 'classes'
                const deletedItem = await model.findByIdAndDelete(itemId);
                if (!deletedItem) {
                    return res.status(404).json({ error: "Item not found" });
                }

                res.status(200).json({ message: "Item deleted successfully" });
            } catch (err) {
                console.error("Error deleting item:", err);
                res
                    .status(500)
                    .json({ error: "Error deleting item", details: err.message });
            }
        },
    };
};

module.exports = dynamicCrudController;
