game.module(
    'bamboo.editor.editorcontroller'
)
.require(
)
.body(function() {

bamboo.EditorController = game.Class.extend({
    editor: null,

    init: function(editor) {
        this.editor = editor;
    },

    createNode: function(className, properties) {
        // make sure name is unique
        properties.name = this.editor.getUniqueName(properties.name);

        var node = new bamboo.nodes[className](this.editor.world, properties);
        var editorNode = new bamboo.nodes[className].editor(node);

        this.editor.nodes.push(editorNode);
        this.editor.nodeAdded(node);
        return node;
    },

    deleteNode: function(node) {
        this.editor.nodeRemoved(node);
        this.editor.nodes.splice(this.editor.nodes.indexOf(node._editorNode), 1);
        node.connectedTo = null;
        node.world = null;
    },

    changeState: function(newState) {
        this.editor.state = newState;
    },

    selectNode: function(node) {
        if(this.editor.selectedNode === node)
            return;

        if(this.editor.selectedNode) {
            this.editor.selectedNode._editorNode.selectionRect.visible = false;
            this.editor.selectedNode._editorNode.selectionAxis.visible = false;
        }
        this.editor.selectedNode = node;
        if(this.editor.selectedNode) {
            this.editor.selectedNode._editorNode.selectionRect.visible = true;
            this.editor.selectedNode._editorNode.selectionAxis.visible = true;
        }
        this.editor.nodeSelected(node);
    }
});

});
