'use strict';

describe( 'Get title', function () {
	beforeEach( function () {
		 isAngularSite( false );
			browser.get( '/test.html' );
	} );

	it( 'should have title', function () {
		browser.driver.findElement( by.css( '.container > h1' ) )
			.getText()
			.then( function ( h1 ) {
				expect( h1 ).toEqual( 'Dashboard' );
			} );
		} );
} );
