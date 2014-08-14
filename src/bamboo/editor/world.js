game.module(
    'bamboo.editor.world'
)
.require(
    'bamboo.runtime.world'
)
.body(function() {
    
bamboo.World.inject({
    getConnectedNodes: function(node) {
        var nodes = [];
        for (var i=0; i<this.nodes.length; i++) {
            if(this.nodes[i].connectedTo === node) nodes.push(this.nodes[i]);
        }
        nodes.sort(function(a,b) {
            return a.displayObject.parent.children.indexOf(a.displayObject) - b.displayObject.parent.children.indexOf(b.displayObject);
        });

        return nodes;
    },

    addJSONConnections: function(node, list) {
        // TODO: optimize this, maybe refactor the whole connectedTo thingy
        var nodes = this.getConnectedNodes(node);
        for (var i=0; i<nodes.length; i++) {
            list.push(nodes[i].toJSON());
            this.addJSONConnections(nodes[i], list);
        }
    },

    toJSON: function() {
        var jsonObj = {
            world: this.getClassName(),
            width: this.boundaries.right,
            height: this.boundaries.bottom,
            images: this.images,
            nodes: []
        };
        this.addJSONConnections(this, jsonObj.nodes);
        return jsonObj;
    }
});

bamboo.World.defaultJSON = {
    world: 'World',
    images: [],
    nodes: [
        {
            class: 'Layer',
            properties: {
                name: 'main',
                position: {
                    x: 0,
                    y: 0
                },
                rotation: 0,
                scale: {
                    x: 1,
                    y: 1
                },
                connectedTo: null,
                speedFactor: 1
            }
        }
    ]
};

});