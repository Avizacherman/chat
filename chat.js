var net = require('net');
var fs = require('fs')
var chalk = require('chalk')
var notifier = require('node-notifier')
chalkKeys = Object.keys(chalk.styles)
var port = 3000;
var counter = 1;
var clients = []
var sourceClient;



var server = net.createServer(function(c) {

	function changeName(data) {

		return false;
	}

	function clientMap(client) {
		return clients.map(function(x) {
			return x.id;
		}).indexOf(client);


	}



	console.log('client connected')
	c.notice = notifier


	c.write('Hello Client\r\n You are client #' + counter + ' to connect\r\n');

	c.id = "Client" + counter
	c.sum = false;
	clients.push(c);
	sourceClient = c;
	counter++
	c.write('The following users are currently logged in: ')
	for (i = 0; i < clients.length; i++) {
		c.write(clients[i].id)
		if (clients.length > 1 && i != clients.length - 1) {
			c.write(', ')
		}
		if (i === clients.length - 2) {
			c.write('and ')
		}
	}
	c.write('\r\n')


	c.write('You are logged in as ' + c.id + '\r\nTo change your name type "/name <newName>. To see a full list of functions type /functions. Enjoy.\r\n')

	c.on('data', function(data) {

		var input = data.toString().trim()

		var functionTree = {
			namer: new RegExp(/\/name( \w+)+/i),
			logOut: new RegExp(/\/logout/i),
			colorize: new RegExp(/\/color( \w+)+/i),
			msg: new RegExp(/\/msg( \w+)+/i),
			kick: new RegExp(/\/kick( \w+)+/i),
			funcs: new RegExp(/\/functions/i),
			yell: new RegExp(/\/yell/gi),
			tableFlip: new RegExp(/\/tableflip/i)
		}

		if (functionTree.tableFlip.test(input)){
			for (i = 0; i < clients.length; i++) {
					if (clients[i] != c) {
						clients[i].write(c.id + ' flips the table: ' +"`(╯°□°）╯︵ ┻━┻`\r\n")
						return false
					}
				}
		}

		if (functionTree.yell.test(input)) {
			input = input.split(' ')
			if (input.length === 1) {
				for (i = 0; i < clients.length; i++) {
					if (clients[i] != c) {
						clients[i].write(c.id + ' yells: ' +"AAAAAAAAH!!!!\r\n")
						return false
					}
				}
			} else {
				input.shift()
				input = input.join(' ')
				console.log(input)
				for (i = 0; i < clients.length; i++) {
					if (clients[i] != c) {
						clients[i].write(c.id + ' yells: ' + input.toUpperCase() + "\r\n")
						return false;
					}
				}
			}
		}

		if (functionTree.namer.test(input)) {
			input = input.split(' ')
			input.shift()
			if (input.length > 1) {
				c.write('Names must not contain spaces\r\n')
				return false;
			}
			input = input.join(' ')
			oldName = c.id
			c.id = input;
			c.write('You are now named ' + c.id + "\r\n")
			for (i = 0; i < clients.length; i++) {

				if (clients[i] != c) {
					clients[i].write(oldName + " is now named " + c.id + "\r\n")
				}
			}
			return false
		}

		if (functionTree.logOut.test(input)) {
			c.destroy()
		}

		if (functionTree.colorize.test(input)) {
			input = input.split(' ')
			input.shift();
			if (chalkKeys.indexOf(input[0].toLowerCase()) === -1) {
				c.write('No such color exists outside your imagination\r\n')
				return false;
			} else {
				for (i = 0; i < clients.length; i++) {

					if (clients[i] != c) {
						clients[i].write(c.id + " says: " + chalk[input.shift()](input.join(' ') + "\r\n"))
					}
				}
				return false;
			}
		}

		if (functionTree.msg.test(input)) {
			input = input.split(' ')
			input.shift()
			var toUser = input.shift()


			var elementPos = clients.map(function(x) {
				return x.id;
			}).indexOf(toUser);

			if (elementPos != -1) {
				input = input.join(' ');
				clients[elementPos].write(chalk.grey("PM> " + c.id + "says: ") + input + "\r\n")
				clients[elementPos].notice.notify({
					title: "New Message",
					message: "You have a new private message"
				})
				return false;
			} else {
				c.write('No such user\r\n')
			}

		}
		if (functionTree.kick.test(input)) {
			input = input.split(' ');
			clients[clientMap(input[1])].destroy()
			clients.splice(clientMap(input[1]), 1)

			return false;
		}

		if (functionTree.funcs.test(input)) {
			c.write('\r\n\r\n' + chalk.blue('+++Avialable Functions+++') + ' \r\n/name - Change Name \n/color <color> <message> - send message in another color \n/msg <user> <message> - send a private message to the user selected\r\n/kick <user> - kicks a user off the chat \r\n /yell <msg> - Yells the message \r\n /tableflip - flips the Fing table\r\n')
			return false;
		}

		for (i = 0; i < clients.length; i++) {

			if (clients[i] != c) {
				clients[i].write(c.id + " says: " + data.toString().trim() + "\r\n")
			}
		}

	})



	c.on('end', function() {
		console.log(c.id + ' disconnected')
		clients.splice(clientMap(c.id), 1)

	})

})

process.stdin.on('data', function(data) {
	input = data.toString().trim()

	if (input === 'exit') {
		process.exit()
	}
	for (i = 0; i < clients.length; i++) {
		clients[i].write("Server says: " + data.toString().trim() + "\r\n")
	}
})

server.on('data', function(data) {
	c.write(data.toString().trim() + "\r\n")
})

server.on('connection', function() {
	for (i = 0; i < clients.length; i++) {

		if (clients[i] != sourceClient) {
			clients[i].write("A new user has connected\r\n")
		}
	}
})

server.listen(port, function() {
	console.log('listening on ' + port);
})