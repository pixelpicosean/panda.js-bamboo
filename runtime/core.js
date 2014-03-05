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
        this.installEventListeners();
    },

    update: function() {
        if(this.world) {
            this.worldTime += game.system.delta;
            this.world.update(this.worldTime);
            this.super();
        }
    },

    click: function() {
        if(this.world)
            this.world.onclick();
    },

    levelLoaded: function(json) {
        if(this.world) {
            this.stage.removeChild(this.world.displayObject);
        }

        var images = JSON.parse(json).images;
        for(var name in images) {
            PIXI.TextureCache[name] = PIXI.Texture.fromImage(images[name], true);
        }

        this.worldTime = 0;
        this.world = bamboo.World.createFromJSON(json);
        this.stage.addChild(this.world.displayObject);
    },


    installEventListeners: function() {
        var canvas = game.system.canvas;
        canvas.ondragover = function() { return false; };
        canvas.ondragend = function() { return false; };
        canvas.ondrop = this.onFileDrop.bind(this);
    },

    onFileDrop: function(e) {
        var self = this;
        e.preventDefault();

        if(e.dataTransfer.files.length !== 1) {
            alert('You must drop only one level file!');
            return false;
        }

        var file = e.dataTransfer.files[0];
        var parts = file.name.split('.');
        var suffix = parts[parts.length-1];
        if(suffix !== 'json') {
            alert('Level file must have .json suffix!');
            return false;
        }


        var reader = new FileReader();
        reader.onload = function(e) {
            var json = e.target.result;
            self.levelLoaded(json);
        };
        reader.filename = file.name;
        reader.readAsText(file);

        return false;
    }
});

bamboo.start = function(scene) {

    game.System.orientation = game.System.LANDSCAPE;
    game.start(scene || bamboo.Scene);
};

});
