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
    triggers: {},
    triggerNodes: [],
    triggerNodesActivated: [],
    triggerActivators: [],
    time: 0,

    staticInit: function(data) {
        game.merge(this, data);
        this.camera = new game.Camera();
        this.camera.minX = this.camera.minY = 0;
        this.camera.maxX = this.width - game.system.width;
        this.camera.maxY = this.height - game.system.height;
        this.displayObject = new game.Container();
        this.initNodes();
        this.updateLayers();
        this.ready();
    },

    ready: function() {},

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

        node.onRemove();

        if (node.displayObject && node.displayObject.parent) {
            node.displayObject.parent.removeChild(node.displayObject);
        }

        this.nodeRemoved(node);
        return true;
    },

    nodeAdded: function(node) {
        if (typeof node.update === 'function') this.updateableNodes.push(node);
        if (node instanceof bamboo.nodes.Layer) this.layers.push(node);
        // if (node instanceof bamboo.nodes.Trigger) this.triggerNodes.push(node);
    },

    nodeRemoved: function(node) {
        if(node instanceof bamboo.nodes.Trigger) {
            var idx = this.triggerNodes.indexOf(node);
            this.triggerNodes.splice(idx,1);
            idx = this.triggerNodesActivated.indexOf(node);
            if (idx !== -1) this.triggerNodesActivated.splice(idx, 1);
        }
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
        this.time += game.system.delta;

        for (var i = this.updateableNodes.length - 1; i >= 0; i--) {
            this.updateableNodes[i].update();
        }

        for (var i = 0; i < this.triggerActivators.length; i++) {
            var wp = this.triggerActivators[i].getWorldPosition();

            for (var j = 0; j < this.triggerNodes.length; j++) {
                var lp = this.triggerNodes[j].toLocalSpace(wp);
                var aid = this.triggerNodesActivated.indexOf(this.triggerNodes[j]);
                if (aid === -1) {
                    if(this.triggerNodes[j].hitTest(lp)) {
                        // first touch (entry)
                        this.triggerNodesActivated.push(this.triggerNodes[j]);
                        this.triggerNodes[j].trigger(this.triggerActivators[i]);
                    }
                }
                else if (!this.triggerNodes[j].hitTest(lp)) {
                    // after last touch (exit)
                    this.triggerNodesActivated.splice(aid, 1);
                }
            }
        }
    }
});

});
