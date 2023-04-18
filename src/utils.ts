import { Message } from 'discord.js';
import { OpenAIApi, ChatCompletionRequestMessage as GPTMessage } from 'openai';

export async function getCompletion(api: OpenAIApi, msg: Message, prefix: string) {
  const history = (
    await msg.channel.messages.fetch({
      limit: 15
    })
  ).sort((a, b) => a.createdTimestamp - b.createdTimestamp);

  const formatted: GPTMessage[] = [...history.values()]
    .filter(m => {
      if (!m.content.startsWith(prefix) || m.author.bot) return false;

      const args = m.content.slice(prefix.length).trim().split(/ +/);
      if (!args[0]) return false;

      const cmdName = args.shift()!.toLowerCase();

      return cmdName === 'w' || cmdName === 's';
    })
    .map(m => {
      const args = m.content.slice(prefix.length).trim().split(/ +/);
      const cmdName = args.shift()!.toLowerCase();

      const msgContent = m.content.slice(prefix.length).slice(cmdName.length);

      let username = m.author.username;
      const usernameRegex = /^[a-zA-Z0-9_-]{1,64}$/;

      if (!usernameRegex.test(username)) {
        username = `user-${m.author.id}`;
      }

      return {
        content: msgContent.trim(),
        role: 'user',
        name: username
      };
    });

  const completion = await api.createChatCompletion({
    model: 'gpt-3.5-turbo',
    max_tokens: 1000,
    stop: ['\n', 'Human:', 'AI:'],
    messages: formatted
  });

  return completion.data.choices[0].message?.content ?? 'No Response';
}
