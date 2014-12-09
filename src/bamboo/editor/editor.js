game.module(
    'bamboo.editor.editor'
)
.body(function() {

game.bamboo.Editor = game.Class.extend({
    nodes: [],
    layers: [],
    selectedNodes: [],
    images: [],
    windowsHidden: false,
    camera: {},
    zoom: 1,

    init: function(data) {
        if (!data) {
            data = game.BambooScene.defaultJSON;
            data.width = bambooConfig.width || data.width;
            data.height = bambooConfig.height || data.height;
            game.storage.remove('lastScene');
        }
        else {
            game.storage.set('lastScene', data.name);
        }

        this.scene = new game.BambooScene(data);

        this.gridSize = game.storage.get('gridSize', 16);
        this.viewNodes = game.storage.get('viewNodes', true);

        this.camera.position = new game.Point();
        this.displayObject = new game.Container();
        this.displayObject.pivot.x = game.system.width / 2;
        this.displayObject.pivot.y = game.system.height / 2;
        this.displayObject.position.x = game.system.width / 2;
        this.displayObject.position.y = game.system.height / 2;
        
        this.controller = new game.bamboo.Controller(this);
        this.prevMousePos = new game.Point(game.system.width / 2, game.system.height / 2);
        
        this.worldTargetPos = new game.Point(game.system.width / 2 - game.System.width / 2, game.system.height / 2 - game.System.height / 2);
        this.scene.displayObject.position.set(~~this.worldTargetPos.x, ~~this.worldTargetPos.y);
        this.displayObject.addChild(this.scene.displayObject);
        
        this.overlay = new game.Container();
        this.displayObject.addChild(this.overlay);

        this.nodeLayer = new game.Container();
        this.displayObject.addChild(this.nodeLayer);

        this.targetCameraWorldPosition = this.worldTargetPos.clone();
        
        this.boundaryLayer = new game.bamboo.BoundaryLayer(this);
        this.overlay.addChild(this.boundaryLayer.displayObject);

        this.menuBar = new game.bamboo.MenuBar(this);
        this.propertyPanel = new game.bamboo.PropertyPanel(this);

        this.changeMode('Main');
        this.cameraWorldPosition = new game.Point(
            this.worldTargetPos.x - this.camera.position.x,
            this.worldTargetPos.y - this.camera.position.y
        );

        this.initNodes();
        this.initNodeProperties();

        // Error window
        this.errorWindow = game.bamboo.ui.addWindow({
            width: 400,
            height: 120,
            closeable: true,
            fixed: true
        });
        this.errorWindow.setTitle('Error');

        // Assets window
        var assetsWindow = game.bamboo.ui.addWindow({
            id: 'assets',
            resizable: true,
            snappable: true,
            closeable: true,
            visible: true,
            minY: this.menuBar.height,
            minHeight: 200
        });
        assetsWindow.setTitle('Assets');

        var assetsList = document.createElement('select');
        this.assetsList = assetsList;
        assetsWindow.onResize = function() {
            assetsList.style.height = (assetsWindow.height - 100) + 'px';
        };
        assetsWindow.onResize();
        this.assetsList.className = 'list';
        this.assetsList.style.overflow = 'auto';
        assetsWindow.contentDiv.appendChild(this.assetsList);

        assetsWindow.addButton('Add', this.addAsset.bind(this, this.assetsList));
        assetsWindow.addButton('Remove', this.removeAsset.bind(this, this.assetsList));
        this.updateAssetsList();

        // Nodes window
        this.nodesWindow = game.bamboo.ui.addWindow({
            id: 'nodes',
            closeable: true,
            resizable: false,
            snappable: true,
            minY: this.menuBar.height,
            title: 'Nodes'
        });
        this.nodesWindow.addInputSelect('type', 'Type');

        for (var name in game.nodes) {
            this.nodesWindow.addInputSelectOption('type', name, name);
        }

        this.nodesWindow.setInputSelectValue('type', 'Image');

        this.nodesWindow.addInputSelect('parent', 'Parent', 'Node that this node will follow');
        this.buildNodeDropdown(this.nodesWindow, 'parent', this.scene);

        this.nodesWindow.addButton('Add', this.addNode.bind(this));
        this.nodesWindow.show();

        // Camera window
        this.cameraWindow = game.bamboo.ui.addWindow({
            id: 'camera',
            resizable: true,
            closeable: true,
            snappable: true
        });
        this.cameraWindow.setTitle('Camera');
        this.cameraWindow.addMultiInput('position', [this.camera.position.x, this.camera.position.y], 2, 'Position', '', this.updateCameraPosition.bind(this));

        // Set default active layer
        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].name === 'main') {
                this.activeLayer = null;
                this.controller.setActiveLayer(this.layers[i]);
                break;
            }
        }

        this.updateLayers();
        this.initShadow();

        console.log('Scene ' + this.scene.name + ' loaded');
    },

    loadScene: function() {
        if (this.scenesWindow) this.scenesWindow.hide();
        this.scenesWindow = game.bamboo.ui.addWindow({
            title: 'Load scene',
            id: 'scenes',
            closeable: true,
            visible: true,
            fixed: true,
            height: 200,
            centered: true
        });

        var scenesList = document.createElement('select');
        scenesList.style.height = '100px';
        scenesList.size = 2;
        scenesList.className = 'list';
        for (var name in game.scenes) {
            var opt = document.createElement('option');
            opt.value = name;
            opt.innerHTML = name;
            scenesList.appendChild(opt);
        }

        this.scenesWindow.contentDiv.appendChild(scenesList);

        this.scenesWindow.addButton('Load', function() {
            if (scenesList.value) game.scene.loadScene(scenesList.value);
        });
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

        this.boundaryLayer.resetGraphics();
    },

    toggleBoundaries: function() {
        this.boundaryLayer.boundaries.visible = !this.boundaryLayer.boundaries.visible;
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
            var index = this.scene.assets.indexOf(assetsList.value);
            if (index !== -1) {
                this.scene.assets.splice(index, 1);
                this.updateAssetsList(assetsList);
            }
        }
    },

    updateAssetsList: function() {
        this.assetsList.innerHTML = '';
        this.assetsList.size = 2;
        for (var i = 0; i < this.scene.assets.length; i++) {
            var opt = document.createElement('option');
            opt.value = this.scene.assets[i];
            opt.innerHTML = this.scene.assets[i];
            this.assetsList.appendChild(opt);
        }
    },

    initNodes: function() {
        var nodes = game.copy(this.scene.nodes);
        this.scene.nodes.length = 0;

        for (var i = 0; i < nodes.length; i++) {
            this.controller.createNode(nodes[i].class, nodes[i].properties);
            if (nodes[i].properties.image) this.addImage(nodes[i].properties.image);
        }
    },

    initNodeProperties: function() {
        for (var i = 0; i < this.scene.nodes.length; i++) {
            this.scene.nodes[i].initProperties();
            this.nodeAdded(this.scene.nodes[i]);
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
        node.editorNode.layerChanged();
        node.editorNode.ready();

        if (node.displayObject && node.size.x === 0 && node.size.y === 0 && node.displayObject.width > 1 && node.displayObject.height > 1) {
            node.editorNode.setProperty('size', new game.Point(node.displayObject.width, node.displayObject.height));
        }
        if (node.size.x === 0 && node.size.y === 0) {
            node.editorNode.setProperty('size', new game.Point(32, 32));
        }

        this.controller.setActiveNode(node);
        this.propertyPanel.updateLayerList();
        this.changeState('Move');

        var parentPos = node.parent.getGlobalPosition();
        var pos = this.toGlobalSpace(this.prevMousePos);
        this.mode.state.offset.x -= pos.x - parentPos.x;
        this.mode.state.offset.y -= pos.y - parentPos.y;
        this.mode.state.update(this.prevMousePos.x, this.prevMousePos.y);

        this.nodesWindow.inputs['parent'].innerHTML = '';
        this.buildNodeDropdown(this.nodesWindow, 'parent', this.scene);
    },

    toggleViewNodes: function() {
        this.viewNodes = !this.viewNodes;
        game.storage.set('viewNodes', this.viewNodes);
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
                layer.editorNode.displayObject.position.set(layer.position.x, layer.position.y);
                continue;
            }
            layer.displayObject.position.set(
                Math.round(layer.position.x + this.camera.position.x * -layer.speedFactor.x),
                Math.round(layer.position.y + this.camera.position.y * -layer.speedFactor.y)
            );
            layer.editorNode.displayObject.position.set(
                layer.position.x + this.camera.position.x * -layer.speedFactor.x,
                layer.position.y + this.camera.position.y * -layer.speedFactor.y
            );
        }
    },

    changeMode: function(mode, param) {
        if (this.mode) this.mode.exit();
        if (this.mode && this.mode.state) this.mode.state.exit();
        this.mode = new game.bamboo.editor['Mode' + mode.ucfirst()](this, param);
    },

    changeState: function(state, param) {
        if (this.mode.state) this.mode.state.exit();
        this.mode.state = new game.bamboo.editor['State' + state.ucfirst()](this.mode, param);
        this.mode.state.enter();
    },

    exit: function() {
        game.bamboo.ui.removeAll();
    },

    getUniqueName: function(name) {
        if (!this.findNode(name)) return name;

        name = name.replace(/[0-9]/g, '');

        var i = 2;
        while (true) {
            var newName = name + i;
            if (!this.scene.findNode(newName)) return newName;
            i++;
        }
    },

    findNodesInside: function(rect, layer) {
        var nodes = [];
        for (var i = 0; i < this.nodes.length; i++) {
            var n = this.nodes[i];
            if (n.layer !== layer || n.node instanceof game.nodes.Layer) continue;
            n = n.node;

            var a = [];
            var pos = n.getGlobalPosition();
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
        node.editorNode.updateRect();
        node.editorNode.layerChanged();
        node.editorNode.ready();
        if (node instanceof game.nodes.Layer) {
            this.layers.push(node);
            this.layerAdded(node);
        }
        else {
            // force update for node-list
            if (this.activeLayer) this.propertyPanel.activeLayerChanged(this.activeLayer);
        }
    },

    nodeRemoved: function(node) {
        if (node instanceof game.nodes.Layer) {
            var idx = this.layers.indexOf(node);
            this.layers.splice(idx, 1);
            this.layerRemoved(node);
        }
        else {
            // force update for node-list
            this.propertyPanel.activeLayerChanged(this.activeLayer);
        }
        this.nodesWindow.inputs['parent'].innerHTML = '';
        this.buildNodeDropdown(this.nodesWindow, 'parent', this.scene);
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
        var pos = this.toGlobalSpace(point);

        for (var i = this.nodes.length - 1; i >= 0; i--) {
            var editorNode = this.nodes[i];
            
            if (!editorNode.layer) continue;
            if (layer && editorNode.layer !== layer) continue;

            var node = editorNode.node;
            if (node instanceof game.nodes.Layer) continue;
            
            var loc = node.getGlobalPosition();
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
        for (var i = 0; i < this.scene.nodes.length; i++) {
            if (this.scene.nodes[i].name === name) return this.scene.nodes[i];
        }
    },

    buildNodeDropdown: function(window, key, node) {
        var self = this;
        var addNodeInputOption = function(window, key, node, prefix) {
            var nodes = self.scene.getConnectedNodes(node);
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
                window.addInputSelectOption(key, nodes[i].name, p + '[' + nodes[i].editorNode.getClassName() + '] - ' + nodes[i].name);
                addNodeInputOption(window, key, nodes[i], np);
            }
        };

        var nodes = this.scene.getConnectedNodes(node);
        for (var i = 0; i < nodes.length; i++) {
            window.addInputSelectOption(key, nodes[i].name, '[' + nodes[i].editorNode.getClassName() + '] - ' + nodes[i].name);
            addNodeInputOption(window, key, nodes[i], ' ');
        }
    },

    toGlobalSpace: function(point) {
        var x = point.x - this.scene.position.x + this.camera.position.x - this.worldTargetPos.x;
        var y = point.y - this.scene.position.y + this.camera.position.y - this.worldTargetPos.y;
        return new game.Point(x, y);
    },

    click: function(event) {
        this.mode.click(event);
    },

    nodeClick: function(node, event) {
        this.mode.nodeClick(node, event);
    },

    nodeMouseDown: function(node, event) {
        this.mode.nodeMouseDown(node, event);
    },

    mousedown: function(event) {
        this.prevMousePos.x = event.global.x;
        this.prevMousePos.y = event.global.y;
        this.mode.mousedown(event);
    },

    mousemove: function(event) {
        if (this.menuBar.menuElem.active) this.menuBar.menuElem.activate();

        this.prevMousePos.x = (event.global.x / this.zoom);
        this.prevMousePos.y = (event.global.y / this.zoom);

        if (this.cameraOffset) {
            this.targetCameraWorldPosition.x = (event.global.x / this.zoom) - this.cameraOffset.x;
            this.targetCameraWorldPosition.y = (event.global.y / this.zoom) - this.cameraOffset.y;
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
        if (key === 'PLUS') {
            // Zoom in
            this.zoom = this.zoom * 1.2;
            this.displayObject.scale.set(this.zoom, this.zoom);
            return;
        }
        if (key === 'MINUS') {
            // Zoom out
            this.zoom = this.zoom / 1.2;
            this.displayObject.scale.set(this.zoom, this.zoom);
            return;
        }
        if (key === '0') {
            // Reset zoom
            this.zoom = 1;
            this.displayObject.scale.set(this.zoom, this.zoom);
            return;
        }
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
                    if (this.scene.audio.indexOf(filename) === -1) {
                        this.scene.audio.push(filename);
                        this.scene.audio.sort();
                        audioFilesAdded++;
                    }
                    isAudio = true;
                    break;
                }
            }
            if (isAudio) continue;

            assets.push(game.getMediaPath(file.name));
        }

        if (audioFilesAdded > 0) {
            var word = audioFilesAdded === 1 ? 'file' : 'files';
            console.log(audioFilesAdded + ' audio ' + word + ' added');
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
            if (this.scene.assets.indexOf(filename) === -1) {
                this.scene.assets.push(filename);
                count++;
            }
        }
        this.scene.assets.sort();
        var word = count === 1 ? 'asset' : 'assets';
        console.log(count + ' ' + word + ' added');
        if (this.activeNode) this.propertyPanel.activeNodeChanged(this.activeNode);

        this.updateAssetsList();
    },

    update: function() {
        this.mode.update();
    },

    downloadAsJSON: function() {
        if (this.mode.animationRunning) this.mode.stopAnimation();
        var json = this.scene.toJSON();
        var filename = json.name.toLowerCase() + '.json';
        var data = JSON.stringify(json, null, '    ');

        var blob = new Blob([data]);
        game.saveAs(blob, filename);
    },

    saveAsJSON: function() {
        if (this.mode.animationRunning) this.mode.stopAnimation();
        var json = this.scene.toJSON();
        var filename = json.name.toLowerCase() + '.json';
        var content = JSON.stringify(json, null, '    ');

        this.saveToFile(bambooConfig.JSONSaveDir, filename, content);
    },

    downloadAsModule: function() {
        if (this.mode.animationRunning) this.mode.stopAnimation();
        var json = this.scene.toJSON();
        var name = json.name.toLowerCase();
        if (!name) return this.showError('Scene must have name');
        var filename = json.name.toLowerCase() + '.js';
        var data = this.buildModuleFromJSON(json);

        var blob = new Blob([data]);
        game.saveAs(blob, filename);
    },

    saveAsModule: function() {
        if (this.mode.animationRunning) this.mode.stopAnimation();
        var json = this.scene.toJSON();

        if (!game.scenes[json.name]) {
            game.scenes[json.name] = json;
        }

        var name = json.name.toLowerCase();

        var content = this.buildModuleFromJSON(json);

        var dir = '../../game/' + bambooConfig.moduleFolder + '/';
        this.saveToFile(dir, name + '.js', content);

        // Save main module
        var content = this.buildMainModule();
        var dir = '../../game/';
        this.saveToFile(dir, bambooConfig.mainModule + '.js', content);
    },

    buildMainModule: function() {
        var content = 'game.module(\n    \'game.' + bambooConfig.mainModule + '\'\n)\n';
        content += '.require(\n';
        content += '    \'bamboo.core\'';
        for (var name in game.scenes) {
            name = name.toLowerCase();
            content += ',\n';
            content += '    \'game.' + bambooConfig.moduleFolder + '.' + name + '\'';
        }
        content += '\n)\n';
        content += '.body(function() {\n';
        content += '\n});\n';

        return content;
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

        var content = 'game.module(\n    \'game.' + bambooConfig.moduleFolder + '.' + name + '\'\n)\n';
        content += '.require(\n';
        content += '    \'bamboo.core\',\n';
        for (var i = 0; i < nodeClasses.length; i++) {
            content += '    \'bamboo.runtime.nodes.' + nodeClasses[i].toLowerCase() + '\'';
            if (i < nodeClasses.length - 1) content += ',\n';
        }
        content += '\n)\n';
        content += '.body(function() {\n\n';
        content += 'var json = ' + JSON.stringify(json, null, '    ');
        content += ';\n\ngame.scenes[json.name] = json;\n';
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
                console.log('Scene saved');
            }
            else {
                console.log('Error saving scene');
            }
        }
    },

    onResize: function() {
        this.displayObject.pivot.x = game.system.width / 2;
        this.displayObject.pivot.y = game.system.height / 2;
        this.displayObject.position.x = game.system.width / 2;
        this.displayObject.position.y = game.system.height / 2;
        this.boundaryLayer.resetGraphics();
        this.worldTargetPos.set(game.system.width / 2 - game.System.width / 2, game.system.height / 2 - game.System.height / 2);
        this.scene.displayObject.position.set(~~this.worldTargetPos.x, ~~this.worldTargetPos.y);
        this.nodeLayer.position.x = game.system.width / 2 - game.System.width / 2;
        this.nodeLayer.position.y = game.system.height / 2 - game.System.height / 2;
        this.shadow.style.lineHeight = window.innerHeight + 'px';
    }
});

Object.defineProperty(game.bamboo.Editor.prototype, 'cameraWorldPosition', {
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
