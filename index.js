console.log("🔥 NUEVO INDEX CARGADO");
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running');
});
// hola webserver para evitar que glitch cierre el bot por inactividad
app.listen(process.env.PORT || 3000, () => {
  console.log('Web server activo');
});
const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));


for (const file of commandFiles) {
  try {
    const cmd = require(`./commands/${file}`);

    if (!cmd || !cmd.data || !cmd.data.name) {
      console.log("❌ INVALID COMMAND FILE:", file, cmd);
      continue;
    }

    client.commands.set(cmd.data.name, cmd);
    console.log("✅ LOADED:", file);

  } catch (err) {
    console.log("💥 ERROR LOADING:", file);
    console.error(err);
  }
}

client.on('interactionCreate', async interaction => {

  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    await command.execute(interaction, client);
  }

  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    if (command.autocomplete) {
      await command.autocomplete(interaction);
    }
  }

  if (interaction.isButton()) {
    const data = JSON.parse(interaction.customId);
    let storage = JSON.parse(fs.readFileSync('./storage.json'));

    let newEmbed;

    if (data.type === "accept") {

      if (!storage.squads[data.team]) {
        storage.squads[data.team] = [];
      }

      const playerId = data.player.replace(/[<@>]/g, '');

      if (!storage.squads[data.team].includes(playerId)) {
        storage.squads[data.team].push(playerId);
      }

      fs.writeFileSync('./storage.json', JSON.stringify(storage, null, 2));

      newEmbed = {
        color: 0x00ff00,
        description: `🤝Contract Accepted!\n\nPosition: ${data.position}\nTeam: ${data.team}\n\n**Player**     **Team**      **Manager**\n${data.player}, ${data.emoji} ${data.team}        ${data.manager}\nWFF - ${new Date().toLocaleString()}`
      };
    }

    if (data.type === "decline") {
      newEmbed = {
        color: 0xff0000,
        description: `${data.manager}\n❌ Contract declined\n\nPosition: ${data.position}\nTeam: ${data.team}\n\n**Player**     **Team**       **Manager**\n${data.player}, ${data.emoji} ${data.team}        ${data.manager}\nWFF - ${new Date().toLocaleString()}`
      };
    }

    await interaction.update({
      content: "",
      embeds: [newEmbed],
      components: []
    });
  }
});

process.on('unhandledRejection', console.error);
process.on('uncaughtException', console.error);

client.login(process.env.TOKEN);