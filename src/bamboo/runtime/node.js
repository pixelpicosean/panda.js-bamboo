game.module(
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

game.Property = {
    node: -999999999 * 1
};

game.createClass('Node', {
    rotation: 0,
    anchor: {
        x: 0,
        y: 0
    },
    size: {
        x: 0,
        y: 0
    },
    position: {
        x: 0,
        y: 0
    },
    name: '',
    parent: game.Property.node,

    staticInit: function(scene, propertyData) {
        this.scene = scene;
        this.propertyData = propertyData;
        this.name = propertyData.name;
        this.children = [];
    },

    init: function() {
        this.displayObject = new game.Container();
    },

    initProperties: function() {
        var props = this.getProperties();

        for (var i = props.length - 1; i >= 0; i--) {
            var name = props[i];
            var value = this.propertyData[name] || this[name];
            this.setProperty(name, this.parseProperty(name, value));
        }

        delete this.propertyData;
    },

    setProperty: function(name, value) {
        this[name] = value;
        
        if (name === 'position') this.displayObject.position.set(value.x, value.y);
        else if (name === 'scale') this.displayObject.scale.set(value.x, value.y);
        else if (name === 'anchor' && this.displayObject.anchor) this.displayObject.anchor.set(value.x, value.y);
        else if (name === 'rotation') this.displayObject.rotation = value * (Math.PI / 180);
        else if (name === 'parent') this.parent.addChild(this);
    },

    parseProperty: function(name, value) {
        var type = this.getPropertyType(name);

        if (type === 'vector') return new game.Point(value.x, value.y);
        if (type === 'node') return this.scene.findNode(value);
        return value;
    },

    getProperties: function() {
        var proto = this.constructor.prototype;
        var props = [];
        for (var name in proto) {
            if (name.indexOf('_') === 0) continue;
            if (typeof proto[name] === 'function') continue;
            props.push(name);
        }
        return props;
    },

    getPropertyType: function(name) {
        var proto = this.constructor.prototype;
        for (var prop in game.Property) {
            if (proto[name] === game.Property[prop]) return prop;
        }

        var type = typeof proto[name];

        if (type === 'object') {
            if (typeof proto[name].length === 'number') return 'array';
            if (typeof proto[name].x === 'number' && typeof proto[name].y === 'number') return 'vector';
        }

        return type;
    },

    ready: function() {
    },

    onRemove: function() {
    },

    remove: function() {
        return this.scene.removeNode(this);
    },

    addChild: function(node) {
        this.children.push(node);
        this.displayObject.addChild(node.displayObject);
    },

    removeChild: function(node) {
        var index = this.children.indexOf(node);
        if (index !== -1) {
            this.children.splice(index, 1);
            this.displayObject.removeChild(node.displayObject);
            return true;
        }
        return false;
    },

    toLocalSpace: function(point, output) {
        var pos = this.getGlobalPosition();
        var x = point.x - pos.x;
        var y = point.y - pos.y;
        
        if (output) {
            game.bambooPool.put('point', pos);
            return output.set(x, y);
        }

        return pos.set(x, y);
    },

    toGlobalSpace: function(point, output) {
        var pos = this.getGlobalPosition();
        var x = point.x + pos.x;
        var y = point.y + pos.y;

        if (output) {
            game.bambooPool.put('point', pos);
            return output.set(x, y);
        }

        return pos.set(x, y);
    },

    getGlobalPosition: function(output) {
        var x = this.position.x;
        var y = this.position.y;
        var parent = this.parent;

        while (parent) {
            if (!parent.position) break;
            x += parent.position.x;
            y += parent.position.y;
            parent = parent.parent;
        }

        if (output) return output.set(x, y);

        var point = game.bambooPool.get('point');
        return point.set(x, y);
    }
});

});
