const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('release')
    .setDescription('Release player')
    .addUserOption(o => o.setName('player').setRequired(true))
    .addStringOption(o => o.setName('team').setRequired(true))
    .addStringOption(o => o.setName('reason').setRequired(true)),

  async execute(interaction) {

    const player = interaction.options.getUser('player');
    const team = interaction.options.getString('team');
    const reason = interaction.options.getString('reason');

    let storage = JSON.parse(fs.readFileSync('./storage.json'));

    if (storage.squads[team]) {
      storage.squads[team] = storage.squads[team].filter(id => id !== player.id);
    }

    fs.writeFileSync('./storage.json', JSON.stringify(storage, null, 2));

    const emoji = config.teams[team] || "";
    const channel = interaction.guild.channels.cache.find(c => c.name === config.logChannelName);

    const embed = {
      color: 0xff0000,
      description:
`📤**Player Released**

**${player}** has been released from ${emoji} **${team}**

**Player**     **Team**        **Released by**
${player}, ${emoji} ${team}        ${interaction.user}

**Reason**
${reason}

WFF - ${new Date().toLocaleString()}`
    };

    await channel.send({ embeds: [embed] });

    await interaction.reply({ content: "Player released", ephemeral: true });
  }
};
