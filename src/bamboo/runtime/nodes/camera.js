game.module(
    'bamboo.runtime.nodes.camera'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {
    
bamboo.createNode('Camera', {
    
});

bamboo.addNodeProperty('Camera', 'target', 'node');

});