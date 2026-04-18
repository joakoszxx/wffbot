const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('teamsheet')
    .setDescription('Show team squad')
    .addStringOption(opt =>
      opt.setName('team')
        .setDescription('Team')
        .setRequired(true)
    ),

  async execute(interaction) {

    const team = interaction.options.getString('team');

    const storage = JSON.parse(fs.readFileSync('./storage.json'));

    const squad = storage.squads[team] || [];
    const emoji = config.teams[team] || "";

    if (squad.length === 0) {
      return interaction.reply(`No players in ${emoji} ${team}`);
    }

    const playersList = squad.map(id => `<@${id}>`).join('\n');

    const embed = {
      color: 0x0099ff,
      title: `${emoji} ${team} Squad`,
      description: playersList
    };

    await interaction.reply({ embeds: [embed] });
  }
};