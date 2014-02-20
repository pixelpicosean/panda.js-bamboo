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

    init: function(editor, p) {
        this.super(editor);

        this.window = new bamboo.UiWindow(game.system.width/2-200, game.system.height/2-100, 400, 'auto');
        this.window.addTitle('Add Node');
        this.window.addInputSelect('type', 'Node Type', this.nodeTypeChanged.bind(this));
        for(var i=0; i<bamboo.availableNodeTypes.length; i++)
            this.window.addInputSelectOption('type', bamboo.availableNodeTypes[i], bamboo.availableNodeTypes[i]);

        this.window.addInputText('name', this.editor.getUniqueName(bamboo.availableNodeTypes[0]), 'Name', this.nodeNameChanged.bind(this));
        this.window.addInputSelect('connectedTo', 'Connected To');
        for(var i=0; i<this.editor.world.nodes.length; i++)
            this.window.addInputSelectOption('connectedTo', this.editor.world.nodes[i].name, this.editor.world.nodes[i].name);

        if(this.editor.selectedNode) {
            this.window.inputs['name'].value = this.editor.getUniqueName(this.editor.selectedNode.name);
            this.window.setInputSelectValue('type', this.editor.selectedNode.getClassName());
            this.window.setInputSelectValue('connectedTo', this.editor.selectedNode.connectedTo.name);
        }

        this.window.addButton('Add', this.addPressed.bind(this));

        this.window.show();
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

        this.window.inputs['name'] = this.editor.getUniqueName(this.window.inputs['type'].value);
    },

    addPressed: function() {
        var node = this.editor.controller.createNode(this.window.inputs['type'].value, {
            name: this.window.inputs['name'].value,
            position: new game.Vector(),
            connectedTo: this.window.inputs['connectedTo'].value});

        this.window.hide();
        this.editor.controller.changeState(new bamboo.editor.NewNodeState(this.editor, new game.Vector(), node));
    }
});

});
