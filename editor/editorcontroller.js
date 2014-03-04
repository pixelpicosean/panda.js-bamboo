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

    createNode: function(className, properties, editorNodeProperties) {
        // make sure name is unique
        properties.name = this.editor.getUniqueName(properties.name);

        var node = new bamboo.nodes[className](this.editor.world, properties);
        var editorNode = new bamboo.nodes[className].editor(node, editorNodeProperties);
        node.displayObject.updateTransform();
        this.editor.nodes.push(editorNode);
        this.editor.nodeAdded(node);
        return node;
    },

    deleteNode: function(node) {
        this.editor.nodes.splice(this.editor.nodes.indexOf(node._editorNode), 1);
        node.connectedTo = null;
        node.world = null;
        this.editor.nodeRemoved(node);
    },

    addImage: function(name, imgData) {
        this.editor.world.images[name] = imgData;
        this.editor.imageAdded(name);
    },

    changeMode: function(newMode) {
        this.editor.mode.exit();
        this.editor.mode = newMode;
        this.editor.mode.enter();
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
    },

    setActiveLayer: function(layer) {
        this.editor.activeLayer = layer;
        this.editor.propertyPanel.activeLayerChanged(layer);
    },

    moveNodeUp: function(node) {
        var idx = node.displayObject.parent.children.indexOf(node.displayObject);
        if(idx === 0)
            return;// already behind everything

        node.displayObject.parent.addChildAt(node.displayObject, idx-1);
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.editor.propertyPanel.nodeSelected(this.editor.selectedNode);
    },
    moveNodeDown: function(node) {
        var idx = node.displayObject.parent.children.indexOf(node.displayObject);
        if(idx === node.displayObject.parent.children.length-1)
            return;// already in front of everything

        node.displayObject.parent.addChildAt(node.displayObject, idx+1);
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.editor.propertyPanel.nodeSelected(this.editor.selectedNode);
    },
    moveNodeTopMost: function(node) {
        var idx = node.displayObject.parent.children.indexOf(node.displayObject);
        if(idx === node.displayObject.parent.children.length-1)
            return;// already in front of everything

        node.displayObject.parent.addChildAt(node.displayObject, node.displayObject.parent.children.length-1);
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.editor.propertyPanel.nodeSelected(this.editor.selectedNode);
    },
    moveNodeBottomMost: function(node) {
        var idx = node.displayObject.parent.children.indexOf(node.displayObject);
        if(idx === 0)
            return;// already behind everything

        node.displayObject.parent.addChildAt(node.displayObject, 0);
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.editor.propertyPanel.nodeSelected(this.editor.selectedNode);
    },

    moveLayerUp: function(layer) {
        var idx = layer.displayObject.parent.children.indexOf(layer.displayObject);
        if(idx === 0)
            return;// already behind everything
        layer.displayObject.parent.addChildAt(layer.displayObject, idx-1);
        idx = this.editor.layers.indexOf(layer);
        this.editor.layers.splice(idx, 1);
        this.editor.layers.splice(idx-1, 0, layer);
        this.editor.propertyPanel.updateLayerList();
    },
    moveLayerDown: function(layer) {
        var idx = layer.displayObject.parent.children.indexOf(layer.displayObject);
        if(idx === layer.displayObject.parent.children.length-1)
            return;// already on front of everything
        layer.displayObject.parent.addChildAt(layer.displayObject, idx+1);
        idx = this.editor.layers.indexOf(layer);
        this.editor.layers.splice(idx, 1);
        this.editor.layers.splice(idx+1, 0, layer);
        this.editor.propertyPanel.updateLayerList();
    },

    enableEditMode: function(node, enabled) {
        if(enabled) {
            node._editorNode.selectionRect.visible = false;
            node._editorNode.editableRect.visible = true;
            node._editorNode.selectionAxis.visible = true;
        } else {
            node._editorNode.selectionRect.visible = true;
            node._editorNode.editableRect.visible = false;
            node._editorNode.selectionAxis.visible = false;
        }
    }
});

});
