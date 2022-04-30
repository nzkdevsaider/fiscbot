let { Schema, model } = require("mongoose");

module.exports = model(
	"EmailCodes",
	new Schema({
		id: { type: String, required: true, unique: true },
		code: { type: String, required: true, unique: true },
		email: { type: String, required: true },
		createdAt: { type: String, required: true },
		verified: { type: Boolean, default: false },
	})
);
