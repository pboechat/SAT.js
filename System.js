// --------------------------------------------------
//              INHERITANCE MECHANISM
// --------------------------------------------------

Function.prototype.SubClass = function () {
    function Class() {
        if (!(this instanceof Class)) {
            throw("Constructor called without \"new\"");
        }

        if ("__Constructor" in this) {
            this.__Constructor.apply(this, arguments);
        }
    }

    Function.prototype.SubClass.Base.prototype = this.prototype;
    Class.prototype = new Function.prototype.SubClass.Base();
    Class.parent = this.prototype;
    return Class;
};

Function.prototype.SubClass.Base = function () {
};

// --------------------------------------------------
//                      SYSTEM
// --------------------------------------------------

var System = function () {
};

System.RegisterEventListener = function (eventName, callback) {
    if (window === undefined) {
        return;
    }

    if (window.attachEvent) {
        window.attachEvent(eventName, callback);
    }
    else if (window.addEventListener) {
        window.addEventListener(eventName, callback);
    }
    else {
        throw("Don't know how to register event");
    }
};

System.AddAnimationCallback = function (callback) {
    if (window === undefined) {
        return;
    }

    if (window.requestAnimationFrame) {
        window.requestAnimationFrame(callback);
    }
    else if (window.webkitRequestAnimationFrame) {
        window.webkitRequestAnimationFrame(callback);
    }
    else if (window.mozRequestAnimationFrame) {
        window.mozRequestAnimationFrame(callback);
    }
    else if (window.oRequestAnimationFrame) {
        window.oRequestAnimationFrame(callback);
    }
    else {
        window.setTimeout(callback, 1000 / 60);
    }
};

System.Print = function (message) {
    if (!(window === undefined)) {
        window.alert(message);
    }
    else if (!(console === undefined)) {
        console.log(message);
    }
};

System.Now = function () {
    return new Date().getTime();
};

// --------------------------------------------------
//                 OBJECT SUPERCLASS
// --------------------------------------------------

System.Object = function () {
};

System.Object.prototype.toString = function () {
    if (this.ToString) {
        return this.ToString();
    }
    else {
        return "[object Object]";
    }
};

// --------------------------------------------------
//                  MATH FUNCTIONS
// --------------------------------------------------

System.Math = function () {
};

System.Math.AP = function (n) {
    return n * (1.0 + n) / 2.0;
};

System.Math.Sign = function (x) {
    return (x >= 0) ? 1 : -1;
};

// --------------------------------------------------
//                  TYPE FUNCTIONS
// --------------------------------------------------
System.Type = function () {
};

System.Type.IsUndefined = function (a) {
    return (a === undefined);
};

System.Type.IsString = function (a) {
    return (typeof a === "string");
};

System.Type.IsNumber = function (a) {
    return !isNaN(a);
};

System.Type.IsArray = function (a) {
    return (typeof a === "array");
};

// --------------------------------------------------
//                  ARRAY FUNCTIONS
// --------------------------------------------------

System.Array = function () {
};

System.Array.Range = function(min, max) {
    var array = [];
    for (var i = min; i < max; i++) {
        array.push(i);
    }
    return array;
};

// --------------------------------------------------
//                      ASSERTIONS
// --------------------------------------------------
System.Assert = function () {
};

System.Assert.ThrowError = function (message) {
    throw Error(message + "\n(Stacktrace: " + printStackTrace().join("\n") + ")\n\n");
};

System.Assert.Equals = function (a, b) {
    System.Assert.NotUndefined(a);
    System.Assert.NotUndefined(b);

    var result;
    if (a.Equals) {
        result = a.Equals(b);
    }
    else {
        result = (a == b);
    }

    if (!result) {
        System.Assert.ThrowError("actual: '" + a.toString() + "' / expected: '" + b.toString() + "'");
    }
};

System.Assert.NotEquals = function (a, b) {
    System.Assert.NotUndefined(a);
    System.Assert.NotUndefined(b);

    var result;
    if (a.Equals) {
        result = a.Equals(b);
    }
    else {
        result = (a == b);
    }

    if (result) {
        System.Assert.ThrowError("actual: '" + a.toString() + "' / expected: !('" + b.toString() + "')");
    }
};

System.Assert.NotUndefined = function (value) {
    if (System.Type.IsUndefined(value)) {
        System.Assert.ThrowError("value is undefined");
    }
};

System.Assert.NotNull = function (value) {
    System.Assert.NotUndefined(value);

    if (value == null) {
        System.Assert.ThrowError("value is null");
    }
};

System.Assert.NotEmpty = function (value) {
    System.Assert.NotNull(value);

    if (System.Type.IsString(value) && value.length == 0) {
        throw Error("value is an empty string");
    }
    else if (System.Type.IsArray(value) && value.length == 0) {
        System.Assert.ThrowError("value is an empty array");
    }
};

System.Assert.Number = function (value) {
    System.Assert.NotNull(value);

    if (!System.Type.IsNumber(value)) {
        System.Assert.ThrowError("value is not a number");
    }
};

System.Assert.GreaterThan = function (value, threshold) {
    System.Assert.Number(value);

    if (value <= threshold) {
        System.Assert.ThrowError("value is not greater than " + threshold);
    }
}

System.Assert.GreaterThanZero = function (value) {
    System.Assert.Number(value);

    if (value <= 0) {
        System.Assert.ThrowError("value is not greater than zero");
    }
};

/*

 System.DOM.Button = System.Object.Element.SubClass();

 System.DOM.Button.Create = function(id, value, styleClass, onClickCallback)
 {
 var button = document.createElement("input");
 button.id = id;
 button.type = "button";
 button.value = value;
 button.onclick = onClickCallback;

 if (typeof styleClass != "undefined" && styleClass != null)
 {
 button.className = styleClass;
 }

 return button;
 };

 System.DOM.Select = System.Object.Element.SubClass();

 System.DOM.Select.Create = function(id, styleClass, list)
 {
 var select = document.createElement("select");

 select.id = id;

 if (typeof styleClass != "undefined" && styleClass != null)
 {
 select.className = styleClass;
 }

 if (typeof list != "undefined" && list != null)
 {
 Select.AddOptions(select, list);
 }

 return select;
 };

 System.DOM.Select.AddOptions = function(select, list)
 {
 for (var i = 0; i < list.GetSize(); i++)
 {
 var option = document.createElement("option");
 option.text = list.Get(i);
 select.add(option);
 }
 };*/