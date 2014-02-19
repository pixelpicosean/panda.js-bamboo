game.module(
    'bamboo.editor.nodes.layer'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.layer'
)
.body(function() {

bamboo.nodes.Layer.editor = bamboo.Node.editor.extend({
    init: function(node) {
        this.super(node);
    },

    getBounds: function() {
        return {x: 0, y: 0, width: 0, height: 0};
    },
});

});
