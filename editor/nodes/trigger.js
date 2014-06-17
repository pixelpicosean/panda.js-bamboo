game.module(
    'bamboo.editor.nodes.trigger'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.trigger'
)
.body(function() {

bamboo.nodes.Trigger.editor = bamboo.Node.editor.extend({
    init: function(node) {
        this._super(node);
    },

    getBounds: function() {
        return {x:-1, y:-1, width: 2, height: 2};
    }
});

});
