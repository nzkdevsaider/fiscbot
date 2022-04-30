/**
 * @file Se mandará a la consola un aviso cuando la base de datos pierda la conexión con el servidor de MongoDB.
 * @author Sebastián Morales
 * @since 1.0.0
 */

 module.exports = {
	name: "disconnected",

	execute() {
		console.error(`La base de datos ha pérdido conexión con el servidor de MongoDB.`);
	},
};
