game.module(
    'bamboo.runtime.world'
)
.require(
    'bamboo.runtime.node',
    'bamboo.runtime.nodes.trigger'
)
.body(function() {

bamboo.World = bamboo.Node.extend({
    nodes: [],
    updateableNodes: [],
    cameraPosition: null,

    // contains image names and datas
    images: {},

    // area that contains visible content
    boundaries: {left:0,top:0,right:2000,bottom:750},
    screenSize: {width: 1024, height: 672},

    triggers: {},// should be set in extended classes {'kill': this.killplayer.bind(this), 'openDoor':this.opendoor.bind(this)}

    triggerNodes: [],
    triggerNodesActivated: [],

    triggerActivators: [],

    init: function() {
        this.displayObject = new game.Container();
        this.super(null,null);
        this.cameraPosition = new game.Vector();
    },

    findNode: function(name) {
        for(var i=0; i<this.nodes.length; i++) {
            if(this.nodes[i].name === name)
                return this.nodes[i];
        }
        return null;
    },

    getConnectedNodes: function(node) {
        var nodes = [];
        for(var i=0; i<this.nodes.length; i++) {
            if(this.nodes[i].connectedTo === node)
                nodes.push(this.nodes[i]);
        }
        nodes.sort(function(a,b) {
            return a.displayObject.parent.children.indexOf(a.displayObject) - b.displayObject.parent.children.indexOf(b.displayObject);
        });

        return nodes;
    },
    addJSONConnections: function(node, list) {
        // TODO: optimize this, maybe refactor the whole connectedTo thingy
        var nodes = this.getConnectedNodes(node);
        for(var i=0; i<nodes.length; i++) {
            list.push(nodes[i].toJSON());
            this.addJSONConnections(nodes[i], list);
        }
    },

    toJSON: function() {
        var jsonObj = {world: this.getClassName(), images: this.images, nodes: []};
        this.addJSONConnections(this, jsonObj.nodes);
        return jsonObj;
    },

    getClassName: function() {
        return 'World';
    },

    _addNode: function(node) {
        this.nodes.push(node);
        this.nodeAdded(node);
    },
    _removeNode: function(node) {
        var idx = this.nodes.indexOf(node);
        this.nodes.splice(idx, 1);
        this.nodeRemoved(node);
    },

    nodeAdded: function(node) {
        if(node instanceof bamboo.nodes.Trigger)
            this.triggerNodes.push(node);
    },

    nodeRemoved: function(node) {
        if(node instanceof bamboo.nodes.Trigger) {
            var idx = this.triggerNodes.indexOf(node);
            this.triggerNodes.splice(idx,1);
            idx = this.triggerNodesActivated.indexOf(node);
            if(idx !== -1)
                this.triggerNodesActivated.splice(idx, 1);
        }
    },

    _addToUpdateables: function(node) {
        this.updateableNodes.push(node);
    },
    _removeFromUpdateables: function(node) {
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

    setCameraPos: function(pos) {
        if(pos.x < this.boundaries.left)
            this.cameraPosition.x = this.boundaries.left;
        else if(pos.x > this.boundaries.right - this.screenSize.width)
            this.cameraPosition.x = this.boundaries.right - this.screenSize.width;
        else
            this.cameraPosition.x = pos.x;

        if(pos.y < this.boundaries.top)
            this.cameraPosition.y = this.boundaries.top;
        else if(pos.y > this.boundaries.bottom - this.screenSize.height)
            this.cameraPosition.y = this.boundaries.bottom - this.screenSize.height;
        else
            this.cameraPosition.y = pos.y;
    },

    update: function(worldTime) {

        for(var i=0; i<this.updateableNodes.length; i++)
            this.updateableNodes[i].update(worldTime);

        for(var i=0; i<this.triggerActivators.length; i++) {
            var wp = this.triggerActivators[i].getWorldPosition();

            for(var j=0; j<this.triggerNodes.length; j++) {
                var lp = this.triggerNodes[j].toLocalSpace(wp);
                var aid = this.triggerNodesActivated.indexOf(this.triggerNodes[j]);
                if(aid === -1) {
                    if(this.triggerNodes[j].hitTest(lp)) {
                        // first touch (entry)
                        this.triggerNodesActivated.push(this.triggerNodes[j]);
                        if(this.triggerNodes[j].target) {
                            this.triggers[this.triggerNodes[j].target](this.triggerNodes[j], this.triggerActivators[i]);
                        }
                    }
                } else if(!this.triggerNodes[j].hitTest(lp)) {
                    // after last touch (exit)
                    this.triggerNodesActivated.splice(aid, 1);
                }
            }
        }
    },
});

bamboo.World.createFromJSON = function(levelJSON) {

    var jsonWorld = JSON.parse(levelJSON);
    var world = new bamboo[jsonWorld.world]();
    world.images = jsonWorld.images;

    var jsonWorldNodes = jsonWorld.nodes;
    for(var i=0; i<jsonWorldNodes.length; i++) {
        var jsonNode = jsonWorldNodes[i];
        if(!bamboo.nodes.hasOwnProperty(jsonNode.class))
            throw 'Cannot find class \''+jsonNode.class+'\' from collection!';

        new bamboo.nodes[jsonNode.class](world, jsonNode.properties);
    }

    return world;
};

});
