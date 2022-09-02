require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ApplicationCommandType, ApplicationCommandOptionType } = require('discord.js');
const bot = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages], partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction]});
const token = process.env['TOKEN'];
bot.on('ready', async () => {
	console.log(`Logged in as ${bot.user.tag}!`);
	let options = [
		{
			name: 'pokemon',
			description: 'The pokemon to translate',
			required: true,
			type: ApplicationCommandOptionType.String
		},
		{
			name: 'target',
			description: 'The language to translate to',
			required: false,
			type: ApplicationCommandOptionType.String,
			choices: [
				{
					name: '日本語',
					value: '1'
				},
				{
					name: 'Rōmaji',
					value: '2'
				},
				{
					name: '한국어',
					value: '3'
				},
				{
					name: '中国人',
					value: '4'
				},
				{
					name: 'Français',
					value: '5'
				},
				{
					name: 'Deutsch',
					value: '6'
				},
				{
					name: 'Español',
					value: '7'
				},
				{
					name: 'italiano',
					value: '8'
				},
				{
					name: 'English',
					value: '9'
				},
				{
					name: 'čeština',
					value: '10'
				}
			]
		}
	];
	await bot.application?.commands?.create({
		name: 'uebersetzen',
		description: 'Übersetzt den Namen des Pokemon ins Englische',
		type: ApplicationCommandType.ChatInput,
		options: options
	});
	await bot.application?.commands?.create({
		name: 'translate',
		description: 'Translates the Name of a pokemon into english',
		type: ApplicationCommandType.ChatInput
		options: options
	});
	process.kill(process.pid, 'SIGTERM');
});
bot.login(token);
