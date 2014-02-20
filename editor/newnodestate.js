game.module(
    'bamboo.editor.newnodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.NewNodeState = bamboo.editor.State.extend({
    node: null,
    offset: null,
    startPos: null,

    init: function(editor, p, node) {
        this.super(editor);
        this.node = node;
        this.offset = p.subtract(node.getWorldPosition());
        this.editor.controller.selectNode(node);
    },

    cancel: function() {
        this.editor.controller.selectNode(null);
        this.editor.controller.deleteNode(this.node);
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        this.node._editorNode.setProperty('position', this.node.connectedTo.toLocalSpace(p.subtract(this.offset)));
    },
});

});
