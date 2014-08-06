System.DOM = function () {
};

// --------------------------------------------------
//                  DOM ELEMENT OBJECT
// --------------------------------------------------

System.DOM.Element = System.Object.SubClass();

System.DOM.Element.prototype.__Initialize = function (parent, tag, id) {
    System.Assert.NotUndefined(parent);
    this.__domElementParent = parent;
    this.__domElement = document.createElement(tag);
    this.__domElement.id = id;
    this.__domElementParent.attachChild(this.__domElement);
};

System.DOM.Element.GetId = function () {
    return this.__domElement.id;
};

System.DOM.Element.prototype.Dispose = function () {
    if (this.__domElement) {
        this.__domElementParent.removeChild(this.__domElement);
    }
};

// --------------------------------------------------
//                  SPAN OBJECT
// --------------------------------------------------

System.DOM.Span = System.DOM.Element.SubClass();

System.DOM.Span.prototype.__Constructor = function (parent, text, styleClass) {
    this.__Initialize(parent, "span", id);
    this.__domElement.innerHTML = text;

    if (!System.Type.IsUndefined(styleClass) && styleClass != null) {
        this.__domElement.className = styleClass;
    }
};

System.DOM.Span.prototype.GetText = function () {
    return this.__domElement.innerHTML;
};
