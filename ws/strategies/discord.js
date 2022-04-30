const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const { VerifyCallback } = require("passport-oauth2");
const config = require("../../config.json");
const UserModel = require("../../models/User");

passport.serializeUser((user, done) => {
	return done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
	try {
		const user = await UserModel.findById({ _id });
		return user ? done(null, user) : done(null, null);
	} catch (e) {
		console.error(e);
		return done(e, null);
	}
});

passport.use(
	"discord",
	new DiscordStrategy(
		{
			clientID: config.client_id,
			clientSecret: config.client_secret,
			callbackURL: config.callback_url,
			scope: ["identify", "email", "guilds"],
		},
		async (accessToken, refreshToken, profile, done) => {
			let { id, username, discriminator, avatar } = profile;
			console.log(profile);
			try {
				let userExistente = await UserModel.findOneAndUpdate({
					id,
					accessToken,
					refreshToken,
					username,
					discriminator,
					avatar,
				});
				if (userExistente) return done(null, userExistente);

				const newUser = new UserModel({
					id,
					accessToken,
					refreshToken,
					username,
					discriminator,
					avatar,
				});
				
				const savedUser = await newUser.save();
				return done(null, savedUser);
			} catch (e) {
				console.error(e);
				return done(e, undefined);
			}
		}
	)
);
