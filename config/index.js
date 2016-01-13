'use strict';

var remoteHost = 'localhost';

module.exports = {
	'host'            : remoteHost,
	'port'            : 7777,
	'seleniumAddress' : 'http://hub.browserstack.com/wd/hub',
	'baseUrl'         : 'https://dev.observe.edivate.com',
	'socketServer'    : 'ws://' + remoteHost + ':3401',
	'apiServer'       : 'http://' + remoteHost + ':3400',
	'specs'           : [ 'test/test/test-1.spec.js' ]
};
