game.module(
    'bamboo.editor.propertypanel'
)
.body(function() {

bamboo.PropertyPanel = game.Class.extend({
    width: 200,
    layerWindowHeight: 330,

    init: function(editor) {
        this.editor = editor;
        
        this.layerWindow = bamboo.ui.addWindow(this.width, game.system.height - this.layerWindowHeight - this.editor.statusBar.height, this.width, this.layerWindowHeight, 'right');
        this.layerWindow.setTitle('Layers');
        this.layerWindow.show();

        this.settingsWindow = bamboo.ui.addWindow(this.width, this.editor.toolBar.height, this.width, game.system.height - this.layerWindowHeight - this.editor.toolBar.height - this.editor.statusBar.height, 'right');
        this.settingsWindow.show();

        // create layer list
        this.layerList = document.createElement('select');
        this.layerList.className = 'layerList';
        this.layerList.size = 6;
        this.layerList.addEventListener('click', this.layerSelectionChanged.bind(this), false);
        this.layerWindow.titleDiv.appendChild(this.layerList);

        var buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttonContainer';

        var layerButton = document.createElement('div');

        layerButton.className = 'button';
        layerButton.innerHTML = '+';
        layerButton.addEventListener('click', this.newLayerClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        layerButton = document.createElement('div');
        layerButton.className = 'button';
        layerButton.innerHTML = '<';
        layerButton.addEventListener('click', this.moveLayerUpClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        layerButton = document.createElement('div');
        layerButton.className = 'button';
        layerButton.innerHTML = '>';
        layerButton.addEventListener('click', this.moveLayerDownClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        layerButton = document.createElement('div');
        layerButton.className = 'button';
        layerButton.innerHTML = '×';
        layerButton.addEventListener('click', this.deleteLayerClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        this.layerWindow.titleDiv.appendChild(buttonsDiv);
        this.layerWindow.titleDiv.style.display = 'block';
    },

    updateLayerList: function() {
        this.layerList.innerHTML = '';
        for (var i = 0; i < this.editor.layers.length; i++) {
            var opt = document.createElement('option');
            opt.value = this.editor.layers[i].name;
            opt.innerHTML = this.editor.layers[i].name;
            this.layerList.appendChild(opt);
        }

        this.activeLayerChanged(this.editor.activeLayer);
    },

    showSettings: function() {
        this.settingsWindow.clear();

        this.settingsWindow.setTitle('Scene settings');

        this.settingsWindow.addInputText('name', this.editor.world.name, 'Name', '', this.settingsChanged.bind(this, 'name'));
        this.settingsWindow.addInputText('width', this.editor.world.width, 'Width', '', this.settingsChanged.bind(this, 'width'));
        this.settingsWindow.addInputText('height', this.editor.world.height, 'Height', '', this.settingsChanged.bind(this, 'height'));
        this.settingsWindow.addInputColor('bgcolor', '#' + this.editor.world.bgcolor.toString(16), 'Backgroundc color', '', this.settingsChanged.bind(this, 'bgcolor'));
    },

    settingsChanged: function(key) {
        var value = this.settingsWindow.inputs[key].value;

        if (key === 'name') {
            this.editor.world.name = value;
        }
        if (key === 'width') {
            this.editor.world.width = parseInt(value) || this.editor.world.width;
            this.settingsWindow.inputs[key].value = this.editor.world.width;
            this.editor.boundaryLayer.resetGraphics();
        }
        if (key === 'height') {
            this.editor.world.height = parseInt(value) || this.editor.world.height;
            this.settingsWindow.inputs[key].value = this.editor.world.height;
            this.editor.boundaryLayer.resetGraphics();
        }
        if (key === 'bgcolor') {
            var color = parseInt('0x' + value.slice(1));
            game.system.stage.setBackgroundColor(color);
            this.editor.world.bgcolor = value.replace('#', '0x');
        }
    },

    activeLayerChanged: function(layer) {
        var self = this;
        this.layerList.value = layer.name;

        this.layerWindow.clear();

        this.layerWindow.addInputSelect('activeNode', 'Active node', 'Active node', function() {self.editor.controller.setActiveNode(self.editor.world.findNode(this.inputs['activeNode'].value));});
        this.editor.buildNodeDropdown(this.layerWindow, 'activeNode', layer);
        if(!this.editor.activeNode)
            this.layerWindow.setInputSelectValue('activeNode', '');
        else
            this.layerWindow.setInputSelectValue('activeNode', this.editor.activeNode.name);

        
        this.layerWindow.addInputCheckbox('visible', layer._editorNode.visible, 'Visible', 'Is layer visible in editor', function() {
            layer._editorNode.setVisibility(this.inputs['visible'].checked);
        });
        this.layerWindow.addInputText('name', layer.name, 'Name', 'Name of the layer', function() {layer._editorNode.setProperty('name', this.inputs['name'].value); self.updateLayerList();});
        this.layerWindow.addInputText('speedFactor', layer.speedFactor.toFixed(2), 'Speed', 'Speed relative to camera', function() {layer._editorNode.setProperty('speedFactor', parseFloat(this.inputs['speedFactor'].value));});
    },

    layerSelectionChanged: function() {
        this.focusOnCanvas();
        this.editor.controller.setActiveLayer(this.editor.findNode(this.layerList.value));
    },

    focusOnCanvas: function() {
        if (document.activeElement !== document.body) document.activeElement.blur();
    },

    newLayerClicked: function() {
        this.editor.controller.createNode('Layer', { name: 'Layer' });
        this.layerSelectionChanged();
    },

    moveLayerUpClicked: function() {
        this.editor.controller.moveLayerUp(this.editor.activeLayer);
    },

    moveLayerDownClicked: function() {
        this.editor.controller.moveLayerDown(this.editor.activeLayer);
    },

    deleteLayerClicked: function() {
        if (this.editor.layers.length === 1) {
            this.editor.showError('Cannot delete last layer!');
            return;
        }
        if (confirm('Delete layer \''+this.editor.activeLayer.name+'\'?')) {
            var l = this.editor.activeLayer;
            this.editor.controller.setActiveLayer(l === this.editor.layers[0] ? this.editor.layers[1] : this.editor.layers[0]);
            this.editor.controller.deleteNode(l);
        }
    },

    activeNodeChanged: function(node) {
        this.activeElement = null;
        if (this.node) {
            this.node._editorNode.removePropertyChangeListener(this.propertyChanged.bind(this));
            this.props = null;
        }

        this.node = node;
        this.settingsWindow.clear();
        this.settingsWindow.setTitle('Node settings');

        if (!node) {
            this.layerWindow.setInputSelectValue('activeNode', '');
            return;
        }

        this.layerWindow.setInputSelectValue('activeNode', node.name);
        this.node._editorNode.addPropertyChangeListener(this.propertyChanged.bind(this));
        
        this.settingsWindow.addText(this.node._editorNode.getClassName() + '<br><br>');
        var props = node.getPropertyDescriptors();
        this.props = props;
        for (var key in props) {
            if (!props[key].editable) continue;

            switch(props[key].type) {
                case bamboo.Property.TYPE.NUMBER:
                     this.settingsWindow.addInputText(key, parseFloat(node[key]).toFixed(2), props[key].name, props[key].description, this.numberPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.STRING:
                    this.settingsWindow.addInputText(key, node[key], props[key].name, props[key].description, this.textPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.ANGLE:
                    this.settingsWindow.addInputText(key, ((180.0*node[key])/Math.PI).toFixed(2), props[key].name, props[key].description, this.anglePropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.BOOLEAN:
                    this.settingsWindow.addInputCheckbox(key, node[key], props[key].name, props[key].description, this.booleanPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.VECTOR:
                    this.settingsWindow.addMultiInput(key, [node[key].x.toFixed(2), node[key].y.toFixed(2)], 2, props[key].name, props[key].description, this.vectorPropertyChanged.bind(this));
                    break;
                case bamboo.Property.TYPE.NODE:
                    this.settingsWindow.addInputSelect(key, props[key].name, props[key].description, this.nodePropertyChanged.bind(this));
                    this.editor.buildNodeDropdown(this.settingsWindow, key, this.editor.world);
                    this.settingsWindow.setInputSelectValue(key, node[key].name);
                    break;
                case bamboo.Property.TYPE.ARRAY:
                    throw 'Cannot edit array type properties!';
                case bamboo.Property.TYPE.EASING:
                    this.settingsWindow.addInputSelect(key, props[key].name, props[key].description, this.easingPropertyChanged.bind(this));
                    var easings = game.Tween.Easing.getNamesList();
                    for(var i=0; i<easings.length; i++)
                        this.settingsWindow.addInputSelectOption(key, easings[i], easings[i]);
                    this.settingsWindow.setInputSelectValue(key, game.Tween.Easing.getName(node[key]));
                    break;
                case bamboo.Property.TYPE.ENUM:
                    this.settingsWindow.addInputSelect(key, props[key].name, props[key].description, this.enumPropertyChanged.bind(this));
                    for(var i=0; i<props[key].options.length; i++)
                        this.settingsWindow.addInputSelectOption(key, props[key].options[i], props[key].options[i]);
                    this.settingsWindow.setInputSelectValue(key, node[key]);
                    break;
                case bamboo.Property.TYPE.IMAGE:
                    this.settingsWindow.addInputSelect(key, props[key].name, props[key].description, this.imagePropertyChanged.bind(this));
                    var images = this.editor.images;
                    for (var i = 0; i < images.length; i++) {
                        var name = images[i];
                        this.settingsWindow.addInputSelectOption(key, name, name);
                    }
                    this.settingsWindow.setInputSelectValue(key, node[key]);
                    break;
                case bamboo.Property.TYPE.TRIGGER:
                    this.settingsWindow.addInputSelect(key, props[key].name, props[key].description, this.triggerPropertyChanged.bind(this));
                    for(var n in this.editor.world.triggers)
                        this.settingsWindow.addInputSelectOption(key, n, n);
                    this.settingsWindow.setInputSelectValue(key, node[key]);
                    break;
                case bamboo.Property.TYPE.COLOR:
                    this.settingsWindow.addInputColor(key, '#' + node[key].toString(16), props[key].name, props[key].description, this.colorPropertyChanged.bind(this));
                    break;
            }
        }
    },

    propertyChanged: function(property, value) {
        switch (this.props[property].type) {
            case bamboo.Property.TYPE.NUMBER:
                this.settingsWindow.inputs[property].value = parseFloat(value).toFixed(2);
                break;
            case bamboo.Property.TYPE.STRING:
            case bamboo.Property.TYPE.ENUM:
            case bamboo.Property.TYPE.TRIGGER:
                this.settingsWindow.inputs[property].value = value;
                break;
            case bamboo.Property.TYPE.IMAGE:
                this.settingsWindow.inputs[property].value = value;
                break;
            case bamboo.Property.TYPE.ANGLE:
                this.settingsWindow.inputs[property].value = ((180.0*parseFloat(value))/Math.PI).toFixed(2);
                break;
            case bamboo.Property.TYPE.BOOLEAN:
                this.settingsWindow.inputs[property].checked = value;
                break;
            case bamboo.Property.TYPE.VECTOR:
                this.settingsWindow.inputs[property+'.0'].value = value.x.toFixed(2);
                this.settingsWindow.inputs[property+'.1'].value = value.y.toFixed(2);
                break;
            case bamboo.Property.TYPE.NODE:
                this.settingsWindow.inputs[property].value = value.name;
                break;
            case bamboo.Property.TYPE.ARRAY:
                // do nothing
                break;
            case bamboo.Property.TYPE.EASING:
                this.settingsWindow.inputs[property].value = game.Tween.Easing.getName(value);
                break;
            case bamboo.Property.TYPE.COLOR:
                this.settingsWindow.inputs[property].value = '#'+value.toString(16);
                break;
        }
    },

    numberPropertyChanged: function(key) {
        var value = parseFloat(this.settingsWindow.inputs[key].value);
        if(this.props[key].options) {
            var min = this.props[key].options.min;
            var max = this.props[key].options.max;
            if(min) value = Math.max(value, min);
            if(max) value = Math.min(value, max);
        }
        this.editor.activeNode._editorNode.setProperty(key, value);
    },

    textPropertyChanged: function(key) {
        this.editor.activeNode._editorNode.setProperty(key, this.settingsWindow.inputs[key].value);
    },

    anglePropertyChanged: function(key) {
        var value = parseFloat(this.settingsWindow.inputs[key].value);
        if(this.props[key].options && this.props[key].options.loop360)
            value = ((value % 360) + 360) % 360;
        this.editor.activeNode._editorNode.setProperty(key, value*Math.PI / 180);
    },

    booleanPropertyChanged: function(key) {
        this.editor.activeNode._editorNode.setProperty(key, this.settingsWindow.inputs[key].checked);
        this.focusOnCanvas();
    },

    vectorPropertyChanged: function(key) {
        var value = parseFloat(this.settingsWindow.inputs[key].value);
        var parts = key.split('.');
        var i = parts[parts.length - 1];
        var keyName = key.slice(0, key.length - 1 - i.length);
        if (i === '0')
            this.editor.activeNode._editorNode.setProperty(keyName, new game.Point(value, this.editor.activeNode[keyName].y));
        else if (i === '1')
            this.editor.activeNode._editorNode.setProperty(keyName, new game.Point(this.editor.activeNode[keyName].x, value));
    },

    nodePropertyChanged: function(key) {
        this.editor.activeNode._editorNode.setProperty(key, this.editor.world.findNode(this.settingsWindow.inputs[key].value));
    },

    easingPropertyChanged: function(key) {
        this.editor.activeNode._editorNode.setProperty(key, game.Tween.Easing.getByName(this.settingsWindow.inputs[key].value));
    },

    enumPropertyChanged: function(key) {
        this.editor.activeNode._editorNode.setProperty(key, this.settingsWindow.inputs[key].value);
    },

    imagePropertyChanged: function(key) {
        this.focusOnCanvas();
        this.editor.activeNode._editorNode.setProperty(key, this.settingsWindow.inputs[key].value);
    },

    triggerPropertyChanged: function(key) {
        this.editor.activeNode._editorNode.setProperty(key, this.settingsWindow.inputs[key].value);
    },

    colorPropertyChanged: function(key) {
        var value = this.settingsWindow.inputs[key].value;
        if (value.length <= 0) {
            value = 0xffffff;
        }
        else {
            value = parseInt('0x'+value.substr(1));
            if (isNaN(value)) value = 0xffffff;
        }
        this.editor.activeNode._editorNode.setProperty(key, value);
    },

    show: function() {
        this.layerWindow.show();
        this.settingsWindow.show();
    },

    hide: function() {
        this.layerWindow.hide();
        this.settingsWindow.hide();
    }
});

});
