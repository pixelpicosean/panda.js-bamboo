game.module(
    'bamboo.runtime.node'
)
.require(
    'bamboo.runtime.property'
)
.body(function() {

bamboo.nodes = bamboo.nodes || {};
bamboo.getNodeClasses = function() {
    var nodes = [];
    for(var i in bamboo.nodes)
        nodes.push(i);
    return nodes;
};

bamboo.Node = game.Class.extend({
    _world: null,
    _needUpdates: false,
    _connectedTo: null,
    name: null,
    displayObject: null, //must be defined in extended classes

    init: function(world, properties) {
        var propDescs = this.getPropertyDescriptors();
        for(var key in properties) {
            if(!propDescs.hasOwnProperty(key)) throw 'Node doesn\'t have property \''+key+'\'';
            this[key] = bamboo.Property.parse(world, properties, key, propDescs[key]);
        }
        this.world = world;
    },

    getPropertyDescriptors: function() {
        var properties = [];
        var proto = Object.getPrototypeOf(this);
        while (true) {
            var p = {};
            properties.splice(0, 0, p);
            for (var key in proto.constructor.desc) {
               p[key] = proto.constructor.desc[key];
            }
            proto = Object.getPrototypeOf(proto);
            if (proto === game.Class.prototype) break;
        }
        var props = {};
        for( var i = 0; i < properties.length; i++) {
            for (var k in properties[i]) {
                props[k] = properties[i][k];
            }
        }
        return props;
    },

    toJSON: function() {
        var propDescs = this.getPropertyDescriptors();
        var jsonProperties = {};
        for(var key in propDescs) {
            jsonProperties[key] = bamboo.Property.toJSON(this, key, propDescs[key]);
        }
        return {class: this.getClassName(), properties: jsonProperties};
    },

    getClassName: function() {
        var nodes = bamboo.getNodeClasses();
        for(var i=nodes.length-1; i >= 0; i--) {
            if(this instanceof bamboo.nodes[nodes[i]])
                return nodes[i];
        }
        return 'Node';
    },

    toLocalSpace: function(v) {
        var wt = this.displayObject.worldTransform;
        var id = 1.0 / (wt.a*wt.d - wt.b*wt.c);

        return new game.Vec2((wt.d * (v.x - wt.tx) - wt.b * (v.y - wt.ty)) * id,
                               (wt.a * (v.y - wt.ty) - wt.c * (v.x - wt.tx)) * id);
    },

    toWorldSpace: function(v) {
        var wt = this.displayObject.worldTransform;
        return new game.Vec2(wt.a * v.x + wt.b * v.y + wt.tx, wt.c * v.x + wt.d * v.y + wt.ty);
    },

    getWorldPosition: function() {
        return new game.Vec2(this.displayObject.worldTransform.tx, this.displayObject.worldTransform.ty);
    }
});

Object.defineProperty(bamboo.Node.prototype, 'world', {
    get: function() {
        return this._world;
    },
    set: function(value) {
        if(this._world) {
            if(this._needUpdates)
                this._world._removeFromUpdateables(this);
            this._world._removeNode(this);
        }
        this._world = value;
        if(this._world) {
            this._world._addNode(this);
            if(this._needUpdates)
                this._world._addToUpdateables(this);
        }
    }
});

Object.defineProperty(bamboo.Node.prototype, 'needUpdates', {
    get: function() {
        return this._needUpdates;
    },
    set: function(value) {
        if(value !== this._needUpdates) {
            this._needUpdates = value;
            if(this._world) {
                if(this._needUpdates)
                    this._world._addToUpdateables(this);
                else
                    this._world._removeFromUpdateables(this);
            }
        }
    }
});

Object.defineProperty(bamboo.Node.prototype, 'position', {
    get: function() {
        return this.displayObject.position;
    },
    set: function(value) {
        this.displayObject.position = value;
    }
});

Object.defineProperty(bamboo.Node.prototype, 'rotation', {
    get: function() {
        return this.displayObject.rotation;
    },
    set: function(value) {
        this.displayObject.rotation = value;
    }
});

Object.defineProperty(bamboo.Node.prototype, 'scale', {
    get: function() {
        return this.displayObject.scale;
    },
    set: function(value) {
        this.displayObject.scale = value;
    }
});

Object.defineProperty(bamboo.Node.prototype, 'connectedTo', {
    get: function() {
        return this._connectedTo;
    },
    set: function(value) {
        if(value === this)
            throw 'Cannot connect to itself!';
        if(this._connectedTo) {
            this._connectedTo.displayObject.removeChild(this.displayObject);
        }
        this._connectedTo = value;
        if(this._connectedTo) {
            this._connectedTo.displayObject.addChild(this.displayObject);
        }
    }
});

bamboo.Node.desc = {
    name: new bamboo.Property(true, 'Name', 'Name of the node', bamboo.Property.TYPE.STRING),
    position: new bamboo.Property(true, 'Position', 'Position of the node', bamboo.Property.TYPE.VECTOR),
    rotation: new bamboo.Property(true, 'Rotation', 'Rotation of the node in degrees', bamboo.Property.TYPE.ANGLE, {loop360:true}),
    scale: new bamboo.Property(true, 'Scale', 'Scale of the node', bamboo.Property.TYPE.VECTOR),
    connectedTo: new bamboo.Property(true, 'Follow', 'Node that this node will follow', bamboo.Property.TYPE.NODE)
};

});
