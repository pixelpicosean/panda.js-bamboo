var bamboo = bamboo || {};

if (typeof document !== 'undefined' && document.location.href.match(/\?editor/)) {
    game.config.debug = game.config.debug || {};
    game.config.debug.enabled = true;
    game.coreModules.push('bamboo.editor.core');
}

game.module(
    'bamboo.runtime.core'
)
.require(
    'bamboo.runtime.world',
    'bamboo.runtime.nodes.image',
    'bamboo.runtime.nodes.layer',
    'bamboo.runtime.nodes.manualtrigger',
    'bamboo.runtime.nodes.movingimage',
    'bamboo.runtime.nodes.path',
    'bamboo.runtime.nodes.pathfollower',
    'bamboo.runtime.nodes.rotator',
    'bamboo.runtime.nodes.trigger',
    'bamboo.runtime.nodes.triggerbox',
    'bamboo.runtime.nodes.triggercircle',
    'engine.scene'
)
.body(function() {

bamboo.Scene = game.Scene.extend({
    world: null,
    worldTime: 0,

    init: function() {
        this.world = bamboo.World.createFromJSON(game.level);
        this.stage.addChild(this.world.displayObject);
        this.world.update(0);
    },

    click: function(event) {
        this.world.click(event);
    },

    mousedown: function(event) {
        this.world.mousedown(event);
    },

    mousemove: function(event) {
        this.world.mousemove(event);
    },

    mouseup: function(event) {
        this.world.mouseup(event);
    },

    keydown: function(key) {
        this.world.keydown(key);
    },

    keyup: function(key) {
        this.world.keyup(key);
    },

    update: function() {
        if (this.world) {
            this.worldTime += game.system.delta;
            this.world.update(this.worldTime);
        }
        // this._super();
    }
});

game.Tween.Easing.getNamesList = function() {
    var names = [];
    for (var i in game.Tween.Easing) {
        for (var o in game.Tween.Easing[i]) {
            names.push(i + '.' + o);
        }
    }
    return names;
};

game.Tween.Easing.getByName = function(name) {
    name = name.split('.');
    return game.Tween.Easing[name[0]][name[1]];
};

game.Tween.Easing.getName = function(easing) {
    for (var i in game.Tween.Easing) {
        for (var o in game.Tween.Easing[i]) {
            if (easing === game.Tween.Easing[i][o]) return i + '.' + o;
        }
    }
};

bamboo.loadLevel = function(json) {
    game.level = json;

    for (var i = 0; i < json.images.length; i++) {
        game.addAsset(json.images[i]);
    }
};

bamboo.start = function(scene) {
    game.start(scene || bamboo.Scene);
};

});
