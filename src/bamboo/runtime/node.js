game.module(
    'bamboo.runtime.node'
)
.require(
    'bamboo.runtime.property'
)
.body(function() {

bamboo.Node = game.Class.extend({
    init: function(world, properties) {
        if (this.displayObject === true) this.displayObject = new game.Container();

        var propDescs = this.getPropertyDescriptors();

        for (var key in propDescs) {
            this.setProperty(key, bamboo.Property.parse(world, properties, key, propDescs[key]));
        }
        
        this.world = world;
        this.world.addNode(this);
    },

    setProperty: function(name, value) {
        this[name] = value;
        if (name === 'rotation') {
            if (this.displayObject) this.displayObject.rotation = value;
        }
        if (name === 'position') {
            if (this.displayObject) this.displayObject.position.set(value.x, value.y);
        }
        if (name === 'scale') {
            if (this.displayObject) this.displayObject.scale.set(value.x, value.y);
        }
        if (name === 'parent') {
            if (this.displayObject && this.parent && this.displayObject.parent) {
                this.parent.displayObject.removeChild(this.displayObject);
            }

            if (this.displayObject && this.parent) {
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

    getClassName: function() {
        for (var name in bamboo.nodes) {
            if (this instanceof bamboo.nodes[name]) return name;
        }
    },

    toLocalSpace: function(point) {
        var pos = this.getWorldPosition();

        var x = point.x - pos.x - this.world.position.x;
        var y = point.y - pos.y - this.world.position.y;
        
        return new game.Point(x, y);
    },

    toWorldSpace: function(point) {
        var x = point.x - this.world.position.x + this.world.cameraPosition.x;
        var y = point.y - this.world.position.y + this.world.cameraPosition.y;

        return new game.Point(x, y);
    },

    getWorldPosition: function() {
        var x = this.position.x;
        var y = this.position.y;

        var parent = this.parent;
        while (parent) {
            x += parent.position.x;
            y += parent.position.y;
            parent = parent.parent;
        }

        return new game.Point(x, y);
    }
});

bamboo.Node.props = {
    parent: new bamboo.Property(true, 'Parent', 'Parent that this node will follow', bamboo.Property.TYPE.NODE),
    name: new bamboo.Property(true, 'Name', 'Name of the node', bamboo.Property.TYPE.STRING),
    position: new bamboo.Property(true, 'Position', 'Position of the node', bamboo.Property.TYPE.VECTOR),
    size: new bamboo.Property(true, 'Size', 'Size of the node', bamboo.Property.TYPE.VECTOR, [100, 100]),
    rotation: new bamboo.Property(true, 'Rotation', 'Rotation of the node in degrees', bamboo.Property.TYPE.ANGLE, 0, { loop360: true }),
    scale: new bamboo.Property(true, 'Scale', 'Scale of the node', bamboo.Property.TYPE.VECTOR, [1, 1])
};

bamboo.nodes.Null = bamboo.Node.extend();

});
