game.module(
    'bamboo.runtime.property'
)
.require(
    'bamboo.runtime.point',
    'engine.tween'
)
.body(function() {
'use strict';

game.createClass('Property', {
    options: {},

    init: function(name, type, defaultValue, hidden, options) {
        this.name = name;
        this.type = type;
        this.defaultValue = defaultValue || false;
        this.hidden = !!hidden;
        this.options = options || this.options;
    },

    parse: function(node) {
        if (this.type === 'object') {
            return node.propertyData[this.name] || {};
        }
        if (this.type === 'vector') {
            if (node.propertyData[this.name] instanceof Array) return new game.Point(node.propertyData[this.name][0], node.propertyData[this.name][1]);
            return typeof node.propertyData[this.name] !== 'undefined' ? new game.Point(node.propertyData[this.name].x, node.propertyData[this.name].y) : this.defaultValue ? new game.Point(this.defaultValue[0], this.defaultValue[1]) : new game.Point();
        }
        if (this.type === 'node') {
            return node.scene.findNode(node.propertyData[this.name]);
        }
        if (this.type === 'easing') {
            return game.Tween.Easing.getByName(node.propertyData[this.name]);
        }
        if (this.type === 'array') {
            var a = [];
            if (!node.propertyData[this.name]) return a;
            for (var i = 0; i < node.propertyData[this.name].length; i++) {
                var value = game.Property.parse(scene, node.propertyData[this.name], i, this.options);
                a.push(value);
            }
            return a;
        }
        return typeof node.propertyData[this.name] !== 'undefined' ? this.parseOptions(node.propertyData[this.name], this.options) : this.defaultValue;
    },

    parseOptions: function(value) {
        if (typeof this.options.min === 'number' && value < this.options.min) value = this.options.min;
        if (typeof this.options.max === 'number' && value > this.options.max) value = this.options.max;
        return value;
    },

    toJSON: function(node) {
        if (this.type === 'vector') {
            return { x: node[this.name].x, y: node[this.name].y };
        }
        if (this.type === 'node') {
            if (!node[this.name]) return '';
            return node[this.name].name;
        }
        if (this.type === 'easing') {
            return game.Tween.Easing.getName(node[this.name]);
        }
        if (this.type === 'array') {
            var a = [];
            for (var i = 0; i < node[this.name].length; i++) {
                a.push(node[this.name][i].toJSON(this));
            }
            return a;
        }
        return node[this.name];
    }
});

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
