'use strict';

const Slave  = require( './slave' );
const config = require( './config' );
const random = require( 'node-random-name' );

const slave = new Slave( {
	'host' : config.host,
	'port' : config.port,
	'name' : random().replace( ' ', '-' ).toLowerCase()
} );

slave.on( 'connected', ( slaveClient ) => {
	console.log( 'Im connected to the server' );
} );

slave.on( 'error', ( error ) => {
	console.log( error );
} );
