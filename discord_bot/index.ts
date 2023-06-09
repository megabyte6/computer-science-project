const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const token = process.env.BOT_TOKEN;
import { bold, codeBlock, EmbedBuilder, Interaction, Message } from "discord.js";
import Game from "../src/Game"
import { LogType } from "../src/LogTypes";
import UserPermissions from "./UserPermissions";

// Create a new client instance
const client = new Client({ intents: [
	GatewayIntentBits.Guilds,
	GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
	GatewayIntentBits.GuildMembers,
] });
module.exports = {
    client: client,
    log: botlog,
    setGame: setGame

};

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file:any) => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log("[BOT]: ",`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}
// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c: any) => {
	console.log("[BOT]: ",`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction:any) => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Log in to Discord with your client's token
client.login(token);

async function botlog(message: string, color?: LogType){
    try{
        const channel = await client.channels.cache.get('1108579839524491294');
		let embed = new EmbedBuilder();
		embed.setColor(color?.embedColor ?? "Blurple");
		embed.setDescription(bold(message));
        await channel.send({embeds: [embed]});

    }catch(error){
		console.log(error)
        console.log("[BOT]:","could not send message")

    }
    
}
function setGame(_game: Game){
    client.game = _game;
}

client.on("messageCreate", async (message: Message) => {

	if(message.author.bot) return;
	if(message.content.startsWith("!eval")){
		if(UserPermissions.isDev(message.author)){
			
			let args = message.content.substring(6);
			await message.channel.sendTyping();
			let result = await client.game.eval(args);
			if(result === ''){
				result = '\'\''
			}
			let embed = new EmbedBuilder();
			embed.setColor(0x00FF99)
			embed.setTitle("Eval")
			embed.addFields(
				{name: "Input", value: codeBlock('js', args)},
				{name: "Output", value: codeBlock('js', `${result}`)},
			)
			embed.setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.avatarURL() ?? undefined})
			await message.channel.send({ embeds: [embed] });
		}else{
			let embed = new EmbedBuilder();
			embed.setColor(0xFF2222)
			embed.setTitle("Eval Denied")
			embed.setDescription("Only devs may use this command.")
			embed.setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.avatarURL() ?? undefined})
			await message.channel.send({ embeds: [embed] });

		}

	}

})

