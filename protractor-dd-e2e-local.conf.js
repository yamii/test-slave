'use strict';

let protractorConfig = require( 'protractor-config' );
let request          = require( 'request' );
let SpecReporter     = require( 'jasmine-spec-reporter' );
let spec             = new SpecReporter( { 'displayStacktrace' : true } );
let _                = require( 'lodash' );
let io               = require( 'socket.io-client' );
let uuid             = require( 'uuid');
let Promise          = require( 'bluebird' );

let socket;
let env      = process.env;
const config = require( './config' );
let os       = require( 'os' );

exports.config = {
	// Framework needed
	'framework'       : 'jasmine2',
	'seleniumAddress' : config.seleniumAddress,
	'baseUrl'         : config.baseUrl,
	'capabilities'    : {
		'browserName' : 'chrome'
	},
	'jasmineNodeOpts' : {
		'showColors'             : true, // Use colors in the command line report.
		'isVerbose'              : true,
		'defaultTimeoutInterval' : 1200000,
		'print'                  : function () {}
	},
	'allScriptsTimeout' : 120000,
	'specs'             : config.specs,
	'onPrepare'         : function () {
		jasmine.getEnv().addReporter( spec );
		return new Promise( function ( resolve, reject ) {
			request( config.apiServer + '/test-cases/' + browser.params.templateId, function ( error, response, body ) {
				if ( !error && response.statusCode == 200 ) {
					browser.params.session = uuid.v4();
					browser.params.template = body;
					socket = io( config.socketServer );
					socket.on( 'connect', function () {
						// temporary fix
						let osPlatform = {
							browser    : 'chrome',
							os         : 'OS X',
							os_version : 'Yosemite'
						};
						if ( os.platform() === 'win32' ) {
							osPlatform.browser    = 'chrome',
							osPlatform.os         = 'Windows';
							osPlatform.os_version = '8';
						}

						browser.params.browserStackBody = {
							'automation_session' : {
								'browser'            : osPlatform.browser,
								'os'                 : osPlatform.os,
								'os_version'         : osPlatform.os_version,
								'session'            : browser.params.session
							}
						};
						socket.emit( 'register-browserstack', {
							'browserstack' : browser.params.browserStackBody,
							'session'      : browser.params.session
						} );
						// Override console.log
						let old = console.log;
						console.log = function () {
							//Array.prototype.unshift.call(arguments, 'Report: ');
							// Keep this for debugging purposes
							old.apply( this, arguments );
							socket.emit( 'browserstack-stream', {
								'data' : arguments
							} );
						};
						resolve();
					} );

					socket.on( 'error', function ( error ) {
						console.log( error );
					} );
				}
			} )
		} );
	},
	'onComplete' : function () {
		spec.metrics.endTime = new Date();
		request( {
			'method' : 'POST',
			'url'    : config.apiServer + '/machines/1/test-cases/' + browser.params.templateId,
			'body'   : {
				'browserstack' : browser.params.browserStackBody,
				'spec'         : spec.metrics,
				'env'          : browser.params.envObj
			},
			'json' : true
		}, function () {
			socket.emit( 'end-socket' );
			//console.log( 'Good' );
		} );
	}

};
