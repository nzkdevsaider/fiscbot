/**
 * @file Cuando suceda un error será desplegado en la consola.
 * @author Sebastián Morales
 * @since 1.0.0
 */

module.exports = {
	name: "error",

	execute(err) {
		console.error(`Se ha producido un error en la base de datos - ${err}`);
	},
};
