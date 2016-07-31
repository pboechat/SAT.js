SAT.js
=====

**SAT.js** is a Javascript implementation of the Separating Axis Theorem for convex polygons and polyhedra.

Requires [three.js](http://threejs.org/).

Based on [this article](http://www.geometrictools.com/Documentation/MethodOfSeparatingAxes.pdf).


----------

### Usage

Add three.js and SAT.js to your page:

	<script type="text/javascript" src="three.js"></script>
    <script type="text/javascript" src="SAT.js"></script>

#### Polygons

Wrap your 2D vertices around with the *SAT.Polygon* class:

    var polyA = new SAT.Polygon([new THREE.Vector2(-0.5, -0.5), 
    new THREE.Vector2(0.5, -0.5),
    new THREE.Vector2(0.5, 0.5),
    new THREE.Vector2(-0.5, 0.5),
    ]);
    var polyB = new SAT.Polygon(verticesB);

Notice that vertices *must* be in *counter-clockwise* order.

#### Polyhedra

With vertices, edges and faces of your polyhedron, build a *SAT.Shape* instance:

    // 1x1x1 cube centered in origin
    var polyA = new SAT.Shape(
    // vertices
    [
		new THREE.Vector3(-0.5, 0.5, 0.5), new THREE.Vector3(-0.5, -0.5, 0.5),
		new THREE.Vector3(0.5, -0.5, 0.5), new THREE.Vector3(0.5, 0.5, 0.5),
		new THREE.Vector3(0.5, 0.5, -0.5), new THREE.Vector3(0.5, -0.5, -0.5),
		new THREE.Vector3(-0.5, -0.5, -0.5), new THREE.Vector3(-0.5, 0.5, -0.5),
	],
	// edges
	[
		[0, 1], 
		[1, 2], 
		[2, 3], 
		[3, 0],
        [4, 5], 
        [5, 6], 
        [6, 7], 
        [7, 4],
        [3, 4], 
        [2, 5], 
        [0, 7], 
        [1, 6]
	],
	// faces
	[
        [0, 1, 2, 3],  // front
        [4, 5, 6, 7],  // back
        [3, 2, 5, 4],  // right
        [7, 6, 1, 0],  // left
        [7, 0, 3, 4],  // top
        [5, 2, 1, 6]   // bottom
    ]);
    var polyB = new SAT.Shape(verticesB, edgesB, facesB);

Faces must reference vertices in counter-clockwise order.

#### Collision Checking

	SAT.CheckCollision(polyA, polyB)



----------

### Demo

Examine the SAT algorithm step-by-step [here](http://pedroboechat.com/SAT.js/3D/main.html).

----------

### Video

[!Video(http://www.pedroboechat.com/images/SATjs-video-thumbnail.png)](https://www.youtube.com/watch?v=djKUDMbGMM4)
