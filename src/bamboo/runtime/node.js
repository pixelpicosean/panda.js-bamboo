game.module(
    'bamboo.runtime.node'
)
.require(
    'bamboo.runtime.property'
)
.body(function() {
'use strict';

bamboo.Node = game.Class.extend({
    children: [],

    staticInit: function(world, properties) {
        this.world = world;
        this.properties = properties;
        this.name = properties.name;
    },

    init: function() {
        this.displayObject = new game.Container();
    },

    initProperties: function() {
        var propDescs = this.getPropertyDescriptors();

        for (var key in propDescs) {
            this.setProperty(key, bamboo.Property.parse(this.world, this.properties, key, propDescs[key]));
        }
    },

    ready: function() {
    },

    onRemove: function() {
    },

    remove: function() {
        return this.world.removeNode(this);
    },

    setProperty: function(name, value) {
        this[name] = value;
        
        if (name === 'position') this.displayObject.position.set(value.x, value.y);
        else if (name === 'scale') this.displayObject.scale.set(value.x, value.y);
        else if (name === 'anchor') {
            if (this.displayObject.anchor) this.displayObject.anchor.set(value.x, value.y);
        }
        else if (name === 'parent') this.parent.addChild(this);
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

    getPropertyDescriptors: function() {
        var properties = [];
        var proto = Object.getPrototypeOf(this);
        while (true) {
            var p = {};
            properties.splice(0, 0, p);
            for (var key in proto.constructor.props) {
                p[key] = proto.constructor.props[key];
            }
            proto = Object.getPrototypeOf(proto);
            if (proto === game.Class.prototype) break;
        }
        var props = {};
        for (var i = 0; i < properties.length; i++) {
            for (var k in properties[i]) {
                props[k] = properties[i][k];
            }
        }
        return props;
    },

    toLocalSpace: function(point, output) {
        var pos = this.getWorldPosition();

        var x = point.x - pos.x;
        var y = point.y - pos.y;
        
        if (output) {
            bamboo.pool.put(pos);
            return output.set(x, y);
        }

        pos.set(x, y);
        return pos;
    },

    toWorldSpace: function(point, output) {
        var pos = this.getWorldPosition();

        var x = point.x + pos.x;
        var y = point.y + pos.y;

        if (output) {
            bamboo.pool.put(pos);
            return output.set(x, y);
        }

        pos.set(x, y);
        return pos;
    },

    getWorldPosition: function(output) {
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

        var point = bamboo.pool.get();
        point.set(x, y);
        return point;
    }
});

bamboo.addNodeProperty('Node', 'parent', 'node');
bamboo.addNodeProperty('Node', 'name', 'string');
bamboo.addNodeProperty('Node', 'position', 'vector');
bamboo.addNodeProperty('Node', 'size', 'vector');
// bamboo.addNodeProperty('Node', 'rotation', 'number', 0);
// bamboo.addNodeProperty('Node', 'scale', 'vector', [1, 1]);
bamboo.addNodeProperty('Node', 'anchor', 'vector');

});
