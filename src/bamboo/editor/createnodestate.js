game.module(
    'bamboo.editor.createnodestate'
)
.require(
    'bamboo.editor.state',
    'bamboo.editor.ui'
)
.body(function() {

bamboo.editor.CreateNodeState = bamboo.editor.State.extend({
    window: null,
    nameHasChanged: false,

    init: function(mode) {
        this._super(mode);

        this.window = new bamboo.UiWindow(game.system.width/2-200, game.system.height/2-100, 400, 'auto');
        this.window.addTitle('Add Node');
        this.window.addInputSelect('type', 'Node Type', 'Type of the node', this.nodeTypeChanged.bind(this));
        for(var i=0; i<bamboo.availableNodeTypes.length; i++)
            this.window.addInputSelectOption('type', bamboo.availableNodeTypes[i], bamboo.availableNodeTypes[i]);

        this.window.addInputText('name', this.mode.editor.getUniqueName(bamboo.availableNodeTypes[0]), 'Name', 'Name of the node', this.nodeNameChanged.bind(this));
        this.window.addInputSelect('connectedTo', 'Follow', 'Node that this node will follow');
        this.mode.editor.buildNodeDropdown(this.window, 'connectedTo', this.mode.editor.world);
        this.window.setInputSelectValue('connectedTo', this.mode.editor.activeLayer.name);

        if(this.mode.editor.selectedNode) {
            this.window.inputs['name'].value = this.mode.editor.getUniqueName(this.mode.editor.selectedNode.getClassName());
            this.window.setInputSelectValue('type', this.mode.editor.selectedNode.getClassName());
            this.window.setInputSelectValue('connectedTo', this.mode.editor.selectedNode.connectedTo.name);
        }

        this.window.addButton('Add', this.addPressed.bind(this));

        this.window.show();

        this.mode.editor.statusbar.setStatus('Create new node, ESC to cancel');
    },

    cancel: function() {
        this.window.hide();
    },

    apply: function() {
        this.window.hide();
    },

    nodeNameChanged: function() {
        this.nameHasChanged = true;
    },

    nodeTypeChanged: function() {
        if(this.nameHasChanged)
            return;

        this.window.inputs['name'].value = this.mode.editor.getUniqueName(this.window.inputs['type'].value);
    },

    addPressed: function() {
        try {

            var node = this.mode.editor.controller.createNode(this.window.inputs['type'].value, {
                name: this.window.inputs['name'].value,
                position: this.mode.editor.world.findNode(this.window.inputs['connectedTo'].value).toLocalSpace(new Vec2()),
                connectedTo: this.window.inputs['connectedTo'].value});

            this.window.hide();
            this.mode.editor.controller.setActiveNode(node);
            this.mode.changeState(new bamboo.editor.NewNodeState(this.mode, new Vec2(), [node]));

        } catch(err) {
            var node = this.mode.editor.world.findNode(this.window.inputs['name'].value);
            if(node) {
                this.mode.editor.controller.deleteNode(node);
            }
            alert(err);
        }
    }
});

});