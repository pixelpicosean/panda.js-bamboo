game.module(
    'bamboo.runtime.scene'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

game.createClass('BambooScene', {
    activeNodes: [],
    audio: [],
    assets: [],
    nodes: [],
    layers: [],
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

    findNode: function(name) {
        if (this.name === name) return this;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].name === name) return this.nodes[i];
        }
    },

    addNode: function(node) {
        if (this.nodes.indexOf(node) === -1) this.nodes.push(node);
        if (typeof node.update === 'function') this.activeNodes.push(node);
        if (node instanceof game.bamboo.nodes.Layer) this.layers.push(node);
        this.nodeAdded(node);
    },

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

    nodeAdded: function(node) {
    },

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
