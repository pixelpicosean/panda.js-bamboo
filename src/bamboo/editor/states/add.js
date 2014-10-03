game.module(
    'bamboo.editor.states.add'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.StateAdd = bamboo.editor.State.extend({
    helpText: 'Add node',
    nameHasChanged: false,

    enter: function() {
        this.addWindow = new bamboo.UiWindow('center', 'center', 400, 220);
        this.addWindow.setTitle('Add Node');
        this.addWindow.addInputSelect('type', 'Node Type', 'Type of the node', this.nodeTypeChanged.bind(this));

        for (var name in bamboo.nodes) {
            this.addWindow.addInputSelectOption('type', name, name);
        }

        this.addWindow.addInputText('name', '', 'Name', 'Name of the node', this.nodeNameChanged.bind(this));
        this.addWindow.addInputSelect('parent', 'Parent', 'Node that this node will follow');
        this.mode.editor.buildNodeDropdown(this.addWindow, 'parent', this.mode.editor.world);
        
        if (this.mode.editor.activeNode) {
            this.addWindow.setInputSelectValue('parent', this.mode.editor.activeNode.name);
        }
        else {
            this.addWindow.setInputSelectValue('parent', this.mode.editor.activeLayer.name);
        }

        if(this.mode.editor.selectedNode) {
            this.addWindow.inputs['name'].value = this.mode.editor.getUniqueName(this.mode.editor.selectedNode.getClassName());
            this.addWindow.setInputSelectValue('type', this.mode.editor.selectedNode.getClassName());
            this.addWindow.setInputSelectValue('parent', this.mode.editor.selectedNode.parent.name);
        }

        this.addWindow.addButton('Add', this.addPressed.bind(this));
        this.addWindow.addButton('Cancel', this.cancel.bind(this));
        this.addWindow.show();

        this.nodeTypeChanged();
    },

    exit: function() {
        this.addWindow.hide();
    },

    cancel: function() {
        this.mode.editor.changeState('Select');
    },

    nodeNameChanged: function() {
        this.nameHasChanged = true;
    },

    nodeTypeChanged: function() {
        if (this.nameHasChanged) return;

        this.addWindow.inputs['name'].value = this.mode.editor.getUniqueName(this.addWindow.inputs['type'].value);
    },

    addPressed: function() {
        this.mode.editor.controller.deselectAllNodes();
        
        bamboo.ui.removeWindow(this.addWindow);

        var node = this.mode.editor.controller.createNode(this.addWindow.inputs['type'].value, {
            name: this.addWindow.inputs['name'].value,
            parent: this.addWindow.inputs['parent'].value
        });

        node.initProperties();
        node._editorNode.layerChanged();
        node._editorNode.ready();

        if (node.displayObject && node.size.x === 0 && node.size.y === 0 && node.displayObject.width > 1 && node.displayObject.height > 1) {
            node._editorNode.setProperty('size', new game.Point(node.displayObject.width, node.displayObject.height));
        }
        if (node.size.x === 0 && node.size.y === 0) {
            node._editorNode.setProperty('size', new game.Point(32, 32));
        }

        this.mode.editor.controller.setActiveNode(node);
        this.mode.editor.propertyPanel.updateLayerList();
        this.mode.editor.changeState('Move');

        var parentPos = node.parent.getWorldPosition();
        var pos = this.mode.editor.toWorldSpace(this.mode.editor.prevMousePos);
        this.mode.state.offset.x -= pos.x - parentPos.x;
        this.mode.state.offset.y -= pos.y - parentPos.y;
        this.mode.state.update(this.mode.editor.prevMousePos.x, this.mode.editor.prevMousePos.y);
    }
});

});
