var bamboo = {
    version: '1.0.0',
    scenes: [],
    nodes: {}
};

if (typeof document !== 'undefined' && document.location.href.match(/\?editor/)) {
    game.config.debug = game.config.debug || {};
    game.config.debug.enabled = true;
    bamboo.editorMode = true;
}

bamboo.createNode = function(name, content) {
    bamboo.nodes[name] = bamboo.Node.extend(content);
};

bamboo.setNodeProperties = function(name, content) {
    bamboo.nodes[name].props = content;
};

bamboo.createBambooScene = function(name, content) {
    content = content || {};
    content.name = name;
    game['Scene' + name] = bamboo.Scene.extend(content);
};

game.module(
    'bamboo.core'
)
.require(
    bamboo.editorMode ? 'bamboo.editor.core' : 'bamboo.runtime.world',
    'bamboo.runtime.nodes.null',
    'bamboo.runtime.nodes.image',
    'bamboo.runtime.nodes.layer',
    'bamboo.runtime.nodes.manualtrigger',
    'bamboo.runtime.nodes.movingimage',
    'bamboo.runtime.nodes.path',
    'bamboo.runtime.nodes.pathfollower',
    'bamboo.runtime.nodes.rotator',
    'bamboo.runtime.nodes.trigger',
    'bamboo.runtime.nodes.triggerbox',
    'bamboo.runtime.nodes.triggercircle'
)
.body(function() {
'use strict';

bamboo.Scene = game.Scene.extend({
    staticInit: function() {
        this._super();

        var data;
        for (var key in game.json) {
            if (game.json[key].name === this.name) {
                data = game.json[key];
            }
        }
        if (!data) throw 'Bamboo scene \'' + this.name + '\' not found';

        this.world = new bamboo.World(data);
        this.stage.addChild(this.world.displayObject);
    }
});

});
