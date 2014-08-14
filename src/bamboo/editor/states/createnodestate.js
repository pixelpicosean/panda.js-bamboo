game.module(
    'bamboo.editor.states.createnodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.CreateNodeState = bamboo.editor.State.extend({
    nameHasChanged: false,

    init: function(mode) {
        this._super(mode);

        this.windowElem = bamboo.ui.addWindow('center', 'center', 400, 214);
        this.windowElem.addTitle('Add Node');
        this.windowElem.addInputSelect('type', 'Node Type', 'Type of the node', this.nodeTypeChanged.bind(this));
        for (var i = 0; i < bamboo.availableNodeTypes.length; i++) {
            this.windowElem.addInputSelectOption('type', bamboo.availableNodeTypes[i], bamboo.availableNodeTypes[i]);
        }

        this.windowElem.addInputText('name', this.mode.editor.getUniqueName(bamboo.availableNodeTypes[0]), 'Name', 'Name of the node', this.nodeNameChanged.bind(this));
        this.windowElem.addInputSelect('connectedTo', 'Follow', 'Node that this node will follow');
        this.mode.editor.buildNodeDropdown(this.windowElem, 'connectedTo', this.mode.editor.world);
        this.windowElem.setInputSelectValue('connectedTo', this.mode.editor.activeLayer.name);

        if(this.mode.editor.selectedNode) {
            this.windowElem.inputs['name'].value = this.mode.editor.getUniqueName(this.mode.editor.selectedNode.getClassName());
            this.windowElem.setInputSelectValue('type', this.mode.editor.selectedNode.getClassName());
            this.windowElem.setInputSelectValue('connectedTo', this.mode.editor.selectedNode.connectedTo.name);
        }

        this.windowElem.addButton('Add', this.addPressed.bind(this));
        this.windowElem.show();

        this.mode.editor.statusbar.setStatus(this.mode.helpText + '<br>Add node');
    },

    apply: function() {
        this.windowElem.hide();
    },

    cancel: function() {
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
        try {
            var node = this.mode.editor.controller.createNode(this.windowElem.inputs['type'].value, {
                name: this.windowElem.inputs['name'].value,
                position: this.mode.editor.world.findNode(this.windowElem.inputs['connectedTo'].value).toLocalSpace(new game.Vec2()),
                connectedTo: this.windowElem.inputs['connectedTo'].value});

            this.windowElem.hide();
            this.mode.editor.controller.setActiveNode(node);
            this.mode.changeState(new bamboo.editor.NewNodeState(this.mode, [node]));

        } catch(err) {
            var node = this.mode.editor.world.findNode(this.windowElem.inputs['name'].value);
            if (node) {
                this.mode.editor.controller.deleteNode(node);
            }
            alert(err);
        }
    }
});

});
