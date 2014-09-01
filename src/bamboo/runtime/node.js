game.module(
    'bamboo.runtime.node'
)
.require(
    'bamboo.runtime.property'
)
.body(function() {
'use strict';

bamboo.Node = game.Class.extend({
    staticInit: function(world, properties) {
        this.world = world;

        this._init = this.init;
        this.init = this.initProperties;
    },

    onRemove: function() {},

    remove: function() {
        return this.world.removeNode(this);
    },

    initProperties: function(world, properties) {
        if (this._init) this._init();

        var propDescs = this.getPropertyDescriptors();

        for (var key in propDescs) {
            this.setProperty(key, bamboo.Property.parse(this.world, properties, key, propDescs[key]));
        }
        
        if (this.ready) this.ready();
    },

    setProperty: function(name, value) {
        this[name] = value;

        if (this.displayObject) {
            if (name === 'rotation') {
                this.displayObject.rotation = value;
            }
            else if (name === 'position') {
                this.displayObject.position.set(value.x, value.y);
            }
            else if (name === 'scale') {
                this.displayObject.scale.set(value.x, value.y);
            }
            else if (name === 'parent') {
                this.parent.displayObject.addChild(this.displayObject);
            }
        }
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

    toLocalSpace: function(point, to) {
        var pos = this.getWorldPosition();

        var x = point.x - pos.x;
        var y = point.y - pos.y;
        
        if (to) {
            bamboo.pool.put(pos);
            to.set(x, y);
            return;
        }

        pos.set(x, y);
        return pos;
    },

    toWorldSpace: function(point, to) {
        var pos = this.getWorldPosition();

        var x = point.x + pos.x;
        var y = point.y + pos.y;

        if (to) {
            bamboo.pool.put(pos);
            to.set(x, y);
            return;
        }

        pos.set(x, y);
        return pos;
    },

    getWorldPosition: function(to) {
        var x = this.position.x;
        var y = this.position.y;

        var parent = this.parent;
        while (parent) {
            if (!parent.position) break;
            x += parent.position.x;
            y += parent.position.y;
            parent = parent.parent;
        }

        if (to) {
            to.set(x, y);
            return;
        }

        var point = bamboo.pool.get();
        point.set(x, y);
        return point;
    }
});

bamboo.Node.props = {
    parent: new bamboo.Property(true, 'Parent', 'Parent that this node will follow', bamboo.Property.TYPE.NODE),
    name: new bamboo.Property(true, 'Name', 'Name of the node', bamboo.Property.TYPE.STRING),
    position: new bamboo.Property(true, 'Position', 'Position of the node', bamboo.Property.TYPE.VECTOR),
    size: new bamboo.Property(true, 'Size', 'Size of the node', bamboo.Property.TYPE.VECTOR),
    rotation: new bamboo.Property(true, 'Rotation', 'Rotation of the node in degrees', bamboo.Property.TYPE.ANGLE, 0, { loop360: true }),
    scale: new bamboo.Property(true, 'Scale', 'Scale of the node', bamboo.Property.TYPE.VECTOR, [1, 1])
};

});
