game.module(
    'bamboo.runtime.object'
)
.require(
    'bamboo.runtime.property'
)
.body(function() {

bamboo.Object = game.Class.extend({
    _world: null,
    _needUpdates: false,
    _connectedTo: null,
    name: null,
    sceneNode: null, //must be defined in extended classes

    init: function(world, properties) {
        var propDescs = this.getPropertyDescriptors();
        for(var key in properties) {
            if(!propDescs.hasOwnProperty(key)) throw 'Object doesn\'t have property \''+key+'\'';
            this[key] = bamboo.Property.parse(world, properties, key, propDescs[key]);
        }
        this.world = world;
    },

    getPropertyDescriptors: function() {
        var properties = [];
        var proto = Object.getPrototypeOf(this);
        while(true) {
            var p = {};
            properties.splice(0,0,p);
            for(var key in proto.constructor.desc) {
               p[key] = proto.constructor.desc[key];
            }
            proto = Object.getPrototypeOf(proto);
            if(proto.constructor.name !== 'Class')
                break;
        }
        var props = {};
        for(var i = 0; i<properties.length; i++)
            for(var k in properties[i])
                props[k] = properties[i][k];
        return props;
    },

    getJSONObject: function() {
        var toJsonObj = function(obj, name, desc) {
            switch(desc.type) {
            case hb.PropertyType.Number:
            case hb.PropertyType.String:
            case hb.PropertyType.File:
            case hb.PropertyType.Boolean:
            case hb.PropertyType.Enum:
                return obj[name];
            case hb.PropertyType.Vector:
                return {x: obj[name].x, y: obj[name].y};
            case hb.PropertyType.Object:
                return obj[name].name;
            case hb.PropertyType.Easing:
                return getNameFromEasing(obj[name]);
            case hb.PropertyType.Array:
                var a = [];
                for(var i=0; i<obj[name].length; i++) {
                    a.push(toJsonObj(obj[name], i, desc.options));
                }
                return a;
            case hb.PropertyType.Trigger:
                return obj[name];
            }
            return null;
        };

        var propDescs = this.getPropertyDescriptors();
        var tmpPropsObj = {};
        for(var key in propDescs) {
            tmpPropsObj[key] = toJsonObj(this,key,propDescs[key]);
        }
        var jsonObj = {class:bamboo.getClassName(this), properties:tmpPropsObj};
        return jsonObj;
    },

    toLocalSpace: function(v) {
        var wt = this.sceneNode.worldTransform;
        var a00 = wt[0], a01 = wt[1], a02 = wt[2], a10 = wt[3], a11 = wt[4], a12 = wt[5], id = 1 / (a00 * a11 + a01 * -a10);

        return new game.Vector((a11 * (v.x - a02) - a01 * (v.y - a12)) * id,
                               (a00 * (v.y - a12) - a10 * (v.x - a02)) * id);
    },

    toWorldSpace: function(v) {
        var wt = this.sceneNode.worldTransform;
        var a00 = wt[0], a01 = wt[1], a02 = wt[2], a10 = wt[3], a11 = wt[4], a12 = wt[5];
        return new game.Vector(a00 * v.x + a01 * v.y + a02, a10 * v.x + a11 * v.y + a12);
    },

    getWorldPosition: function() {
        return new game.Vector(this.sceneNode.worldTransform[2], this.sceneNode.worldTransform[5]);
    },

    update: function() {}
});

Object.defineProperty(bamboo.Object.prototype, 'world', {
    get: function() {
        return this._world;
    },
    set: function(value) {
        if(this._world) {
            if(this._needUpdates)
                this._world._removeFromUpdateables(this);
            this._world._removeObject(this);
        }
        this._world = value;
        if(this._world) {
            this._world._addObject(this);
            if(this._needUpdates)
                this._world._addToUpdateables(this);
        }
    }
});

Object.defineProperty(bamboo.Object.prototype, 'needUpdates', {
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

Object.defineProperty(bamboo.Object.prototype, 'position', {
    get: function() {
        return this.sceneNode.position;
    },
    set: function(value) {
        this.sceneNode.position = value;
    }
});

Object.defineProperty(bamboo.Object.prototype, 'rotation', {
    get: function() {
        return this.sceneNode.rotation;
    },
    set: function(value) {
        this.sceneNode.rotation = value;
    }
});

Object.defineProperty(bamboo.Object.prototype, 'scale', {
    get: function() {
        return this.sceneNode.scale;
    },
    set: function(value) {
        this.sceneNode.scale = value;
    }
});

Object.defineProperty(bamboo.Object.prototype, 'connectedTo', {
    get: function() {
        return this._connectedTo;
    },
    set: function(value) {
        if(value === this)
            throw 'Cannot connect to itself!';
        var wp = this.position;
        if(this._connectedTo) {
            this._connectedTo.sceneNode.removeChild(this.sceneNode);
            wp = this._connectedTo.toWorldSpace(wp);
        }
        this._connectedTo = value;
        if(this._connectedTo) {
            this._connectedTo.sceneNode.addChild(this.sceneNode);
            wp = this._connectedTo.toLocalSpace(wp);
        }
        this.position = wp;
    }
});

bamboo.Object.desc = {
    name: new bamboo.Property(true, 'Name of the object', bamboo.Property.TYPE.STRING),
    position: new bamboo.Property(true, 'Position of the object', bamboo.Property.TYPE.VECTOR),
    rotation: new bamboo.Property(true, 'Rotation of the object', bamboo.Property.TYPE.NUMBER),
    scale: new bamboo.Property(true, 'Scale of the object', bamboo.Property.TYPE.VECTOR),
    connectedTo: new bamboo.Property(true, 'Object that this object will follow', bamboo.Property.TYPE.OBJECT)
};

});