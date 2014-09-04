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

    init: function(mode) {
        this._super(mode);

        this.windowElem = bamboo.ui.addWindow('center', 'center', 400, 214);
        this.windowElem.setTitle('Add Node');
        this.windowElem.addInputSelect('type', 'Node Type', 'Type of the node', this.nodeTypeChanged.bind(this));

        for (var name in bamboo.nodes) {
            this.windowElem.addInputSelectOption('type', name, name);
        }

        this.windowElem.addInputText('name', '', 'Name', 'Name of the node', this.nodeNameChanged.bind(this));
        this.windowElem.addInputSelect('parent', 'Parent', 'Node that this node will follow');
        this.mode.editor.buildNodeDropdown(this.windowElem, 'parent', this.mode.editor.world);
        this.windowElem.setInputSelectValue('parent', this.mode.editor.activeLayer.name);

        if(this.mode.editor.selectedNode) {
            this.windowElem.inputs['name'].value = this.mode.editor.getUniqueName(this.mode.editor.selectedNode.getClassName());
            this.windowElem.setInputSelectValue('type', this.mode.editor.selectedNode.getClassName());
            this.windowElem.setInputSelectValue('parent', this.mode.editor.selectedNode.parent.name);
        }

        this.windowElem.addButton('Add', this.addPressed.bind(this));
        this.windowElem.addButton('Cancel', this.cancel.bind(this));
        this.windowElem.show();

        this.nodeTypeChanged();
    },

    cancel: function() {
        this.mode.editor.changeState('Select');
        this.windowElem.hide();
    },

    nodeNameChanged: function() {
        this.nameHasChanged = true;
    },

    nodeTypeChanged: function() {
        if (this.nameHasChanged) return;

        this.windowElem.inputs['name'].value = this.mode.editor.getUniqueName(this.windowElem.inputs['type'].value);
    },

    addPressed: function() {
        this.mode.editor.controller.deselectAllNodes();
        
        bamboo.ui.removeWindow(this.windowElem);

        var node = this.mode.editor.controller.createNode(this.windowElem.inputs['type'].value, {
            name: this.windowElem.inputs['name'].value,
            parent: this.windowElem.inputs['parent'].value
        });

        node.initProperties();
        node._editorNode.layerChanged();
        node._editorNode.ready();

        if (node.displayObject && node.size.x === 0 && node.size.y === 0 && node.displayObject.width > 1 && node.displayObject.height > 1) {
            node._editorNode.setProperty('size', new game.Point(node.displayObject.width, node.displayObject.height));
        }
        if (node.size.x === 0 && node.size.y === 0) {
            node._editorNode.setProperty('size', new game.Point(64, 64));
        }

        this.mode.editor.controller.setActiveNode(node);
        this.mode.editor.changeState('Move');

        var parentPos = node.parent.getWorldPosition();
        var pos = this.mode.editor.toWorldSpace(this.mode.editor.prevMousePos);
        this.mode.state.offset.x -= pos.x - parentPos.x;
        this.mode.state.offset.y -= pos.y - parentPos.y;
        this.mode.state.update(this.mode.editor.prevMousePos.x, this.mode.editor.prevMousePos.y);
    }
});

});
