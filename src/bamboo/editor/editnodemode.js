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
        this._super(editor);
        this.node = node;

        this.editor.statusbar.setStatus('Edit mode, TAB to exit');
    },

    enter: function() {
        this.node._editorNode.enableEditMode(true);
        this.editor.controller.enableEditMode(this.node, true);
    },
    
    exit: function() {
        this.editor.controller.enableEditMode(this.node, false);
        this.node._editorNode.enableEditMode(false);
        this.editor.controller.selectNode(this.node);
    },

    onclick: function(p) {
        this.node._editorNode.onclick(p);
    },

    onmousemove: function(p) {
        this.node._editorNode.onmousemove(p);
    },

    onkeydown: function(keycode, p) {
        switch(keycode) {
            case 9:// TAB
                return true;
        }
        return this.node._editorNode.onkeydown(keycode, p);
    },

    onkeyup: function(keycode, p) {
        switch(keycode) {
            case 9:// TAB - exit edit mode
                this.editor.controller.changeMode(new bamboo.editor.NodeMode(this.editor, p));
                return true;
        }
        return this.node._editorNode.onkeyup(keycode, p);
    }
});

});
