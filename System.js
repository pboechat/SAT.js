// --------------------------------------------------
//              INHERITANCE MECHANISM
// --------------------------------------------------

Function.prototype.SubClass = function()
{
	function Class()
	{
		if (!(this instanceof Class))
		{
            throw("Constructor called without \"new\"");
		}
	
		if ("__Constructor" in this)
		{
			this.__Constructor.apply(this, arguments);
		}
	}
	Function.prototype.SubClass.NonConstructor.prototype = this.prototype;
	Class.prototype = new Function.prototype.SubClass.NonConstructor();
	return Class;
};

// --------------------------------------------------
Function.prototype.SubClass.NonConstructor = function() {};

// --------------------------------------------------
//                  SYSTEM NAMESPACE
// --------------------------------------------------
System = function() {};

// --------------------------------------------------
System.RegisterEventListener = function(eventName, callback)
{
    if (typeof window === "undefined")
    {
        return;
    }

    if (window.attachEvent)
    {
        window.attachEvent(eventName, callback);
    }
    else if (window.addEventListener)
    {
        window.addEventListener(eventName, callback);
    }
    else
    {
        throw("Don't know how to register event");
    }
};

// --------------------------------------------------
System.AddAnimationCallback = function(callback)
{
    if (typeof window === "undefined")
    {
        return;
    }

    if (window.requestAnimationFrame)
    {
        window.requestAnimationFrame(callback);
    }
    else if (window.webkitRequestAnimationFrame)
    {
        window.webkitRequestAnimationFrame(callback);
    }
    else if (window.mozRequestAnimationFrame)
    {
        window.mozRequestAnimationFrame(callback);
    }
    else if (window.oRequestAnimationFrame)
    {
        window.oRequestAnimationFrame(callback);
    }
    else
    {
        window.setTimeout(callback, 1000 / 60);
    }
};

// --------------------------------------------------
System.Print = function(message)
{
    if (!(typeof window === "undefined"))
    {
        window.alert(message);
    }
    else if (!(typeof console === "undefined"))
    {
        console.log(message);
    }
};

// --------------------------------------------------
System.Now = function()
{
    return new Date().getTime();
};

// --------------------------------------------------
//                  OBJECT CLASS
// --------------------------------------------------

System.Object = function() {};

System.Object.prototype.toString = function()
{
    if (this.ToString)
    {
        return this.ToString();
    }
    else
    {
        return "[object Object]";
    }
};

// --------------------------------------------------
//              UNIT TEST NAMESPACE
// --------------------------------------------------

System.UnitTest = function() {};

System.UnitTest.AddTestCase = function(testCase) {};

// --------------------------------------------------
//                  MATH NAMESPACE
// --------------------------------------------------

System.Math = function() {};

System.Math.AP = function(n)
{
    return n * (1.0 + n) / 2.0;
};

System.Math.Sign = function(x) { return (x >= 0) ? 1 : -1; };

// --------------------------------------------------
//                  TYPE NAMESPACE
// --------------------------------------------------
System.Type = function() {};

// --------------------------------------------------
System.Type.IsUndefined = function(a)
{
    return (typeof a === "undefined");
};

// --------------------------------------------------
System.Type.IsString = function(a)
{
    return (typeof a === "string");
};

// --------------------------------------------------
System.Type.IsNumber = function(a)
{
    return !isNaN(a);
};

// --------------------------------------------------
System.Type.IsArray = function(a)
{
    return (typeof a === "array");
};

// --------------------------------------------------
//                      ASSERTIONS
// --------------------------------------------------
Assert = function() {};

Assert.ThrowError = function(message)
{
    throw Error(message + "\n(Stacktrace: " + printStackTrace().join("\n") + ")\n\n");
};

// --------------------------------------------------
Assert.Equals = function(a, b)
{
    Assert.NotUndefined(a);
    Assert.NotUndefined(b);

    var result;
    if (a.Equals)
    {
        result = a.Equals(b);
    }
    else
    {
        result = (a == b);
    }

    if (!result)
    {
        Assert.ThrowError("actual: '" + a.toString() + "' / expected: '" + b.toString() +"'");
    }
};

// --------------------------------------------------
Assert.NotEquals = function(a, b)
{
    Assert.NotUndefined(a);
    Assert.NotUndefined(b);

    var result;
    if (a.Equals)
    {
        result = a.Equals(b);
    }
    else
    {
        result = (a == b);
    }

    if (result)
    {
        Assert.ThrowError("actual: '" + a.toString() + "' / expected: !('" + b.toString() + "')");
    }
};

// --------------------------------------------------
Assert.NotUndefined = function(value)
{
    if (System.Type.IsUndefined(value))
    {
        Assert.ThrowError("value is undefined");
    }
};

// --------------------------------------------------
Assert.NotNull = function(value)
{
    Assert.NotUndefined(value);

    if (value == null)
    {
        Assert.ThrowError("value is null");
    }
};

// --------------------------------------------------
Assert.NotEmpty = function(value)
{
    Assert.NotNull(value);

	if (System.Type.IsString(value) && value.length == 0)
	{
		throw Error("value is an empty string");
	}
	
	else if (System.Type.IsArray(value) && value.length == 0)
	{
        Assert.ThrowError("value is an empty array");
	}
};

// --------------------------------------------------
Assert.Number = function(value)
{
    Assert.NotNull(value);

    if (!System.Type.IsNumber(value))
    {
        Assert.ThrowError("value is not a number");
    }
};

// --------------------------------------------------
Assert.GreaterThan = function(value, threshold)
{
    Assert.Number(value);

    if (value <= threshold)
    {
        Assert.ThrowError("value is not greater than " + threshold);
    }
}

// --------------------------------------------------
Assert.GreaterThanZero = function(value)
{
    Assert.Number(value);

	if (value <= 0)
	{
        Assert.ThrowError("value is not greater than zero");
	}
};

// --------------------------------------------------
//                  DOM NAMESPACE
// --------------------------------------------------

System.DOM = function() {};

// --------------------------------------------------
//                  DOM ELEMENT OBJECT
// --------------------------------------------------

System.DOM.Element = System.Object.SubClass();

System.DOM.Element.prototype.__Initialize = function(parent, tag, id)
{
    Assert.NotUndefined(parent);
    this.__domElementParent = parent;
    this.__domElement = document.createElement(tag);
    this.__domElement.id = id;
    this.__domElementParent.attachChild(this.__domElement);
};

System.DOM.Element.GetId = function()
{
    return this.__domElement.id;
};

System.DOM.Element.prototype.Dispose = function()
{
    if (this.__domElement)
    {
        this.__domElementParent.removeChild(this.__domElement);
    }
};

// --------------------------------------------------
//                  SPAN OBJECT
// --------------------------------------------------

System.DOM.Span = System.DOM.Element.SubClass();

System.DOM.Span.prototype.__Constructor = function(parent, text, styleClass)
{
    this.__Initialize(parent, "span", id);
    this.__domElement.innerHTML = text;

    if (!System.Type.IsUndefined(styleClass) && styleClass != null)
    {
        this.__domElement.className = styleClass;
    }
};

System.DOM.Span.prototype.GetText = function()
{
    return this.__domElement.innerHTML;
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