/**
 * @file Ready Event File.
 * @author Naman Vrati
 * @since 1.0.0
 */

module.exports = {
	name: "ready",
	once: true,

	/**
	 * @description Executes the block of code when client is ready (bot initialization)
	 * @param {Object} client Main Application Client
	 */
	execute(client) {
		console.log(`El bot ha sido iniciado en Discord - ${client.user.tag}`);
	},
};
