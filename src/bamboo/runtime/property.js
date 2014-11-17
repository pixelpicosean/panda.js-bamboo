game.module(
    'bamboo.runtime.property'
)
.require(
    'bamboo.runtime.point',
    'engine.tween'
)
.body(function() {

game.bamboo.Property = game.Class.extend({
    options: {},

    init: function(name, type, defaultValue, hidden, options) {
        this.name = name;
        this.type = type;
        this.defaultValue = defaultValue;
        this.hidden = !!hidden;
        this.options = options || this.options;
    }
});

game.bamboo.Property.TYPE = {
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
    COLOR: 11,
    JSON: 12,
    AUDIO: 13,
    OBJECT: 14
};

game.bamboo.Property.parse = function(scene, obj, name, prop) {
    switch (prop.type) {
        case game.bamboo.Property.TYPE.OBJECT:
            return obj[name] || {};

        case game.bamboo.Property.TYPE.VECTOR:
            if (obj[name] instanceof Array) return new game.Point(obj[name][0], obj[name][1]);
            return typeof obj[name] !== 'undefined' ? new game.Point(obj[name].x, obj[name].y) : prop.defaultValue ? new game.Point(prop.defaultValue[0], prop.defaultValue[1]) : new game.Point();

        case game.bamboo.Property.TYPE.NODE:
            return scene.findNode(obj[name]);

        case game.bamboo.Property.TYPE.EASING:
            return game.Tween.Easing.getByName(obj[name]);

        case game.bamboo.Property.TYPE.ARRAY:
            var a = [];
            if (!obj[name]) return a;
            for (var i = 0; i < obj[name].length; i++) {
                var value = game.bamboo.Property.parse(scene, obj[name], i, prop.options);
                a.push(value);
            }
            return a;

        default:
            return typeof obj[name] !== 'undefined' ? game.bamboo.Property.parseOptions(obj[name], prop.options) : prop.defaultValue;
    }
};

game.bamboo.Property.parseOptions = function(value, options) {
    if (typeof options.min === 'number' && value < options.min) value = options.min;
    if (typeof options.max === 'number' && value > options.max) value = options.max;
    return value;
};

game.bamboo.Property.toJSON = function(obj, name, desc) {
    switch (desc.type) {
        case game.bamboo.Property.TYPE.VECTOR:
            return { x: obj[name].x, y: obj[name].y };

        case game.bamboo.Property.TYPE.NODE:
            if (!obj[name]) return '';
            return obj[name].name;

        case game.bamboo.Property.TYPE.EASING:
            return game.Tween.Easing.getName(obj[name]);

        case game.bamboo.Property.TYPE.ARRAY:
            var a = [];
            for (var i = 0; i < obj[name].length; i++) {
                a.push(game.bamboo.Property.toJSON(obj[name], i, desc.options));
            }
            return a;

        default:
            return obj[name];
    }
};

// Helper functions for easing
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
