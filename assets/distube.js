const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const chalk = require("chalk");

module.exports = async (client) => {
  const distube = new DisTube(client, {
    searchSongs: 5,
    searchCooldown: 30,
    leaveOnEmpty: true,
    leaveOnFinish: true,
    leaveOnStop: true,
    plugins: [new YtDlpPlugin()],
  });

  distube
    .on("playSong", (queue, song) => console.log(chalk.bold.yellow(`🎶 | Started ${song.name}`)))
    .on("error", (textChannel, e) => console.error(e))
    .on("finish", (queue) => console.log(chalk.bold.yellow(`🔈 | Finished`)))
    .on("finishSong", (queue) => console.log(chalk.bold.yellow(`🔈 | Finished`)))
    .on("disconnect", (queue) => console.log(chalk.bold.yellow(`📴 | Disconnected`)))
    .on("empty", (queue) => console.log(chalk.bold.yellow(` | Empty`)));

  return distube;
};
