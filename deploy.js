
const { REST, Routes } = require('discord.js');
const fs = require('fs');

const CLIENT_ID = "1494859005061894369"; // tu bot
const GUILD_ID = "1483641603955490966"; // 👈 CAMBIA ESTO

const commands = [];
const files = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));

for (const file of files) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🚀 Registrando comandos...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Comandos registrados!");
  } catch (error) {
    console.error(error);
  }
})();
