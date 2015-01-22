game.module(
    'bamboo.editor.sidebar'
)
.body(function() {

game.createClass('BambooSideBar', {
    visible: true,
    width: 220,

    init: function(editor) {
        this.editor = editor;
        
        this.initWindows();
        this.initLayerList();
    },

    initWindows: function() {
        this.propertyWindow = new game.BambooWindow({
            id: 'properties',
            y: this.editor.menuBar.height,
            width: this.width,
            height: 310,
            snappedToEdge: 'right'
        });

        this.nodesWindow = new game.BambooWindow({
            id: 'nodes',
            title: 'Nodes',
            snappedTo: 'properties'
        });

        this.nodesWindow.addInputSelect('type', 'Type');
        for (var name in game.nodes) {
            this.nodesWindow.addInputSelectOption('type', name, name);
        }
        this.nodesWindow.setInputSelectValue('type', 'Image');
        this.nodesWindow.addButton('Add', this.editor.addNode.bind(this.editor));

        this.layerWindow = new game.BambooWindow({
            id: 'layers',
            title: 'Layers',
            snappedTo: 'nodes',
            height: 180
        });

        this.layerSettingsWindow = new game.BambooWindow({
            id: 'layerSettings',
            title: 'Layer settings',
            snappedTo: 'layers'
        });

        this.layerSettingsWindow.addInputText('name', '', 'Name', '', this.layerSettingsChanged.bind(this));
        this.layerSettingsWindow.addInputSelect('activeNode', 'Active node', '', this.layerSettingsChanged.bind(this));
        this.layerSettingsWindow.addInputCheckbox('visible', false, 'Visible', '', this.layerSettingsChanged.bind(this));
        this.layerSettingsWindow.addInputCheckbox('fixed', false, 'Fixed position', '', this.layerSettingsChanged.bind(this));
        this.layerSettingsWindow.addMultiInput('speedFactor', [0, 0], 2, 'Speed', '', this.layerSettingsChanged.bind(this));

        this.assetsWindow = new game.BambooWindow({
            id: 'assets',
            title: 'Assets',
            snappedTo: 'layerSettings'
        });

        this.assetsList = document.createElement('select');
        this.assetsList.style.height = (this.assetsWindow.height - 100) + 'px';
        this.assetsList.className = 'list';
        this.assetsList.style.overflow = 'auto';

        this.assetsWindow.contentDiv.appendChild(this.assetsList);

        this.assetsWindow.addButton('Add', this.editor.addAsset.bind(this.editor, this.assetsList));
        this.assetsWindow.addButton('Remove', this.editor.removeAsset.bind(this.editor, this.assetsList));
        this.updateAssetsList();
    },

    updateAssetsList: function() {
        this.assetsList.innerHTML = '';
        this.assetsList.size = 2;
        for (var i = 0; i < this.editor.scene.assets.length; i++) {
            var opt = document.createElement('option');
            opt.value = this.editor.scene.assets[i];
            opt.innerHTML = this.editor.scene.assets[i];
            this.assetsList.appendChild(opt);
        }
    },

    layerSettingsChanged: function(key) {
        console.log('TODO');
    },

    initLayerList: function() {
        this.layerList = document.createElement('select');
        this.layerList.className = 'list';
        this.layerList.size = 6;
        this.layerList.addEventListener('click', this.layerSelectionChanged.bind(this));

        
        this.layerList.style.height = (this.layerWindow.height - 101) + 'px';

        this.layerWindow.contentDiv.appendChild(this.layerList);
    },

    toggleVisibility: function() {
        this.visible = !this.visible;
        if (this.visible) {
            this.propertyWindow.show();
            this.layerWindow.show();
            this.nodesWindow.show();
        }
        else {
            this.propertyWindow.hide();
            this.layerWindow.hide();
            this.nodesWindow.hide();
        }
        game.bamboo.resize();
    },

    updateLayerList: function() {
        this.layerList.innerHTML = '';

        for (var i = 0; i < this.editor.layers.length; i++) {
            var option = document.createElement('option');
            option.value = this.editor.layers[i].name;
            option.innerHTML = this.editor.layers[i].name;
            this.layerList.appendChild(option);
        }

        this.activeLayerChanged(this.editor.activeLayer);
    },

    showSceneSettings: function() {
        this.propertyWindow.clear();
        this.propertyWindow.setTitle('Properties');

        this.propertyWindow.addInputText('name', this.editor.scene.name, 'Name', '', this.sceneSettingChanged.bind(this, 'name'));
        this.propertyWindow.addInputText('width', this.editor.scene.width, 'Width', '', this.sceneSettingChanged.bind(this, 'width'));
        this.propertyWindow.addInputText('height', this.editor.scene.height, 'Height', '', this.sceneSettingChanged.bind(this, 'height'));

        for (var name in this.editor.scene.properties) {
            this.propertyWindow.addInputText(name, this.editor.scene.properties[name], name, '', this.sceneSettingChanged.bind(this, name));
        }
    },

    sceneSettingChanged: function(key) {
        var value = this.propertyWindow.inputs[key].value;

        if (key === 'name') {
            value = value.replace(/\s/g, '');
            if (value === '') value = 'Untitled';
            this.editor.scene.name = value;
            this.propertyWindow.inputs[key].value = value;
            this.editor.updateDocumentTitle();
        }
        else if (key === 'width') {
            this.editor.scene.width = parseInt(value) || this.editor.scene.width;
            this.propertyWindow.inputs[key].value = this.editor.scene.width;
            this.editor.boundary.updateGrid();
            this.editor.boundary.update();
        }
        else if (key === 'height') {
            this.editor.scene.height = parseInt(value) || this.editor.scene.height;
            this.propertyWindow.inputs[key].value = this.editor.scene.height;
            this.editor.boundary.updateGrid();
            this.editor.boundary.update();
        }
        else {
            if (typeof this.editor.scene.properties[key] !== 'undefined') {
                this.editor.scene.properties[key] = parseFloat(value) || value;
            }
        }
        this.editor.focus();
    },

    activeLayerChanged: function(layer) {
        this.layerList.value = layer.name;
        this.updateLayerSettingsWindow(layer);
    },

    updateLayerSettingsWindow: function(layer) {
        this.editor.buildNodeDropdown(this.layerSettingsWindow, 'activeNode', layer);

        if (!this.editor.activeNode) {
            this.layerSettingsWindow.setInputSelectValue('activeNode', '');
        }
        else {
            this.layerSettingsWindow.setInputSelectValue('activeNode', this.editor.activeNode.name);
        }
    },

    layerSelectionChanged: function() {
        this.editor.controller.setActiveLayer(this.editor.findNode(this.layerList.value));
        this.editor.controller.setActiveNode();
        this.editor.focus();
    },

    newLayerClicked: function() {
        var node = this.editor.controller.createNode('Layer', {
            name: 'Layer',
            parent: this.editor.scene.name
        });
        node.initProperties();
        this.editor.nodeAdded(node);
        this.editor.nodesWindow.inputs['parent'].innerHTML = '';
        this.editor.buildNodeDropdown(this.editor.nodesWindow, 'parent', this.editor.scene);
        this.editor.controller.setActiveNode();
        this.editor.activeNodeChanged();
        this.editor.focus();
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
        if (!node) return this.showSceneSettings();
        this.activeNode = node;
        this.updatePropertyWindow(node);
        this.layerSettingsWindow.setInputSelectValue('activeNode', node.name);
    },

    updatePropertyWindow: function(node) {
        this.propertyWindow.clear();
        this.propertyWindow.setTitle('Properties');        
        // this.propertyWindow.addText(node.editorNode.getClassName() + '<br><br>');

        var props = node.editorNode.getProperties();
        for (var i = props.length - 1; i >= 0; i--) {
            var name = props[i];
            var type = node.editorNode.getPropertyType(name);
            var value = node.editorNode.getPropertyValue(name);

            if (type === 'number') {
                this.propertyWindow.addInputText(name, value, name, null, this.nodePropertyChanged.bind(this, type));
            }
            else if (type === 'string') {
                this.propertyWindow.addInputText(name, value, name, null, this.nodePropertyChanged.bind(this, type));
            }
            else if (type === 'boolean') {
                this.propertyWindow.addInputCheckbox(name, value, name, null, this.nodePropertyChanged.bind(this, type));
            }
            else if (type === 'array') {
                this.propertyWindow.addInputSelect(name, name, null, this.nodePropertyChanged.bind(this, type));
                for (var j = 0; j < value.length; j++) {
                    this.propertyWindow.addInputSelectOption(name, value[j], value[j]);
                }
                this.propertyWindow.setInputSelectValue(name, '');
            }
            else if (type === 'vector') {
                this.propertyWindow.addMultiInput(name, [value.x, value.y], 2, name, null, this.nodePropertyChanged.bind(this, type));
            }
            else if (type === 'spriteSheet') {
                console.log('TODO');
            }
        }
    },

    nodePropertyChanged: function(type, key) {
        var value = this.propertyWindow.inputs[key].value;
        if (type === 'number') value = parseFloat(value);
        this.activeNode.editorNode.setProperty(key, value);
    }
});

});
