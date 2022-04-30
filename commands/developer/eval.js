const { exec } = require("child_process"),
	util = require("util"),
	axios = require("axios"),
	_ = require("lodash"),
	moment = require("moment"),
	fs = require("fs");

module.exports = {
	name: "eval",
	description: "Evalúa una expresión del sistema.",
	args: true,
	ownerOnly: true,

	async execute(message, args, data, embed) {
		let author = message.author,
			client = message.client,
			member = message.member,
			guild = message.guild,
			channel = message.channel;
		try {
			let evalued = await eval(args.join(" "));
			if (typeof evalued !== "string")
				evalued = util.inspect(evalued, { depth: 0 });

			if (evalued.length > 1024) {
				let buffer = Buffer.from(
					`=== OUTPUT / ${args.join(" ")} ===\n\n${evalued}`
				);
				let attachment = new MessageAttachment(buffer, `output.txt`);
				message.channel.send(attachment);
			} else {
				embed
					.setTitle("Evaluación")
					.addField("Output", "```js\n" + evalued + "\n```");
				message.channel.send({ embeds: [embed] });
			}
		} catch (err) {
			console.error(err);
			embed
				.setTitle("Error")
				.setDescription(
					"> Se ha producido un error de tipo **" + err.name + "**."
				)
				.addField("Output", "```js\n" + err.toString() + "\n```");
			message.channel.send({ embeds: [embed] });
		}
	},
};
