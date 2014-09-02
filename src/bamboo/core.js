var bamboo = {
    version: '1.0.0',
    scenes: [],
    nodes: {},
    config: typeof bambooConfig !== 'undefined' ? bambooConfig : {}
};

if (typeof document !== 'undefined' && document.location.href.match(/\?editor/)) {
    game.config.debug = game.config.debug || {};
    game.config.debug.enabled = true;
    bamboo.editorMode = true;
}

bamboo.createNode = function(name, className, content) {
    if (!content) {
        content = className;
        className = null;
    }
    var extendClass = className ? bamboo.nodes[className] : bamboo.Node;
    bamboo.nodes[name] = extendClass.extend(content);
    bamboo.nodes[name].parent = className || 'Null';
};

bamboo.setNodeProperties = function(name, content) {
    bamboo.nodes[name].props = content;
};

bamboo.createScene = function(name, content) {
    content = content || {};
    content.name = name;
    game['Scene' + name] = bamboo.Scene.extend(content);
};

game.module(
    'bamboo.core'
)
.require(
    bamboo.editorMode ? 'bamboo.editor.core' : 'bamboo.runtime.world',
    'bamboo.runtime.pool',
    'bamboo.runtime.nodes.null',
    'bamboo.runtime.nodes.image',
    'bamboo.runtime.nodes.layer',
    // 'bamboo.runtime.nodes.manualtrigger',
    // 'bamboo.runtime.nodes.movingimage',
    'bamboo.runtime.nodes.path',
    'bamboo.runtime.nodes.pathfollower',
    // 'bamboo.runtime.nodes.rotator',
    // 'bamboo.runtime.nodes.trigger',
    // 'bamboo.runtime.nodes.triggerbox',
    // 'bamboo.runtime.nodes.triggercircle',
    'engine.scene',
    'engine.pool'
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
