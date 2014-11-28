game.module(
    'bamboo.editor.scene'
)
.require(
    'bamboo.runtime.scene'
)
.body(function() {
    
game.BambooScene.inject({
    init: function(data) {
        game.merge(this, data);
        this.displayObject = new game.Container();
        this.position = new game.Point();
    },

    getConnectedNodes: function(node) {
        var nodes = [];
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].parent === node) nodes.push(this.nodes[i]);
        }
        return nodes;
    },

    addJSONConnections: function(node, list) {
        var nodes = this.getConnectedNodes(node);
        for (var i = 0; i < nodes.length; i++) {
            list.push(nodes[i].editorNode.toJSON());
            this.addJSONConnections(nodes[i], list);
        }
    },

    toJSON: function() {
        var jsonObj = {
            name: this.name,
            width: this.width,
            height: this.height,
            audio: this.audio,
            assets: this.assets,
            nodes: []
        };
        this.addJSONConnections(this, jsonObj.nodes);
        return jsonObj;
    }
});

game.BambooScene.defaultJSON = {
    name: 'Untitled',
    width: 1024,
    height: 768,
    nodes: [
        {
            class: 'Layer',
            properties: {
                name: 'main',
                parent: 'Untitled'
            }
        }
    ]
};

});
