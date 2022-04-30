/**
 * @file Sample ping command
 * @author Naman Vrati
 * @since 1.0.0
 */

module.exports = {
	name: "ping",
	execute(message, args, data) {
		message.channel.send({ content: `Pong! Tu ID es ${data.user.id}` });
	},
};
