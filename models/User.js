let { Schema, model } = require("mongoose");
module.exports = model(
	"User",
	new Schema({
		id: { type: String, required: true, unique: true },
		nombre: { type: String, default: undefined},
		verifyStudent: { type: Boolean, default: false },
		studentEmail: { type: String, default: undefined },
		accessToken: { type: String, default: undefined },
		refreshToken: { type: String, default: undefined },
		username: { type: String, default: undefined },
		discriminator: { type: String, default: undefined },
		avatar: { type: String, default: undefined },
	})
);
