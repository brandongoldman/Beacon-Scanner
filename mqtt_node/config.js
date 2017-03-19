/*
 * Config.js
 * 
 * Contains all of the configurable fields used by this project
 */
var path = require('path');

module.exports = {
	HOST: '127.0.0.1',
	PORT: '8080',

	// Variables used internally
	MONGO_VERSION: '3.2.8',
	MONGO_PORT   : 27017,
	MONGO_DIR    : path.join(__dirname, '.mongo'),
	
	MOSCA_PORT   : 1883
};