import { SlashCommandBuilder, EmbedBuilder, inlineCode } from 'discord.js';
import Game from '../../../src/Game';
import Player from '../../../src/Player';
import UserPermissions from '../../UserPermissions';


module.exports = {
	data: new SlashCommandBuilder()
		.setName('listplayers')
		.setDescription('Lists all players in the game'),
	async execute(interaction: any) {
		const sent = await interaction.reply({ content: 'Fetching...', fetchReply: true });
		if(UserPermissions.isDev(interaction.member)){
			const playersEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setTitle('Players')
				.setTimestamp()
			.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.avatarURL()});

		
			let game: Game = interaction.client.game;
			let players: Player[] = game.players;
			playersEmbed.setDescription(`[Click to join the game!](http://${process.env.GAME_IP})`)
			if(players.length == 0){
				playersEmbed.setDescription(`No players currently in game \n [Click to join the game!](http://${process.env.GAME_IP})`)
			}
			players.forEach((player:Player)=>{
				playersEmbed.addFields({
					name: player.name,
					value: ` ${player.origPrompt ? `• Submitted prompt: \n${inlineCode(player.origPrompt)}` : ""} 
					${player.origResponse ? `• Response: \n${inlineCode(player.origResponse)}` : ""}
					${player.newPrompt ? `• New prompt: \n${inlineCode(player.newPrompt)}` : ""}
					${player.newResponse ? `• Response to rearrange: \n${inlineCode(player.newResponse)}` : ""}`

				})


			})

			await interaction.editReply({ embeds: [playersEmbed] });
			await interaction.editReply("");
		}
		else{
			await interaction.editReply(`Only devs may use this command!`);
		}
		
	},
};