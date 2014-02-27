game.module(
    'bamboo.editor.editnodemode'
)
.require(
    'bamboo.editor.mode'
)
.body(function() {

bamboo.editor.EditNodeMode = bamboo.editor.Mode.extend({
    node: null,

    init: function(editor, node) {
        this.super(editor);
        this.node = node;
        this.node._editorNode.enableEditMode(true);
        this.editor.controller.enableEditMode(this.node, true);

        this.editor.statusbar.setStatus('Edit mode, TAB to exit');
    },

    onclick: function(p) {
        this.node._editorNode.onclick(this.node.toLocalSpace(p));
    },
    onmousemove: function(p) {
        this.node._editorNode.onmousemove(this.node.toLocalSpace(p));
    },
    onkeydown: function(keycode, p) {
        switch(keycode) {
            case 9:// TAB
                return true;
        }
        return this.node._editorNode.onkeydown(keycode, this.node.toLocalSpace(p));
    },
    onkeyup: function(keycode, p) {
        switch(keycode) {
            case 9:// TAB - exit edit mode
                this.editor.controller.enableEditMode(this.node, false);
                this.node._editorNode.enableEditMode(false);
                this.editor.controller.selectNode(this.node);
                this.editor.controller.changeMode(new bamboo.editor.NodeMode(this.editor, p));
                return true;
        }
        return this.node._editorNode.onkeyup(keycode, this.node.toLocalSpace(p));
    }
});

});
