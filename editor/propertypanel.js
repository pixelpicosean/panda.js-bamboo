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
    node: null,
    props: null,
    activeElement: null,

    init: function(editor) {
        this.editor = editor;
        this.window = new bamboo.UiWindow(game.system.width-200, 0, 200, game.system.height);
        this.window.windowDiv.onmouseover = this.mousein.bind(this);
        this.window.windowDiv.onmouseout = this.mouseout.bind(this);
        this.window.show();
    },

    mousein: function() {
        if(this.activeElement)
            this.activeElement.focus();
    },
    mouseout: function() {
        this.activeElement = null;
        if(document.activeElement !== document.body) {
            this.activeElement = document.activeElement;
            this.activeElement.blur();
        }
    },

    nodeSelected: function(node) {
        this.activeElement = null;
        if(this.node) {
            this.node._editorNode.removePropertyChangeListener(this.propertyChanged.bind(this));
            this.props = null;
        }

        this.node = node;
        this.window.clear();
        if(!node)
            return;

        this.node._editorNode.addPropertyChangeListener(this.propertyChanged.bind(this));
        
        var props = node.getPropertyDescriptors();
        this.props = props;
        for(var key in props) {
            if(!props[key].editable)
                continue;

            switch(props[key].type) {
                case bamboo.Property.TYPE.NUMBER:
                     this.window.addInputText(key, node[key].toFixed(2), props[key].name, props[key].description, this.textPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.STRING:
                    this.window.addInputText(key, node[key], props[key].name, props[key].description, this.textPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.ANGLE:
                    this.window.addInputText(key, ((180.0*node[key])/Math.PI).toFixed(2), props[key].name, props[key].description, this.anglePropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.BOOLEAN:
                    this.window.addInputCheckbox(key, node[key], props[key].name, props[key].description, this.booleanPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.VECTOR:
                    this.window.addMultiInput(key, [node[key].x.toFixed(2), node[key].y.toFixed(2)], 2, props[key].name, props[key].description, this.vectorPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.NODE:
                    this.window.addInputSelect(key, props[key].name, props[key].description, this.nodePropertyChanged.bind(this));
                    for(var i=0; i<this.editor.world.nodes.length; i++) {
                        var n = this.editor.world.nodes[i];
                        this.window.addInputSelectOption(key, n.name, '['+n.getClassName()+'] - '+n.name);
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

    propertyChanged: function(property, value) {
        switch(this.props[property].type) {
            case bamboo.Property.TYPE.NUMBER:
                this.window.inputs[property].value = value.toFixed(2);
                break;
            case bamboo.Property.TYPE.STRING:
            case bamboo.Property.TYPE.ENUM:
            case bamboo.Property.TYPE.FILE:
            case bamboo.Property.TYPE.TRIGGER:
                this.window.inputs[property].value = value;
                break;
            case bamboo.Property.TYPE.ANGLE:
                this.window.inputs[property].value = ((180.0*value)/Math.PI).toFixed(2);
                break;
            case bamboo.Property.TYPE.BOOLEAN:
                this.window.inputs[property].checked = value;
                break;
            case bamboo.Property.TYPE.VECTOR:
                this.window.inputs[property+'.0'].value = value.x.toFixed(2);
                this.window.inputs[property+'.1'].value = value.y.toFixed(2);
                break;
            case bamboo.Property.TYPE.NODE:
                this.window.inputs[property].value = value.name;
                break;
            case bamboo.Property.TYPE.ARRAY:
                // do nothing
                break;
            case bamboo.Property.TYPE.EASING:
                this.window.inputs[property].value = game.Tween.Easing.getName(value);
                break;
        }
    },


    textPropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.window.inputs[key].value);
    },

    anglePropertyChanged: function(key) {
        var value = this.window.inputs[key].value;
        value = ((value % 360) + 360) % 360;
        this.editor.selectedNode._editorNode.setProperty(key, value*Math.PI / 180);
    },

    booleanPropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.window.inputs[key].checked);
    },

    vectorPropertyChanged: function(key) {
        var value = this.window.inputs[key].value;
        var parts = key.split('.');
        var i = parts[parts.length-1];
        var keyName = key.slice(0, key.length - 1 - i.length);
        if(i === '0')
            this.editor.selectedNode._editorNode.setProperty(keyName, new game.Vector(value, this.editor.selectedNode[keyName].y));
        else if(i === '1')
            this.editor.selectedNode._editorNode.setProperty(keyName, new game.Vector(this.editor.selectedNode[keyName].x, value));
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
