import dotenv from 'dotenv';
import { Client, GatewayIntentBits as Intents, ChannelType, TextChannel } from 'discord.js';
import { Configuration, OpenAIApi } from 'openai';
import { getCompletion } from './utils.js';

dotenv.config();

const key = process.env.oaiKey!;
const token = process.env.discordToken!;
const prefix = 'j';

const openai = new OpenAIApi(
  new Configuration({
    apiKey: key
  })
);

const client = new Client({
  intents: [Intents.Guilds, Intents.GuildMessages, Intents.MessageContent]
});

client.on('ready', async client => {
  console.log(`${client.user.username} has connected.`);
  // console.log(`Alive in ${(await client.guilds.fetch()).size} guilds`);

  // const guilds = client.guilds.cache.values();
  // const str: string[] = [];

  // for (const guild of guilds) {
  //   const name = guild.name;
  //   const channel = guild.channels.cache.filter(c => c.type === ChannelType.GuildText).first()! as TextChannel;

  //   const invite = await channel.createInvite({ maxAge: 0, maxUses: 1 });

  //   str.push(`${name} - ${invite.url}`);
  // }

  // console.log(str.join('\n\n'));
});

client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  if (!args[0]) return;

  const cmdName = args.shift()!.toLowerCase();

  if (cmdName === 'w' || cmdName === 's') {
    await message.channel.sendTyping();

    let reply: string | undefined;

    try {
      reply = await getCompletion(openai, message, prefix);
    } catch (e: any) {
      console.error(e.message);
    }

    await message.reply({ content: reply || 'Error.', tts: cmdName === 's' });
  }
});

client.login(token);
