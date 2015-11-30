'use strict';

var socket = io( 'ws://localhost:3401' );

var SlaveTabs = React.createClass( {

	'render' : function () {
		return (
			<div className="navbar">
				<ul className="nav nav-tabs">
					{
						this.props.slaves.map( function ( slave, key ) {
							return (
								<li key={ key } role="presentation" className={ slave.activeTab ? 'active' : '' }>
									<a href="#">{ slave.platform }-{ slave.id }</a>
								</li>
							);
						} )
					}
				</ul>
			</div>
		);
	}

} );

var SlaveContainer = React.createClass( {

	'_handleClick' : function () {
		$.get( 'http://localhost:3400/vms/' + this.props.slave.platform + '/' + this.props.slave.id, function () {
			console.log( 'sucess' );
		} );
	},

	'render' : function () {
		return (
			<div className="col-xs-12">
				<h3>{ this.props.slave.platform }-{ this.props.slave.id }</h3>
				<button type="button" className="btn btn-primary" onClick={ this._handleClick }>Run</button>
				<button type="button" className="btn btn-danger">Cancel</button>
			</div>
		);
	}

} );

var StdoutContainer = React.createClass( {

	'render' : function () {
		return (
			<div className="stdout col-xs-12">
				{
					this.props.slave.stdout.map( function ( stdout, key ) {
						return (
							<p key={ key }>{ stdout }</p>
						);
					} )
				}
			</div>
		);
	}

} );

var MasterSlaveApp = React.createClass( {

	'getInitialState' : function () {
		return {
			'activeSlave' : {
				'id'        : '',
				'platform'  : '',
				'activeTab' : false,
				'stdout'    : [ ]
			},

			'slaves'      : [ ],
			'stdout'      : [ ]
		};
	},

	'componentDidMount' : function () {
		socket.on( 'connect', this._initialize );
		socket.on( 'data-stream', this._streamData );
		socket.on( 'disconnect', this._disconnect );
		socket.on( 'update-slaves-list', this._updateSlaveList );
	},

	'_initialize' : function () {
		socket.emit( 'update-slaves-list', function ( data ) {
			console.log( data );
		} );
	},

	'_streamData' : function ( res ) {
		var slave = this.state.slaves.filter( function ( slave ) {
			slave.activeTab = false;
			return slave.platform === res.platform && slave.id === res.machine;
		} );

		if ( slave.length ) {
			slave[ 0 ].activeTab = true;
			slave[ 0 ].stdout.push( res.data[ 2 ] );
		}

		this.setState( { 'slaves' : this.state.slaves } );
	},

	'_disconnect' : function ( data ) {
		console.log( data );
	},

	'_updateSlaveList' : function ( slaves ) {
		slaves.map( function ( slave, key ) {
			slave.activeTab = key === 0;
			slave.stdout    = [ ];

			if ( key === 0 ) {
				this.setState( { 'activeSlave' : slave } );
			}
		}.bind( this ) );

		this.setState( { 'slaves' : slaves } );
	},

	'render' : function () {
		return (
			<div>
				<SlaveTabs slaves={ this.state.slaves } />
				<SlaveContainer slave={ this.state.activeSlave } />
				<StdoutContainer slave={ this.state.activeSlave } />
			</div>
		);
	}

} );

ReactDOM.render(
	<MasterSlaveApp />,
	document.getElementById( 'app' )
);
