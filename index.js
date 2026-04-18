const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require('fs');
console.log("TOKEN:", process.env.TOKEN);

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
  const cmd = require(`./commands/${file}`);
  client.commands.set(cmd.data.name, cmd);
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
    const fs = require('fs');
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

client.login(process.env.TOKEN);