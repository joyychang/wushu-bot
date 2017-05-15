'use strict';

var request = require('request-promise');
var optional = require('optional');
var config = optional('./config.json');


// Discord Bot
var Discordie = require("discordie");
var analyze = require('./libs/analyze');
var Events = Discordie.Events;
var client = new Discordie({autoReconnect: true, delay: 5000});

client.connect({
  token: process.env.BOT_TOKEN || config.BOT_TOKEN
});

client.Dispatcher.on(Events.GATEWAY_READY, e => {
  console.log("Connected to Discord as: " + client.User.username);

  // No more free Cleverbot
  //
  // request.post({
  //   url: 'https://cleverbot.io/1.0/create',
  //   body: {
  //     user: process.env.CLEVERBOT_USER || config.CLEVERBOT_USER,
  //     key: process.env.CLEVERBOT_KEY || config.CLEVERBOT_KEY,
  //     nick: client.User.username
  //   },
  //   json: true
  // })
  // .then(body => {
  //   if(body.nick) {
  //     console.log('Connected to CleverBot with session id: ' + body.nick);
  //   }
  //   else {
  //     console.log(body.status);
  //   }
  // })
  // .catch(err => {
  //   console.error(err.error.status || err);
  // });
});

client.Dispatcher.on(Events.MESSAGE_CREATE, e => {
  analyze(e.message, client.User.id);
});