'use strict';

const Slave  = require( './slave' );
const config = require( './config' );

const slave = new Slave( {
	'host' : config.host,
	'port' : config.port
} );

slave.on( 'connected', ( slaveClient ) => {
	console.log( 'Im connected to the server' );
} );

slave.on( 'error', ( error ) => {
	console.log( error );
} );
