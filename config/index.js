'use strict';

module.exports = {
	'port'            : 7777,
	'seleniumAddress' : 'http://hub.browserstack.com/wd/hub',
	'baseUrl'         : 'https://dev.observe.edivate.com',
	'socketServer'    : 'ws://localhost:3401',
	'apiServer'       : 'http://localhost:3400',
	'specs'           : [ '../observation-public/test/single-pass/index.spec.js' ]
};
