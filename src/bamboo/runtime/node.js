game.module(
    'bamboo.runtime.node'
)
.require(
    'bamboo.runtime.property'
)
.body(function() {
'use strict';

game.createClass('Node', {
    children: [],

    staticInit: function(scene, propertyData) {
        this.scene = scene;
        this.propertyData = propertyData;
        this.name = propertyData.name;
    },

    init: function() {
        this.displayObject = new game.Container();
    },

    initProperties: function() {
        var propClasses = this.getPropertyClasses();

        for (var name in propClasses) {
            this.setProperty(name, propClasses[name].parse(this));
        }

        delete this.propertyData;
    },

    ready: function() {
    },

    onRemove: function() {
    },

    remove: function() {
        return this.scene.removeNode(this);
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

    getPropertyClasses: function() {
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

game.Node.properties = {
    parent: new game.Property('parent', 'node'),
    name: new game.Property('name', 'string'),
    position: new game.Property('position', 'vector'),
    size: new game.Property('size', 'vector'),
    anchor: new game.Property('anchor', 'vector')
};

});
