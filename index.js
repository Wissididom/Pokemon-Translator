import "dotenv/config";
import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  Partials,
  InteractionType,
} from "discord.js";
import csv2json from "csvtojson";

const bot = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
  ],
});

let lastPokemons = Date.now();

async function getPokemonNames() {
  if (!pokemons || Date.now() - lastPokemons > 1000 * 60 * 60 * 24) {
    // Older than a day
    lastPokemons = Date.now();
    // https://github.com/veekun/pokedex/blob/master/pokedex/data/csv/language_names.csv
    // https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/pokemon_species_names.csv
    return await csv2json().fromString(
      await fetch(
        "https://github.com/PokeAPI/pokeapi/raw/master/data/v2/csv/pokemon_species_names.csv",
      )
        .then(async (res) => {
          if (res.ok) return await res.text();
          else return undefined;
        })
        .catch((err) => console.error(`Error fetching Pokemon names: ${err}`)),
    );
  } else {
    return pokemons;
  }
}

let pokemons;

(async function () {
  pokemons = await getPokemonNames();
})();

function getResponse(name, target = 9 /*English*/) {
  let pokemonFound = false;
  let reply = "";
  switch (target) {
    case "1":
      reply = "あなたのポケモンは見つかりませんでした!";
      break;
    case "2":
      reply = "Anata no pokemon wa mitsukarimasendeshita!";
      break;
    case "3":
      reply = "당신의 포켓몬을 찾을 수 없습니다!";
      break;
    case "4":
      reply = "你的小精灵找不到了！";
      break;
    case "5":
      reply = "Ton Pokemon n'a pas pu être trouvé !";
      break;
    case "6":
      reply = "Dein Pokemon konnte nicht gefunden werden!";
      break;
    case "7":
      reply = "¡Tu Pokemon no ha podido ser encontrado!";
      break;
    case "8":
      reply = "Il tuo Pokemon non è stato trovato!";
    case "10":
      reply = "Vašeho Pokémona se nepodařilo najít!";
      break;
    default: // 9
      reply = "Your Pokemon couldn't be found!";
      break;
  }
  for (let i = 0; i < pokemons.length; i++) {
    if (pokemonFound) break;
    if (pokemons[i].name.toLowerCase() === name.toLowerCase()) {
      for (let j = 0; j < pokemons.length; j++) {
        if (
          pokemons[i].pokemon_species_id == pokemons[j].pokemon_species_id &&
          pokemons[j].local_language_id == target
        ) {
          switch (target) {
            case "1":
              reply = `あなたのポケモンの日本語名は **${pokemons[j].name}** です。`;
              break;
            case "2":
              reply = `Anata no pokemon no nihongo-mei wa **${pokemons[j].name}** desu.`;
              break;
            case "3":
              reply = `포켓몬의 한국 이름은 **${pokemons[j].name}**입니다.`;
              break;
            case "4":
              reply = `你的小精灵的中文名字是**${pokemons[j].name}**。`;
              break;
            case "5":
              reply = `Le nom français de votre pokémon est **${pokemons[j].name}**.`;
              break;
            case "6":
              reply = `Der deutsche Name deines Pokemons lautet **${pokemons[j].name}**.`;
              break;
            case "7":
              reply = `El nombre en español de tu pokemon es **${pokemons[j].name}**.`;
              break;
            case "8":
              reply = `Il nome italiano del tuo pokemon è **${pokemons[j].name}**.`;
              break;
            case "10":
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

function getAutocompleteResponse(entered) {
  let pokemonList = [];
  for (let i = 0; i < pokemons.length; i++) {
    if (
      pokemonList.length < 25 &&
      pokemons[i].name.toLowerCase().indexOf(entered.toLowerCase()) > -1 &&
      !pokemonList.map((x) => x.name).includes(pokemons[i].name)
    ) {
      pokemonList.push({
        name: pokemons[i].name,
        value: pokemons[i].name,
      });
    }
  }
  return pokemonList;
}

bot.on(Events.ClientReady, () => {
  console.log(`Logged in as ${bot.user.tag}!`);
});
bot.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    await interaction.respond(
      getAutocompleteResponse(interaction.options.getFocused()),
    );
  }
  if (interaction.isChatInputCommand() || interaction.isCommand()) {
    switch (interaction.commandName) {
      case "uebersetzen":
      case "translate":
        if (interaction.options.getBoolean("public") == true) {
          await interaction.deferReply();
        } else {
          await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        }
        let name = interaction.options.getString("pokemon");
        let target = interaction.options.getString("target") || "9"; // 9 = English
        name = name
          .replace("  ", " ")
          .replace(":female_sign:", "♀️")
          .replace(" ♀️", "♀")
          .replace("♀️", "♀");
        name = name
          .replace("  ", " ")
          .replace(":male_sign:", "♂️")
          .replace(" ♂️", "♂")
          .replace("♂️", "♂");
        await interaction.editReply({
          content: getResponse(name, target),
        });
    }
  }
});

bot.login(process.env.TOKEN);
