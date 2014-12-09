game.module(
    'bamboo.editor.propertypanel'
)
.body(function() {

game.bamboo.PropertyPanel = game.Class.extend({
    width: 200,
    layerWindowHeight: 389,

    init: function(editor) {
        this.editor = editor;
        
        this.propertyWindow = game.bamboo.ui.addWindow({
            id: 'properties',
            minY: this.editor.menuBar.height,
            resizable: true,
            snappable: true,
            closeable: true
        });
        this.propertyWindow.show();

        this.layerWindow = game.bamboo.ui.addWindow({
            id: 'layers',
            minY: this.editor.menuBar.height,
            resizable: true,
            snappable: true,
            closeable: true,
            minHeight: 150
        });
        this.layerWindow.setTitle('Layers');
        this.layerWindow.show();

        // Create layer list
        this.layerList = document.createElement('select');
        this.layerList.className = 'list';
        this.layerList.size = 6;
        this.layerList.addEventListener('click', this.layerSelectionChanged.bind(this), false);

        var buttonsDiv = document.createElement('div');
        buttonsDiv.className = 'buttonContainer';

        var layerButton = document.createElement('div');

        layerButton.className = 'button image';
        layerButton.innerHTML = '<img src="src/bamboo/editor/media/blue-document--plus.png">';
        layerButton.addEventListener('click', this.newLayerClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        layerButton = document.createElement('div');
        layerButton.className = 'button image';
        layerButton.innerHTML = '<img src="src/bamboo/editor/media/arrow-090.png">';
        layerButton.addEventListener('click', this.moveLayerUpClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        layerButton = document.createElement('div');
        layerButton.className = 'button image';
        layerButton.innerHTML = '<img src="src/bamboo/editor/media/arrow-270.png">';
        layerButton.addEventListener('click', this.moveLayerDownClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        layerButton = document.createElement('div');
        layerButton.className = 'button image';
        layerButton.innerHTML = '<img src="src/bamboo/editor/media/cross.png">';
        layerButton.addEventListener('click', this.deleteLayerClicked.bind(this), false);
        buttonsDiv.appendChild(layerButton);

        // layerButton = document.createElement('div');
        // layerButton.className = 'button image last';
        // layerButton.innerHTML = '<img src="src/bamboo/editor/media/gear.png">';
        // layerButton.addEventListener('click', this.showLayerSettings.bind(this), false);
        // buttonsDiv.appendChild(layerButton);

        this.layerWindow.onResize = this.layerWindowResize.bind(this);
        this.layerWindowResize();

        this.layerSettingsWindow = game.bamboo.ui.addWindow({
            id: 'layerSettings',
            minY: this.editor.menuBar.height,
            resizable: true,
            snappable: true,
            closeable: true
        });
        this.layerSettingsWindow.setTitle('Layer settings');

        this.layerWindow.contentDiv.appendChild(this.layerList);
        this.layerWindow.contentDiv.appendChild(buttonsDiv);
    },

    showLayerSettings: function() {
        this.layerSettingsWindow.show();
    },

    layerWindowResize: function() {
        this.layerList.style.height = (this.layerWindow.height - 101) + 'px';
    },

    updateLayerList: function() {
        this.layerList.innerHTML = '';
        for (var i = 0; i < this.editor.layers.length; i++) {
            var opt = document.createElement('option');
            opt.value = this.editor.layers[i].name;
            opt.innerHTML = this.editor.layers[i].name;
            this.layerList.appendChild(opt);
        }

        if (this.editor.activeLayer) this.activeLayerChanged(this.editor.activeLayer);
    },

    showSettings: function() {
        this.propertyWindow.clear();
        this.propertyWindow.setTitle('Properties');

        this.propertyWindow.addInputText('name', this.editor.scene.name, 'Name', '', this.settingsChanged.bind(this, 'name'));
        this.propertyWindow.addInputText('width', this.editor.scene.width, 'Width', '', this.settingsChanged.bind(this, 'width'));
        this.propertyWindow.addInputText('height', this.editor.scene.height, 'Height', '', this.settingsChanged.bind(this, 'height'));

        for (var name in this.editor.scene.properties) {
            this.propertyWindow.addInputText(name, this.editor.scene.properties[name], name, '', this.settingsChanged.bind(this, name));
        }
        
        this.updateLayerList();
    },

    settingsChanged: function(key) {
        var value = this.propertyWindow.inputs[key].value;

        if (key === 'name') {
            this.editor.scene.name = value;
        }
        else if (key === 'width') {
            this.editor.scene.width = parseInt(value) || this.editor.scene.width;
            this.propertyWindow.inputs[key].value = this.editor.scene.width;
            this.editor.boundaryLayer.resetGraphics();
        }
        else if (key === 'height') {
            this.editor.scene.height = parseInt(value) || this.editor.scene.height;
            this.propertyWindow.inputs[key].value = this.editor.scene.height;
            this.editor.boundaryLayer.resetGraphics();
        }
        else {
            if (typeof this.editor.scene.properties[key] !== 'undefined') {
                this.editor.scene.properties[key] = parseFloat(value) || value;
            }
        }
        this.focusOnCanvas();
    },

    activeLayerChanged: function(layer) {
        var self = this;
        this.layerList.value = layer.name;

        this.layerSettingsWindow.clear();

        this.layerSettingsWindow.addInputText('name', layer.name, 'Name', 'Name of the layer', function() {layer.editorNode.setProperty('name', this.inputs['name'].value); self.updateLayerList();});

        this.layerSettingsWindow.addInputSelect('activeNode', 'Active node', 'Active node', function() {
            self.editor.controller.setActiveNode(self.editor.scene.findNode(this.inputs['activeNode'].value));
            self.focusOnCanvas();
        });
        this.editor.buildNodeDropdown(this.layerSettingsWindow, 'activeNode', layer);
        if (!this.editor.activeNode)
            this.layerSettingsWindow.setInputSelectValue('activeNode', '');
        else
            this.layerSettingsWindow.setInputSelectValue('activeNode', this.editor.activeNode.name);

        this.layerSettingsWindow.addInputCheckbox('visible', layer.editorNode.visible, 'Visible', 'Is layer visible in editor', function() {
            layer.editorNode.setVisibility(this.inputs['visible'].checked);
            self.focusOnCanvas();
        });

        this.layerSettingsWindow.addInputCheckbox('fixed', layer.fixed, 'Fixed position', '', function() {
            layer.fixed = this.inputs['fixed'].checked;
            self.editor.updateLayers();
            self.focusOnCanvas();
        });
        
        this.layerSettingsWindow.addMultiInput('speedFactor', [layer.speedFactor.x, layer.speedFactor.y], 2, 'Speed', '', function() {
            layer.speedFactor.set(
                parseFloat(this.inputs['speedFactor.0'].value),
                parseFloat(this.inputs['speedFactor.1'].value)
            );
        });
    },

    layerSelectionChanged: function() {
        this.editor.controller.setActiveLayer(this.editor.findNode(this.layerList.value));
        this.editor.controller.setActiveNode();
        this.focusOnCanvas();
        this.editor.activeNodeChanged();
    },

    focusOnCanvas: function() {
        if (document.activeElement !== document.body) document.activeElement.blur();
    },

    newLayerClicked: function() {
        var node = this.editor.controller.createNode('Layer', {
            name: 'Layer',
            parent: this.editor.scene.name
        });
        node.initProperties();
        this.editor.nodeAdded(node);
        this.focusOnCanvas();

        this.editor.nodesWindow.inputs['parent'].innerHTML = '';
        this.editor.buildNodeDropdown(this.editor.nodesWindow, 'parent', this.editor.scene);
        this.editor.controller.setActiveNode();
        this.editor.activeNodeChanged();
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
        if (!node) {
            return this.showSettings();
        }

        this.activeElement = null;
        if (this.node) {
            this.node.editorNode.removePropertyChangeListener(this.propertyChanged.bind(this));
            this.props = null;
        }

        this.node = node;
        this.propertyWindow.clear();
        this.propertyWindow.setTitle('Properties');

        this.layerSettingsWindow.setInputSelectValue('activeNode', node.name);
        this.node.editorNode.addPropertyChangeListener(this.propertyChanged.bind(this));
        
        this.propertyWindow.addText(this.node.editorNode.getClassName() + '<br><br>');

        var props = node.getProperties();
        for (var i = props.length - 1; i >= 0; i--) {
            var name = props[i];
            var type = node.getPropertyType(name);

            if (type === 'number') {
                this.propertyWindow.addInputText(name, node[name], name, null, this.numberPropertyChanged.bind(this));
            }
            else if (type === 'string') {
                this.propertyWindow.addInputText(name, node[name], name, null, this.textPropertyChanged.bind(this));
            }
            else if (type === 'boolean') {
                this.propertyWindow.addInputCheckbox(name, node[name], name, null, this.booleanPropertyChanged.bind(this));
            }
            else if (type === 'array') {

            }
            else if (type === 'vector') {
                this.propertyWindow.addMultiInput(name, [node[name].x, node[name].y], 2, name, null, this.vectorPropertyChanged.bind(this));
            }
        }
        return;

        var props = node.getPropertyClasses();
        this.props = props;
        for (var key in props) {
            if (props[key].hidden) continue;

            if (props[key].type === 'number') {
                this.propertyWindow.addInputText(key, parseFloat(node[key]) || 0, props[key].name, null, this.numberPropertyChanged.bind(this));
            }                
            else if (props[key].type === 'string') {
                this.propertyWindow.addInputText(key, node[key], props[key].name, null, this.textPropertyChanged.bind(this));
            }
            else if (props[key].type === 'angle') {
                this.propertyWindow.addInputText(key, ((180 * node[key]) / Math.PI), props[key].name, null, this.anglePropertyChanged.bind(this));
            }
            else if (props[key].type === 'boolean') {
                this.propertyWindow.addInputCheckbox(key, node[key], props[key].name, null, this.booleanPropertyChanged.bind(this));
            }
            else if (props[key].type === 'vector') {
                this.propertyWindow.addMultiInput(key, [node[key].x, node[key].y], 2, props[key].name, null, this.vectorPropertyChanged.bind(this));
            }
            else if (props[key].type === 'node') {
                this.propertyWindow.addInputSelect(key, props[key].name, null, this.nodePropertyChanged.bind(this));
                this.editor.buildNodeDropdown(this.propertyWindow, key, this.editor.scene);
                if (node[key]) this.propertyWindow.setInputSelectValue(key, node[key].name);
                else this.propertyWindow.setInputSelectValue(key, '');
            }
            else if (props[key].type === 'array') {
                throw 'cannot edit array type properties';
            }
            else if (props[key].type === 'easing') {
                this.propertyWindow.addInputSelect(key, props[key].name, null, this.easingPropertyChanged.bind(this));
                var easings = game.Tween.Easing.getNamesList();
                for (var i = 0; i < easings.length; i++) {
                    this.propertyWindow.addInputSelectOption(key, easings[i], easings[i]);
                }
                this.propertyWindow.setInputSelectValue(key, game.Tween.Easing.getName(node[key]));
            }
            else if (props[key].type === 'enum') {
                this.propertyWindow.addInputSelect(key, props[key].name, null, this.enumPropertyChanged.bind(this));
                for (var i = 0; i < props[key].options.length; i++) {
                    this.propertyWindow.addInputSelectOption(key, props[key].options[i], props[key].options[i]);
                }
                this.propertyWindow.setInputSelectValue(key, node[key]);
            }
            else if (props[key].type === 'image') {
                this.propertyWindow.addInputSelect(key, props[key].name, null, this.imagePropertyChanged.bind(this));
                var images = this.editor.scene.assets;
                for (var i = 0; i < images.length; i++) {
                    var name = images[i];
                    if (name.indexOf('png') !== -1 || name.indexOf('jpg') !== -1) {
                        this.propertyWindow.addInputSelectOption(key, name, name);
                    }
                }
                this.propertyWindow.setInputSelectValue(key, node[key]);
            }
            else if (props[key].type === 'json') {
                this.propertyWindow.addInputSelect(key, props[key].name, null, this.imagePropertyChanged.bind(this));
                var images = this.editor.scene.assets;
                for (var i = 0; i < images.length; i++) {
                    var name = images[i];
                    if (name.indexOf('json') !== -1) {
                        this.propertyWindow.addInputSelectOption(key, name, name);
                    }
                }
                this.propertyWindow.setInputSelectValue(key, node[key]);
            }
            else if (props[key].type === 'audio') {
                this.propertyWindow.addInputSelect(key, props[key].name, null, this.imagePropertyChanged.bind(this));
                var audio = this.editor.scene.audio;
                for (var i = 0; i < audio.length; i++) {
                    var name = audio[i];
                    this.propertyWindow.addInputSelectOption(key, name, name);
                }
                this.propertyWindow.setInputSelectValue(key, node[key]);
            }
            else if (props[key].type === 'trigger') {
                this.propertyWindow.addInputSelect(key, props[key].name, null, this.triggerPropertyChanged.bind(this));
                for(var n in this.editor.scene.triggers) {
                    this.propertyWindow.addInputSelectOption(key, n, n);
                }
                this.propertyWindow.setInputSelectValue(key, node[key]);
            }
            else if (props[key].type === 'color') {
                this.propertyWindow.addInputColor(key, '#' + node[key].toString(16), props[key].name, null, this.colorPropertyChanged.bind(this));
            }
        }
    },

    propertyChanged: function(name, value) {
        var type = this.node.getPropertyType(name);

        if (type === 'number') {
            this.propertyWindow.inputs[name].value = parseFloat(value);
        }
        else if (type === 'angle') {
            this.propertyWindow.inputs[name].value = ((180.0 * parseFloat(value)) / Math.PI);
        }
        else if (type === 'boolean') {
            this.propertyWindow.inputs[name].checked = value;
        }
        else if (type === 'vector') {
            this.propertyWindow.inputs[name + '.0'].value = value.x;
            this.propertyWindow.inputs[name + '.1'].value = value.y;
        }
        else if (type === 'node') {
            this.propertyWindow.inputs[name].value = value.name;
        }
        else if (type === 'array') {
            // do nothing
        }
        else if (type === 'easing') {
            this.propertyWindow.inputs[name].value = game.Tween.Easing.getName(value);
        }
        else if (type === 'color') {
            this.propertyWindow.inputs[name].value = '#' + value.toString(16);
        }
        else {
            this.propertyWindow.inputs[name].value = value;
        }
    },

    numberPropertyChanged: function(key) {
        var value = parseFloat(this.propertyWindow.inputs[key].value);
        this.editor.activeNode.editorNode.setProperty(key, value);
    },

    textPropertyChanged: function(key) {
        var value = this.propertyWindow.inputs[key].value;
        if (key === 'name') value = this.editor.getUniqueName(value);

        this.editor.activeNode.editorNode.setProperty(key, value);
    },

    anglePropertyChanged: function(key) {
        var value = parseFloat(this.propertyWindow.inputs[key].value);
        if(this.props[key].options && this.props[key].options.loop360)
            value = ((value % 360) + 360) % 360;
        this.editor.activeNode.editorNode.setProperty(key, value*Math.PI / 180);
    },

    booleanPropertyChanged: function(key) {
        this.editor.activeNode.editorNode.setProperty(key, this.propertyWindow.inputs[key].checked);
        this.focusOnCanvas();
    },

    vectorPropertyChanged: function(key) {
        var value = parseFloat(this.propertyWindow.inputs[key].value);
        var parts = key.split('.');
        var i = parts[parts.length - 1];
        var keyName = key.slice(0, key.length - 1 - i.length);
        if (i === '0')
            this.editor.activeNode.editorNode.setProperty(keyName, new game.Point(value, this.editor.activeNode[keyName].y));
        else if (i === '1')
            this.editor.activeNode.editorNode.setProperty(keyName, new game.Point(this.editor.activeNode[keyName].x, value));
    },

    nodePropertyChanged: function(key) {
        this.editor.activeNode.editorNode.setProperty(key, this.editor.scene.findNode(this.propertyWindow.inputs[key].value));
        this.focusOnCanvas();
    },

    easingPropertyChanged: function(key) {
        this.editor.activeNode.editorNode.setProperty(key, game.Tween.Easing.getByName(this.propertyWindow.inputs[key].value));
        this.focusOnCanvas();
    },

    enumPropertyChanged: function(key) {
        this.editor.activeNode.editorNode.setProperty(key, this.propertyWindow.inputs[key].value);
    },

    imagePropertyChanged: function(key) {
        this.focusOnCanvas();
        this.editor.activeNode.editorNode.setProperty(key, this.propertyWindow.inputs[key].value);
    },

    triggerPropertyChanged: function(key) {
        this.editor.activeNode.editorNode.setProperty(key, this.propertyWindow.inputs[key].value);
    },

    colorPropertyChanged: function(key) {
        var value = this.propertyWindow.inputs[key].value;
        if (value.length <= 0) {
            value = 0xffffff;
        }
        else {
            value = parseInt('0x'+value.substr(1));
            if (isNaN(value)) value = 0xffffff;
        }
        this.editor.activeNode.editorNode.setProperty(key, value);
    },

    show: function() {
        this.layerWindow.show();
        this.propertyWindow.show();
    },

    hide: function() {
        this.layerWindow.hide();
        this.propertyWindow.hide();
    }
});

});
