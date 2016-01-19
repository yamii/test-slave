'use strict';

var remoteHost = process.env.REMOTE_HOST || 'localhost';

module.exports = {
	'host'            : remoteHost,
	'port'            : 7777,
	'seleniumAddress' : process.env.SELENIUM_ADDRESS || 'http://localhost:4444/wd/hub',
	'baseUrl'         : process.env.BASE_URL || 'https://dev.observe.edivate.com',
	'socketServer'    : 'ws://' + remoteHost + ':3401',
	'apiServer'       : 'http://' + remoteHost + ':3400',
	'specs'           : [ 'test/test/test-1.spec.js' ]
};
