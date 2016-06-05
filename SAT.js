var SAT = function () {
};

SAT.Edge = System.Object.SubClass();

SAT.Edge.prototype.__Constructor = function (shape, startIndex, endIndex) {
    this.__shape = shape;
    this.__startIndex = startIndex;
    this.__endIndex = endIndex;
};

SAT.Edge.prototype.StartIndex = function () {
    return this.__startIndex;
};

SAT.Edge.prototype.EndIndex = function () {
    return this.__endIndex;
};

SAT.Edge.prototype.ToLine = function () {
    return new SAT.Line(this.__shape.Vertex(this.__startIndex), this.__shape.Vertex(this.__endIndex));
};


SAT.Edge.prototype.Clone = function () {
    return new SAT.Edge(this.__shape, this.__startIndex, this.__endIndex);
};

SAT.Face = System.Object.SubClass();

SAT.Face.prototype.__Constructor = function (shape, verticesIndices) {
    this.__shape = shape;
    this.__verticesIndices = verticesIndices;
};

SAT.Face.prototype.VertexIndex = function (i) {
    return this.__verticesIndices[i];
};

SAT.Face.prototype.VerticesIndices = function () {
    return this.__verticesIndices.concat([]);
};

SAT.Face.prototype.VertexCount = function () {
    return this.__verticesIndices.length;
}

SAT.Face.prototype.ToPolygon = function () {
    var vertices = [];
    for (var i = 0; i < this.__verticesIndices.length; i++) {
        vertices.push(this.__shape.Vertex(this.__verticesIndices[i]));
    }
    return new SAT.Polygon(vertices);
}

SAT.Face.prototype.Clone = function () {
    return new SAT.Face(this.__shape, this.__verticesIndices.concat([]));
};

SAT.Shape = System.Object.SubClass();

SAT.Shape.prototype.__Constructor = function (vertices, faces, edges) {
    this.__vertices = ((System.Type.IsUndefined(vertices)) ? null : vertices);
    this.__faces = ((System.Type.IsUndefined(faces)) ? null : faces);
    this.__edges = ((System.Type.IsUndefined(edges)) ? null : edges);
    this.__matrix = new THREE.Matrix4();
};

SAT.Shape.prototype.Consolidate = function (shape) {
    var vertices = [];
    for (var i = 0; i < this.__vertices.length; i++) {
        vertices.push(this.__vertices[i].clone().applyMatrix4(this.__matrix));
    }
    var faces = [];
    for (var i = 0; i < this.__faces.length; i++) {
        faces.push(new SAT.Face(shape, this.__faces[i].VerticesIndices()));
    }
    var edges = [];
    for (var i = 0; i < this.__edges.length; i++) {
        edges.push(new SAT.Edge(shape, this.__edges[i].StartIndex(), this.__edges[i].EndIndex()));
    }
    shape.__vertices = vertices;
    shape.__faces = faces;
    shape.__edges = edges;
    return shape;
};

SAT.Shape.prototype.ConsolidateSelf = function () {
    this.Consolidate(this);
    this.__matrix = new THREE.Matrix4();
    return this;
};

SAT.Shape.prototype.ApplyMatrix4 = function (matrix) {
    /*var vertices = [];
     for (var i = 0; i < this.__vertices.length; i++) {
     vertices.push(this.__vertices[i].clone().applyMatrix4(matrix));
     }
     this.__vertices = vertices;*/
    this.__matrix = new THREE.Matrix4().multiplyMatrices(matrix, this.__matrix);
    return this;
};

SAT.Shape.prototype.Clone = function () {
    throw new Error("Method non implemented.");
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

SAT.Shape.prototype.GetTransform = function () {
    /*var transform = this.__matrix.clone();
     transform.elements[0] = this.__width;
     transform.elements[5] = this.__height;
     transform.elements[10] = this.__depth;
     return transform;*/
    return this.__matrix.clone();
};

SAT.Shape.prototype.Translate = function (vertex) {
    this.__matrix.elements[12] += vertex.x;
    this.__matrix.elements[13] += vertex.y;
    this.__matrix.elements[14] += vertex.z;
};

SAT.Shape.prototype.Rotate = function (x, y, z) {
    this.__matrix = new THREE.Matrix4().multiplyMatrices(this.__matrix, new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(x, y, z, "XYZ")));
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

SAT.Line = SAT.Shape.SubClass();

SAT.Line.prototype.__Constructor = function (start, end) {
    this.__direction = new THREE.Vector3().subVectors(end, start);
    this.__length = this.__direction.length();
    this.__direction.normalize();
    SAT.Line.parent.__Constructor.call(this, [start, end], [], [new SAT.Edge(this, 0, 1)]);
};

SAT.Line.prototype.GetDirection = function () {
    return this.__direction.clone();
};

SAT.Line.prototype.Start = function () {
    return this.__vertices[0];
};

SAT.Line.prototype.End = function () {
    return this.__vertices[1];
};

SAT.Line.prototype.Length = function () {
    return this.__length;
};

SAT.Polygon = SAT.Shape.SubClass();

SAT.Polygon.prototype.__Constructor = function (vertices) {
    System.Assert.GreaterThan(vertices.length, 2);
    var edges = [];
    for (var i = vertices.length - 1, j = 0; j < vertices.length; i = j, j++) {
        edges.push(new SAT.Edge(this, i, j));
    }
    SAT.Polygon.parent.__Constructor.call(this, vertices, [new SAT.Face(this, System.Array.Range(0, vertices.length))], edges)
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

SAT.Box = SAT.Shape.SubClass();

SAT.Box.prototype.__Constructor = function (width, height, depth) {
    if (System.Type.IsUndefined(width) || System.Type.IsUndefined(height) || System.Type.IsUndefined(depth)) {
        SAT.Box.parent.__Constructor.call(this);
        return;
    }
    this.__width = width;
    this.__height = height;
    this.__depth = depth;
    var halfExtents = new THREE.Vector3(this.__width, this.__height, this.__depth).multiplyScalar(0.5);
    var vertices = [
        new THREE.Vector3(-halfExtents.x, halfExtents.y, halfExtents.z), new THREE.Vector3(-halfExtents.x, -halfExtents.y, halfExtents.z),
        new THREE.Vector3(halfExtents.x, -halfExtents.y, halfExtents.z), new THREE.Vector3(halfExtents.x, halfExtents.y, halfExtents.z),
        new THREE.Vector3(halfExtents.x, halfExtents.y, -halfExtents.z), new THREE.Vector3(halfExtents.x, -halfExtents.y, -halfExtents.z),
        new THREE.Vector3(-halfExtents.x, -halfExtents.y, -halfExtents.z), new THREE.Vector3(-halfExtents.x, halfExtents.y, -halfExtents.z)
    ];
    var faces = [
        new SAT.Face(this, [0, 1, 2, 3]),  // front
        new SAT.Face(this, [4, 5, 6, 7]),  // back
        new SAT.Face(this, [3, 2, 5, 4]),  // right
        new SAT.Face(this, [7, 6, 1, 0]),  // left
        new SAT.Face(this, [7, 0, 3, 4]),  // top
        new SAT.Face(this, [5, 2, 1, 6])   // bottom
    ];
    var edges = [
        new SAT.Edge(this, 0, 1), new SAT.Edge(this, 1, 2), new SAT.Edge(this, 2, 3), new SAT.Edge(this, 3, 0),
        new SAT.Edge(this, 4, 5), new SAT.Edge(this, 5, 6), new SAT.Edge(this, 6, 7), new SAT.Edge(this, 7, 4),
        new SAT.Edge(this, 3, 4), new SAT.Edge(this, 2, 5), new SAT.Edge(this, 0, 7), new SAT.Edge(this, 1, 6)
    ];
    SAT.Box.parent.__Constructor.call(this, vertices, faces, edges);
};

SAT.Box.prototype.GetWidth = function () {
    return this.__width;
};

SAT.Box.prototype.GetHeight = function () {
    return this.__height;
};

SAT.Box.prototype.GetDepth = function () {
    return this.__depth;
};

SAT.Box.prototype.Clone = function () {
    var clone = new SAT.Box();
    clone.__width = this.__width;
    clone.__height = this.__height;
    clone.__depth = this.__depth;
    clone.__matrix = this.__matrix;
    var vertices = [];
    for (var i = 0; i < this.__vertices.length; i++) {
        vertices.push(this.__vertices[i].clone());
    }
    var faces = [];
    for (var i = 0; i < this.__faces.length; i++) {
        faces.push(new SAT.Face(clone, this.__faces[i].VerticesIndices()));
    }
    var edges = [];
    for (var i = 0; i < this.__edges.length; i++) {
        edges.push(new SAT.Edge(clone, this.__edges[i].StartIndex(), this.__edges[i].EndIndex()));
    }
    clone.__vertices = vertices;
    clone.__faces = faces;
    clone.__edges = edges;
    return clone;
};

SAT.BuildMesh = function (shape0, params) {
    var shape1 = shape0.Consolidate(new SAT.Shape());
    var mesh = new THREE.Object3D();

    if (!System.Type.IsUndefined(params) && !System.Type.IsUndefined(params.decoration) && params.decoration) {
        for (var i = 0; i < shape1.VertexCount(); i++) {
            var vertexMesh = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 6), new THREE.MeshBasicMaterial({color: 0x333333}));
            var vertex = shape1.Vertex(i);
            vertexMesh.translateX(vertex.x);
            vertexMesh.translateY(vertex.y);
            vertexMesh.translateZ(vertex.z);
            mesh.add(vertexMesh);
        }

        var edgesGeometry = new THREE.Geometry();
        for (var i = 0; i < shape1.EdgeCount(); i++) {
            var edge = shape1.Edge(i).ToLine();
            var direction = edge.GetDirection();
            var arrowHelper = new THREE.ArrowHelper(direction, edge.Start(), edge.Length() * 0.5);
            edgesGeometry.merge(new THREE.CylinderGeometry(0.02, 0.02, edge.Length(), 8, 4),
                new THREE.Matrix4().makeRotationFromQuaternion(arrowHelper.quaternion).setPosition(new THREE.Vector3().addVectors(edge.Start(), direction.multiplyScalar(edge.Length() * 0.5))), 0);
        }
        mesh.add(new THREE.Mesh(edgesGeometry, new THREE.MeshBasicMaterial({color: 0x666666})));
    }

    var facesGeometry = new THREE.Geometry();
    facesGeometry.vertices = shape1.Vertices();
    var c = 0;
    for (var i = 0; i < shape1.FaceCount(); i++) {
        var face = shape1.Face(i);
        for (var j = 0; j < face.VertexCount() - 2; j++) {
            var v1 = face.VertexIndex(0);
            var v2 = face.VertexIndex(j + 1);
            var v3 = face.VertexIndex(j + 2);
            facesGeometry.faces[c] = new THREE.Face3(v1, v2, v3);
            facesGeometry.faces[c].color = params.color;
            c++;
        }
    }

    facesGeometry.computeFaceNormals();
    facesGeometry.computeVertexNormals();

    var facesMesh = new THREE.Mesh(facesGeometry, new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors, side: THREE.FrontSide, transparent: false, opacity: 0.8}));
    facesMesh.scale.multiplyScalar(1.01);
    mesh.add(facesMesh);

    var interiorFacesMesh = new THREE.Mesh(facesGeometry, new THREE.MeshBasicMaterial({color: 0xffffff, vertexColors: THREE.FaceColors, side: THREE.BackSide}));
    interiorFacesMesh.scale.multiplyScalar(0.99);
    mesh.add(interiorFacesMesh);

    mesh.matrixAutoUpdate = false;
    mesh.matrix = shape1.__matrix;
    mesh.matrixWorldNeedsUpdate = true;

    return mesh;
};

SAT.WhichSide = function (V, D, P) {
    var positive = 0, negative = 0;
    for (var i = 0; i < V.length; i++) {
        var t = D.dot(new THREE.Vector3().subVectors(V[i], P));
        if (t > 0) positive++; else if (t < 0) negative++;
        if (positive && negative) return 0;
    }
    return (positive) ? 1 : -1;
};

SAT.CheckGenericPolyhedraCollision = function (a0, b0) {
    var a1 = a0.Consolidate(new SAT.Shape());
    var b1 = b0.Consolidate(new SAT.Shape());

    for (var i = 0; i < a1.FaceCount(); i++) {
        var face = a1.Face(i).ToPolygon();
        if (SAT.WhichSide(b1.Vertices(), face.Normal(), face.Vertex(0)) > 0) {
            return false;
        }
    }

    for (var i = 0; i < b1.FaceCount(); i++) {
        var face = b1.Face(i).ToPolygon();
        if (SAT.WhichSide(a1.Vertices(), face.Normal(), face.Vertex(0)) > 0) {
            return false;
        }
    }

    for (var i = 0; i < a1.EdgeCount(); i++) {
        var e0 = a1.Edge(i).ToLine();
        for (var j = 0; j < b1.EdgeCount(); j++) {
            var e1 = b1.Edge(j).ToLine();
            var D = new THREE.Vector3().crossVectors(e0.GetDirection(), e1.GetDirection()).normalize();
            var same0;
            if ((same0 = SAT.WhichSide(a1.Vertices(), D, e0.Start())) == 0) {
                continue;
            }
            var same1;
            if ((same1 = SAT.WhichSide(b1.Vertices(), D, e0.Start())) == 0) {
                continue;
            }
            if (same0 * same1 < 0) {
                return false;
            }
        }
    }
    return true;
};

SAT.InverseModel = function (matrix) {
    // M = | R  T |
    //     | 0  1 |
    // inv(M) = | R'    R' * T' |
    //          | 0     1       |
    var R1 = new THREE.Matrix3(matrix.elements[0], matrix.elements[1], matrix.elements[2],
        matrix.elements[4], matrix.elements[5], matrix.elements[6],
        matrix.elements[8], matrix.elements[9], matrix.elements[10]);

    var T1 = new THREE.Vector3(-matrix.elements[12], -matrix.elements[13], -matrix.elements[14]).applyMatrix3(R1);

    return new THREE.Matrix4(R1.elements[0], R1.elements[3], R1.elements[6], T1.x,
        R1.elements[1], R1.elements[4], R1.elements[7], T1.y,
        R1.elements[2], R1.elements[5], R1.elements[8], T1.z,
        0.0, 0.0, 0.0, 1.0);
};


SAT.CheckBoxBoxCollision = function (a0, b0) {
    var inverseModel = SAT.InverseModel(a0.GetTransform());
    var b1 = b0.Clone().ApplyMatrix4(inverseModel);
    b1.ConsolidateSelf();

    var vertices = b1.Vertices();
    var e = new THREE.Vector3(a0.GetWidth(), a0.GetHeight(), a0.GetDepth()).multiplyScalar(0.5);

    // TODO:
};

SAT.CheckCollision = function (a, b) {
    if (a instanceof SAT.Box && b instanceof SAT.Box) {
        return SAT.CheckBoxBoxCollision(a, b);
    }
    return SAT.CheckGenericPolyhedraCollision(a, b);
};
