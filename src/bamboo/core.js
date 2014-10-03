/**
    @namespace
**/
/**
    @class bamboo
**/
var bamboo = {
    version: '0.3.0',
    scenes: [],
    nodes: {}
};

pandaConfig.bamboo = pandaConfig.bamboo || {};

/**
    @method createNode
    @param {String} name
    @param {String} [className]
    @param {Object} content
**/
bamboo.createNode = function(name, className, content) {
    if (!content) {
        content = className;
        className = null;
    }
    var extendClass = className ? bamboo.nodes[className] : bamboo.Node;
    bamboo.nodes[name] = extendClass.extend(content);
};

/**
    @method addNodeProperty
    @param {String} node
    @param {String} name
    @param {String} type
    @param defaultValue
    @param {Boolean} hidden
**/
bamboo.addNodeProperty = function(node, name, type, defaultValue, hidden) {
    node = bamboo.nodes[node] || bamboo.Node;
    if (!node.props) node.props = {};
    node.props[name] = new bamboo.Property(hidden ? false : true, name, '', bamboo.Property.TYPE[type.toUpperCase()], defaultValue);
};

/**
    @method createScene
    @param {String} name
    @param {Object} content
**/
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
        var data;
        for (var i = 0; i < bamboo.scenes.length; i++) {
            if (bamboo.scenes[i].name === this.name) {
                data = bamboo.scenes[i];
                break;
            }
        }
        if (!data) throw 'Bamboo scene \'' + this.name + '\' not found';

        this.backgroundColor = parseInt(data.bgcolor);
        this._super();

        this.world = new bamboo.World(data);
        this.world.scene = this;
        this.stage.addChild(this.world.displayObject);
    }
});

});
