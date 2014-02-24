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

    init: function(mode, p, node) {
        this.super(mode);
        this.node = node;
        this.offset = p.subtract(node.getWorldPosition());
        this.mode.editor.controller.selectNode(node);

        this.mode.editor.statusbar.setStatus('Position new node, ESC to cancel (removes new node)');
    },

    cancel: function() {
        this.mode.editor.controller.selectNode(null);
        this.mode.editor.controller.deleteNode(this.node);
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        this.node._editorNode.setProperty('position', this.node.connectedTo.toLocalSpace(p.subtract(this.offset)));
    },
});

});
