const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.DIRECT_MESSAGES] });
const fs = require("fs");

// Load config
const { prefix, token } = require("./config.json");

// Load birthdays data
let birthdays = {};
try {
  birthdays = require("./birthdays.json");
} catch (error) {
  console.error("Error loading birthdays:", error);
}

client.once("ready", () => {
  console.log("Bot is ready!");
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return; // Ignore bot messages
  if (!message.content.startsWith(prefix)) return; // Ignore messages without prefix

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "setbirthday") {
    const birthday = args.join(" ");
    birthdays[message.author.id] = birthday;
    fs.writeFileSync("./birthdays.json", JSON.stringify(birthdays, null, 4));
    message.channel.send(`Birthday set for ${message.author}: ${birthday}`);
  }
});

client.on("ready", () => {
  setInterval(
    () => {
      const currentDate = new Date();
      const currentDay = currentDate.getDate();
      const currentMonth = currentDate.getMonth() + 1; // Months are 0 indexed in JS
      for (const userId in birthdays) {
        const [day, month] = birthdays[userId].split("-").map(Number);
        if (currentDay === day && currentMonth === month) {
          const user = client.users.cache.get(userId);
          if (user) {
            user.send(`Happy Birthday <@${userId}>! 🎉🎂`);
            const channel = client.channels.cache.get("your_channel_id");
            if (channel) {
              channel.send(`<@${userId}> Happy Birthday! 🎉🎂`);
            } else {
              console.error("Channel not found!");
            }
          }
        }
      }
    },
    1000 * 60 * 60 * 24,
  ); // Check every 24 hours
});

client.login(token);
