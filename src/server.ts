import { IncomingMessage } from "http"
import { networkInterfaces } from "os"
import { WebSocketServer } from "ws"

import Game from "./Game"
import { LogType } from "./LogTypes"
import MessageHandler from "./MessageHandler"

import express = require("express")
import path = require("path")
import internal = require("stream")
import chalk = require("chalk")

const PORT = 8080
const LOAD_BOT = true

const app = express()
app.use("/", express.static(path.resolve(__dirname, "../client")))
app.use("/host", express.static(path.resolve(__dirname, "../client/host")))

const server = app.listen(PORT, () => console.log(chalk.greenBright("Listening...")))

const log = function (message: string, color?: LogType) {
    if (!color) {
        console.log(`[SERVER]: ${message}`);
    }
    else {
        console.log(`[SERVER]: ${color.chalkColor(message)}`)
    }
    if (LOAD_BOT)
        bot.log(message, color)
}

const websocketServer = new WebSocketServer({ noServer: true })
const game = new Game(log)
const messageHandler: MessageHandler = new MessageHandler(websocketServer, game)
game.setHandler(messageHandler)

server.on("upgrade", async (request: IncomingMessage, socket: internal.Duplex, head: Buffer) => {
    websocketServer.handleUpgrade(request, socket, head, (client) => {
        let addr = request.socket.remoteAddress ?? "Anonymous"
        log(`Client (${addr}) connected`)

        client.on("message", (message: MessageEvent) => messageHandler.handle(message, client))
    })
})

let IPs = []
let IpObj = getIP()
for (const prop in IpObj) {
    IPs.push(IpObj[prop])
}
console.log(chalk.magentaBright(`Connect: ${IPs}:${PORT}`))
process.env.GAME_IP = `${IPs}:${PORT}`;

let bot: any
if (LOAD_BOT) {
    bot = require("../discord_bot/index.ts")
    bot.setGame(game)
}



function getIP() {
    const nets = networkInterfaces()
    const results = Object.create(null)

    for (const name of Object.keys(nets)) {
        const netObj = nets[name] ?? []
        for (const net of netObj) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            // 'IPv4' is in Node <= 17, from 18 it's a number 4 or 6
            const familyV4Value = typeof net.family === 'string' ? 'IPv4' : 4
            if (net.family === familyV4Value && !net.internal) {
                if (!results[name]) {
                    results[name] = []
                }
                results[name].push(net.address)
            }
        }
    }

    return results
}


