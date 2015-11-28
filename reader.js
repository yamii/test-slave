'use strict';

// Encoding
const encoding = 'ascii';

// Constact Delimeters
const start = '~';
const line  = '#';
const end   = '\r\n';

// Buffed delimeters
const bufStart = new Buffer( start, encoding );
const bufLine  = new Buffer( line, encoding );
const bufEnd   = new Buffer( end, encoding );

function write () {

	var args = arguments;

	let buflen = new Buffer( String( args.length ), encoding );
	let parts = [ bufStart, buflen, bufEnd ];
	let size  = 3 + buflen.length;

	for( let i = 0; i < args.length; ++i ) {
		let arg = args[ i ];

		if( !Buffer.isBuffer( arg ) ) {
			arg = new Buffer( String( arg ) );
		}

		buflen = new Buffer( String( arg.length ), encoding );

		parts = parts.concat( [
			bufLine, buflen, bufEnd,
			arg, bufEnd
		] );

		size += 5 + buflen.length + arg.length;
	}

	return Buffer.concat( parts, size );

}

function read ( bufferData ) {

	let read          = [];
	let readable      = bufferData.toString( 'utf-8' );
	let readableArray = readable.split( start );

	// Clean up excess delimeter from concat
	readableArray.shift();

	for( let k = 0; k < readableArray.length; ++k ) {

		let readData      = [];
		let command = readableArray[ k ].split( end );

		// Info of request
		let infoRaw = command.shift();

		// Clear up delimeter
		var excess = command.pop();
		if( excess ) {
			command.push( excess );
		}

		for( let i = 0; i < command.length; ) {
			// Check length if the same as readable ascii
			// let length  = readableArray[ i ].substring( 1 );
			let argData = command[ i + 1 ];
			readData.push( argData );
			i = i + 2;
		}

		read.push( readData );
	}

	return read;

}

module.exports = {
	'write' : write,
	'read'  : read
};
