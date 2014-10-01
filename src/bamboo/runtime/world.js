/**
    @module world
    @namespace bamboo
**/
game.module(
    'bamboo.runtime.world'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

/**
    @class World
**/
bamboo.World = game.Class.extend({
    /**
        List of audio files.
        @property audio
    **/
    audio: [],
    /**
        List of assets.
        @property assets
    **/
    assets: [],
    /**
        List of nodes.
        @property nodes
    **/
    nodes: [],
    /**
        List of layers.
        @property layers
    **/
    layers: [],
    /**
        List of updateable nodes.
        @property updateable nodes
    **/
    updateableNodes: [],
    /**
        Current world time.
        @property time
    **/
    time: 0,

    init: function(data) {
        game.merge(this, data);
        this.displayObject = new game.Container();
        this.initNodes();
        this.initNodeProperties();
        this.ready();
    },

    ready: function() {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].ready();
        }
    },

    addChild: function(node) {
        this.displayObject.addChild(node.displayObject);
    },

    initNodes: function() {
        for (var i = 0; i < this.nodes.length; i++) {
            if (!bamboo.nodes[this.nodes[i].class]) throw 'Node \'' + this.nodes[i].class + '\' not found';
            var node = new bamboo.nodes[this.nodes[i].class](this, this.nodes[i].properties);
            this.nodes[i] = node;
            this.addNode(node);
        }
    },

    initNodeProperties: function() {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].initProperties();
        }
    },

    /**
        Find node by name.
        @method findNode
        @param {String} name
    **/
    findNode: function(name) {
        if (this.name === name) return this;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].name === name) return this.nodes[i];
        }
    },

    /**
        Add node to world.
        @method addNode
        @param {Node} node
    **/
    addNode: function(node) {
        if (this.nodes.indexOf(node) === -1) this.nodes.push(node);
        if (typeof node.update === 'function') this.updateableNodes.push(node);
        if (node instanceof bamboo.nodes.Layer) this.layers.push(node);
        this.nodeAdded(node);
    },

    /**
        Remove node from world.
        @method removeNode
        @param {Node} node
    **/
    removeNode: function(node) {
        var index = this.updateableNodes.indexOf(node);
        if (index !== -1) return node._remove = true;

        index = this.nodes.indexOf(node);
        if (index === -1) return false;
        this.nodes.splice(index, 1);

        node.parent.removeChild(node);
        node.onRemove();

        this.nodeRemoved(node);
        return true;
    },

    /**
        Called, when node is added to world.
        @method nodeAdded
        @param {Node} node
    **/
    nodeAdded: function(node) {
    },

    /**
        Called, when node is removed from world.
        @method nodeRemoved
        @param {Node} node
    **/
    nodeRemoved: function(node) {
    },

    update: function() {
        for (var i = this.updateableNodes.length - 1; i >= 0; i--) {
            this.updateableNodes[i].update();
            if (this.updateableNodes[i]._remove) {
                var node = this.updateableNodes[i];
                this.updateableNodes.splice(i, 1);
                this.removeNode(node);
            }
        }
        this.time += game.system.delta;
    }
});

});
