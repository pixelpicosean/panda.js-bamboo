window.bamboo = window.bamboo || {};

game.module(
    'bamboo.runtime.core'
)
.require(
    'bamboo.runtime.node',
    'bamboo.runtime.world',
    'engine.scene'
)
.body(function() {

bamboo.Scene = game.Scene.extend({
    world: null,
    worldTime: 0,

    init: function() {
        this.world = bamboo.World.createFromJSON(bamboo.levelJSON);
        this.stage.addChild(this.world.displayObject);
    },

    update: function() {
        this.worldTime += game.system.delta;
        this.world.update(this.worldTime);
        this.super();
    },

    mousedown: function(p) {
        this.world.onmousedown(p);
    },
    mousemove: function(p) {
        this.world.onmousemove(p);
    },
    mouseup: function(p) {
        this.world.onmouseup(p);
    }
});

bamboo.start = function(levelJSON) {
    if(!levelJSON)
        throw 'Level json must be provided!';

    bamboo.levelJSON = levelJSON;

    // TODO: read from json?
    game.System.orientation = game.System.LANDSCAPE;
    game.start(bamboo.Scene);
};

});
