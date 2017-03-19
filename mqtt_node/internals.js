/*
 * Internals.js
 * 
 * This file contains all of the code necessary for setting up the MQTT broker
 * and corresponding MongoDB backend.
 * 
 * Some methods of interest are: 
 *  - mosca
 *    * A reference to the running instance of MOSCA
 *    * The property 'on' should be used to set custom handlers for MQTT events
 *  - ready
 *    * Returns true __IFF__ MOSCA and MongoDB are setup
 * 
 * You do __NOT__ need to edit this (but feel free to look around)
 */

var mosca = require('mosca');
var nems  = require('nems');
var path  = require('path');

var conf  = require(path.join(__dirname, 'config'));

// Confine everything to this namespace
var self = module.exports = {
	// -- Members
	ready: false,
	mosca: undefined,

	// -- Methods
	// Responsible for first setting up MongoDB, and then linking that to Mosca
	// Will call a supplied callback when everything is setup
	start: callback => {
		// Setup MongoDB
		nems.start(conf.MONGO_VERSION, conf.MONGO_DIR, conf.MONGO_PORT).then(pid => {
			console.log("MongoDB started with PID: " + pid);
			
			// Setup MOSCA to use MongoDB as pub/sub service to help Mosca implement MQTT
			self.mosca = new mosca.Server({
				port:    conf.MOSCA_PORT,
				backend: {
					type: 'mongo',
					url:  'mongodb://' + conf.HOST + ':' + conf.MONGO_PORT + '/mqtt',
					pubsubCollection: 'ascoltatori',
					mongo: {}
				}
			});

			// Report that the internals are ready when MOSCA is set up
			self.mosca.on('ready', () => { 
				self.ready = true;

				callback(self.mosca); 
			});
		}).catch(err => { throw err; });
	},

	// Kills the internals cleanly by shutting down both MOSCA and MongoDB
	stop: () => {
		console.log('Stopping internals');
		nems.stop(conf.MONGO_DIR, conf.MONGO_PORT);
	}
};