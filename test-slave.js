'use strict';

const Slave = require( './slave' );

const slave = new Slave( {
	'port' : 7777
} );

slave.on( 'connected', ( slaveClient ) => {
} );

slave.on( 'error', ( error ) => {

	console.log( error );
} );
