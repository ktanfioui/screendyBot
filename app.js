'use strict';

var express = require('express'); // app server
var bodyParser = require('body-parser'); // parser for post requests
var Conversation = require('watson-developer-cloud/conversation/v1'); // watson sdk
//var mongoClient = require('mongodb').MongoClient; // Récupération du client mongodb
var app = express();
// Bootstrap application settings
app.use(express.static('./public')); // load UI from public folder
app.use(bodyParser.json());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Create the service wrapper
var conversation = new Conversation({
  version_date: '2016-10-21',
  version: 'v1'
});

// Endpoint to be call from the client side
app.post('/screendy/bot', function(req, res) {
  var workspace = process.env.WORKSPACE_ID;
  if (!workspace) {
    return res.json({
      'output': {
        'text': 'The app has not been configured with a <b>WORKSPACE_ID</b> environment variable.'
      }
    });
  }

  console.log(JSON.stringify(req.body));

  var payload = {
    workspace_id: workspace, // necessary
    context: req.body.context || {},
    input: {}
  };

  if(req.body.input) {
      payload.input = {
        'text': req.body.input
      }
  }

// send data to server
console.log('User say :');
console.log(payload.input);
console.log(payload.context);
console.log('--------------------------------------------------------------');

var action = "True";

  // Send the input to the conversation service
  conversation.message(payload,function(err, data) {

    if (err) {
      action = "False";
      return res.status(err.code || 500).json(err);
    }
    else{

      // Paramètres de connexion
     // var url = 'mongodb://localhost/mydb';

      // Connexion au serveur avec la méthode connect
      /*mongoClient.connect(url, function (err, db) {
          if (err) {
              return console.error('Connection failed', err);
          }
          console.log('Connection successful on ', url);

          // Nous allons travailler ici ...
          // Récupération de la collection users
var collection = db.collection('response');
// Création de deux objets users
var answer = JSON.stringify(data.output.text).substring(2,JSON.stringify(data.output.text).length-2);
var cleanAnswer = answer.replace(/(<([^>]+)>)/ig,"");
//var intent = JSON.stringify(data.intents).substring(12,JSON.stringify(data.intents).length-16);
var intent = JSON.stringify(data.intents).split(",");
var cleanIntent = intent[0].substring(12,intent[0].length-1);
var response1 = {answer: cleanAnswer, intents: cleanIntent, entities: JSON.stringify(data.entities)};

collection.insertOne(response1, function (err, result) {
    if (err) {
        console.error('Insert failed', err);
    } else {
        console.log('Insert successful', result);
    }
});


          // Fermeture de la connexion
          db.close()
      });*/

      //var intent = JSON.stringify(data.intents).split(",");
      //var cleanIntent = intent[0].substring(12,intent[0].length-1);


    //  console.log(JSON.stringify(data.intents));
    //  console.log(JSON.stringify(data.entities));
    //console.log(JSON.stringify(data.output.text));
    var intent = JSON.stringify(data.intents).split(",");
    var cleanIntent = intent[0].substring(12,intent[0].length-1);
    var eventName;
    if (cleanIntent == "open-styles-section"){
      eventName = "sdbot:style:open-styles-section";
    }
    else {
      eventName = null;
    }

    var reponse = {
      "action": action,
      "response": {
         "answer": {
             "intents": JSON.stringify(data.intents),
            "entities": JSON.stringify(data.entities),
          "data": data.output.text[0].message,
          "type": "string"
       },
        "events":[
           {
            "type": data.output.text[0].eventType,
          "name": data.output.text[0].eventName,
          "data": data.output.text[0].eventName
          }
        ]
      }
    }

    return res.json(updateMessage(payload, reponse));}
  });
});


function updateMessage(input, response) {
  var responseText = null;
  if (!response.output) {
    response.output = {};
  } else {
    return response;
  }
  response.output.text = responseText;
  return response;

}

module.exports = app;
