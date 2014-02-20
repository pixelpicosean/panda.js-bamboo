game.module(
    'bamboo.editor.rotatenodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.RotateNodeState = bamboo.editor.State.extend({
    node: null,
    startValue: null,
    offset: null,

    init: function(editor, p, node) {
        this.super(editor);
        this.node = node;
        this.startValue = node.rotation;
        this.offset = p.subtract(node.getWorldPosition());
    },

    cancel: function() {
        this.node._editorNode.setProperty('rotation', this.startValue);
        this.node.displayObject.updateTransform();
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        var angle = this.offset.angle(p.subtract(this.node.getWorldPosition()));
        this.node._editorNode.setProperty('rotation', this.startValue + angle);
    },
});

});
