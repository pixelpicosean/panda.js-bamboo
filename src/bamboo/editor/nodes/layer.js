game.module(
    'bamboo.editor.nodes.layer'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.layer'
)
.body(function() {

game.createEditorNode('Layer', {
    visible: true,

    ready: function() {
        this.displayObject.removeChild(this.nameText);
        this.displayObject.removeChild(this.parentSelectionRect);
        this.editor.editorContainer.addChild(this.displayObject);
    },

    setVisibility: function(value) {
        this.visible = this.node.displayObject.visible = value;
    }
});

});
