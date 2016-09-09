/**
 * @author mrdoob / http://mrdoob.com/
 * @author bhouston / http://clara.io/
 * @author stephomi / http://stephaneginier.com/
 */

( function ( THREE ) {

	THREE.MyRaycaster = function ( origin, direction,near, far) {

		this.ray = new THREE.Ray( origin, direction );
		// direction is assumed to be normalized (for accurate distance calculations)

		this.near = near || 0;
		this.far = far || Infinity;

		//是否检出隐藏的物体，默认不检出
		this.visible = false;

		this.params = {
			Mesh: {},
			Line: {},
			LOD: {},
			Points: { threshold: 1 },
			Sprite: {}
		};

		Object.defineProperties( this.params, {
			PointCloud: {
				get: function () {
					console.warn( 'THREE.MyRaycaster: params.PointCloud has been renamed to params.Points.' );
					return this.Points;
				}
			}
		} );

	};

	function ascSort( a, b ) {

		return a.distance - b.distance;

	}

	function intersectObject( object, raycaster, intersects, recursive ) {

		if(!raycaster.visible){
			if ( object.visible === false ) return;
		}

		object.raycast( raycaster, intersects );

		if ( recursive === true ) {
			var children = object.children;
			for ( var i = 0, l = children.length; i < l; i ++ ) {
				intersectObject( children[ i ], raycaster, intersects, true );
			}
		}
	}

	//

	THREE.MyRaycaster.prototype = {

		constructor: THREE.MyRaycaster,

		linePrecision: 1,

		set: function ( origin, direction ) {

			// direction is assumed to be normalized (for accurate distance calculations)

			this.ray.set( origin, direction );

		},

		setFromCamera: function ( coords, camera ) {

			if ( camera instanceof THREE.PerspectiveCamera ) {

				this.ray.origin.setFromMatrixPosition( camera.matrixWorld );
				this.ray.direction.set( coords.x, coords.y, 0.5 ).unproject( camera ).sub( this.ray.origin ).normalize();

			} else if ( camera instanceof THREE.OrthographicCamera ) {

				this.ray.origin.set( coords.x, coords.y, - 1 ).unproject( camera );
				this.ray.direction.set( 0, 0, - 1 ).transformDirection( camera.matrixWorld );

			} else {

				console.error( 'THREE.MyRaycaster: Unsupported camera type.' );

			}

		},

		intersectObject: function ( object, recursive ) {

			var intersects = [];

			intersectObject( object, this, intersects, recursive);

			intersects.sort( ascSort );

			return intersects;

		},

		intersectObjects: function ( objects, recursive) {

			var intersects = [];

			if ( Array.isArray( objects ) === false ) {

				console.warn( 'THREE.MyRaycaster.intersectObjects: objects is not an Array.' );
				return intersects;

			}

			for ( var i = 0, l = objects.length; i < l; i ++ ) {

				intersectObject( objects[ i ], this, intersects, recursive);

			}

			intersects.sort( ascSort );

			return intersects;

		}

	};

}( THREE ) );
