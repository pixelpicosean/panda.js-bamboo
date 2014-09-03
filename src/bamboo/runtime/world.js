game.module(
    'bamboo.runtime.world'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

bamboo.World = bamboo.Node.extend({
    nodes: [],
    layers: [],
    updateableNodes: [],
    time: 0,

    initNode: function(data) {
        this.originalInit();
        game.merge(this, data);
        this.initCamera();
        this.initNodes();
        // this.updateLayers();
        this.ready();
    },

    ready: function() {
    },

    initCamera: function() {
        this.camera = new game.Camera();
        this.camera.minX = this.camera.minY = 0;
        this.camera.maxX = this.width - game.system.width;
        this.camera.maxY = this.height - game.system.height;
    },

    initNodes: function() {
        for (var i = 0; i < this.nodes.length; i++) {
            if (!bamboo.nodes[this.nodes[i].class]) throw 'Node \'' + this.nodes[i].class + '\' not found';
            var node = new bamboo.nodes[this.nodes[i].class](this, this.nodes[i].properties);
            this.nodes[i] = node;
            this.nodeAdded(node);
        }
    },

    findNode: function(name) {
        if (this.name === name) return this;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].name === name) return this.nodes[i];
        }
    },

    addNode: function(node) {
        this.nodes.push(node);
        this.nodeAdded(node);
    },

    removeNode: function(node) {
        var index = this.nodes.indexOf(node);
        if (index === -1) return false;
        this.nodes.splice(index, 1);
        
        index = this.updateableNodes.indexOf(node);
        if (index > -1) this.updateableNodes.splice(index, 1);

        node.parent.removeChild(node);
        node.onRemove();

        this.nodeRemoved(node);
        return true;
    },

    nodeAdded: function(node) {
        if (typeof node.update === 'function') this.updateableNodes.push(node);
        if (node instanceof bamboo.nodes.Layer) this.layers.push(node);
    },

    nodeRemoved: function(node) {
    },

    removeFromUpdateables: function(node) {
        var idx = this.updateableNodes.indexOf(node);
        this.updateableNodes.splice(idx, 1);
    },

    addTriggerActivator: function(node) {
        this.triggerActivators.push(node);
    },

    removeTriggerActivator: function(node) {
        var idx = this.triggerActivators.indexOf(node);
        this.triggerActivators.splice(idx, 1);
    },

    setCameraPos: function(x, y) {
        if (x < 0) x = 0;
        else if (x > this.width - game.System.width) x = this.width - game.System.width;
        if (y < 0) y = 0;
        else if (y > this.height - game.System.height) y = this.height - game.System.height;

        this.camera.position.x = x;
        this.camera.position.y = y;
    },

    updateLayers: function() {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].update();
        }
    },

    update: function() {
        for (var i = this.updateableNodes.length - 1; i >= 0; i--) {
            this.updateableNodes[i].update();
        }
        this.time += game.system.delta;
    }
});

});
