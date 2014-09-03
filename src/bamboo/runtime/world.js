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
            this.addNode(node);
        }
    },

    findNode: function(name) {
        if (this.name === name) return this;
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].name === name) return this.nodes[i];
        }
    },

    addNode: function(node) {
        if (this.nodes.indexOf(node) === -1) this.nodes.push(node);
        if (typeof node.update === 'function') this.updateableNodes.push(node);
        if (node instanceof bamboo.nodes.Layer) this.layers.push(node);
        this.nodeAdded(node);
    },

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

    nodeAdded: function(node) {
    },

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
