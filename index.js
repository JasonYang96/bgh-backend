var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

let users = [];

app.get('/', (req, res) => {
  res.send('healthy');
});

io.on('connection', (socket) => {
  console.log('user connected', socket.id);

  socket.on('disconnect', () => {
    let room;
    users = users.filter((user) => {
      if (user.socketId === socket.id) {
        room = user.roomName;
      }
      return user.socketId !== socket.id;
    });
    io.to(room).emit('new users', users);
    console.log('client disconnected');
    console.log('new users', users);
  });

  socket.on('join room', (config) => {
    config.socketId = socket.id;
    socket.join(config.roomName);
    users.push(config);
    io.to(config.roomName).emit('new users', users);
    console.log(config.userName, 'is connecting to room', config.roomName);
  });

  socket.on('start game', users => {
    room = users.find(user => user.socketId === socket.id).roomName;
    console.log('room', room);
    io.to(room).emit('new users', users);
    io.to(room).emit('game started');
  });

  socket.on('message', (message) => {
    console.log(message);
  });
})

http.listen(PORT, () => {
  console.log('listening on port', PORT);
});
