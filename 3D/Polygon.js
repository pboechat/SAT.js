var Polygon = System.Object.SubClass();

Polygon.prototype.__Constructor = function (vertices) {
    System.Assert.GreaterThan(vertices.length, 2);
    this.__vertices = vertices;
    this.__normal = null;
    this.__ComputeNormal();
    this.__e1 = new THREE.Vector3().subVectors(vertices[1], vertices[0]).normalize();
    this.__e2 = new THREE.Vector3().crossVectors(this.__normal, this.__e1);
    this.__origin = vertices[0];
    this.__centroid = null;
    this.__ComputeCentroid();
};

Polygon.prototype.__ComputeNormal = function () {
    this.__normal = new THREE.Vector3();
    for (var i = this.__vertices.length - 1, j = 0; j < this.__vertices.length; i = j, j++) {
        this.__normal.x += (this.__vertices[i].z + this.__vertices[j].z) * (this.__vertices[i].y - this.__vertices[j].y);
        this.__normal.y += (this.__vertices[i].x + this.__vertices[j].x) * (this.__vertices[i].z - this.__vertices[j].z);
        this.__normal.z += (this.__vertices[i].y + this.__vertices[j].y) * (this.__vertices[i].x - this.__vertices[j].x);
    }
    this.__normal.normalize();
};

Polygon.prototype.__ComputeCentroid = function () {
    var centroid = new THREE.Vector2();
    var area = 0;
    for (var i = this.__vertices.length - 1, j = 0; j < this.__vertices.length; i = j, j++) {
        var v0 = this.__ToLocalCoordinates(this.__vertices[i]);
        var v1 = this.__ToLocalCoordinates(this.__vertices[j]);
        var b = v0.x * v1.y - v1.x * v0.y;
        area += b;
        centroid.x += (v0.x + v1.x) * b;
        centroid.y += (v0.y + v1.y) * b;
    }
    area *= 0.5;
    this.__centroid = this.__ToGlobalCoordinates(centroid.divideScalar(6.0 * area));
};

Polygon.prototype.Normal = function () {
    return this.__normal;
};

Polygon.prototype.Vertex = function (i) {
    return this.__vertices[i];
};

Polygon.prototype.__ToLocalCoordinates = function (v) {
    var x = (v.x - this.__origin.x) * this.__e1.x + (v.y - this.__origin.y) * this.__e1.y + (v.z - this.__origin.z) * this.__e1.z;
    var y = (v.x - this.__origin.x) * this.__e2.x + (v.y - this.__origin.y) * this.__e2.y + (v.z - this.__origin.z) * this.__e2.z;
    return new THREE.Vector2(x, y);
};

Polygon.prototype.__ToGlobalCoordinates = function (v) {
    return new THREE.Vector3(this.__origin.x + this.__e1.x * v.x + this.__e2.x * v.y,
            this.__origin.y + this.__e1.y * v.x + this.__e2.y * v.y,
            this.__origin.z + this.__e1.z * v.x + this.__e2.z * v.y);
};

Polygon.prototype.Centroid = function () {
    return this.__centroid;
};