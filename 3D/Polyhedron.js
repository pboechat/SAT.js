var Polyhedron = System.Object.SubClass();

Polyhedron.prototype.__Constructor = function (data, size) {
    this.__data = data;
    this.__size = size;
    this.__vertices = [];
    this.__faces = [];
    this.__edges = [];
    this.__mesh = null;
    this.__BuildMesh();
    this.__mesh.matrixAutoUpdate = false;
    this.__mesh.matrix = new THREE.Matrix4();
};

Polyhedron.prototype.GetName = function () {
    return this.__data.name;
};

Polyhedron.prototype.GetSize = function () {
    return this.__size;
};

Polyhedron.prototype.GetMesh = function () {
    return this.__mesh;
};

Polyhedron.prototype.GetX = function () {
    return this.__mesh.matrix.elements[12];
};

Polyhedron.prototype.GetY = function () {
    return this.__mesh.matrix.elements[13];
};

Polyhedron.prototype.GetZ = function () {
    return this.__mesh.matrix.elements[14];
};

Polyhedron.prototype.NumEdges = function () {
    return this.__edges.length;
};

Polyhedron.prototype.NumFaces = function () {
    return this.__faces.length;
};

Polyhedron.prototype.NumVertices = function () {
    return this.__vertices.length;
};

Polyhedron.prototype.Edge = function (i) {
    return this.__edges[i];
};

Polyhedron.prototype.Face = function (i) {
    return this.__faces[i];
};

Polyhedron.prototype.Vertex = function (i) {
    return this.__vertices[i];
};

Polyhedron.prototype.TransformVertex = function (v) {
    return v.clone().applyMatrix4(this.__mesh.matrix);
};

Polyhedron.prototype.Rotate = function (v) {
    var rotation = new THREE.Matrix4().extractRotation(this.__mesh.matrix);
    return v.clone().applyMatrix4(rotation);
};

Polyhedron.prototype.SetPosition = function (x, y, z) {
    this.__mesh.matrix.setPosition(new THREE.Vector3(x, y, z));
    this.__mesh.matrixWorldNeedsUpdate = true;
};

Polyhedron.prototype.SetRotation = function (x, y, z) {
    var quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(x / 180 * Math.PI, y / 180 * Math.PI, z / 180 * Math.PI, "XYZ"));
    var transform = new THREE.Matrix4();
    transform.makeRotationFromQuaternion(quaternion).setPosition(new THREE.Vector3(this.GetX(), this.GetY(), this.GetZ()));
    this.__mesh.matrix = transform;
    this.__mesh.matrixWorldNeedsUpdate = true;
};

Polyhedron.prototype.__BuildMesh = function () {
    this.__mesh = new THREE.Object3D();

    for (var i = 0; i < this.__data.vertex.length; i++) {
        this.__vertices.push(new THREE.Vector3(this.__data.vertex[i][0], this.__data.vertex[i][1], this.__data.vertex[i][2]).multiplyScalar(this.__size));
    }

    for (var i = 0; i < this.__data.vertex.length; i++) {
        var vertexMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06 * this.__size, 12, 6), new THREE.MeshBasicMaterial({color: 0x333333}));
        vertexMesh.translateX(this.__vertices[i].x);
        vertexMesh.translateY(this.__vertices[i].y);
        vertexMesh.translateZ(this.__vertices[i].z);
        this.__mesh.add(vertexMesh);
    }

    var edgeMaterial = new THREE.MeshBasicMaterial({color: 0x666666});
    var edgesMeshes = new THREE.Geometry();
    for (var i = 0; i < this.__data.edge.length; i++) {
        var start = this.__vertices[this.__data.edge[i][0]];
        var end = this.__vertices[this.__data.edge[i][1]];
        var edge = new Line(start, end);
        var direction = edge.GetDirection();
        var arrowHelper = new THREE.ArrowHelper(direction, start, edge.Length() * 0.5);
        edgesMeshes.merge(new THREE.CylinderGeometry(0.02 * this.__size, 0.02 * this.__size, edge.Length(), 8, 4),
            new THREE.Matrix4().makeRotationFromQuaternion(arrowHelper.quaternion).setPosition(new THREE.Vector3().addVectors(start, direction.multiplyScalar(edge.Length() * 0.5))), 0);
        this.__edges.push(edge);
    }
    var edgeMesh = new THREE.Mesh(edgesMeshes, edgeMaterial);
    this.__mesh.add(edgeMesh);

    var faceMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, vertexColors: THREE.FaceColors, side: THREE.FrontSide, transparent: false, opacity: 0.8 });
    var faceColors =
    {
        3: new THREE.Color(0xff0000),
        4: new THREE.Color(0x00cc00),
        5: new THREE.Color(0x0000cc),
        6: new THREE.Color(0xcccc00),
        7: new THREE.Color(0x999999),
        8: new THREE.Color(0x990099),
        9: new THREE.Color(0xff6600),
        10: new THREE.Color(0x6666ff)
    };

    var geometry = new THREE.Geometry();
    geometry.vertices = this.__vertices;
    var faceIndex = 0;
    for (var faceNum = 0; faceNum < this.__data.face.length; faceNum++) {
        for (var i = 0; i < this.__data.face[faceNum].length - 2; i++) {
            geometry.faces[faceIndex] = new THREE.Face3(this.__data.face[faceNum][0], this.__data.face[faceNum][i + 1], this.__data.face[faceNum][i + 2]);
            geometry.faces[faceIndex].color = faceColors[this.__data.face[faceNum].length];
            faceIndex++;
        }
        var faceVertices = [];
        for (var i = 0; i < this.__data.face[faceNum].length; i++) {
            faceVertices.push(this.__vertices[this.__data.face[faceNum][i]]);
        }
        this.__faces.push(new Polygon(faceVertices));
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var faces = new THREE.Mesh(geometry, faceMaterial);
    faces.scale.multiplyScalar(1.01);
    this.__mesh.add(faces);

    var interiorMaterial = new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors, side: THREE.BackSide});

    var interiorFaces = new THREE.Mesh(geometry, interiorMaterial);
    interiorFaces.scale.multiplyScalar(0.99);
    this.__mesh.add(interiorFaces);
};

