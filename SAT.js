var SAT = function () {
};

SAT.Line = System.Object.SubClass();

SAT.Line.prototype.__Constructor = function (start, end) {
    this.__start = start;
    this.__end = end;
    this.__direction = new THREE.Vector3().subVectors(this.__end, this.__start);
    this.__length = this.__direction.length();
    this.__direction.normalize();
};

SAT.Line.prototype.GetDirection = function () {
    return this.__direction.clone();
};

SAT.Line.prototype.GetStart = function () {
    return this.__start.clone();
};

SAT.Line.prototype.GetEnd = function () {
    return this.__end.clone();
};

SAT.Line.prototype.Length = function () {
    return this.__length;
};

SAT.Line.prototype.Clone = function () {
    return new SAT.Line(this.__start, this.__end);
};

SAT.Shape = System.Object.SubClass();

SAT.Shape.prototype.__Constructor = function (vertices, faces, edges) {
    this.__vertices = vertices;
    this.__faces = faces;
    this.__edges = edges;
    this.__matrix = new THREE.Matrix4();
};

SAT.Shape.prototype.X = function () {
    return this.__matrix.elements[12];
};

SAT.Shape.prototype.Y = function () {
    return this.__matrix.elements[13];
};

SAT.Shape.prototype.Z = function () {
    return this.__matrix.elements[14];
};

SAT.Shape.prototype.Vertices = function () {
    return this.__vertices.concat([]);
};

SAT.Shape.prototype.Faces = function () {
    return this.__faces.concat([]);
};

SAT.Shape.prototype.Edges = function () {
    return this.__edges.concat([]);
};

SAT.Shape.prototype.EdgeCount = function () {
    return this.__edges.length;
};

SAT.Shape.prototype.FaceCount = function () {
    return this.__faces.length;
};

SAT.Shape.prototype.VertexCount = function () {
    return this.__vertices.length;
};

SAT.Shape.prototype.Edge = function (i) {
    return this.__edges[i].Clone();
};

SAT.Shape.prototype.Face = function (i) {
    return this.__faces[i].Clone();
};

SAT.Shape.prototype.Vertex = function (i) {
    return this.__vertices[i].clone();
};

SAT.Shape.prototype.Transform = function (vertex) {
    return vertex.clone().applyMatrix4(this.__matrix);
};

SAT.Shape.prototype.GetTransform = function () {
    return this.__matrix;
};

SAT.Shape.prototype.Rotate = function (vertex) {
    var rotation = new THREE.Matrix4().extractRotation(this.__matrix);
    return vertex.clone().applyMatrix4(rotation);
};

SAT.Shape.prototype.SetPosition = function (x, y, z) {
    this.__matrix.setPosition(new THREE.Vector3(x, y, z));
};

SAT.Shape.prototype.SetRotation = function (x, y, z) {
    var quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(x / 180 * Math.PI, y / 180 * Math.PI, z / 180 * Math.PI, "XYZ"));
    var transform = new THREE.Matrix4();
    transform.makeRotationFromQuaternion(quaternion).setPosition(new THREE.Vector3(this.GetX(), this.GetY(), this.GetZ()));
    this.__matrix = transform;
};

SAT.Polygon = SAT.Shape.SubClass();

SAT.Polygon.prototype.__Constructor = function (vertices) {
    System.Assert.GreaterThan(vertices.length, 2);
    var edges = [];
    for (var i = vertices.length - 1, j = 0; j < vertices.length; i = j, j++) {
        edges.push(new SAT.Line(vertices[i], vertices[j]));
    }
    SAT.Polygon.parent.__Constructor.call(this, vertices, [this], edges)
    this.__normal = null;
    this.__centroid = null;
    this.ComputeNormal();
    this.ComputeCentroid();
};

SAT.Polygon.prototype.ComputeNormal = function () {
    this.__normal = new THREE.Vector3();
    for (var i = this.__vertices.length - 1, j = 0; j < this.__vertices.length; i = j, j++) {
        this.__normal.x += (this.__vertices[i].z + this.__vertices[j].z) * (this.__vertices[i].y - this.__vertices[j].y);
        this.__normal.y += (this.__vertices[i].x + this.__vertices[j].x) * (this.__vertices[i].z - this.__vertices[j].z);
        this.__normal.z += (this.__vertices[i].y + this.__vertices[j].y) * (this.__vertices[i].x - this.__vertices[j].x);
    }
    this.__normal.normalize();
};

SAT.Polygon.prototype.ComputeCentroid = function () {
    var e1 = new THREE.Vector3().subVectors(this.__vertices[1], this.__vertices[0]).normalize();
    var e2 = new THREE.Vector3().crossVectors(this.__normal, e1);
    var origin = this.__vertices[0];
    var centroid = new THREE.Vector2();
    var area = 0;
    for (var i = this.__vertices.length - 1, j = 0; j < this.__vertices.length; i = j, j++) {
        var v0 = SAT.Polygon.ToLocalCoordinates(e1, e2, origin, this.__vertices[i]);
        var v1 = SAT.Polygon.ToLocalCoordinates(e1, e2, origin, this.__vertices[j]);
        var b = v0.x * v1.y - v1.x * v0.y;
        area += b;
        centroid.x += (v0.x + v1.x) * b;
        centroid.y += (v0.y + v1.y) * b;
    }
    area *= 0.5;
    this.__centroid = SAT.Polygon.ToGlobalCoordinates(e1, e2, origin, centroid.divideScalar(6.0 * area));
};

SAT.Polygon.prototype.Normal = function () {
    return this.__normal;
};

SAT.Polygon.prototype.Centroid = function () {
    return this.__centroid;
};

SAT.Polygon.ToLocalCoordinates = function (e1, e2, origin, vertex) {
    var x = (vertex.x - origin.x) * e1.x + (vertex.y - origin.y) * e1.y + (vertex.z - origin.z) * e1.z;
    var y = (vertex.x - origin.x) * e2.x + (vertex.y - origin.y) * e2.y + (vertex.z - origin.z) * e2.z;
    return new THREE.Vector2(x, y);
};

SAT.Polygon.ToGlobalCoordinates = function (e1, e2, origin, vertex) {
    return new THREE.Vector3(origin.x + e1.x * vertex.x + e2.x * vertex.y,
            origin.y + e1.y * vertex.x + e2.y * vertex.y,
            origin.z + e1.z * vertex.x + e2.z * vertex.y);
};

SAT.Face = SAT.Polygon.SubClass();

SAT.Face.prototype.__Constructor = function (verticesSet, verticesIndices) {
    this.__verticesSet = verticesSet;
    this.__verticesIndices = verticesIndices;
    var vertices = [];
    for (var i = 0; i < this.__verticesIndices.length; i++) {
        vertices.push(this.__verticesSet[this.__verticesIndices[i]]);
    }
    SAT.Face.parent.__Constructor.call(this, vertices);
};

SAT.Face.prototype.VertexIndex = function (i) {
    return this.__verticesIndices[i];
};

SAT.Face.prototype.Clone = function () {
    return new SAT.Face(this.__verticesSet, this.__verticesIndices);
};

SAT.Box = SAT.Shape.SubClass();

SAT.Box.prototype.__Constructor = function (width, height, depth) {
    this.__width = width;
    this.__height = height;
    this.__depth = depth;
    var halfExtents = new THREE.Vector3(this.__width, this.__height, this.__depth).multiplyScalar(0.5);
    var vertices = [
        new THREE.Vector3(-halfExtents.x, halfExtents.y, halfExtents.z), new THREE.Vector3(-halfExtents.x, -halfExtents.y, halfExtents.z),
        new THREE.Vector3(halfExtents.x, -halfExtents.y, halfExtents.z), new THREE.Vector3(halfExtents.x, halfExtents.y, halfExtents.z),
        new THREE.Vector3(halfExtents.x, halfExtents.y, -halfExtents.z), new THREE.Vector3(halfExtents.z, -halfExtents.y, -halfExtents.z),
        new THREE.Vector3(-halfExtents.x, -halfExtents.y, -halfExtents.z), new THREE.Vector3(-halfExtents.x, halfExtents.y, -halfExtents.z)
    ];
    var faces = [
        new SAT.Face(vertices, [0, 1, 2, 3]),  // front
        new SAT.Face(vertices, [4, 5, 6, 7]),  // back
        new SAT.Face(vertices, [3, 2, 5, 4]),  // right
        new SAT.Face(vertices, [7, 6, 1, 0]),  // left
        new SAT.Face(vertices, [7, 0, 3, 4]),  // top
        new SAT.Face(vertices, [5, 2, 1, 6])   // bottom
    ];
    var edges = [
        new SAT.Line(vertices[0], vertices[1]), new SAT.Line(vertices[1], vertices[2]), new SAT.Line(vertices[2], vertices[3]), new SAT.Line(vertices[3], vertices[0]),
        new SAT.Line(vertices[4], vertices[5]), new SAT.Line(vertices[5], vertices[6]), new SAT.Line(vertices[6], vertices[7]), new SAT.Line(vertices[7], vertices[4]),
        new SAT.Line(vertices[3], vertices[4]), new SAT.Line(vertices[2], vertices[5]), new SAT.Line(vertices[0], vertices[7]), new SAT.Line(vertices[1], vertices[6])
    ];
    SAT.Box.parent.__Constructor.call(this, vertices, faces, edges);
};

SAT.BuildMesh = function (shape, color) {
    var mesh = new THREE.Object3D();

    for (var i = 0; i < shape.VertexCount(); i++) {
        var vertexMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 6), new THREE.MeshBasicMaterial({color: 0x333333}));
        var vertex = shape.Vertex(i);
        vertexMesh.translateX(vertex.x);
        vertexMesh.translateY(vertex.y);
        vertexMesh.translateZ(vertex.z);
        mesh.add(vertexMesh);
    }

    var edgesGeometry = new THREE.Geometry();
    for (var i = 0; i < shape.EdgeCount(); i++) {
        var edge = shape.Edge(i);
        var direction = edge.GetDirection();
        var arrowHelper = new THREE.ArrowHelper(direction, edge.GetStart(), edge.Length() * 0.5);
        edgesGeometry.merge(new THREE.CylinderGeometry(0.02, 0.02, edge.Length(), 8, 4),
            new THREE.Matrix4().makeRotationFromQuaternion(arrowHelper.quaternion).setPosition(new THREE.Vector3().addVectors(edge.GetStart(), direction.multiplyScalar(edge.Length() * 0.5))), 0);
    }
    mesh.add(new THREE.Mesh(edgesGeometry, new THREE.MeshBasicMaterial({color: 0x666666})));

    var geometry = new THREE.Geometry();
    geometry.vertices = shape.Vertices();
    var c = 0;
    for (var i = 0; i < shape.FaceCount(); i++) {
        var face = shape.Face(i);
        for (var j = 0; j < face.VertexCount() - 2; j++) {
            geometry.faces[c] = new THREE.Face3(face.VertexIndex(0), face.VertexIndex(j + 1), face.VertexIndex(j + 2));
            geometry.faces[c].color = color;
            c++;
        }
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var facesMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors, side: THREE.FrontSide, transparent: false, opacity: 0.8}));
    facesMesh.scale.multiplyScalar(1.01);
    mesh.add(facesMesh);

    var interiorFacesMesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors, side: THREE.BackSide}));
    interiorFacesMesh.scale.multiplyScalar(0.99);
    mesh.add(interiorFacesMesh);

    mesh.matrixAutoUpdate = false;
    mesh.matrix = shape.GetTransform();
    mesh.matrixWorldNeedsUpdate = true;

    return mesh;
};

SAT.BoxBoxCollision = function () {
    return false;
};