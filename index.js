const chalk = require("chalk");
const { Client, ChannelType, ActivityType } = require("discord.js");
const loadDistube = require("./assets/distube");
const db = require("pro.db");
require("dotenv").config();
const {
  statusChannelId,
  streamChannelId,
  streamVideoUrl,
} = require("./config.json");
const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");

const client = new Client({
  intents: 3276799,
  allowedMentions: { repliedUser: false },
});

// const distube = loadDistube(client);
const distube = new DisTube(client, {
  searchSongs: 5,
  searchCooldown: 30,
  leaveOnEmpty: true,
  leaveOnFinish: true,
  leaveOnStop: true,
  plugins: [new YtDlpPlugin()],
});

distube
  .on("playSong", (queue, song) =>
    console.log(chalk.bold.yellow(`🎶 | Started ${song.name}`))
  )
  .on("error", (textChannel, e) => console.error(e))
  .on("finish", (queue) => console.log(chalk.bold.yellow(`🔈 | Finished`)))
  .on("finishSong", (queue) => console.log(chalk.bold.yellow(`🔈 | Finished`)))
  .on("disconnect", (queue) =>
    console.log(chalk.bold.yellow(`📴 | Disconnected`))
  )
  .on("empty", (queue) => console.log(chalk.bold.yellow(` | Empty`)));

client.login(process.env.TOKEN).catch((err) => console.log(err));

client.on("ready", async () => {
  console.log(chalk.bold.green(`🤖 | ${client.user.tag} is now online.`));
  client.user.setStatus("idle");
  client.user.setActivity({
    name: `Developer Tools`,
    type: ActivityType.Watching,
  });
  let statusChannel = client.channels.cache.get(statusChannelId);
  if (!statusChannel)
    return console.log(
      chalk.bold.red(`⛔ | Please provide a text based channel.`)
    );
  let streamChannel = client.channels.cache.get(streamChannelId);
  if (!streamChannel)
    return console.log(
      chalk.bold.red(`⛔ | Please provide a voice based channel.`)
    );
  if (!streamChannel.type == ChannelType.GuildVoice)
    return console.log(
      chalk.bold.red(`⛔ | Please provide a voice based channel.`)
    );
  if (!streamChannel.type == ChannelType.GuildStageVoice)
    return console.log(
      chalk.bold.red(`⛔ | Please provide a voice based channel.`)
    );
  if (streamChannel) {
    let progressData = await db.get(`streamProg_${streamChannel.guild.id}`);
    if (!progressData) progressData = 0;
    let msg;
    statusChannel
      .send({
        content: `🎶 **| The bot is online, Starting the player soon.**`,
      })
      .then(async (message) => {
        distube.play(streamChannel, streamVideoUrl, {
          message: message,
          textChannel: message.channel,
        }).then(async () => {
          distube.seek(message, progressData);
        });
        msg = message;
      });
    setInterval(async () => {
      let queue = distube.getQueue(msg);
      let song = queue.songs[0];
      let progress = queue.currentTime;
      if (progress == 0) return;
      db.set(`streamProg_${streamChannel.guild.id}`, progress);
      console.log(progress);
    }, 100);
  }
});
