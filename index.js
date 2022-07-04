
const express = require('express') //llamamos a Express
const moment=require('moment'); 
moment.locale('es');

const TelegramBot = require('node-telegram-bot-api');
const token = '1776190895:AAEcO-6lcWXaQO5fzp7TJT0cW8OMMXKbKFs';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});
let chatbot=718810605;
//172.26.8.19
const app = express();
app.listen(8083, "localhost", () => {
  console.log("Ya estoy escuchando en el puerto 8083");
});


        app.get("/api/ahorro", (req, res) => {
            res.send(true);
            let msg="Busqueda en proceso"+" "+moment().format('MMMM DD YYYY, h:mm:ss a');
            console.log(msg);
            bot.sendMessage(chatbot,msg);
        });

        app.get("/api/updateahorro", (req, res) => {

            res.status(200).send(
              "Update"
            );
            let msg="Actualizacion en proceso"+" "+moment().format('MMMM DD YYYY, h:mm:ss a')
            console.log(msg);
            bot.sendMessage(chatbot,msg);

        });
           
     /*   bot.on('message', (msg) => {
          const chatId = msg.chat.id;
        console.log(chatId);
          // send a message to the chat acknowledging receipt of their message
          bot.sendMessage(chatId, 'Received your message');
        });
        */