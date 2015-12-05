'use strict';

const glob     = require( 'glob' );
const _        = require( 'lodash' );
const Hapi     = require( 'hapi' );
const SocketIO = require( 'socket.io' );
const server   = new Hapi.Server();
const Master   = require( './master' );
const master   = new Master();

const testCases = [];
const testCasesDir = '../observation-public-tests/test/sandbox/templates/*.json';
glob( testCasesDir, function ( er, files ) {
	files.forEach( function ( file ) {
			let fileArray = file.split( '/' );
			let filename = fileArray[ fileArray.length - 1 ];
			testCases.push( {
			'filename' : filename,
			'file' : file
			} );
	} );
} );
// Start the master to listen
master.on( 'listening', ( masterServer ) => {} );

server.connection( {
	'port' : 3400,
	'labels' : 'rest',
	'routes' : {
		'cors' : {
			'origin' : [ '*' ]
		}
	}
} );

server.connection( {
	'port' : 3401,
	'labels' : 'ws'
} );

server.connection( {
	'port' : 3402,
	'labels' : 'static'
} );

const rest        = server.select( 'rest' );
const ws          = server.select( 'ws' );
const staticFiles = server.select( 'static' );

// Temporary
const results = {};

rest.route( [
	{
		'method' : 'GET',
		'path' : '/vms/{platform}/{machine}/{testCaseId?}',
		'handler' : function ( request, reply ) {

			let machine = {
				'platform' : request.params.platform,
				'machine'  : request.params.machine
			};

			let id = request.params.testCaseId || '100.json';
			let jsonfilename = _.findWhere( testCases, { 'filename' : id } );
			let json = require( jsonfilename.file );
			let command = {
				'shell'     : './runner.sh',
				'arguments' : [ escape( JSON.stringify( json ) ), id ]
			};

			master.exec( machine, command, function ( error, data ) {
				if ( error ) {
					return reply( error.message ).code( 404 );
				}
				return reply( data );
			} );
		}
	},
	{
		'method' : 'GET',
		'path' : '/test-cases',
		'handler' : function ( request, reply ) {
			return reply( testCases );
		}
	},
	{
		'method' : 'GET',
		'path' : '/results',
		'handler' : function ( request, reply ) {
			return reply( results );
		}
	},
	{
		'method' : 'POST',
		'path' : '/results/{testCaseId}',
		'handler' : function ( request, reply ) {
			let browserstack = JSON.parse( request.payload.browserstack );
			let spec = request.payload.spec;

			// Initialize object reference
			if( !results[ request.params.testCaseId ] ) {
				results[ request.params.testCaseId ] = {};
				results[ request.params.testCaseId ].results = [];
				results[ request.params.testCaseId ].totalSuccess = 0;
			}
			if( spec.failedSpecs === 0 ) {
				results[ request.params.testCaseId ].totalSuccess += 1;
			}
			let result = {
				'browserstack' : browserstack,
				'spec'         : spec
			};
			results[ request.params.testCaseId ].results.push( result );
			return reply( true );
		}
	}
] );

const io = SocketIO.listen( ws.listener );

// FIREHOSE
master.on( 'data', function ( data ) {
	_.forEach( io.sockets.connected, ( socket, socketId ) => {
		socket.emit( 'data-stream', data );
	} );
} );

function getMachines ( slaves ) {
	let machines = [];

	_.forEach( slaves, function ( slave, key ) {
		_.forEach( slave, function ( machine, machineKey ) {
			let m = {
				'id'       : machine.id,
				'platform' : machine.platform
			};
			machines.push( m );
		} );
	} );

	return machines;
}

// When there are new or removed slaves
master.on( 'update-slaves-list', function ( slaves ) {
	_.forEach( io.sockets.connected, ( socket, socketId ) => {
		let machines = getMachines( slaves );
		socket.emit( 'update-slaves-list', machines );
	} );
} );

io.sockets.on( 'connection', ( socket ) => {
	// Initially send for available machines
	socket.on( 'update-slaves-list', () => {
		let machines = getMachines( master.slaves );
		socket.emit( 'update-slaves-list', machines );
	} );
} );

server.register( require( 'inert' ), ( error ) => {

	staticFiles.route( {
		'method' : 'GET',
		'path' : '/{param*}',
		'handler' : {
			'directory' : {
				'path' : 'public'
			}
		}
	} );

	server.start( ( error ) => {
		console.log( 'started' );
	} );

} );
