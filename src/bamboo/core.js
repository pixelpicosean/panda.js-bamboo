var bamboo = {
    version: '1.0.0',
    scenes: [],
    nodes: {}
};

pandaConfig.bamboo = pandaConfig.bamboo || {};

bamboo.createNode = function(name, className, content) {
    if (!content) {
        content = className;
        className = null;
    }
    var extendClass = className ? bamboo.nodes[className] : bamboo.Node;
    bamboo.nodes[name] = extendClass.extend(content);
};

bamboo.addNodeProperty = function(node, name, type, defaultValue, hidden) {
    node = bamboo.nodes[node] || bamboo.Node;
    if (!node.props) node.props = {};
    node.props[name] = new bamboo.Property(hidden ? false : true, name, '', bamboo.Property.TYPE[type.toUpperCase()], defaultValue);
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
    'bamboo.runtime.node',
    'bamboo.runtime.point',
    'bamboo.runtime.pool',
    'bamboo.runtime.property',
    'bamboo.runtime.world',
    'engine.scene'
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
