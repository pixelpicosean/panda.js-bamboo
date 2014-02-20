game.module(
    'bamboo.editor.propertypanel'
)
.require(
    'bamboo.editor.ui'
)
.body(function() {

bamboo.PropertyPanel = game.Class.extend({
    editor: null,
    window: null,

    init: function(editor) {
        this.editor = editor;
        this.window = new bamboo.UiWindow(game.system.width-200, 0, 200, game.system.height-40);
        this.window.show();
    },

    nodeSelected: function(node) {

        this.window.clear();
        if(!node)
            return;

        var props = node.getPropertyDescriptors();
        for(var key in props) {
            if(!props[key].editable)
                continue;

            switch(props[key].type) {
                case bamboo.Property.TYPE.NUMBER:
                case bamboo.Property.TYPE.STRING:
                    this.window.addInputText(key, node[key], props[key].name, props[key].description, this.textPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.ANGLE:
                    this.window.addInputText(key, (180.0*node[key])/Math.PI, props[key].name, props[key].description, this.anglePropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.BOOLEAN:
                    this.window.addInputCheckbox(key, node[key], props[key].name, props[key].description, this.booleanPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.VECTOR:
                    this.window.addInputText(key, node[key].x, props[key].name, props[key].description, this.vectorPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.NODE:
                    this.window.addInputSelect(key, props[key].name, props[key].description, this.nodePropertyChanged.bind(this));
                    for(var i=0; i<this.editor.world.nodes.length; i++) {
                        this.window.addInputSelectOption(key, this.editor.world.nodes[i].name, this.editor.world.nodes[i].name);
                    }
                    this.window.setInputSelectValue(key, node[key].name);
                    break;
                case bamboo.Property.TYPE.ARRAY:
                    throw 'Cannot edit array type properties!';
                case bamboo.Property.TYPE.EASING:
                    this.window.addInputSelect(key, props[key].name, props[key].description, this.easingPropertyChanged.bind(this));
                    var easings = game.Tween.Easing.getNamesList();
                    for(var i=0; i<easings.length; i++)
                        this.window.addInputSelectOption(key, easings[i], easings[i]);
                    this.window.setInputSelectValue(key, game.Tween.Easing.getName(node[key]));
                    break;
                case bamboo.Property.TYPE.ENUM:
                    this.window.addInputSelect(key, props[key].name, props[key].description, this.enumPropertyChanged.bind(this));
                    for(var i=0; i<props[key].options.length; i++)
                        this.window.addInputSelectOption(key, props[key].options[i], props[key].options[i]);
                    this.window.setInputSelectValue(key, node[key]);
                    break;
                case bamboo.Property.TYPE.FILE:
                    this.window.addInputText(key, node[key], props[key].name, props[key].description, this.textPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.TRIGGER:
                    this.window.addInputSelect(key, props[key].name, props[key].description, this.triggerPropertyChanged.bind(this));
                    for(var n in this.editor.world.triggers)
                        this.window.addInputSelectOption(key, n, n);
                    this.window.setInputSelectValue(key, node[key]);
                    break;
            }
        }
    },



    textPropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.window.inputs[key].value);
    },

    anglePropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.window.inputs[key].value*Math.PI / 180);
    },

    booleanPropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.window.inputs[key].checked);
    },

    vectorPropertyChanged: function(key) {
    },

    nodePropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.editor.world.findNode(this.window.inputs[key].value));
    },

    easingPropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, game.Tween.Easing.getByName(this.window.inputs[key].value));
    },

    enumPropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.window.inputs[key].value);
    },

    triggerPropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.window.inputs[key].value);
    }
});

Object.defineProperty(bamboo.PropertyPanel.prototype, 'visible', {
    get: function() {
        return this.window.visible;
    },
    set: function(value) {
        if(value === this.window.visible)
            return;
        if(value) {
            this.window.show();
        } else {
            this.window.hide();
        }
    }
});

});
