game.module(
    'bamboo.editor.nodes.layer'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.layer'
)
.body(function() {

bamboo.nodes.Layer.editor = bamboo.Node.editor.extend({
    visible: true,

    ready: function() {
        this.displayObject.removeChild(this.nameText);
        this.displayObject.removeChild(this.parentSelectionRect);
        this.editor.nodeLayer.addChild(this.displayObject);
    },

    setVisibility: function(value) {
        this.visible = this.node.displayObject.visible = value;
    }
});

});
