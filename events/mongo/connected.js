/**
 * @file Se mandará a la consola un aviso cuando la base de datos establezca una conexión con el servidor de MongoDB.
 * @author Sebastián Morales
 * @since 1.0.0
 */

 module.exports = {
	name: "connected",

	execute() {
		console.error(`La base de datos ha establecido conexión con el servidor de MongoDB.`);
	},
};
