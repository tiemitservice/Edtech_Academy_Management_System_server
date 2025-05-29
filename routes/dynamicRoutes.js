const express = require("express");
const dynamicCrudController = require("../Controller/DynamicController");
const router = express.Router();

// Define collections to handle
const collections = [
  "users",
  "staffs",
  "books",
  "book_categories",
  "students",
  "classes",
  "cours",
  "sections",
  "departments",
  "positions",
  "rooms",
  "attendances",
  "student_categories",
  "student_permissions",
  "student_payments",
];

collections.forEach((collection) => {
  const controller = dynamicCrudController(collection);
  if (controller) {
    router.post(`/${collection}`, controller.create);
    router.get(`/${collection}`, controller.getAll);
    router.patch(`/${collection}/:id`, controller.update);
    router.delete(`/${collection}/:id`, controller.delete);
  }
});

module.exports = router;
