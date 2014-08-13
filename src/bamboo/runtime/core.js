if (typeof window !== 'undefined') window.bamboo = window.bamboo || {};

game.module(
    'bamboo.runtime.core'
)
.require(
    'bamboo.runtime.node',
    'bamboo.runtime.world',
    'bamboo.runtime.nodes.layer',
    'bamboo.runtime.nodes.path',
    'bamboo.runtime.nodes.image',
    'bamboo.runtime.nodes.movingimage',
    'bamboo.runtime.nodes.pathfollower',
    'engine.scene'
)
.body(function() {

game.Tween.Easing.getNamesList = function() {
    var names = [];
    for(var i in game.Tween.Easing) {
        for(var o in game.Tween.Easing[i]) {
            names.push(i + '.' + o);
        }
    }
    return names;
};

game.Tween.Easing.getByName = function(name) {
    name = name.split('.');
    var type = name[1];
    name = name[0];

    return game.Tween.Easing[name][type];
};

game.Tween.Easing.getName = function(easing) {
    for(var i in game.Tween.Easing) {
        for(var o in game.Tween.Easing[i]) {
            if (easing === game.Tween.Easing[i][o]) return i + '.' + o;
        }
    }
};

bamboo.Scene = game.Scene.extend({
    world: null,
    worldTime: 0,

    init: function() {
    },

    click: function() {
        if (this.world) this.world.onclick();
    },

    mousedown: function() {
        if (this.world) this.world.mousedown();
    },

    mousemove: function(e) {
        if (this.world) this.world.mousemove(e.global);
    },

    mouseup: function() {
        if (this.world) this.world.mouseup();
    },

    keydown: function(key) {
        if (this.world) this.world.keydown(key);
    },

    keyup: function(key) {
        if (this.world) this.world.keyup(key);
    },

    update: function() {
        if (this.world) {
            this.worldTime += game.system.delta;
            this.world.update(this.worldTime);
        }
        // this._super();
    }
});

bamboo.start = function(scene) {
    game.start(scene || bamboo.Scene);
};

});
