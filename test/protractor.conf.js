'use strict';

var request      = require( 'request' );
var SpecReporter = require( 'jasmine-spec-reporter' );
var spec         = new SpecReporter( { 'displayStacktrace' : true } );

exports.config = {
	'framework' : 'jasmine2',
	'seleniumAddress' : 'http://hub.browserstack.com/wd/hub',
	'baseUrl' : 'http://localhost:3402',
	'multiCapabilities' : [
		{
			'project' : 'edivate-observe',
			'build' : 'data-driven',
			'browserName' : 'firefox',
			'browserstack.user' : 'gideonrosales1',
			'browserstack.key' : 'bhzBLfyWLyPgfKGHznov',
			'browserstack.local' : 'true',
			'browserstack.debug' : 'true'
		},{
			'project' : 'edivate-observe',
			'build' : 'data-driven',
			'browserName' : 'chrome',
			'browserstack.user' : 'gideonrosales1',
			'browserstack.key' : 'bhzBLfyWLyPgfKGHznov',
			'browserstack.local' : 'true',
			'browserstack.debug' : 'true'
		},{
			'project' : 'edivate-observe',
			'build' : 'data-driven',
			'browserName' : 'chrome',
			'browserstack.user' : 'gideonrosales1',
			'browserstack.key' : 'bhzBLfyWLyPgfKGHznov',
			'browserstack.local' : 'true',
			'browserstack.debug' : 'true'
		},{
			'project' : 'edivate-observe',
			'build' : 'data-driven',
			'browserName' : 'chrome',
			'browserstack.user' : 'gideonrosales1',
			'browserstack.key' : 'bhzBLfyWLyPgfKGHznov',
			'browserstack.local' : 'true',
			'browserstack.debug' : 'true'
		},{
			'project' : 'edivate-observe',
			'build' : 'data-driven',
			'browserName' : 'chrome',
			'browserstack.user' : 'gideonrosales1',
			'browserstack.key' : 'bhzBLfyWLyPgfKGHznov',
			'browserstack.local' : 'true',
			'browserstack.debug' : 'true'
		}
	],
	'jasmineNodeOpts' : {
		'showColors'             : true, // Use colors in the command line report.
		'isVerbose'              : true,
		'defaultTimeoutInterval' : 1200000,
		'print'                  : function () {}
	},
	'allScriptsTimeout' : 120000,
	'specs' : [ 'test/**/*.spec.js' ],
	'onPrepare' : function () {
		jasmine.getEnv().addReporter( spec );
		global.isAngularSite = function( flag ){
			browser.ignoreSynchronization = !flag;
		};
	},
	'onComplete' : function () {
		browser
			.driver
			.session_
			.then( function ( sessionDetails ) {
				var session = sessionDetails.id_;
				var url = 'https://gideonrosales1:bhzBLfyWLyPgfKGHznov@www.browserstack.com/automate/sessions/'+session+'.json';
				request( {
					'url' : url,
				}, function ( error, response, body ) {

					if( error ) {
						return;
					}
					// Send to master the results
					request( {
						'method' : 'POST',
						'url' : 'http://localhost:3400/results/' + browser.params.templateId,
						'body' : {
							'browserstack' : body,
							'spec' : spec.metrics
						},
						'json' : true
					}, function () {
						console.log( arguments );
					} );
				} );
			} );
	}

};
