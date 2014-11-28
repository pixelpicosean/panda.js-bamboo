game.module(
    'game.nodes.mynode'
)
.require(
    'bamboo.core'
)
.body(function() {

// Example of custom node
bamboo.createNode('MyNode', {
    ready: function() {
        // This is called, when node is ready and all properties are set
    },

    onRemove: function() {
        // This is called, when node is removed from scene
    },

    update: function() {
        // This is called every frame
    }
});

});
