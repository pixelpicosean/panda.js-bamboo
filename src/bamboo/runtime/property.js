game.module(
    'bamboo.runtime.property'
)
.require(
    'bamboo.runtime.point',
    'engine.tween'
)
.body(function() {

bamboo.Property = game.Class.extend({
    editable: false,
    name: null,
    description: null,
    type: null,
    options: {},

    init: function(editable, name, desc, type, defaultValue, options) {
        this.editable = editable;
        this.name = name;
        this.description = desc;
        this.type = type;
        this.defaultValue = defaultValue;
        this.options = options || this.options;
    }
});

bamboo.Property.TYPE = {
    NUMBER: 0,
    ANGLE: 1,
    STRING: 2,
    BOOLEAN: 3,
    VECTOR: 4,
    NODE: 5,
    ARRAY: 6,
    EASING: 7,
    ENUM: 8,
    IMAGE: 9,
    TRIGGER: 10,
    COLOR: 11
};

bamboo.Property.parse = function(world, obj, name, prop) {
    switch (prop.type) {
        case bamboo.Property.TYPE.NUMBER:
        case bamboo.Property.TYPE.ANGLE:
        case bamboo.Property.TYPE.STRING:
        case bamboo.Property.TYPE.IMAGE:
        case bamboo.Property.TYPE.BOOLEAN:
        case bamboo.Property.TYPE.ENUM:
        case bamboo.Property.TYPE.TRIGGER:
        case bamboo.Property.TYPE.COLOR:
            return typeof obj[name] !== 'undefined' ? bamboo.Property.parseOptions(obj[name], prop.options) : prop.defaultValue;

        case bamboo.Property.TYPE.VECTOR:
            if (obj[name] instanceof Array) return new game.Point(obj[name][0], obj[name][1]);
            return typeof obj[name] !== 'undefined' ? new game.Point(obj[name].x, obj[name].y) : prop.defaultValue ? new game.Point(prop.defaultValue[0], prop.defaultValue[1]) : new game.Point();

        case bamboo.Property.TYPE.NODE:
            if (!obj[name]) return world;
            return world.findNode(obj[name]);

        case bamboo.Property.TYPE.EASING:
            return game.Tween.Easing.getByName(obj[name]);

        case bamboo.Property.TYPE.ARRAY:
            var a = [];
            if (!obj[name]) return a;
            for (var i = 0; i < obj[name].length; i++) {
                var value = bamboo.Property.parse(world, obj[name], i, prop.options);
                a.push(value);
            }
            return a;
    }
    return null;
};

bamboo.Property.parseOptions = function(value, options) {
    if (typeof options.min === 'number' && value < options.min) value = options.min;
    if (typeof options.max === 'number' && value > options.max) value = options.max;
    return value;
};

bamboo.Property.toJSON = function(obj, name, desc) {
    switch (desc.type) {
        case bamboo.Property.TYPE.NUMBER:
        case bamboo.Property.TYPE.ANGLE:
        case bamboo.Property.TYPE.STRING:
        case bamboo.Property.TYPE.IMAGE:
        case bamboo.Property.TYPE.BOOLEAN:
        case bamboo.Property.TYPE.ENUM:
        case bamboo.Property.TYPE.TRIGGER:
        case bamboo.Property.TYPE.COLOR:
            return obj[name];

        case bamboo.Property.TYPE.VECTOR:
            return {x: obj[name].x, y: obj[name].y};

        case bamboo.Property.TYPE.NODE:
            return obj[name].name;

        case bamboo.Property.TYPE.EASING:
            return game.Tween.Easing.getName(obj[name]);

        case bamboo.Property.TYPE.ARRAY:
            var a = [];
            for (var i=0; i<obj[name].length; i++) {
                a.push(bamboo.Property.toJSON(obj[name], i, desc.options));
            }
            return a;
    }
};

game.Tween.Easing.getNamesList = function() {
    var names = [];
    for (var i in game.Tween.Easing) {
        for (var o in game.Tween.Easing[i]) {
            names.push(i + '.' + o);
        }
    }
    return names;
};

game.Tween.Easing.getByName = function(name) {
    if (!name) return game.Tween.Easing.Linear.None;
    name = name.split('.');
    return game.Tween.Easing[name[0]][name[1]];
};

game.Tween.Easing.getName = function(easing) {
    for (var i in game.Tween.Easing) {
        for (var o in game.Tween.Easing[i]) {
            if (easing === game.Tween.Easing[i][o]) return i + '.' + o;
        }
    }
};

});
