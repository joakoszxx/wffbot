const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tw')
    .setDescription('Open or close transfer window')
    .addStringOption(opt =>
      opt.setName('state')
        .setDescription('State')
        .setRequired(true)
        .addChoices(
          { name: 'opened', value: 'opened' },
          { name: 'closed', value: 'closed' }
        )
    ),

  async execute(interaction) {

    const state = interaction.options.getString('state');

    let storage = JSON.parse(fs.readFileSync('./storage.json'));

    storage.tw = state;

    fs.writeFileSync('./storage.json', JSON.stringify(storage, null, 2));

    await interaction.reply(`${interaction.user} has ${state} the Transfer Window!`);
  }
};
