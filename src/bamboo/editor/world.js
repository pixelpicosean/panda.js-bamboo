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
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].parent === node) nodes.push(this.nodes[i]);
        }
        // nodes.sort(function(a, b) {
        //     return a.displayObject.parent.children.indexOf(a.displayObject) - b.displayObject.parent.children.indexOf(b.displayObject);
        // });

        return nodes;
    },

    addJSONConnections: function(node, list) {
        var nodes = this.getConnectedNodes(node);
        for (var i = 0; i < nodes.length; i++) {
            list.push(nodes[i]._editorNode.toJSON());
            this.addJSONConnections(nodes[i], list);
        }
    },

    toJSON: function() {
        var jsonObj = {
            name: game.scene.editor.name,
            world: this.getClassName(),
            width: this.width,
            height: this.height,
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
                name: 'main'
            }
        }
    ]
};

});