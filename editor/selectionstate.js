game.module(
    'bamboo.editor.selectionstate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.SelectionState = bamboo.editor.State.extend({
    hoveredNode: null,

    init: function(editor, p) {
        this.super(editor);
        this.hoverNode(this.editor.getNodeAt(p));
    },

    hoverNode: function(node) {
        if(this.hoveredNode === node)
            return;

        if(this.hoveredNode) {
            this.hoveredNode._editorNode.hoverRect.visible = false;
            this.hoveredNode._editorNode.hoverAxis.visible = false;
        }
        this.hoveredNode = node;
        if(this.hoveredNode) {
            this.hoveredNode._editorNode.hoverRect.visible = true;
            this.hoveredNode._editorNode.hoverAxis.visible = true;
        }
    },

    cancel: function() {
        this.hoverNode(null);
        this.editor.controller.selectNode(null);
    },

    apply: function() {
        this.editor.controller.selectNode(this.hoveredNode);
        this.hoverNode(null);
    },

    onmousemove: function(p) {
        this.hoverNode(this.editor.getNodeAt(p));
    },

    onkeydown: function(keycode) {
    onkeydown: function(keycode, p) {
        switch(keycode) {
        }
        return false;
    },
    onkeyup: function(keycode) {
    onkeyup: function(keycode, p) {
        switch(keycode) {
        }
        return false;
    }
});

});
