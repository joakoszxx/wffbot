const { REST, Routes } = require('discord.js');
const fs = require('fs');
const {GUILD_ID} = "1494859005061894369";

const commands = [];
const files = fs.readdirSync('./commands');

for (const file of files) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
    { body: commands }
  );
})();
