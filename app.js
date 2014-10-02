(function() {
	"use strict";

	var nconf        = require('nconf');
	nconf.file({file :'./config/config.json'});
	var Server       = require('./lib/server');
	var server       = new Server(nconf);

	server.runServer();

})();
