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

    click: function() {
        this.world.onclick();
    },
});

bamboo.start = function(levelJSON) {
    if(!levelJSON)
        throw 'Level json must be provided!';

    bamboo.levelJSON = levelJSON;

    // load level images
    var images = JSON.parse(levelJSON).images;
    for(var name in images) {
        PIXI.TextureCache[name] = PIXI.Texture.fromImage(images[name], true);
    }

    // TODO: read from json?
    game.System.orientation = game.System.LANDSCAPE;
    game.start(bamboo.Scene);
};

});
