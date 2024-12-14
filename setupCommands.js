import "dotenv/config";
import { REST, Routes, SlashCommandBuilder } from "discord.js";

const rest = new REST().setToken(process.env.TOKEN);

let commands = [
  new SlashCommandBuilder()
    .setName("translate")
    .setNameLocalizations({
      de: "uebersetzen",
    })
    .setDescription("Translates the Name of a pokemon into english")
    .setDescriptionLocalizations({
      de: "Übersetzt den Namen des Pokemon ins Englische",
    })
    .addStringOption((option) =>
      option
        .setName("pokemon")
        .setNameLocalizations({
          de: "pokemon",
        })
        .setDescription("The pokemon to translate")
        .setDescriptionLocalizations({
          de: "Das zu übersetzende Pokémon",
        })
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("target")
        .setNameLocalizations({
          de: "ziel",
        })
        .setDescription("The language to translate to")
        .setDescriptionLocalizations({
          de: "Die Sprache in die übersetzt werden soll",
        })
        .setRequired(false)
        .addChoices(
          {
            name: "日本語",
            value: "1",
          },
          {
            name: "Rōmaji",
            value: "2",
          },
          {
            name: "한국어",
            value: "3",
          },
          {
            name: "中国人",
            value: "4",
          },
          {
            name: "Français",
            value: "5",
          },
          {
            name: "Deutsch",
            value: "6",
          },
          {
            name: "Español",
            value: "7",
          },
          {
            name: "italiano",
            value: "8",
          },
          {
            name: "English",
            value: "9",
          },
          {
            name: "čeština",
            value: "10",
          },
        ),
    ),
];

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`,
    );
    for (let i = 0; i < commands.length; i++) {
      commands[i] = commands[i].toJSON();
      commands[i].integration_types = [
        0, // Guild Install
        1, // User Install
      ];
      commands[i].contexts = [
        0, // Guild
        1, // Bot DM
        2, // Private Channel
      ];
    }
    const userData = await rest.get(Routes.user());
    const userId = userData.id;
    const data = await rest.put(Routes.applicationCommands(userId), {
      body: commands,
    });
    console.log(
      `Successfully reloaded ${data.length} application (/) commands.`,
    );
  } catch (err) {
    console.error(err);
  }
})();
