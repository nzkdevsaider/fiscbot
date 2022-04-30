// Webserver

const express = require("express"),
	morgan = require("morgan"),
	axios = require("axios"),
	config = require("../config.json"),
	url = require("url"),
	cors = require("cors"),
	session = require("express-session"),
	passport = require("passport"),
	store = require("connect-mongo");

const EmailCodes = require("../models/EmailCodes");
const User = require("../models/User");
const moment = require("moment");
const mailer = require("nodemailer");

class WebServer {
	constructor(port, client) {
		this.port = port;
		this.client = client;

		this.app = express();

		// Config
		this.app.set("port", port);
		this.app.set("json spaces", 2);

		// Middleware
		this.app.use(morgan("dev"));
		this.app.use(express.urlencoded({ extended: false }));
		this.app.use(express.json());
		this.app.use(
			cors({ origin: ["http://localhost:3000"], credentials: true })
		);

		this.app.use(
			session({
				secret: "takane",
				resave: false,
				saveUninitialized: false,
				cookie: { maxAge: 1800000 },
				store: store.create({
					mongoUrl: config.mongoDash,
				}),
				name: "discordoauth",
			})
		);

		this.app.use(passport.initialize());
		this.app.use(passport.session());

		// Rutas
		this.registerRoutes();

		this.server = this.app.listen(this.app.get("port"), () => {
			console.log(`[WebServer] Servidor escuchando en ${this.app.get("port")}`);
		});
	}

	isAuthorized(req, res, next) {
		if (req.user) {
			console.log("El usuario está logeado.");
			next();
		} else {
			console.log("El usuario no está logeado.");
			res.sendStatus(401);
		}
	}

	registerRoutes() {
		require("./strategies/discord");

		this.app.get("/", (req, res) => {
			res.send("fiscbot");
		});

		this.app.get("/webserver/:id", (req, res) => {
			let { id } = req.params;

			if (!id) {
				res.send("No se ha especificado el usuario.");
				return;
			}

			this.client.mongoUsers.findOne({ id: id }, (err, user) => {
				if (!user) {
					res.send({
						error: true,
						message: "Usuario no encontrado en la base de datos.",
					});
					return;
				}
				res.send(user);
			});
		});

		// Auth
		this.app.get(
			"/auth/discord/",
			passport.authenticate("discord"),
			(req, res) => {
				res.sendStatus(200);
			}
		);

		this.app.get(
			"/auth/discord/redirect",
			passport.authenticate("discord", {
				failureRedirect: "/auth/disocrd/failed",
				successRedirect: "http://localhost:3000/user",
			})
		);

		this.app.get("/auth/discord/failed", (req, res) => {
			return res.sendStatus(400);
		});

		this.app.get("/auth/discord/logout", (req, res) => {
			if (req.user) {
				req.logout();
				res.redirect("http://localhost:3000/");
			} else {
				res.redirect("/auth/discord");
			}
		});

		// Data

		this.app.get("/discord/get-user", this.isAuthorized, (req, res) => {
			res.send(req.user);
		});

		// Email Verification

		this.app.post(
			"/email/send-verification",
			this.isAuthorized,
			async (req, res) => {
				const { id, email, nombre } = req.body;
				console.log(req.body);
				const validateEmail = /^[A-Za-z0-9._%+-]+@utp.ac.pa$/g.test(email);
				const codeGenerator = Math.floor(1000 + Math.random() * 9000);

				if (!validateEmail) {
					res.send({ utpEmail: false });
					return;
				}

				const emailCode = await EmailCodes.findOneAndUpdate(
					{ id },
					{ code: codeGenerator, email }
				);

				if (!emailCode) {
					let createEmailCode = new EmailCodes({
						id,
						code: codeGenerator,
						createdAt: moment(),
						email,
					});
					if (nombre) {
						await User.findOneAndUpdate({ id }, { nombre });
					}
					await createEmailCode.save();
				}

				let transporter = mailer.createTransport({
					service: "gmail",
					auth: {
						user: config.mailer_mail,
						pass: config.mailer_password,
					},
				});

				let mailOptions = {
					from: config.mailer_mail,
					to: email,
					subject: "FISCBOT - Verificación de correo estudiantil",
					text: "Tu código de verificación es: " + codeGenerator,
				};

				transporter.sendMail(mailOptions, function (error, info) {
					if (error) {
						res.sendStatus(500);
						console.log(error);
					} else {
						console.log("Email sent: " + info.response);
						res.send({ codeSent: true });
					}
				});
			}
		);

		this.app.post(
			"/email/verification",
			this.isAuthorized,
			async (req, res) => {
				const { code, id } = req.body;

				let emailCodeExiste = await EmailCodes.findOne({ id });
				let student = await User.findOne({ id });
				if (!emailCodeExiste) res.send({ codeExist: false });
				if (student.verifyStudent) res.send({ alreadyVerified: true });

				if (code === emailCodeExiste.code) {
					student.verifyStudent = true;
					student.studentEmail = emailCodeExiste.email;
					student.save();
					res.send({ verified: true, email: emailCodeExiste.email });
					emailCodeExiste.remove();
				} else {
					res.send({ codeInvalid: true });
				}
			}
		);
	}
}

module.exports = WebServer;
