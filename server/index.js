var express = require('express');
var bodyParser = require('body-parser');
var items = require('../database-mysql');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/../react-client/dist'));

app.get('/items', function (req, res) {
  items.selectAll(function(err, data) {
    if(err) {
      res.sendStatus(500);
    } else {
      res.json(data);
    }
  });
});

var main = io.of('/');
main.on('connection', function(socket) {
  socket.on('drawImage', function(data) {
    main.emit('data', { history: data.history });
  });
});

server.listen(3000, function() {
  console.log('listening on port 80!');
});
