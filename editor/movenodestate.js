game.module(
    'bamboo.editor.movenodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.MoveNodeState = bamboo.editor.State.extend({
    node: null,
    startValue: null,
    offset: null,

    init: function(mode, p, node) {
        this.super(mode);
        this.node = node;
        this.startValue = node.getWorldPosition();
        this.offset = p.subtract(this.startValue);

        this.mode.editor.statusbar.setStatus('Move node, ESC cancel | TBD: X,Y lock to axis, ctrl snap 10px grid');
    },

    cancel: function() {
        this.node._editorNode.setProperty('position', this.node.connectedTo.toLocalSpace(this.startValue));
        this.node.displayObject.updateTransform();
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        this.node._editorNode.setProperty('position', this.node.connectedTo.toLocalSpace(p.subtract(this.offset)));
    },
});

});
