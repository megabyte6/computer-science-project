import Player from "./Player"
import Host from "./Host"
import { WebSocket } from "ws"
import GPT4FreeRequester from "./GPT4FreeRequester"
import MessageHandler from "./MessageHandler"

export default class Game {

    players: Player[] = []
    gpt: GPT4FreeRequester
    host: Host | null
    handler: MessageHandler | null

    constructor(){
        this.gpt = new GPT4FreeRequester();
        this.host = null;
        this.handler = null;
    }

    getPlayerFromClient(client: WebSocket) {
        for (const player of this.players) {
            if (player.client === client)
                return player
        }
        return null
    }

    setHandler(handler: MessageHandler){
        this.handler = handler;
    }

    async askAndSendGPT(prompt : string, player: Player){
        player.client.send(await this.gpt.getResponse(prompt))
    }

    onPlayerJoin(player: Player){
        this.handler?.player_join(player);
    }

    playerLeave(client: WebSocket) {
        let player: Player = this.players.filter(player => {return player.client === client})[0];
        this.players = this.players.filter(player => {return player.client !== client});
        this.handler?.player_leave(player);
    }

}
