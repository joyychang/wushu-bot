'use strict';

var swearjar = require('swearjar');
var cool = require('cool-ascii-faces');
var request = require('request-promise');
var fs = require('fs');

try {
  var config = require('../config.json');
}
catch(err) {
}

module.exports = function analyze_message(message, bot_id) {
  wushu(message);
  mentions(message, bot_id);
};

function wushu(message) {
  let matches = message.content.match(/(\/\d+)/g);
  if(!matches) {
    return;
  }

  matches.forEach(match => {
    try {
      var file = fs.readFileSync('./assets/aow' + match + '.gif');
    } catch (error) {
      console.error(error);
      return;
    }
    message.channel.uploadFile(file, match + '.gif');
  });
};

function mentions(message, id) {
  var msg = message.content;
  var mentioned = false;
  var bot_user;

  var fn = user => {
    if (user.bot && swearjar.profane(msg)) {
      console.info('"' + msg + '" is profane');
      message.channel.createPermissionOverwrite(message.member, 0, 0x0000800 + 0x0000008)
          .then(po => {
            message.reply(' has been muted for 1 minute for disrespecting the bots.');
            console.info('"' + msg + '" is profane');
            setTimeout(function unmute() {
              po.delete()
                  .then(po => {
                    console.info('PO successfully deleted');
                  }).catch(err => {
                console.error('PO was not deleted correctly');
              });
            }, 60000);
          }).catch(err => {
        console.error(err)
      });
    } else if (user.id === id) {
      msg = msg.split('<@' + id + '>').join('').trim();
      mentioned = true;
      bot_user = user;
    }
    else {
      msg = msg.split('<@' + user.id + '>').join(user.username).trim();
    }

    return Promise.resolve();
  };

  var actions = message.mentions.map(fn);

  Promise.all(actions)
  .then(data => {
    if (mentioned) {
      console.info(msg);
      request.post({
        url: 'https://cleverbot.io/1.0/ask',
        body: {
          user: process.env.CLEVERBOT_USER || config.CLEVERBOT_USER,
          key: process.env.CLEVERBOT_KEY || config.CLEVERBOT_KEY,
          nick: bot_user.username,
          text: msg
        },
        json: true
      })
          .then(body => {
            message.reply(body.response);
          })
          .catch(err => {
            console.error(err.error.status);
            message.reply(cool());

            // Try reinitiate the bot.
            request.post({
              url: 'https://cleverbot.io/1.0/create',
              body: {
                user: process.env.CLEVERBOT_USER || config.CLEVERBOT_USER,
                key: process.env.CLEVERBOT_KEY || config.CLEVERBOT_KEY,
                nick: bot_user.username
              },
              json: true
            })
                .then(body => {
                  if (body.nick) {
                    console.log('Connected to CleverBot with session id: ' + body.nick);
                  }
                  else {
                    console.log(body.status);
                  }
                })
                .catch(err => {
                  console.error(err.error.status || err);
                });
          });
    }
  }).catch(err => {
    console.error(err)
  });
}