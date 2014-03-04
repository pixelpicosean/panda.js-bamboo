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

    layerList: null,
    layerProperties: null,

    init: function(editor) {
        this.editor = editor;
        this.window = new bamboo.UiWindow(game.system.width-200, 0, 200, game.system.height);
        this.window.show();

        // create layer list
        this.layerList = document.createElement('select');
        this.layerList.size = 6;
        this.layerList.addEventListener('change', this.layerSelectionChanged.bind(this), false);
        this.window.titleDiv.appendChild(this.layerList);

        var buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttonContainer';

        var layerButton = document.createElement('div');

        layerButton.className = 'button';
        layerButton.innerHTML = '+';
        layerButton.addEventListener('click', this.newLayerClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        layerButton = document.createElement('div');
        layerButton.className = 'button';
        layerButton.innerHTML = '⬆';
        layerButton.addEventListener('click', this.moveLayerUpClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        layerButton = document.createElement('div');
        layerButton.className = 'button';
        layerButton.innerHTML = '⬇';
        layerButton.addEventListener('click', this.moveLayerDownClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        layerButton = document.createElement('div');
        layerButton.className = 'button';
        layerButton.innerHTML = '×';
        layerButton.addEventListener('click', this.deleteLayerClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        this.window.titleDiv.appendChild(buttonsDiv);

        this.layerProperties = document.createElement('div');
        this.window.titleDiv.appendChild(this.layerProperties);
        this.window.titleDiv.style.display = 'block';
    },

    updateLayerList: function() {
        this.layerList.innerHTML = '';
        for(var i=0; i<this.editor.layers.length; i++) {
            var opt = document.createElement('option');
            opt.value = this.editor.layers[i].name;
            opt.innerHTML = this.editor.layers[i].name;
            this.layerList.appendChild(opt);
        }

        this.activeLayerChanged(this.editor.activeLayer);
    },

    activeLayerChanged: function(layer) {
        var self = this;
        this.layerList.value = layer.name;
        this.layerProperties.innerHTML = '';


        var inputDiv = document.createElement('div');
        inputDiv.className = 'input';
        var labelElem = document.createElement('label');
        labelElem.innerHTML = 'visible';
        var inputElem = document.createElement('input');
        inputElem.type = 'checkbox';
        inputElem.name = 'visible';
        inputElem.title = 'Is layer visible';
        inputElem.checked = layer._editorNode.visible;
        inputElem.addEventListener('change', function() {layer._editorNode.visible=this.checked;}, false);
        inputDiv.appendChild(labelElem);
        inputDiv.appendChild(inputElem);
        this.layerProperties.appendChild(inputDiv);

        inputDiv = document.createElement('div');
        inputDiv.className = 'input';
        labelElem = document.createElement('label');
        labelElem.innerHTML = 'Name';
        inputElem = document.createElement('input');
        inputElem.type = 'text';
        inputElem.name = 'name';
        inputElem.title = 'Name of the layer';
        inputElem.value = layer.name;
        inputElem.addEventListener('change', function()
                                   {layer._editorNode.setProperty('name', this.value);
                                    self.updateLayerList();}, false);
        inputDiv.appendChild(labelElem);
        inputDiv.appendChild(inputElem);
        this.layerProperties.appendChild(inputDiv);
        
        inputDiv = document.createElement('div');
        inputDiv.className = 'input';
        labelElem = document.createElement('label');
        labelElem.innerHTML = 'Parallax multiplier';
        inputElem = document.createElement('input');
        inputElem.type = 'text';
        inputElem.name = 'speedFactor';
        inputElem.title = 'Speed relative to camera';
        inputElem.value = layer.speedFactor.toFixed(2);
        inputElem.addEventListener('change', function() {layer._editorNode.setProperty('speedFactor', parseFloat(this.value));}, false);
        inputDiv.appendChild(labelElem);
        inputDiv.appendChild(inputElem);
        this.layerProperties.appendChild(inputDiv);
    },

    layerSelectionChanged: function() {
        this.editor.controller.setActiveLayer(this.editor.world.findNode(this.layerList.value));
        // clear selection!
    },
    newLayerClicked: function() {
        this.editor.controller.createNode('Layer', {name:'Layer', connectedTo:null});
    },
    moveLayerUpClicked: function() {
        this.editor.controller.moveLayerUp(this.editor.activeLayer);
    },
    moveLayerDownClicked: function() {
        this.editor.controller.moveLayerDown(this.editor.activeLayer);
    },
    deleteLayerClicked: function() {
        if(this.editor.layers.length === 1) {
            alert('Cannot delete last layer!');
            return;
        }
        if(confirm('Delete layer \''+this.editor.activeLayer.name+'\'?')) {
            var l = this.editor.activeLayer;
            this.editor.controller.setActiveLayer(l === this.editor.layers[0] ? this.editor.layers[1] : this.editor.layers[0]);
            this.editor.controller.deleteNode(l);
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
                     this.window.addInputText(key, parseFloat(node[key]).toFixed(2), props[key].name, props[key].description, this.numberPropertyChanged.bind(this));
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
                case bamboo.Property.TYPE.IMAGE:
                    this.window.addInputSelect(key, props[key].name, props[key].description, this.imagePropertyChanged.bind(this));
                    var images = this.editor.world.images;
                    for(var name in images) {
                        this.window.addInputSelectOption(key, name, name);
                    }
                    this.window.setInputSelectValue(key, node[key]);
                    break;
                case bamboo.Property.TYPE.TRIGGER:
                    this.window.addInputSelect(key, props[key].name, props[key].description, this.triggerPropertyChanged.bind(this));
                    for(var n in this.editor.world.triggers)
                        this.window.addInputSelectOption(key, n, n);
                    this.window.setInputSelectValue(key, node[key]);
                    break;
                case bamboo.Property.TYPE.COLOR:
                    this.window.addInputColor(key, '#'+node[key].toString(16), props[key].name, props[key].description, this.colorPropertyChanged.bind(this));
                    break;
            }
        }
    },

    propertyChanged: function(property, value) {
        switch(this.props[property].type) {
            case bamboo.Property.TYPE.NUMBER:
                this.window.inputs[property].value = parseFloat(value).toFixed(2);
                break;
            case bamboo.Property.TYPE.STRING:
            case bamboo.Property.TYPE.ENUM:
            case bamboo.Property.TYPE.IMAGE:
            case bamboo.Property.TYPE.TRIGGER:
                this.window.inputs[property].value = value;
                break;
            case bamboo.Property.TYPE.ANGLE:
                this.window.inputs[property].value = ((180.0*parseFloat(value))/Math.PI).toFixed(2);
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
            case bamboo.Property.TYPE.COLOR:
                this.window.inputs[property].value = '#'+value.toString(16);
                break;
        }
    },


    numberPropertyChanged: function(key) {
        var value = parseFloat(this.window.inputs[key].value);
        if(this.props[key].options) {
            var min = this.props[key].options.min;
            var max = this.props[key].options.max;
            if(min) value = Math.max(value, min);
            if(max) value = Math.min(value, max);
        }
        this.editor.selectedNode._editorNode.setProperty(key, value);
    },

    textPropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.window.inputs[key].value);
    },

    anglePropertyChanged: function(key) {
        var value = parseFloat(this.window.inputs[key].value);
        value = ((value % 360) + 360) % 360;
        this.editor.selectedNode._editorNode.setProperty(key, value*Math.PI / 180);
    },

    booleanPropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.window.inputs[key].checked);
    },

    vectorPropertyChanged: function(key) {
        var value = parseFloat(this.window.inputs[key].value);
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

    imagePropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.window.inputs[key].value);
    },

    triggerPropertyChanged: function(key) {
        this.editor.selectedNode._editorNode.setProperty(key, this.window.inputs[key].value);
    },

    colorPropertyChanged: function(key) {
        var value = this.window.inputs[key].value;
        if(value.length <= 0) {
            value = 0xffffff;
        } else {
            value = parseInt('0x'+value.substr(1));
            if(isNaN(value))
                value = 0xffffff;
        }
        this.editor.selectedNode._editorNode.setProperty(key, value);
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
