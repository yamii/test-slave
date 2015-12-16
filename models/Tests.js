'use strict';

var mongoose = require( 'mongoose' );
var Schema = mongoose.Schema;

var TestsModelSchema = new Schema( {
	'machineId'       : Number,
	'browserStackId'  : String,
	'browserStackURL' : String,
	'testCaseId'      : String,
	'successCount'    : Number,
	'failCount'       : Number,
	'success'         : Number,
	'fail'            : Number
} );

mongoose.models.Test = mongoose.model( 'Test', TestsModelSchema );
