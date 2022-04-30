/**
 * @file Se mandará a la consola un aviso cuando la base de datos establezca una conexión con el servidor de MongoDB.
 * @author Sebastián Morales
 * @since 1.0.0
 */

module.exports = {
	name: "connecting",

	execute() {
		console.error(`Iniciando conexión con el servidor de la base de datos...`);
	},
};
