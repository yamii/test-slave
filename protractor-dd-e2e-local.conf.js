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

const fs         = require('fs');
const specs      = require( './config/specs.json' );

let writeStream;
let readableStream;

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
		browser.manage().window().setSize( 1792, 1008 );
		jasmine.getEnv().addReporter( spec );
		return new Promise( function ( resolve, reject ) {

			// Override console.log
			let old = console.log;

			request( config.apiServer + '/test-cases/' + browser.params.templateId, function ( error, response, body ) {
				if ( !error && response.statusCode == 200 ) {

					browser.params.session  = uuid.v4();
					browser.params.template = body;
					socket                  = io( config.socketServer );

					// temporary fix
					let osPlatform = {
						os         : 'OS X',
						os_version : 'Yosemite'
					};
					if ( os.platform() === 'win32' ) {
						osPlatform.os         = 'Windows';
						osPlatform.os_version = '8';
					}

					browser.params.browserStackBody = {
						'automation_session' : {
							'browser'            : specs.browser,
							'browserVersion'     : specs.browserVersion,
							'os'                 : osPlatform.os,
							'os_version'         : osPlatform.os_version,
							'session'            : browser.params.session,
							'name'               : specs.name
						}
					};

					// create log file
					if ( !writeStream ) {
						writeStream = fs.createWriteStream( 'test/data/testlogs/' + browser.params.session + '.log' );
						writeStream.on('error', function (error) {
							old(error);
						} );
					}

					socket.on( 'connect', function () {
						socket.emit( 'register-browserstack', {
							'browserstack' : browser.params.browserStackBody,
							'session'      : browser.params.session
						} );

						function writeToStream () {
							for ( let key in arguments ) {
								writeStream.write( arguments[key] );
							}
						}

						console.log = function () {
							if ( writeStream ) {
								writeToStream.apply( null, arguments );
							}
							old.apply( this, arguments );
							socket.emit( 'browserstack-stream', {
								'data' : arguments
							} );
						};
						resolve();
					} );

					socket.on( 'error', function ( error ) {
						old( error );
						reject();
					} );

				} else {
					reject( 'master dies' );
				}
			} );
		} );
	},
	'onComplete' : function () {
		writeStream.on( 'finish', () => {
			console.error( 'all writes are now complete.' );
		} );

		writeStream          = '';
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
			let readableStream = fs.createReadStream( 'test/data/testlogs/' + browser.params.session + '.log' );

			readableStream.on( 'data', function ( chunk ) {
				socket.emit( 'local-logs-stream', {
					'data' : chunk
				} );
			} );

			fs.unlink( 'test/data/testlogs/' + browser.params.session + '.log', ( err ) => {
				if ( err ) throw err;
				console.log( 'successfully deleted log' );
			} );
		} );

		socket.emit( 'end-socket', {
			'testCase' : browser.params.templateId,
			'name'     : specs.name
		} );
	}
};
