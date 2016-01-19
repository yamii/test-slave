'use strict';

const uuid         = require( 'uuid' );
const os           = require( 'os' );
const net          = require( 'net' );
const fs           = require( 'fs' );
const util         = require( 'util' );
const EventEmitter = require( 'events' );
const spawn        = require( 'child_process' ).spawn;

// Transform
const testProtocol   = require( 'test-protocol' );
const read           = testProtocol.read;
const transformWrite = testProtocol.write;

const config = require( './config' );

function debug () {
	console.log.apply( null, Array.prototype.slice.call( arguments ) );
}

function Slave( options ) {

	EventEmitter.call( this );

	// Identify self
	this.id = uuid.v4();

	// Queue for callback
	this.queue     = [];

	// This queue is to regulate processes on spawn
	this.taskQueue = [];

	this.busy         = false;
	this.retry        = 0;
	this.retry_max    = 10;
	this.retry_delay  = 2000;
	this.reconnecting = false;

	this.defaultOptions = {
		'port' : config.port
	};

	this.options    = options || this.defaultOptions;
	this.options.os = os.platform();

	this.name   = options.name || 'slave';
	this.client = net.connect( options );
	this.setListeners();

	return this;
}

util.inherits( Slave, EventEmitter );

Slave.prototype.setListeners = function () {

	this.client.on( 'data', ( data ) => {

		let readable = read( data );
		for( let k = 0; k < readable.length; ++k ) {

			let command = readable[ k ][ 0 ];
			if( command === 'REPLY' ) {
				var cb = this.queue.shift();
				cb( null, readable[ k ] );
			} else {
				this[ command ]( readable[ k ] );
			}
		}
	} );

	this.client.on( 'error', ( error ) => {
		this.emit( 'error', error );
	} );

	this.client.on( 'connect', () => {
		// Reset retry counter
		this.retry = 0;

		let slaveMeta = {
			'platform' : this.options.os,
			'id'       : this.id,
			'name'     : this.name
		}
		// Introduce self
		this.write( 'IAM', JSON.stringify( slaveMeta ), ( error, data ) => {
			console.log( 'IAM ', this.name );
			this.emit( 'connected', this );
		} );

	} );

	this.client.on( 'close', ( reason ) => {
		console.log( reason );
		this.reconnect();
	} );

};

Slave.prototype.reconnect = function () {
	if( this.retry < this.retry_max ) {
		console.log( 'Reconnecting...' );
		setTimeout( () => {
			this.client = net.connect( this.options );
			this.setListeners();
		}, this.retry_delay );
		++this.retry;
	} else {
		console.log( 'Slave has given up...' );
	}
};

Slave.prototype.write = function () {

	let args = Array.prototype.slice.call( arguments );

	// Get callback
	let cb = args.pop();

	// Check if function
	if( typeof cb !== 'function' ) {
		args.push( cb );
	} else {
		this.queue.push( cb );
	}

	this.client.write( transformWrite.apply( null, args ) );
};

// Temporary for now
/**
 * TEMPORARY NEED PROPER HANDLER
 *
 */

Slave.prototype.spawnProcess = function () {

	let metaCurrent   = this.taskQueue.shift();
	let currentId     = metaCurrent.pop();
	let commandString = metaCurrent.pop();
	let command       = JSON.parse( commandString );
	let testProcess;

	command.arguments.push( currentId );
	if ( os.platform() === 'win32' ) {
 		let cmd     = [ '/c', command.shell + '.bat' ];
		cmd         = cmd.concat( command.arguments );
		testProcess = spawn( process.env.comspec, cmd )
	} else {
		testProcess = spawn( './' + command.shell + '.sh', command.arguments );
	}

	testProcess.stdout.on( 'data', ( stdout ) => {
		this.write( 'FIREHOSE', currentId, stdout );
	} );

	testProcess.stderr.on( 'data', ( stderr ) => {
		this.write( 'FIREHOSE', currentId, stderr );
	} );

	testProcess.stdout.on( 'end', () => {
		if( this.taskQueue.length ) {
			this.spawnProcess();
		} else{
			this.busy = false;
		}
	} );
};

Slave.prototype.RUN = function( meta ) {

	let id = uuid.v4();
	meta.push( id );
	this.taskQueue.push( meta );

	this.write( 'REPLY', id );

	if( !this.busy ) {
		this.busy = true;
		this.spawnProcess();
	}

};

module.exports = Slave;
