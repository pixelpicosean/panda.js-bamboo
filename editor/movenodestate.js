game.module(
    'bamboo.editor.movenodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.MoveNodeState = bamboo.editor.State.extend({
    node: null,
    offset: null,
    startPos: null,

    init: function(editor, p, node) {
        this.super(editor);
        this.node = node;
        this.startPos = node.getWorldPosition();
        this.offset = p.subtract(this.startPos);
    },

    cancel: function() {
        this.node.position = this.node.connectedTo.toLocalSpace(this.startPos);
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        this.node.position = this.node.connectedTo.toLocalSpace(p.subtract(this.offset));
    },
});

});
