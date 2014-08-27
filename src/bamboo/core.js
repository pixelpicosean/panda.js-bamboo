var bamboo = {
    version: '1.0.0',
    editorMode: false,
    scenes: {},
    nodes: {}
};

if (typeof document !== 'undefined' && document.location.href.match(/\?editor/)) {
    game.config.debug = game.config.debug || {};
    game.config.debug.enabled = true;
    bamboo.editorMode = true;
}

game.module(
    'bamboo.core'
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

bamboo.createWorld = function(sceneName) {
    var data = bamboo.scenes[sceneName];
    
    var world = new bamboo[data.world](data);
    
    var nodes = data.nodes;
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        new bamboo.nodes[node.class](world, node.properties);
    }

    return world;
};

bamboo.load = function(scene, container) {
    var world = bamboo.createWorld(scene);
    var container = container || game.scene.stage;
    container.addChild(world.displayObject);

    game.scene.world = world;
};

});
