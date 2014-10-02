(function() {
	"use strict";


	var restify = require('restify');
	var PtLog   = require('promotexter-logger');
	var log     = new PtLog('deploy-server');
	var Solo    = require('./knife-solo');
	var Q       = require('q');
	var _       = require('underscore')._;


	var KnifeSoloServer = function(config) {
		this.config = config;
		this.solo   = new Solo(config);
		this.server = restify.createServer({
			name: config.get('deploy_server')
		});

		this.server.use(restify.bodyParser());
		this.server.on('uncaughtException', function(request, response, route, error) {
			throw error;
		});



		this.initServer();
	};


	KnifeSoloServer.prototype.register = function(req, res, next) {
		var ip = req.connection.remoteAddress;
		this.solo.create_node(ip, req.params, function(err, obj) {
			if(err) {
				res.send(500, obj);
			} else {
				res.send(obj);
			}
		});
	};

	KnifeSoloServer.prototype.initialize = function(req, res, next) {
		var ip = req.connection.remoteAddress;
		this.solo.bootstrap(ip, function(err, obj) {
			if(err) {
				res.send(500, obj);
			} else {
				res.send(obj);
			}
		});

	};

	KnifeSoloServer.prototype.deploy = function(req, res, next) {
		var ip = req.connection.remoteAddress;
		this.solo.cook(ip, function(err, obj) {
			if(err) {
				log.error('failed to deploy to', ip);
				res.send(500, obj);
			} else {
				res.send(obj);
			}
		});
	};

	KnifeSoloServer.prototype.runServer = function() {
		var port = this.config.get('listen_port');
		log.info('app started at', port);
		this.server.listen(port);
	};


	KnifeSoloServer.prototype.initServer = function() {
		this.server.post('/register', this.register.bind(this));
		this.server.post('/initialize', this.initialize.bind(this));
		this.server.post('/deploy', this.deploy.bind(this));
	};

	module.exports = KnifeSoloServer;
})();
