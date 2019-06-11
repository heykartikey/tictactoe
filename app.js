let roomID

const
	members = new Object,
	http = require('http'),
	fs = require('fs'),
	url = require('url'),

	server = http.createServer((req, res) => {
		if (req.url == '/index.html' || req.url == '/') {
			fs.readFile('./index.html', 'utf-8', (error, content) => {
				res.writeHead(200, {
					"Content-Type": "text/html"
				})
				res.end(content)
			})
		} else {
			fs.readFile('./game.html', 'utf-8', (error, content) => {
				res.writeHead(200, {
					"Content-Type": "text/html"
				})
				res.end(content)
			})
		}
	}),

	io = require('socket.io').listen(server)

io.sockets.on('connection', socket => {
	socket.on('checkRoom', roomID => {
		if (!members[roomID] || members[roomID].length < 2) {
			socket.emit('roomAvailable')
		}
	})

	socket.on('addUser', (username, roomID) => {
		if (!members[roomID]) {
			members[roomID] = []
		}
		if (members[roomID].length <= 2) {
			members[roomID].push(username)
			socket.username = username
			socket.room = roomID
			socket.join(socket.room)
			if(members[roomID].length === 2){
				socket.now = 'X'
				socket.broadcast.to(roomID).emit('anb')
				io.sockets.in(socket.room).emit('updateName', ...members[socket.room])
			}
		}
	})

	socket.on('moveMade', (data, roomId) => {
		socket.broadcast.to(roomId).emit('anb')
		io.sockets.in(socket.room).emit('update', data)
	})
})

server.listen(8080)