game.module(
    'bamboo.editor.nodes.null'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.null'
)
.body(function() {
    
bamboo.nodes.Null.editor = bamboo.Node.editor.extend();

});
