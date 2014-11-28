/**
    @namespace game
**/
game.module(
    'bamboo.runtime.scene'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

/**
    @class BambooScene
    @extends game.Class
    @constructor
    @param {String} sceneName
**/
game.createClass('BambooScene', {
    /**
        List of active nodes.
        @property {Array} activeNodes
    **/
    activeNodes: [],
    /**
        List of audio files.
        @property {Array} audio
    **/
    audio: [],
    /**
        List of assets.
        @property {Array} assets
    **/
    assets: [],
    /**
        List of nodes.
        @property {Array} nodes
    **/
    nodes: [],
    /**
        List of layers.
        @property {Array} layers
    **/
    layers: [],
    /**
        Current scene time.
        @property {Number} time
    **/
    time: 0,

    init: function(sceneName) {
        game.merge(this, game.bamboo.getSceneData(sceneName));
        
        this.displayObject = new game.Container();
        
        this.initNodes();
        this.initNodeProperties();
        this.ready();
    },

    initNodes: function() {
        for (var i = 0; i < this.nodes.length; i++) {
            if (!game.bamboo.nodes[this.nodes[i].class]) throw 'node ' + this.nodes[i].class + ' not found';
            var node = new game.bamboo.nodes[this.nodes[i].class](this, this.nodes[i].properties);
            this.nodes[i] = node;
            this.addNode(node);
        }
    },

    initNodeProperties: function() {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].initProperties();
        }
    },

    ready: function() {
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].ready();
        }
    },

    addChild: function(node) {
        this.displayObject.addChild(node.displayObject);
    },

    removeChild: function(node) {
        this.displayObject.removeChild(node.displayObject);
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
        Add node to scene.
        @method addNode
        @param {Node} node
    **/
    addNode: function(node) {
        if (this.nodes.indexOf(node) === -1) this.nodes.push(node);
        if (typeof node.update === 'function') this.activeNodes.push(node);
        if (node instanceof game.bamboo.nodes.Layer) this.layers.push(node);
        this.nodeAdded(node);
    },

    /**
        Remove node from scene.
        @method removeNode
        @param {Node} node
    **/
    removeNode: function(node) {
        var index = this.activeNodes.indexOf(node);
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
        Called, when node is added to scene.
        @method nodeAdded
        @param {Node} node
    **/
    nodeAdded: function(node) {
    },

    /**
        Called, when node is removed from scene.
        @method nodeRemoved
        @param {Node} node
    **/
    nodeRemoved: function(node) {
    },

    update: function() {
        for (var i = this.activeNodes.length - 1; i >= 0; i--) {
            this.activeNodes[i].update();
            if (this.activeNodes[i]._remove) {
                var node = this.activeNodes[i];
                this.activeNodes.splice(i, 1);
                this.removeNode(node);
            }
        }
        this.time += game.system.delta;
    }
});

});
