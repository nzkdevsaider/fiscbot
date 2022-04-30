/**
 * @file Se mandará a la consola un aviso cuando la base de datos se reconecte con el servidor de MongoDB.
 * @author Sebastián Morales
 * @since 1.0.0
 */

 module.exports = {
	name: "reconnected",

	execute() {
		console.error(`La base de datos ha sido reconectada con el servidor de MongoDB.`);
	},
};
