const { Client, GatewayIntentBits, ActivityType } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
require('dotenv').config();
const express = require("express");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMembers
  ]
});

const app = express();
const listener = app.listen(process.env.PORT || 2000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
app.get('/', (req, res) => {
  res.send(`<body><center><h1>Bot 24H ON!</h1></center></body>`);
});

client.once('ready', async () => {
  console.log(`${client.user.username} is ready!`);

  client.user.setPresence({ status: 'dnd' });

  // Join voice
  let joined = false;
  setInterval(async () => {
    if (joined) return;
    try {
      const channel = await client.channels.fetch(process.env.channel);
      if (channel && channel.isVoiceBased()) {
        joinVoiceChannel({
          channelId: channel.id,
          guildId: process.env.guild,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfMute: false,
          selfDeaf: true
        });
        joined = true;
        console.log('Joined voice channel successfully.');
      }
    } catch (error) {
      console.error('Failed to join voice channel:', error.message);
    }
  }, 10000);

  // Check if user is playing VALORANT
  const guild = await client.guilds.fetch(process.env.guild);

  setInterval(async () => {
    try {
      const member = await guild.members.fetch(process.env.USER_ID);
      const activities = member.presence?.activities || [];

      const playingValorant = activities.some(activity =>
        activity.type === ActivityType.Playing &&
        activity.name.toLowerCase() === 'valorant'
      );

      if (playingValorant) {
        client.user.setActivity('VALORANT', { type: ActivityType.Playing });
        console.log('User is playing VALORANT. Bot status updated.');
      } else {
        client.user.setActivity('Sleep', { type: ActivityType.Listening });
        console.log('User is not playing. Bot status set to Sleep.');
      }
    } catch (err) {
      console.error('Error checking user activity:', err.message);
    }
  }, 15000);
});

client.login(process.env.token);
