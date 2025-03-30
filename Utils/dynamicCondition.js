const mongoose = require('mongoose');

const applyDynamicConditions = (filter) => {
    let conditions = {};

    // Loop through the filter keys
    for (let key in filter) {
        let value = filter[key];

        // Handle _id separately
        if (key === '_id') {
            // Only cast to ObjectId if the value is a valid ObjectId string
            if (mongoose.Types.ObjectId.isValid(value)) {
                conditions[key] = mongoose.Types.ObjectId(value);
            } else {
                console.error(`Invalid ObjectId format for _id: ${value}`);
                continue;  // Skip this key
            }
        } else if (value === 'true') {
            conditions[key] = true;
        } else if (value === 'false') {
            conditions[key] = false;
        } else if (mongoose.Types.ObjectId.isValid(value)) {
            // For other fields, cast to ObjectId if valid
            conditions[key] = mongoose.Types.ObjectId(value);
        } else {
            // Otherwise, treat as a string or other type
            conditions[key] = value;
        }
    }

    return conditions;
};

module.exports = { applyDynamicConditions };
