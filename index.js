'use strict';

const Slave  = require( './slave' );
const config = require( './config' );
const random = require( 'node-random-name' );
const uuid   = require( 'uuid' );
const os     = require( 'os' );

// read config name file -- INIT SPECS
const fs       = require( 'fs' );
const namePath = process.cwd() + '/config/specs.json';
let specs      = require( './config/specs.json' );
let slaveName  = 'slave';

// in the future separate this initialization
if ( specs.os.trim().length === 0 ) {
	specs.os = os.platform();
}

if ( specs.name === 'slave' ) {
	specs.name =  slaveName = random().replace( ' ', '-' ).toLowerCase();
	specs.name += '-' + uuid.v4();
	// write updates
}

fs.writeFile( namePath, JSON.stringify( specs ), ( error ) => {
	if ( error ) console.log( error );
} );

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
