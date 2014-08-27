game.module(
    'bamboo.runtime.world'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.World = bamboo.Node.extend({
    width: 0,
    height: 0,
    nodes: [],
    updateableNodes: [],
    layers: [],
    triggers: {},
    triggerNodes: [],
    triggerNodesActivated: [],
    triggerActivators: [],
    time: 0,

    init: function(data) {
        this.width = data.width || this.width;
        this.height = data.height || this.height;
        this.position = new game.Point();
        this.displayObject = new game.Container();
        this.cameraPosition = new game.Point();

        if (data.camera && data.camera.position) this.setCameraPos(data.camera.position.x, data.camera.position.y);
    },

    findNode: function(name) {
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].name === name) return this.nodes[i];
        }
    },

    addNode: function(node) {
        this.nodes.push(node);
        this.nodeAdded(node);
    },

    removeNode: function(node) {
        var idx = this.nodes.indexOf(node);
        this.nodes.splice(idx, 1);
        this.nodeRemoved(node);
    },

    nodeAdded: function(node) {
        if (node.needUpdates) this.updateableNodes.push(node);
        if (node instanceof bamboo.nodes.Layer) this.layers.push(node);
        if (node instanceof bamboo.nodes.Trigger) this.triggerNodes.push(node);
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

        this.cameraPosition.set(x, y || this.cameraPosition.y);
    },

    updateLayers: function() {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].update();
        }
    },

    getClassName: function() {
        return 'World';
    },

    click: function() {},
    mousedown: function() {},
    mouseup: function() {},
    mousemove: function() {},
    mouseout: function() {},
    keydown: function() {},
    keyup: function() {},

    update: function() {
        this.time += game.system.delta;

        for (var i = this.updateableNodes.length - 1; i >= 0; i--) {
            this.updateableNodes[i].update(this.time);
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
