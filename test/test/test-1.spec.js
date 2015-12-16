'use strict';

describe( 'Get title', function () {
	beforeEach( function () {
		 isAngularSite( false );
			browser.get( '/' );
	} );

	it( 'should have title', function () {
		browser.driver.findElement( by.css( '.container > h1' ) )
			.getText()
			.then( function ( h1 ) {
				expect( h1 ).toEqual( 'E2E Runner' );
			} );
	} );

	it( 'should add 2', function () {
		expect( 2 ).toEqual( 2 );
	} );

} );
