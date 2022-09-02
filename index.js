// TODO: Load the pokemon species names from github by using csv2json
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, InteractionType } = require('discord.js');
const pokemons = require('./pokemon_species_names.json');
const bot = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.DirectMessages, GatewayIntentBits.MessageContent], partials: [Partials.User, Partials.Channel, Partials.GuildMember, Partials.Message, Partials.Reaction]});
const token = process.env['TOKEN'];

function getResponse(name, target = 9/*English*/) {
	let pokemonFound = false;
	let reply = '';
	switch (target) {
		case '1':
			reply = 'あなたのポケモンは見つかりませんでした!';
			break;
		case '2':
			reply = 'Anata no pokemon wa mitsukarimasendeshita!';
			break;
		case '3':
			reply = '당신의 포켓몬을 찾을 수 없습니다!';
			break;
		case '4':
			reply = '你的小精灵找不到了！';
			break;
		case '5':
			reply = "Ton Pokemon n'a pas pu être trouvé !";
			break;
		case '6':
			reply = 'Dein Pokemon konnte nicht gefunden werden!';
			break;
		case '7':
			reply = '¡Tu Pokemon no ha podido ser encontrado!';
			break;
		case '8':
			reply = 'Il tuo Pokemon non è stato trovato!';
		case '10':
			reply = 'Vašeho Pokémona se nepodařilo najít!';
			break;
		default: // 9
			reply = "Your Pokemon couldn't be found!";
			break;
	}
	for (let i = 0; i < pokemons.length; i++) {
		if (pokemonFound)
			break;
		if (pokemons[i].name.toLowerCase() === name.toLowerCase()) {
			for (let j = 0; j < pokemons.length; j++) {
				if (pokemons[i].pokemon_species_id == pokemons[j].pokemon_species_id && pokemons[j].local_language_id == target) {
					switch (target) {
						case '1':
							reply = `あなたのポケモンの日本語名は **${pokemons[j].name}** です。`;
							break;
						case '2':
							reply = `Anata no pokemon no nihongo-mei wa **${pokemons[j].name}** desu.`;
							break;
						case '3':
							reply = `포켓몬의 한국 이름은 **${pokemons[j].name}**입니다.`;
							break;
						case '4':
							reply = `你的小精灵的中文名字是**${pokemons[j].name}**。`;
							break;
						case '5':
							reply = `Le nom français de votre pokémon est **${pokemons[j].name}**.`;
							break;
						case '6':
							reply = `Der deutsche Name deines Pokemons lautet **${pokemons[j].name}**.`;
							break;
						case '7':
							reply = `El nombre en español de tu pokemon es **${pokemons[j].name}**.`;
							break;
						case '8':
							reply = `Il nome italiano del tuo pokemon è **${pokemons[j].name}**.`;
							break;
						case '10':
							reply = `České jméno vašeho pokémona je **${pokemons[j].name}**.`;
						default: // 9
							reply = `The english name of your pokemon is **${pokemons[j].name}**.`;
							break;
					}
					pokemonFound = true;
				}
			}
		}
	}
	return reply;
}

bot.on('ready', () => {
	console.log(`Logged in as ${bot.user.tag}!`);
});
bot.on('interactionCreate', async (interaction) => {
	if (!interaction.type === InteractionType.ApplicationCommand)
		return;
	const { commandName, options } = interaction;
	switch (commandName) {
		case 'uebersetzen':
		case 'translate':
			let name = options.getString('pokemon');
			let target = options.getString('target') || '9'; // 9 = English
			// console.log(`interactionCreate:${name}`);
			name = name.replace('  ', ' ').replace(':female_sign:', '♀️').replace(' ♀️', '♀').replace('♀️', '♀');
			name = name.replace('  ', ' ').replace(':male_sign:', '♂️').replace(' ♂️', '♂').replace('♂️', '♂');
			let pokemonFound = false;
			interaction.reply({
				content: getResponse(name, target),
				ephemeral: true
			});
	}
});
bot.on('messageCreate', async (message) => {
	if (message.author.bot) return; // Don't read  messages from bots
	if (message.content.startsWith('!übersetzen') || message.content.startsWith('!uebersetzen') || message.content.startsWith('!translate')) {
		let name = message.content.substring(message.content.indexOf(' ') + 1).trim();
		name = name.replace('  ', ' ').replace(':female_sign:', '♀️').replace(' ♀️', '♀').replace('♀️', '♀');
		message.author.send(getResponse(name)).then(message => console.log('Pokemon Name sent successfully!')).catch(e => {
			console.error(e);
			message.channel.send(`<@!${message.author.id}> DM could not be delivered!`).then(message => console.log('Error message sent successfully!')).catch(console.error);
		});
		if (message.guild)
			message.delete().then(message => console.log('Message successfully deleted!')).catch(console.error);
	}
});
bot.login(token);
