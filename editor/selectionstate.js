game.module(
    'bamboo.editor.selectionstate'
)
.require(
    'bamboo.editor.state',
    'bamboo.editor.movenodestate',
    'bamboo.editor.rotatenodestate',
    'bamboo.editor.scalenodestate',
    'bamboo.editor.newnodestate',
    'bamboo.editor.createnodestate'
)
.body(function() {

bamboo.editor.SelectionState = bamboo.editor.State.extend({
    hoveredNode: null,

    init: function(editor, p) {
        this.super(editor);
        this.hoverNode(this.editor.getNodeAt(p, true));
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
        this.hoverNode(this.editor.getNodeAt(p, true));
    },

    onkeydown: function(keycode, p) {
        switch(keycode) {
            case 13:// ENTER
            case 46:// DEL
            case 65:// A
            case 68:// D
            case 71:// G
            case 82:// R
            case 83:// S
                return true;
        }
        return false;
    },
    onkeyup: function(keycode, p) {
        switch(keycode) {
            case 13:// ENTER - enter game
                this.hoverNode(null);
                this.editor.controller.changeState(new bamboo.editor.GameState(this.editor));
                return true;
            case 46:// DEL - delete
                if(this.editor.selectedNode) {
                    this.editor.controller.deleteNode(this.editor.selectedNode);
                    this.cancel();
                    this.editor.controller.changeState(new bamboo.editor.SelectionState(this.editor, p));
                }
                return true;
            case 65:// A - add
                this.editor.controller.changeState(new bamboo.editor.CreateNodeState(this.editor, p));
                return true;
            case 68:// D - duplicate
                if(this.editor.selectedNode) {
                    this.hoverNode(null);
                    var json = this.editor.selectedNode.toJSON();
                    var node = this.editor.controller.createNode(json.class, json.properties, this.editor.selectedNode._editorNode.properties);
                    this.editor.controller.changeState(new bamboo.editor.NewNodeState(this.editor, p, node));
                }
                return true;
            case 71:// G - grab
                if(this.editor.selectedNode) {
                    this.hoverNode(null);
                    this.editor.controller.changeState(new bamboo.editor.MoveNodeState(this.editor, p, this.editor.selectedNode));
                }
                return true;
            case 82:// R - rotate
                if(this.editor.selectedNode) {
                    this.hoverNode(null);
                    this.editor.controller.changeState(new bamboo.editor.RotateNodeState(this.editor, p, this.editor.selectedNode));
                }
                return true;
            case 83:// S - scale
                if(this.editor.selectedNode) {
                    this.hoverNode(null);
                    this.editor.controller.changeState(new bamboo.editor.ScaleNodeState(this.editor, p, this.editor.selectedNode));
                }
                return true;
        }
        return false;
    }
});

});
