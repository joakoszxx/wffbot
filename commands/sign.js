const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sign')
    .setDescription('Send a contract')
    .addUserOption(o =>
      o.setName('player')
        .setDescription('Player to sign')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('team')
        .setDescription('Team')
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName('position')
        .setDescription('Position')
        .setRequired(true)
    ),

  async execute(interaction) {

    let storage = JSON.parse(fs.readFileSync('./storage.json'));

    // ❌ TW cerrado
    if (storage.tw !== "opened") {
      return interaction.reply({ content: "Transfer Window is closed", ephemeral: true });
    }

    // ❌ No es manager
    if (!interaction.member.roles.cache.has(config.managerRole)) {
      return interaction.reply({ content: "You are not a manager", ephemeral: true });
    }

    const player = interaction.options.getUser('player');
    const team = interaction.options.getString('team');
    const position = interaction.options.getString('position');

    const emoji = config.teams[team] || "";
    const channel = interaction.guild.channels.cache.find(c => c.name === config.logChannelName);

    if (!channel) {
      return interaction.reply({ content: "Channel not found", ephemeral: true });
    }

    // 🧠 BOTONES
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(JSON.stringify({
          type: "accept",
          player: `<@${player.id}>`,
          manager: `<@${interaction.user.id}>`,
          team,
          position,
          emoji
        }))
        .setLabel("Accept")
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId(JSON.stringify({
          type: "decline",
          player: `<@${player.id}>`,
          manager: `<@${interaction.user.id}>`,
          team,
          position,
          emoji
        }))
        .setLabel("Decline")
        .setStyle(ButtonStyle.Danger)
    );

    // 📃 EMBED
    const embed = {
      color: 0x0099ff,
      description:
`📃A contract has been sent to you!

**${interaction.user}** has sent a contract to **${player}**

Position: ${position}
Team: ${team}

Player     Team        Manager
${player}, ${emoji} ${team}        ${interaction.user}

WFF - ${new Date().toLocaleString()}`
    };

    // 📤 MENSAJE EN CANAL
    await channel.send({
      content: `${interaction.user} ${player}`,
      embeds: [embed],
      components: [row]
    });

    // 📩 DM AL PLAYER
    try {
      await player.send(`${player}, ${interaction.user} sent you a contract in WFF!`);
    } catch {
      console.log("No se pudo enviar DM");
    }

    await interaction.reply({ content: "Contract sent", ephemeral: true });
  }
};