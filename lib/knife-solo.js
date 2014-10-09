(function() {
	"use strict";

	var path    = require('path');
	var spawn   = require('child_process').spawn;
	var PtLog   = require('promotexter-logger');
	var log     = new PtLog('knife-solo');
	var fs      = require('fs');


	var KnifeSolo = function(config) {
		this.config       = config;
		this.kitchen_path = path.resolve(this.config.get('kitchen_path'));
	};

	KnifeSolo.prototype.create_node = function(host, attr, callback) {
		var node = {name: host};

		if(typeof attr.environment !== 'undefined') {
			node.environment = attr.environment;
		}

		if(typeof attr.run_list !== 'undefined') {
			node.run_list = attr.run_list;
		}

		if(typeof attr.automatic !== 'undefined') {
			node.automatic = attr.automatic;
		}

		var f = this.kitchen_path + '/nodes/' + node.name + '.json';
		fs.writeFile(f,  JSON.stringify(node, null , "\n") , function (err) {
			log.info('response is', node);
	  		if (err) {
				callback(err);
			}
			if(typeof callback === 'function') {
				callback(null, node);
			}
		});
	};


	KnifeSolo.prototype.child_process_handler = function(proc, callback) {
		var out = "";
		var err = "";
		proc.stdout.on('data', function(data) {
			out += String(data);
			log.info(String(data));
		});

		proc.stderr.on('data', function(data) {
			err += String(data);
		});

		proc.on('close', function(code, signal) {
			if(code > 0) {
				var res = {
					error : err,
					ouput : out
				};

				callback(new Error("Process failed"), res);
			} else {
				callback(null, out);
			}

		});
	};

	// boostraps a node simply installs current version on the node
	KnifeSolo.prototype.bootstrap = function(host, callback) {
		var proc = spawn('knife', ['solo', 'prepare', '--bootstrap-version=11.12.0', host] );
		this.child_process_handler(proc, function(err, result) {
			if(err) {
				callback(new Error(err), result);
			} else {
				callback(null, result);
			}
		});
	};

	// starts cooking a the node
	KnifeSolo.prototype.cook = function(host, callback) {
		var opts = {
			cwd: this.kitchen_path
		};

		var proc = spawn('knife', ['solo', 'cook', host], opts);

		log.info('cooking node', host);
		this.child_process_handler(proc, function(err, result) {
			if(err) {
				callback(err, result);
			} else {
				callback(null, result);
			}
		});
	};

	module.exports =  KnifeSolo;
})();
