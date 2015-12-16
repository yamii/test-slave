'use strict';

const Slave = require( './slave' );

const slave = new Slave( {
	'port' : 7777
} );

slave.on( 'connected', ( slaveClient ) => {
	console.log( 'Hello Im connectes' );
} );

slave.on( 'error', ( error ) => {
	console.log( error );
} );
