game.module(
    'bamboo.runtime.property'
)
.body(function() {
    
bamboo.Property = game.Class.extend({
    editable: false,
    description: null,
    type: null,
    options: null,

    init: function(editable, desc, type, options) {
        this.editable = editable;
        this.description = desc;
        this.type = type;
        this.options = options;
    }
});

bamboo.Property.TYPE = {
    NUMBER: 0,
    STRING: 1,
    BOOLEAN: 2,
    VECTOR: 3,
    OBJECT: 4,
    ARRAY: 5,
    EASING: 6,
    ENUM: 7,
    FILE: 8,
    TRIGGER: 9
};

bamboo.Property.parse = function(world, obj, name, desc) {
    switch(desc.type) {
        case bamboo.Property.TYPE.NUMBER:
        case bamboo.Property.TYPE.STRING:
        case bamboo.Property.TYPE.FILE:
        case bamboo.Property.TYPE.BOOLEAN:
        case bamboo.Property.TYPE.ENUM:
            return obj[name];

        case bamboo.Property.TYPE.VECTOR:
            if(obj[name] instanceof Array) return new game.Vector(obj[name][0], obj[name][1]);
            return new game.Vector(obj[name].x, obj[name].y);

        case bamboo.Property.TYPE.OBJECT:
            if(obj[name] === null) return world;
            return world.findObject(obj[name]);

        case bamboo.Property.TYPE.EASING:
            return getEasingFromName(obj[name]);

        case bamboo.Property.TYPE.ARRAY:
            var a = [];
            for(var i=0; i<obj[name].length; i++)
                a.push(parseProperty(world, obj[name], i, desc.options));
            return a;

        case bamboo.Property.TYPE.TRIGGER:
            return obj[name];
    }
    return null;
};

});