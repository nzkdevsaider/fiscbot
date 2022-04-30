/**
 * @file Archivo principal del bot, responsable de toda la gestión y su funcionamiento principal.
 * @author Sebastián Morles
 * @version 1.0.0
 */

// Declaración de constantes principales

const fs = require("fs");
const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { token, client_id, test_guild_id, mongo } = require("./config.json");
const mongoose = require("mongoose");

/**
 * La declaración de intents de Discord.
 * @type {Object}
 * @description Cliente de la aplicación principal */

const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});

/**
 * Declaración y ejecución de la base de datos.
 * @type {Object}
 * @description Conexión a la base de datos.
 */
/**********************************************************************/

try {
	mongoose.connect(mongo, { useNewUrlParser: true, useUnifiedTopology: true });
	const mongoFiles = fs
		.readdirSync("./events/mongo")
		.filter((file) => file.endsWith(".js"));
	let db = mongoose.connection;

	for (const file of mongoFiles) {
		const event = require(`./events/mongo/${file}`);
		db.on(event.name, async (...args) => await event.execute(...args, db));
	}
} catch (e) {
	console.error("Ha ocurrido un error con la base de datos.");
}

/**
 * @description Todos los archivos de eventos.
 * @type {String[]}
 */

const eventFiles = fs
	.readdirSync("./events")
	.filter((file) => file.endsWith(".js"));

// Inspecciona todos los archivos y ejecuta los eventos encontrados.
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args, client));
	} else {
		client.on(
			event.name,
			async (...args) => await event.execute(...args, client)
		);
	}
}

/**********************************************************************/

client.commands = new Collection();
client.slashCommands = new Collection();
client.buttonCommands = new Collection();
client.selectCommands = new Collection();
client.contextCommands = new Collection();
client.cooldowns = new Collection();

// Modelos de la base de datos

let usersData = require("./models/User");

client.findOrCreateUser = async (param, isLean) => {
	return new Promise(async function (resolve, reject) {
		let userData = isLean
			? await usersData.findOne(param).lean()
			: await usersData.findOne(param);
		if (userData) {
			resolve(userData);
		} else {
			userData = new usersData(param);
			await userData.save();
			resolve(isLean ? userData.toJSON() : userData);
		}
	});
};

client.mongoUsers = usersData;

/**********************************************************************/

/**
 * @type {String[]}
 * @description Todas los comandos con sus categorías (folders)
 */

const commandFolders = fs.readdirSync("./commands");

// Inspecciona cada comando existente en el directorio.

for (const folder of commandFolders) {
	const commandFiles = fs
		.readdirSync(`./commands/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		client.commands.set(command.name, command);
	}
}

/**********************************************************************/

/**
 * @type {String[]}
 * @description Todos los comandos de slash.
 */

const slashCommands = fs.readdirSync("./interactions/slash");

// Inspecciona todos los comandos de slash existentes.

for (const module of slashCommands) {
	const commandFiles = fs
		.readdirSync(`./interactions/slash/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`./interactions/slash/${module}/${commandFile}`);
		client.slashCommands.set(command.data.name, command);
	}
}

/**********************************************************************/

/**
 * @type {String[]}
 * @description Todos los menús.
 */

const contextMenus = fs.readdirSync("./interactions/context-menus");

// Inspecciona todos los menús.

for (const folder of contextMenus) {
	const files = fs
		.readdirSync(`./interactions/context-menus/${folder}`)
		.filter((file) => file.endsWith(".js"));
	for (const file of files) {
		const menu = require(`./interactions/context-menus/${folder}/${file}`);
		const keyName = `${folder.toUpperCase()} ${menu.data.name}`;
		client.contextCommands.set(keyName, menu);
	}
}

/**********************************************************************/

/**
 * @type {String[]}
 * @description Todos los comandos de botones.
 */

const buttonCommands = fs.readdirSync("./interactions/buttons");

// Inspecciona todos los comandos de botones existentes.

for (const module of buttonCommands) {
	const commandFiles = fs
		.readdirSync(`./interactions/buttons/${module}`)
		.filter((file) => file.endsWith(".js"));

	for (const commandFile of commandFiles) {
		const command = require(`./interactions/buttons/${module}/${commandFile}`);
		client.buttonCommands.set(command.id, command);
	}
}

/**********************************************************************/

/**
 * @type {String[]}
 * @description Todos los menús de selección.
 */

const selectMenus = fs.readdirSync("./interactions/select-menus");

// Inspecciona todos los menús de selección existentes.

for (const module of selectMenus) {
	const commandFiles = fs
		.readdirSync(`./interactions/select-menus/${module}`)
		.filter((file) => file.endsWith(".js"));
	for (const commandFile of commandFiles) {
		const command = require(`./interactions/select-menus/${module}/${commandFile}`);
		client.selectCommands.set(command.id, command);
	}
}

/**********************************************************************/
// Registro de los comandos Slash en la API de Discord.

const rest = new REST({ version: "9" }).setToken(token);

const commandJsonData = [
	...Array.from(client.slashCommands.values()).map((c) => c.data.toJSON()),
	...Array.from(client.contextCommands.values()).map((c) => c.data),
];

(async () => {
	try {
		console.log("Se cargarán todos los comandos de slash (/).");

		await rest.put(Routes.applicationGuildCommands(client_id, test_guild_id), {
			body: commandJsonData,
		});

		console.log("Todos los comandos de slash (/) han sido cargados.");
	} catch (error) {
		console.error(error);
	}
})();

/**
 * Declaración y ejecución del WebServer.
 */

try {
	const WebServer = require("./ws/ws");
	new WebServer("3001", client);
} catch (e) {
	console.error("Ha ocurrido un error al intentar ejecutar el WebServer.\n", e);
}

// Login

client.login(token);
