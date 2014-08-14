var bamboo = {
    version: '1.0.0',
    editorMode: false
};

if (typeof document !== 'undefined' && document.location.href.match(/\?editor/)) {
    game.config.debug = game.config.debug || {};
    game.config.debug.enabled = true;
    bamboo.editorMode = true;
}

game.module(
    'bamboo.runtime.core'
)
.require(
    bamboo.editorMode ? 'bamboo.editor.core' : 'bamboo.runtime.world',
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

game.Scene.inject({
    click: function(event) {
        if (this.world) this.world.click(event);
    },

    mousedown: function(event) {
        if (this.world) this.world.mousedown(event);
    },

    mousemove: function(event) {
        if (this.world) this.world.mousemove(event);
    },

    mouseup: function(event) {
        if (this.world) this.world.mouseup(event);
    },

    keydown: function(key) {
        if (this.world) this.world.keydown(key);
    },

    keyup: function(key) {
        if (this.world) this.world.keyup(key);
    }
});

game.createBambooScene = function(name, content) {
    return game['Scene' + name] = bamboo.Scene.extend(content);
};

bamboo.levels = {};
bamboo.loadLevel = function(level) {
    bamboo.levels[level.name] = level;

    for (var i = 0; i < level.images.length; i++) {
        game.addAsset(level.images[i]);
    }
};

bamboo.loadScene = function(scene) {
    game.scene.world = bamboo.World.createFromJSON(bamboo.levels[scene]);
    game.scene.world.addTo(game.scene.stage);
};

});
