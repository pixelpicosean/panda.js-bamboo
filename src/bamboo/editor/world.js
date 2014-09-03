game.module(
    'bamboo.editor.world'
)
.require(
    'bamboo.runtime.world'
)
.body(function() {
    
bamboo.World.inject({
    staticInit: function(data) {
        game.merge(this, data);
        this.displayObject = new game.Container();
        this.position = new game.Point();
    },

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
            name: this.name,
            width: this.width,
            height: this.height,
            bgcolor: this.bgcolor,
            camera: this.camera,
            nodes: []
        };
        this.addJSONConnections(this, jsonObj.nodes);
        return jsonObj;
    }
});

bamboo.World.defaultJSON = {
    name: 'Main',
    bgcolor: '0x000000',
    camera: {
        position: {
            x: 0,
            y: 0
        }
    },
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
