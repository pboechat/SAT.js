Line = System.Object.SubClass();

Line.prototype.__Constructor = function (start, end) {
    this.__start = start;
    this.__end = end;
    this.__direction = new THREE.Vector3().subVectors(this.__end, this.__start);
    this.__length = this.__direction.length();
    this.__direction.normalize();
};

Line.prototype.GetDirection = function () {
    return this.__direction.clone();
};

Line.prototype.GetStart = function () {
    return this.__start.clone();
};

Line.prototype.GetEnd = function () {
    return this.__end.clone();
};

Line.prototype.Length = function () {
    return this.__length;
};