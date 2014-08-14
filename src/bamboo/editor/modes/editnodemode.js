game.module(
    'bamboo.editor.modes.editnodemode'
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

        this.editor.statusbar.setStatus('Edit mode: ESC exit / cancel<br>' + this.node._editorNode.helpText);
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

    click: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        this.node._editorNode.click(pos);
    },

    mousemove: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        this.node._editorNode.mousemove(pos);
    },

    keydown: function(key) {
        if (key === 'ESC') {
            this.editor.controller.changeMode(new bamboo.editor.NodeMode(this.editor));

            this.editor.controller.selectNode(this.node);
            this.editor.controller.setActiveNode(this.node);
        }
        this.node._editorNode.keydown(key);
    }
});

});
