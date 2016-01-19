'use strict';

const Slave  = require( './slave' );
const config = require( './config' );
const random = require( 'node-random-name' );

// read config name file
const fs       = require( 'fs' );
const namePath = process.cwd() + '/config/specs.json';
let specs      = require( './config/specs.json' );
let slaveName  = 'slave';

if ( specs.name === 'slave' ) {
	specs.name =  slaveName = random().replace( ' ', '-' ).toLowerCase();
	// write updates
	fs.writeFile( namePath, JSON.stringify( specs ), ( error ) => {
		if ( error ) console.log( error );
	} );
}

const slave = new Slave( {
	'host' : config.host,
	'port' : config.port,
	'name' : slaveName
} );

slave.on( 'connected', ( slaveClient ) => {
	console.log( 'Im connected to the server' );
} );

slave.on( 'error', ( error ) => {
	console.log( error );
} );
