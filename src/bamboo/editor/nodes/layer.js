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
    locked: false,

    propertyChanged: function(key, value, oldValue) {
        if (key === 'size') {
            if (value.x === 0 && value.y === 0) {
                value.x = value.y = 128;
            }
        }
        this._super(key, value, oldValue);
        this.node.update();
    },

    setVisibility: function(value) {
        this.visible = this.node.displayObject.visible = value;
    },

    setLocked: function(value) {
        this.locked = value;
        if (this.editor.activeNode && this.editor.activeNode._editorNode.layer._editorNode === this) {
            this.editor.controller.deselectNode(this.editor.activeNode);
        }
    }
});

});
