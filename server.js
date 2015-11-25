'use strict';

const _        = require( 'lodash' );
const Hapi     = require( 'hapi' );
const SocketIO = require( 'socket.io' );
const server   = new Hapi.Server();
const Master   = require( './master' );
const master   = new Master();

// Start the master to listen
master.on( 'listening', ( masterServer ) => {} );

server.connection( {
	'port' : 3400,
	'labels' : 'rest'
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

rest.route( [
	{
		'method' : 'GET',
		'path' : '/vms/{platform}/{machine}',
		'handler' : function ( request, reply ) {

			let machine = {
				'platform' : request.params.platform,
				'machine'  : request.params.machine
			};

			let command = {
				'shell'     : './runner.sh',
				'arguments' : []
			};

			master.exec( machine, command, function ( error, data ) {
				if ( error ) {
					return reply( error.message ).code( 404 );
				}
				return reply( data );
			} );
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
