game.module(
    'bamboo.editor.editor'
)
.body(function() {

bamboo.Editor = game.Class.extend({
    nodes: [],
    layers: [],
    selectedNodes: [],
    images: [],
    windowsHidden: false,
    viewNodes: true,
    camera: {},

    init: function(data) {
        if (!data) {
            data = bamboo.World.defaultJSON;
            data.width = game.System.width;
            data.height = game.System.height;
        }

        this.world = new bamboo.World(data);
        game.system.stage.setBackgroundColor(parseInt(this.world.bgcolor));

        bamboo.console = new bamboo.Console();

        this.gridSize = game.storage.get('gridSize', 16);

        this.camera.position = new game.Point();
        this.displayObject = new game.Container();
        this.controller = new bamboo.Controller(this);
        this.prevMousePos = new game.Point(game.system.width / 2, game.system.height / 2);
        
        this.worldTargetPos = new game.Point(game.system.width / 2 - game.System.width / 2, game.system.height / 2 - game.System.height / 2);
        this.world.displayObject.position.set(~~this.worldTargetPos.x, ~~this.worldTargetPos.y);
        this.displayObject.addChild(this.world.displayObject);
        
        this.overlay = new game.Container();
        this.displayObject.addChild(this.overlay);

        this.nodeLayer = new game.Container();
        this.displayObject.addChild(this.nodeLayer);

        this.targetCameraWorldPosition = this.worldTargetPos.clone();
        
        this.boundaryLayer = new bamboo.BoundaryLayer(this);
        this.overlay.addChild(this.boundaryLayer.displayObject);

        this.menuBar = new bamboo.MenuBar(this);
        // this.statusBar = new bamboo.StatusBar();
        this.propertyPanel = new bamboo.PropertyPanel(this);

        this.tempMessage = new game.Text('', { font: '16px Arial', fill: 'white' });
        this.tempMessage.position.set(10, this.menuBar.height + 10);
        this.overlay.addChild(this.tempMessage);

        this.changeMode('Main');
        this.cameraWorldPosition = new game.Point(
            this.worldTargetPos.x - this.camera.position.x,
            this.worldTargetPos.y - this.camera.position.y
        );

        this.initNodes();
        this.initNodeProperties();

        // Error window
        this.errorWindow = bamboo.ui.addWindow({
            width: 400,
            height: 120,
            closeable: true,
            fixed: true
        });
        this.errorWindow.setTitle('Error');

        // About window
        this.aboutWindow = bamboo.ui.addWindow({
            width: 400,
            height: 125,
            closeable: true
        });
        this.aboutWindow.setTitle('About');
        this.aboutWindow.addText('Bamboo scene editor ' + bamboo.version);
        this.aboutWindow.addText('Developed by <a href="http://github.com/ekelokorpi" target="_blank">Eemeli Kelokorpi</a> and <a href="http://github.com/ezzkoram" target="_blank">Esko Oramaa</a>.');
        this.aboutWindow.addText('<br>');
        this.aboutWindow.addText('Released under the <a href="http://opensource.org/licenses/MIT" target="_blank">MIT License</a>.');
        
        // Assets window
        var assetsWindow = bamboo.ui.addWindow({
            id: 'assets',
            resizable: true,
            snappable: true,
            closeable: true,
            visible: true,
            minY: this.menuBar.height
        });
        assetsWindow.setTitle('Assets');

        var assetsList = document.createElement('select');
        this.assetsList = assetsList;
        assetsWindow.onResize = function() {
            assetsList.style.height = (assetsWindow.height - 100) + 'px';
        };
        assetsWindow.onResize();
        this.assetsList.className = 'assetsList';
        this.assetsList.style.overflow = 'auto';
        assetsWindow.contentDiv.appendChild(this.assetsList);

        assetsWindow.addButton('Add', this.addAsset.bind(this, this.assetsList));
        assetsWindow.addButton('Remove', this.removeAsset.bind(this, this.assetsList));
        this.updateAssetsList();

        // Nodes window
        this.nodesWindow = bamboo.ui.addWindow({
            id: 'nodes',
            closeable: true,
            resizable: true,
            snappable: true,
            minY: this.menuBar.height
        });
        this.nodesWindow.setTitle('Nodes');
        this.nodesWindow.addInputSelect('type', 'Type');

        for (var name in bamboo.nodes) {
            this.nodesWindow.addInputSelectOption('type', name, name);
        }

        this.nodesWindow.setInputSelectValue('type', 'Image');

        this.nodesWindow.addInputSelect('parent', 'Parent', 'Node that this node will follow');
        this.buildNodeDropdown(this.nodesWindow, 'parent', this.world);

        this.nodesWindow.addButton('Add', this.addNode.bind(this));
        this.nodesWindow.show();

        // Camera window
        this.cameraWindow = bamboo.ui.addWindow({
            id: 'camera',
            resizable: true,
            closeable: true,
            snappable: true
        });
        this.cameraWindow.setTitle('Camera');
        this.cameraWindow.addMultiInput('position', [this.camera.position.x, this.camera.position.y], 2, 'Position', '', this.updateCameraPosition.bind(this));

        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].name === 'main') {
                this.activeLayer = null;
                this.controller.setActiveLayer(this.layers[i]);
                break;
            }
        }

        this.updateLayers();
        this.showSettings();
        this.initShadow();

        bamboo.console.log('Scene ' + this.world.name + ' loaded');
    },

    addAsset: function() {
        var input = document.createElement('input');
        input.type = 'file';
        input.onchange = this.addAssetInputChange.bind(this, input);
        input.click();
    },

    addAssetInputChange: function(input) {
        this.loadFiles(input.files);
    },

    updateCameraPosition: function() {
        this.camera.position.x = this.cameraWindow.inputs['position.0'].value;
        this.camera.position.y = this.cameraWindow.inputs['position.1'].value;
        this.cameraWorldPosition = this.cameraWorldPosition;
    },

    changeGrid: function() {
        if (this.mode.shiftDown) {
            this.gridSize /= 2;
            if (this.gridSize === 0) this.gridSize = 128;
            if (this.gridSize === 4) this.gridSize = 0;
        }
        else {
            this.gridSize *= 2;
            if (this.gridSize === 0) this.gridSize = 8;
            if (this.gridSize > 128) this.gridSize = 0;
        }
        game.storage.set('gridSize', this.gridSize);

        if (this.gridSize > 0) this.setTempMessage('Grid ' + this.gridSize + ' x ' + this.gridSize);
        else this.setTempMessage('Grid disabled');

        this.boundaryLayer.resetGraphics();
    },

    toggleBoundaries: function() {
        this.boundaryLayer.boundaries.visible = !this.boundaryLayer.boundaries.visible;
        this.setTempMessage('Boundaries ' + (this.boundaryLayer.boundaries.visible ? 'on' : 'off'));
    },

    initShadow: function() {
        this.shadow = document.createElement('div');
        this.shadow.style.position = 'absolute';
        this.shadow.style.left = '0px';
        this.shadow.style.top = '0px';
        this.shadow.style.width = '100%';
        this.shadow.style.height = '100%';
        this.shadow.style.backgroundColor = 'rgba(0,0,0,0.5)';
        this.shadow.style.zIndex = 10;
        this.shadow.style.textAlign = 'center';
        this.shadow.style.lineHeight = window.innerHeight + 'px';
        this.shadow.style.display = 'none';
        this.shadow.style.pointerEvents = 'none';
        document.body.appendChild(this.shadow);
    },

    updateCameraWindow: function() {
        var x = this.camera.position.x;
        var y = this.camera.position.y;
        this.cameraWindow.inputs['position.0'].value = x;
        this.cameraWindow.inputs['position.1'].value = y;
    },

    resetCamera: function() {
        this.cameraWorldPosition = new game.Point(this.worldTargetPos.x, this.worldTargetPos.y);
        this.updateCameraWindow();
    },

    showShadow: function() {
        this.shadow.style.display = 'block';
    },

    hideShadow: function() {
        this.shadow.style.display = 'none';
    },

    setShadowText: function(text) {
        this.shadow.innerHTML = text;
        return this;
    },

    removeAsset: function(assetsList) {
        if (assetsList.value && confirm('Remove ' + assetsList.value + '?')) {
            var index = this.world.assets.indexOf(assetsList.value);
            if (index !== -1) {
                this.world.assets.splice(index, 1);
                this.updateAssetsList(assetsList);
            }
        }
    },

    updateAssetsList: function() {
        this.assetsList.innerHTML = '';
        this.assetsList.size = 2;
        for (var i = 0; i < this.world.assets.length; i++) {
            var opt = document.createElement('option');
            opt.value = this.world.assets[i];
            opt.innerHTML = this.world.assets[i];
            this.assetsList.appendChild(opt);
        }
    },

    setTempMessage: function(text) {
        bamboo.console.log(text);
        return;
        
        if (this.tempMessageTween) this.tempMessageTween.stop();

        this.tempMessage.alpha = 1;
        this.tempMessage.setText(text);
        this.tempMessage.updateTransform();
        this.tempMessage.position.x = game.system.width / 2 - this.tempMessage.width / 2;
        this.tempMessageTween = game.scene.addTween(this.tempMessage, {
            alpha: 0
        }, 2000).start();
    },

    initNodes: function() {
        var nodes = game.copy(this.world.nodes);
        this.world.nodes.length = 0;

        for (var i = 0; i < nodes.length; i++) {
            this.controller.createNode(nodes[i].class, nodes[i].properties);
            if (nodes[i].properties.image) this.addImage(nodes[i].properties.image);
        }
    },

    initNodeProperties: function() {
        for (var i = 0; i < this.world.nodes.length; i++) {
            this.world.nodes[i].initProperties();
            this.nodeAdded(this.world.nodes[i]);
        }
    },

    addNode: function() {
        this.controller.deselectAllNodes();

        var name = this.getUniqueName(this.nodesWindow.inputs['type'].value);

        var node = this.controller.createNode(this.nodesWindow.inputs['type'].value, {
            name: name,
            parent: this.nodesWindow.inputs['parent'].value
        });

        node.initProperties();
        node._editorNode.layerChanged();
        node._editorNode.ready();

        if (node.displayObject && node.size.x === 0 && node.size.y === 0 && node.displayObject.width > 1 && node.displayObject.height > 1) {
            node._editorNode.setProperty('size', new game.Point(node.displayObject.width, node.displayObject.height));
        }
        if (node.size.x === 0 && node.size.y === 0) {
            node._editorNode.setProperty('size', new game.Point(32, 32));
        }

        this.controller.setActiveNode(node);
        this.propertyPanel.updateLayerList();
        this.changeState('Move');

        var parentPos = node.parent.getWorldPosition();
        var pos = this.toWorldSpace(this.prevMousePos);
        this.mode.state.offset.x -= pos.x - parentPos.x;
        this.mode.state.offset.y -= pos.y - parentPos.y;
        this.mode.state.update(this.prevMousePos.x, this.prevMousePos.y);

        this.nodesWindow.inputs['parent'].innerHTML = '';
        this.buildNodeDropdown(this.nodesWindow, 'parent', this.world);
    },

    toggleViewNodes: function() {
        this.viewNodes = !this.viewNodes;
        this.setTempMessage('Nodes ' + (this.viewNodes ? 'visible' : 'hidden'));
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].parentSelectionRect.visible = this.viewNodes;
            this.nodes[i].connectedToLine.visible = this.viewNodes;
            this.nodes[i].nameText.visible = this.viewNodes;
            this.nodes[i].debugDisplayObject.visible = this.viewNodes;
        }
    },

    showError: function(error) {
        this.errorWindow.clear();
        this.errorWindow.addText(error);
        this.errorWindow.show();
    },

    hideError: function() {
        this.errorWindow.hide();
    },

    updateLayers: function() {
        var layer;
        for (var i = 0; i < this.layers.length; i++) {
            layer = this.layers[i];
            if (layer.fixed) {
                layer.displayObject.position.set(layer.position.x, layer.position.y);
                layer._editorNode.displayObject.position.set(layer.position.x, layer.position.y);
                continue;
            }
            layer.displayObject.position.set(
                Math.round(layer.position.x + this.camera.position.x * -layer.speedFactor.x),
                Math.round(layer.position.y + this.camera.position.y * -layer.speedFactor.y)
            );
            layer._editorNode.displayObject.position.set(
                layer.position.x + this.camera.position.x * -layer.speedFactor.x,
                layer.position.y + this.camera.position.y * -layer.speedFactor.y
            );
        }
    },

    changeMode: function(mode, param) {
        if (this.mode) this.mode.exit();
        if (this.mode && this.mode.state) this.mode.state.exit();
        this.mode = new bamboo.editor['Mode' + mode.ucfirst()](this, param);
        this.mode.enter();
        this.updateStatus();
    },

    changeState: function(state, param) {
        if (this.mode.state) this.mode.state.exit();
        this.mode.state = new bamboo.editor['State' + state.ucfirst()](this.mode, param);
        this.mode.state.enter();
        this.updateStatus();
    },

    updateStatus: function() {
        return;
        var status = this.mode.helpText;
        if (this.mode.state) status += '<br>' + this.mode.state.helpText;
        this.statusBar.setStatus(status);
    },

    exit: function() {
        bamboo.ui.removeAll();
    },

    getUniqueName: function(name) {
        if (!this.findNode(name)) return name;

        name = name.replace(/[0-9]/g, '');

        var i = 2;
        while (true) {
            var newName = name + i;
            if (!this.world.findNode(newName)) return newName;
            i++;
        }
    },

    findNodesInside: function(rect, layer) {
        var nodes = [];
        for (var i = 0; i < this.nodes.length; i++) {
            var n = this.nodes[i];
            if (n.layer !== layer || n.node instanceof bamboo.nodes.Layer) continue;
            n = n.node;

            var a = [];
            var pos = n.getWorldPosition();
            pos.x -= n.anchor.x * n.size.x;
            pos.y -= n.anchor.y * n.size.y;
            a.push(new game.Point(pos.x, pos.y));
            a.push(new game.Point(pos.x, pos.y + n.size.y));
            a.push(new game.Point(pos.x + n.size.x, pos.y));
            a.push(new game.Point(pos.x + n.size.x, pos.y + n.size.y));
            
            for (var j = 0; j < 4; j++) {
                if (a[j].x >= rect.tl.x && a[j].x <= rect.br.x &&
                    a[j].y >= rect.tl.y && a[j].y <= rect.br.y) {
                    nodes.push(n);
                    break;
                }
            }
        }
        return nodes;
    },

    nodeAdded: function(node) {
        node._editorNode.updateRect();
        node._editorNode.layerChanged();
        node._editorNode.ready();
        if (node instanceof bamboo.nodes.Layer) {
            this.layers.push(node);
            this.layerAdded(node);
        }
        else {
            // force update for node-list
            if (this.activeLayer) this.propertyPanel.activeLayerChanged(this.activeLayer);
        }
    },

    nodeRemoved: function(node) {
        if (node instanceof bamboo.nodes.Layer) {
            var idx = this.layers.indexOf(node);
            this.layers.splice(idx, 1);
            this.layerRemoved(node);
        }
        else {
            // force update for node-list
            this.propertyPanel.activeLayerChanged(this.activeLayer);
        }
        this.nodesWindow.inputs['parent'].innerHTML = '';
        this.buildNodeDropdown(this.nodesWindow, 'parent', this.world);
    },

    nodeSelected: function(node) {
    },

    nodeDeselected: function(node) {
    },

    layerAdded: function(layer) {
        this.controller.setActiveLayer(layer);
        this.propertyPanel.updateLayerList();
    },

    layerRemoved: function(layer) {
        this.propertyPanel.updateLayerList();
    },

    addImage: function(name) {
        if (this.images.indexOf(name) !== -1) return;
        this.images.push(name);
        this.images.sort();
        if (this.activeNode) this.propertyPanel.activeNodeChanged(this.activeNode);
    },

    activeNodeChanged: function(node) {
        this.propertyPanel.activeNodeChanged(node);

        if (node) {
            this.nodesWindow.setInputSelectValue('parent', node.name);
        }
        else {
            this.nodesWindow.setInputSelectValue('parent', this.activeLayer.name);
        }
    },

    showSettings: function() {
        this.propertyPanel.showSettings();
    },

    getNodesInLayer: function(layer) {
        var nodes = [];
        for (var i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].layer === layer) nodes.push(this.nodes[i]);
        }
        return nodes;
    },

    getNodeAt: function(point, layer) {
        var pos = this.toWorldSpace(point);

        for (var i = this.nodes.length - 1; i >= 0; i--) {
            var _editorNode = this.nodes[i];
            
            if (!_editorNode.layer) continue;
            if (layer && _editorNode.layer !== layer) continue;

            var node = _editorNode.node;
            if (node instanceof bamboo.nodes.Layer) continue;
            
            var loc = node.getWorldPosition();
            loc.x -= node.size.x * node.anchor.x;
            loc.y -= node.size.y * node.anchor.y;

            var parent = node.parent;
            while (parent) {
                if (parent.speedFactor) {
                    loc.x += this.camera.position.x + parent.displayObject.position.x;
                    loc.y += this.camera.position.y + parent.displayObject.position.y;
                }
                parent = parent.parent;
            }
        
            if (pos.x >= loc.x && pos.x <= loc.x + node.size.x &&
               pos.y >= loc.y && pos.y <= loc.y + node.size.y) {
                return node;
            }
        }
    },

    getNextNodeAt: function(p, layer, node) {
        // far enough flags z-order, so when finding next node, we first
        // loop until we find the 'starting' node, and start searching from that
        // TODO: we could probably use indexOf to find the starting index instead of looping
        var farEnough = false;
        for (var i=this.nodes.length-1; i>=0; i--) {
            if (!farEnough) {
                if (this.nodes[i] === node)
                    farEnough = true;
                continue;
            }

            var n = this.nodes[i];
            if (layer && n.layer !== layer)
                continue;

            var l = n.node.toLocalSpace(p);
            var r = n._cachedRect;
            var sx = 6/n.node.scale.x;
            var sy = 6/n.node.scale.y;
            if (l.x >= r.x-sx && l.x <= r.x+r.width+sx &&
               l.y >= r.y-sy && l.y <= r.y+r.height+sy) {
                return n.node;
            }
        }
        return null;
    },

    findNode: function(name) {
        for (var i = 0; i < this.world.nodes.length; i++) {
            if (this.world.nodes[i].name === name) return this.world.nodes[i];
        }
    },

    buildNodeDropdown: function(window, key, node) {
        var self = this;
        var addNodeInputOption = function(window, key, node, prefix) {
            var nodes = self.world.getConnectedNodes(node);
            for(var i = 0; i < nodes.length; i++) {
                var p = prefix;
                var np = prefix;
                if (i === nodes.length-1) {
                    p += '┗ ';
                    np += '  ';
                } else {
                    p +=  '┣ ';
                    np += '┃ ';
                }
                window.addInputSelectOption(key, nodes[i].name, p + '[' + nodes[i]._editorNode.getClassName() + '] - ' + nodes[i].name);
                addNodeInputOption(window, key, nodes[i], np);
            }
        };

        var nodes = this.world.getConnectedNodes(node);
        for (var i = 0; i < nodes.length; i++) {
            window.addInputSelectOption(key, nodes[i].name, '[' + nodes[i]._editorNode.getClassName() + '] - ' + nodes[i].name);
            addNodeInputOption(window, key, nodes[i], ' ');
        }
    },

    toWorldSpace: function(point) {
        var x = point.x - this.world.position.x + this.camera.position.x - this.worldTargetPos.x;
        var y = point.y - this.world.position.y + this.camera.position.y - this.worldTargetPos.y;
        return new game.Point(x, y);
    },

    click: function(event) {
        this.mode.click(event);
    },

    mousedown: function(event) {
        this.prevMousePos.x = event.global.x;
        this.prevMousePos.y = event.global.y;
        this.mode.mousedown(event);
    },

    mousemove: function(event) {
        if (this.menuBar.menuElem.active) this.menuBar.menuElem.activate();

        this.prevMousePos.x = event.global.x;
        this.prevMousePos.y = event.global.y;

        if (this.cameraOffset) {
            this.targetCameraWorldPosition.x = event.global.x - this.cameraOffset.x;
            this.targetCameraWorldPosition.y = event.global.y - this.cameraOffset.y;
            this.cameraWorldPosition = this.targetCameraWorldPosition.clone();
        }

        this.mode.mousemove(event);
    },

    mouseup: function(event) {
        this.mode.mouseup(event);
    },

    mouseout: function() {
    },

    keydown: function(key) {
        this.mode.keydown(key);
    },

    keyup: function(key) {
        this.mode.keyup(key);
    },

    filedrop: function(event) {
        this.loadFiles(event.dataTransfer.files);
    },

    loadFiles: function(fileList) {
        var assets = [];
        var audioFilesAdded = 0;
        for (var i = 0; i < fileList.length; i++) {
            var file = fileList[i];

            // Check if file is audio
            var isAudio = false;
            for (var f = 0; f < game.Audio.formats.length; f++) {
                var ext = game.Audio.formats[f].ext;
                if (file.name.indexOf('.' + ext) !== -1) {
                    var filename = 'audio/' + file.name;
                    if (this.world.audio.indexOf(filename) === -1) {
                        this.world.audio.push(filename);
                        this.world.audio.sort();
                        audioFilesAdded++;
                    }
                    isAudio = true;
                    break;
                }
            }
            if (isAudio) continue;

            assets.push(game.config.mediaFolder + '/' + file.name);
        }

        if (audioFilesAdded > 0) {
            var word = audioFilesAdded === 1 ? 'file' : 'files';
            this.setTempMessage(audioFilesAdded + ' audio ' + word + ' added');
        }

        if (assets.length > 0) {
            var loader = new game.AssetLoader(assets);
            loader.onComplete = this.assetsLoaded.bind(this, loader);
            loader.onProgress = this.assetsProgress.bind(this);
            loader.load();
        }
        else {
            if (this.activeNode) this.propertyPanel.activeNodeChanged(this.activeNode);
        }

        return false;
    },

    assetsProgress: function(loader) {
        if (loader.json) game.json[loader.url] = loader.json;
    },

    assetsLoaded: function(loader) {
        var filename;
        var count = 0;
        for (var i = 0; i < loader.assetURLs.length; i++) {
            filename = loader.assetURLs[i].replace(game.config.mediaFolder + '/', '');
            if (this.world.assets.indexOf(filename) === -1) {
                this.world.assets.push(filename);
                count++;
            }
        }
        this.world.assets.sort();
        var word = count === 1 ? 'asset' : 'assets';
        this.setTempMessage(count + ' ' + word + ' added');
        if (this.activeNode) this.propertyPanel.activeNodeChanged(this.activeNode);

        this.updateAssetsList();
    },

    update: function() {
        this.mode.update();
    },

    downloadAsJSON: function() {
        if (this.mode.animationRunning) this.mode.stopAnimation();
        var json = this.world.toJSON();
        var filename = json.name.toLowerCase() + '.json';
        var data = JSON.stringify(json, null, '    ');

        var blob = new Blob([data]);
        game.saveAs(blob, filename);
    },

    saveAsJSON: function() {
        if (this.mode.animationRunning) this.mode.stopAnimation();
        var json = this.world.toJSON();
        var filename = json.name.toLowerCase() + '.json';
        var content = JSON.stringify(json, null, '    ');

        this.saveToFile(bamboo.editor.config.JSONSaveDir || '../../../media/', filename, content);
    },

    downloadAsModule: function() {
        if (this.mode.animationRunning) this.mode.stopAnimation();
        var json = this.world.toJSON();
        var name = json.name.toLowerCase();
        if (!name) return this.showError('Scene must have name');
        var filename = json.name.toLowerCase() + '.js';
        var data = this.buildModuleFromJSON(json);

        var blob = new Blob([data]);
        game.saveAs(blob, filename);
    },

    saveAsModule: function() {
        if (this.mode.animationRunning) this.mode.stopAnimation();
        var json = this.world.toJSON();
        var name = json.name.toLowerCase();
        if (!name) return this.showError('Scene must have name');
        var content = this.buildModuleFromJSON(json);

        this.saveToFile(bamboo.editor.config.moduleSaveDir || '../../game/scenes/', name + '.js', content);
    },

    buildModuleFromJSON: function(json) {
        var name = json.name.toLowerCase();

        var nodeClasses = [];
        for (var i = 0; i < json.nodes.length; i++) {
            if (game.modules['bamboo.runtime.nodes.' + json.nodes[i].class.toLowerCase()]) {
                if (nodeClasses.indexOf(json.nodes[i].class) === -1) {
                    nodeClasses.push(json.nodes[i].class);
                }
            }
        }

        var content = 'game.module(\n    \'game.scenes.' + name + '\'\n)\n';
        content += '.require(\n';
        content += '    \'bamboo.core\',\n';
        for (var i = 0; i < nodeClasses.length; i++) {
            content += '    \'bamboo.runtime.nodes.' + nodeClasses[i].toLowerCase() + '\'';
            if (i < nodeClasses.length - 1) content += ',\n';
        }
        content += '\n)\n';
        content += '.body(function() {\n\n';
        content += 'var json = ' + JSON.stringify(json, null, '    ');
        content += ';\n\nbamboo.scenes.push(json);\n';
        if (json.assets.length > 0) {
           content += 'for (var i = 0; i < json.assets.length; i++) {\n';
           content += '    game.addAsset(json.assets[i]);\n';
           content += '}\n'; 
        }
        if (json.audio.length > 0) {
            content += 'for (var i = 0; i < json.audio.length; i++) {\n';
            content += '    game.addAudio(json.audio[i]);\n';
            content += '}\n';
        }
        content += '\n});\n';

        return content;
    },

    saveToFile: function(folder, filename, content) {
        var query = [];
        query.push('folder=' + encodeURIComponent(folder));
        query.push('filename=' + encodeURIComponent(filename));
        query.push('content=' + encodeURIComponent(content));

        var request = new XMLHttpRequest();
        request.open('POST', 'src/bamboo/editor/save.php');
        request.onreadystatechange = this.saveToFileComplete.bind(this, request, filename);
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        request.send(query.join('&'));
    },

    saveToFileComplete: function(request, filename) {
        if (request.readyState === 4) {
            if (request.responseText === 'success') {
                this.setTempMessage('File saved');
            }
            else this.showError('Failed to write file ' + filename);
        }
    },

    onResize: function() {
        this.boundaryLayer.resetGraphics();
        this.worldTargetPos.set(game.system.width / 2 - game.System.width / 2, game.system.height / 2 - game.System.height / 2);
        this.world.displayObject.position.set(~~this.worldTargetPos.x, ~~this.worldTargetPos.y);
        this.nodeLayer.position.x = game.system.width / 2 - game.System.width / 2;
        this.nodeLayer.position.y = game.system.height / 2 - game.System.height / 2;
        this.shadow.style.lineHeight = window.innerHeight + 'px';
    },

    showAbout: function() {
        this.aboutWindow.show();
    }
});

Object.defineProperty(bamboo.Editor.prototype, 'cameraWorldPosition', {
    get: function() {
        var point = new game.Point(
            this.camera.position.x * -1 + this.worldTargetPos.x,
            this.camera.position.y * -1 + this.worldTargetPos.y
        );
        return point;
    },
    set: function(value) {
        var tgtCamPos = value.subtract(this.worldTargetPos);

        tgtCamPos.multiply(-1);
        this.camera.position.x = tgtCamPos.x;
        this.camera.position.y = tgtCamPos.y;
        this.boundaryLayer.updateBoundary();

        this.nodeLayer.position.x = game.system.width / 2 - game.System.width / 2;
        this.nodeLayer.position.y = game.system.height / 2 - game.System.height / 2;
        this.updateLayers();
        if (this.cameraWindow) this.updateCameraWindow();
    }
});

});
