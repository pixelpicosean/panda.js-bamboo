/**
    @namespace game.bamboo
**/
game.module(
    'bamboo.runtime.node'
)
.require(
    'bamboo.runtime.property'
)
.body(function() {
'use strict';

/**
    @class Node
**/
game.bamboo.Node = game.Class.extend({
    /**
        List of nodes childrens.
        @property {Array} children
    **/
    children: [],

    staticInit: function(scene, properties) {
        this.scene = scene;
        this.properties = properties;
        this.name = properties.name;
    },

    /**
        @method init
    **/
    init: function() {
        this.displayObject = new game.Container();
    },

    /**
        @method initProperties
    **/
    initProperties: function() {
        var propDescs = this.getPropertyDescriptors();

        for (var key in propDescs) {
            this.setProperty(key, game.bamboo.Property.parse(this.scene, this.properties, key, propDescs[key]));
        }
    },

    /**
        Called, when node is ready and properties inited.
        @method ready
    **/
    ready: function() {
    },

    /**
        Called, when node is removed from it's scene.
        @method onRemove
    **/
    onRemove: function() {
    },

    /**
        Remove node from it's scene.
        @method remove
    **/
    remove: function() {
        return this.scene.removeNode(this);
    },

    /**
        @method setProperty
        @param {String} name
        @param value
    **/
    setProperty: function(name, value) {
        this[name] = value;
        
        if (name === 'position') this.displayObject.position.set(value.x, value.y);
        else if (name === 'scale') this.displayObject.scale.set(value.x, value.y);
        else if (name === 'anchor') {
            if (this.displayObject.anchor) this.displayObject.anchor.set(value.x, value.y);
        }
        else if (name === 'parent') this.parent.addChild(this);
    },

    /**
        Add child to node.
        @method addChild
        @param {Node} node
    **/
    addChild: function(node) {
        this.children.push(node);
        this.displayObject.addChild(node.displayObject);
    },

    /**
        Remove child from node.
        @method removeChild
        @param {Node} node
    **/
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
            for (var key in proto.constructor.properties) {
                p[key] = proto.constructor.properties[key];
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

    /**
        Convert global position to local position.
        @method toLocalSpace
        @param {Vector} point
        @param {Vector} [output]
    **/
    toLocalSpace: function(point, output) {
        var pos = this.getGlobalPosition();

        var x = point.x - pos.x;
        var y = point.y - pos.y;
        
        if (output) {
            game.bamboo.pool.put(pos);
            return output.set(x, y);
        }

        pos.set(x, y);
        return pos;
    },

    /**
        Convert local position to global position.
        @method toGlobalSpace
        @param {Vector} point
        @param {Vector} [output]
    **/
    toGlobalSpace: function(point, output) {
        var pos = this.getGlobalPosition();

        var x = point.x + pos.x;
        var y = point.y + pos.y;

        if (output) {
            game.bamboo.pool.put(pos);
            return output.set(x, y);
        }

        pos.set(x, y);
        return pos;
    },

    /**
        Get node's global position.
        @method getGlobalPosition
        @param {Vector} [output]
    **/
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

        var point = game.bamboo.pool.get();
        point.set(x, y);
        return point;
    }
});

game.bamboo.Node.properties = {};

/**
    @property {Node} parent
**/
game.addNodeProperty('Node', 'parent', 'node');
/**
    @property {String} name
**/
game.addNodeProperty('Node', 'name', 'string');
/**
    @property {Vector} position
**/
game.addNodeProperty('Node', 'position', 'vector');
/**
    @property {Vector} size
**/
game.addNodeProperty('Node', 'size', 'vector');
/**
    @property {Vector} anchor
**/
game.addNodeProperty('Node', 'anchor', 'vector');

});
