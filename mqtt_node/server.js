#!/usr/bin/env nodejs
/*
 * Server.js
 * 
 * The main portion of this project. Contains all the defined routes for express,
 * rules for the websockets, and rules for the MQTT broker.
 * 
 * Refer to the portions surrounded by --- for points of interest
 */
 
// Retrieve options from .env
require('dotenv').config({ silent: false });

var mbedAPI = require('mbed-connector-api');

var express   = require('express'),
	app       = express();
var pug       = require('pug');
var sockets   = require('socket.io');
var path      = require('path');

var conf      = require(path.join(__dirname, 'config'));
var internals = require(path.join(__dirname, 'internals'));


// -- Setup the application
setupExpress();
setupSocket();

// Set up connections to mbed boards
//
// NOT SURE THAT WE NEED TO SET UP THESE CONNECTIONS BEING THAT WE ARE USING MQTT PROTOCOL RATHER THAN DIRECT REST COMMUNICATION
//
/*
var mbedOne = new mbedAPI({ accessKey: process.env.MBED_ACCESS_KEY_ONE });
var mbedTwo = new mbedAPI({ accessKey: process.env.MBED_ACCESS_KEY_TWO });
var mbedThree = new mbedAPI({ accessKey: process.env.MBED_ACCESS_KEY_THREE });
var mbedFour = new mbedAPI({ accessKey: process.env.MBED_ACCESS_KEY_FOUR });
*/

// -- Socket Handler
// Here is where you should handle socket/mqtt events
// The mqtt object should allow you to interface with the MQTT broker through 
// events. Refer to the documentation for more info 
// -> https://github.com/mcollina/mosca/wiki/Mosca-basic-usage
// ----------------------------------------------------------------------------
function socket_handler(socket, mqtt) {
	
	// Called when MQTT server is ready
	mqtt.on('ready', client => {
		socket.emit('debug', {
			type: 'CLIENT', msg: 'Mosca server is ready to go!'
		});
	});
	
	// Called when a client connects
	mqtt.on('clientConnected', client => {
		socket.emit('debug', {
			type: 'CLIENT', msg: 'New client connected: ' + client.id
		});
	});

	// Called when a client disconnects
	mqtt.on('clientDisconnected', client => {
		socket.emit('debug', {
			type: 'CLIENT', msg: 'Client "' + client.id + '" has disconnected'
		});
	});

	// Called when a client publishes data
	// i.e. when Android app sends us updated area counter values (# of people nearby a certain mbed)
	mqtt.on('published', (data, client) => {
		if (!client) return;

		// See what area this is referring to and update appropriate counter via helper method updateAreaCount
		if(data.topic == '/areaUpdate/1') {
			updateAreaCount(1, data.payload);
		} else if(data.topic == '/areaUpdate/2') {
			updateAreaCount(2, data.payload);
		} else if(data.topic == '/areaUpdate/3') {
			updateAreaCount(3, data.payload);
		} else if(data.topic == '/areaUpdate/4') {
			updateAreaCount(4, data.payload);
		}

		socket.emit('debug', {
			type: 'PUBLISH', 
			msg: 'Client "' + client.id + '" published "' + JSON.stringify(data) + '"'
		});
		
	});

	// Called when a client subscribes
	mqtt.on('subscribed', (topic, client) => {
		if (!client) return;

		socket.emit('debug', {
			type: 'SUBSCRIBE',
			msg: 'Client "' + client.id + '" subscribed to "' + topic + '"'
		});
	});

	// Called when a client unsubscribes
	mqtt.on('unsubscribed', (topic, client) => {
		if (!client) return;

		socket.emit('debug', {
			type: 'SUBSCRIBE',
			msg: 'Client "' + client.id + '" unsubscribed from "' + topic + '"'
		});
	});
}
// ----------------------------------------------------------------------------


// Helper functions
function setupExpress() {
	app.set('view engine', 'pug'); // Set express to use pug for rendering HTML

	// Setup the 'public' folder to be statically accessable
	var publicDir = path.join(__dirname, 'public');
	app.use(express.static(publicDir));

	// Setup the paths (Insert any other needed paths here)
	// ------------------------------------------------------------------------
	// Home page
	app.get('/', (req, res) => {
		res.render('index', {title: 'MQTT Tracker'});
	});

	// Basic 404 Page
	app.use((req, res, next) => {
		var err = {
			stack: {},
			status: 404,
			message: "Error 404: Page Not Found '" + req.path + "'"
		};

		// Pass the error to the error handler below
		next(err);
	});

	// Error handler
	app.use((err, req, res, next) => {
		console.log("Error found: ", err);
		res.status(err.status || 500);

		res.render('error', {title: 'Error', error: err.message});
	});
	// ------------------------------------------------------------------------

	// Handle killing the server
	process.on('SIGINT', () => {
		internals.stop();
		process.kill(process.pid);
	});
}

function setupSocket() {
	var server = require('http').createServer(app);
	var io = sockets(server);

	// Setup the internals
	internals.start(mqtt => {
		io.on('connection', socket => {
			socket_handler(socket, mqtt)
		});
	});

	server.listen(conf.PORT, conf.HOST, () => { 
		console.log("Listening on: " + conf.HOST + ":" + conf.PORT);
	});
}

// Helper method for updating counter value on frontend of web app as well as on mbed boards
function updateAreaCount(area, newCount) {
	
	// Initialize message
	// topic is identifer for which mbed we are sending counter update to
	// payload is actual counter value
	// qos is "quality of service" (0 = deliver message at most once, 1 = deliver message at least once, 2 = deliver message exactly once)
	// retain is whether we hold message to send to subscriber in case the subscriber is offline when we first send the message
	var message = {
		topic: '/mbedUpdate/mbedNumber',
		payload: newCount,
		qos: 1, // we want to receive EVERY message and can handle duplicates (no harm as same value). QOS=1 guarantees message received at least once.
		retain: true
	};
	
	// Send new area counter value to frontend via socket
	if(area == 1) {
		
		// Update web app
		socket.emit('areaOneCounterUpdate', {
			value: newCount
		});
		
		// Update mbed #1
		message.topic = '/mbedUpdate/1';
		server.publish(message, function() {
			console.log('mbed #1 was sent a counter update! message content as follows: ' + JSON.stringify(message) + '');
		});
		
	} else if(area == 2) {
		
		// Update web app
		socket.emit('areaTwoCounterUpdate', {
			value: newCount
		});
		
		// Update mbed #2
		message.topic = '/mbedUpdate/2';
		server.publish(message, function() {
			console.log('mbed #2 was sent a counter update! message content as follows: ' + JSON.stringify(message) + '');
		});
		
	} else if(area == 3) {
		
		// Update web app
		socket.emit('areaThreeCounterUpdate', {
			value: newCount
		});
		
		// Update mbed #3
		message.topic = '/mbedUpdate/3';
		server.publish(message, function() {
			console.log('mbed #3 was sent a counter update! message content as follows: ' + JSON.stringify(message) + '');
		});
		
	} else if(area == 4) {
		
		// Update web app
		socket.emit('areaFourCounterUpdate', {
			value: newCount
		});
		
		// Update mbed #4
		message.topic = '/mbedUpdate/4';
		server.publish(message, function() {
			console.log('mbed #4 was sent a counter update! message content as follows: ' + JSON.stringify(message) + '');
		});
		
	} else {
		
		console.log('Improper area number specified for updating area count. Area specified was: ' + newCount + '');
		
	}
	
}
