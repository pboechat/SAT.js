// --------------------------------------------------
//              WEBGL APPLICATION
// --------------------------------------------------

System.WebGL = function () {
};

System.WebGL.Application = System.Object.SubClass();

System.WebGL.Application.prototype.__Constructor = function () {
    this.__scene = null;
    this.__camera = null;
    this.__renderer = null;
    this.__controls = null;
    this.__fullscreen = false;
    this.__width = 0;
    this.__height = 0;
    this.__onKeyUpListener = null;
    this.__onLoadListener = null;
};

System.WebGL.Application.prototype.RunWindowed = function (width, height) {
    this.__width = width;
    this.__height = height;
    this.__fullscreen = false;
    window.onload = this.OnLoad.bind(this);
};

System.WebGL.Application.prototype.RunFullscreen = function () {
    this.__fullscreen = true;
    window.onload = this.OnLoad.bind(this);
    window.onresize = this.OnResize.bind(this);
};

System.WebGL.Application.prototype.SetOnKeyUpListener = function (onKeyUpListener) {
    this.__onKeyUpListener = onKeyUpListener;
};

System.WebGL.Application.prototype.SetOnLoadListener = function (onLoadListener) {
    this.__onLoadListener = onLoadListener;
};

System.WebGL.Application.prototype.OnKeyUp = function (e) {
    if (this.__onKeyUpListener == null) {
        return;
    }
    this.__onKeyUpListener.apply(this, [e || event]);
};

System.WebGL.Application.prototype.OnResize = function (e) {
    if (!this.__fullscreen) {
        return;
    }
    var width = window.innerWidth;
    var height = window.innerHeight;
    var aspect = width / height;
    this.__camera.aspect = aspect;
    this.__camera.updateProjectionMatrix();
    this.__renderer.setSize(width, height);
};

System.WebGL.Application.prototype.OnLoad = function () {
    var body = document.getElementsByTagName("body")[0];
    body.style.margin = 0;
    body.onkeyup = this.OnKeyUp.bind(this);
    this.__scene = new THREE.Scene();
    var width = (this.__fullscreen) ? window.innerWidth : this.__width;
    var height = (this.__fullscreen) ? window.innerHeight : this.__height;
    var aspect = width / height;
    this.__camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    this.__camera.position.set(0, 1.5, 6);
    this.__camera.lookAt(this.__scene.position);
    this.__renderer = new THREE.WebGLRenderer();
    this.__renderer.setSize(width, height);
    document.body.appendChild(this.__renderer.domElement);
    this.__controls = new THREE.TrackballControls(this.__camera, this.__renderer.domElement);
    if (this.__onLoadListener != null) {
        this.__onLoadListener.call(this);
    }
    this.__MainLoop();
};

System.WebGL.Application.prototype.__MainLoop = function () {
    System.AddAnimationCallback(this.__MainLoop.bind(this));
    this.__renderer.render(this.__scene, this.__camera);
    this.__controls.update();
};