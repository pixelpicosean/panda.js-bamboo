game.module(
    'bamboo.editor.modes.edit'
)
.require(
    'bamboo.editor.mode'
)
.body(function() {

bamboo.editor.ModeEdit = bamboo.editor.Mode.extend({
    helpText: 'Edit mode: MOUSE confirm, ESC cancel',

    init: function(editor) {
        this._super(editor);
        this.node = this.editor.activeNode;
        this.state = this.node._editorNode;
        console.log('Edit mode inited');
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
        pos = this.editor.toWorldSpace(pos);
        this.node._editorNode.click(pos);
    },

    mousemove: function(event) {
        var pos = new game.Point(event.global.x, event.global.y);
        pos = this.editor.toWorldSpace(pos);
        this.node._editorNode.mousemove(pos);
    },

    keydown: function(key) {
        if (key === 'ESC') {
            this.editor.changeMode('Main');
            this.editor.controller.selectNode(this.node);
            this.editor.controller.setActiveNode(this.node);
        }
        
        this.node._editorNode.keydown(key);
    }
});

});
