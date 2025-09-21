import "dotenv/config";
import {
  Client,
  Events,
  GatewayIntentBits,
  MessageFlags,
  Partials,
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

let lastPokemons = 0;
let pokemons = [];

const messages = {
  notFound: {
    1: "あなたのポケモンは見つかりませんでした!",
    2: "Anata no pokemon wa mitsukarimasendeshita!",
    3: "당신의 포켓몬을 찾을 수 없습니다!",
    4: "你的小精灵找不到了！",
    5: "Ton Pokemon n'a pas pu être trouvé !",
    6: "Dein Pokemon konnte nicht gefunden werden!",
    7: "¡Tu Pokemon no ha podido ser encontrado!",
    8: "Il tuo Pokemon non è stato trovato!",
    10: "Vašeho Pokémona se nepodařilo najít!",
    9: "Your Pokemon couldn't be found!", // default
  },
  found: {
    1: (name) => `あなたのポケモンの日本語名は **${name}** です。`,
    2: (name) => `Anata no pokemon no nihongo-mei wa **${name}** desu.`,
    3: (name) => `포켓몬의 한국 이름은 **${name}**입니다.`,
    4: (name) => `你的小精灵的中文名字是**${name}**。`,
    5: (name) => `Le nom français de votre pokémon est **${name}**.`,
    6: (name) => `Der deutsche Name deines Pokemons lautet **${name}**.`,
    7: (name) => `El nombre en español de tu pokemon es **${name}**.`,
    8: (name) => `Il nome italiano del tuo pokemon è **${name}**.`,
    10: (name) => `České jméno vašeho pokémona je **${name}**.`,
    9: (name) => `The english name of your pokemon is **${name}**.`,
  },
};

async function getPokemonNames() {
  if (!pokemons || Date.now() - lastPokemons > 1000 * 60 * 60 * 24) {
    // Older than a day
    lastPokemons = Date.now();
    try {
      // https://github.com/veekun/pokedex/blob/master/pokedex/data/csv/language_names.csv
      // https://github.com/PokeAPI/pokeapi/blob/master/data/v2/csv/pokemon_species_names.csv
      const res = await fetch(
        "https://github.com/PokeAPI/pokeapi/raw/master/data/v2/csv/pokemon_species_names.csv",
      );
      if (!res.ok) throw new Error("Failed to fetch Pokémon names");
      pokemons = await csv2json().fromString(await res.text());
    } catch (err) {
      console.error(`Error fetching Pokemon names: ${err}`);
    }
  }
}

function getResponse(name, target = "9" /*English*/) {
  const lang = String(target);
  const baseMsg = messages.notFound[lang] || messages.notFound[9];
  const match = pokemons.find(
    (p) => p.name.toLowerCase() === name.toLowerCase(),
  );
  if (!match) return baseMsg;
  const translation = pokemons.find(
    (p) =>
      p.pokemon_species_id === match.pokemon_species_id &&
      p.local_language_id == lang,
  );
  if (!translation) return baseMsg;
  return (messages.found[lang] || messages.found[9])(translation.name);
}

function getAutocompleteResponse(entered) {
  const lower = entered.toLowerCase();
  const seen = new Set();
  return pokemons
    .filter((p) => p.name.toLowerCase().includes(lower))
    .filter((p) => !seen.has(p.name) && seen.add(p.name))
    .slice(0, 25)
    .map((p) => ({ name: p.name, value: p.name }));
}

function normalizeName(name) {
  return name
    .replace(/\s+/g, " ")
    .replace(/:female_sign:| ♀️|♀️/g, "♀")
    .replace(/:male_sign:| ♂️|♂️/g, "♂");
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
    if (["uebersetzen", "translate"].includes(interaction.commandName)) {
      await interaction.deferReply({
        flags: interaction.options.getBoolean("public")
          ? undefined
          : MessageFlags.Ephemeral,
      });
      const name = normalizeName(interaction.options.getString("pokemon"));
      const target = interaction.options.getString("target") || "9";
      await interaction.editReply({
        content: getResponse(name, target),
      });
    }
  }
});

await getPokemonNames();
bot.login(process.env.TOKEN);
