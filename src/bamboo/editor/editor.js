game.module(
    'bamboo.editor.editor'
)
.body(function() {

game.createScene('BambooEditor', {
    nodes: [],
    layers: [],
    selectedNodes: [],
    images: [],

    init: function() {
        game.editor = this;

        this.initConfig();
        this.initDragDrop();
        this.initLastScene();
        this.initScene();
        this.initObjects();
        this.initLayers();
        this.initCamera();
        this.initNodes();
        this.initNodeProperties();
        // this.initOverlay();
        this.initWindows();

        this.controller.setActiveLayer(this.layers[0]);
        this.changeMode('Main');

        this.prevMousePos = new game.Point(game.system.width / 2, game.system.height / 2);

        console.log('Scene ' + this.scene.name + ' loaded');
        this.updateDocumentTitle();
    },

    updateDocumentTitle: function() {
        document.title = 'Bamboo (' + this.scene.name + ')';
    },

    initConfig: function() {
        this.config = game.bamboo.config;

        if (!this.config.saveSettings) return;

        // Read local storage
        this.config.gridSize = game.storage.get('gridSize', this.config.gridSize);
        this.config.viewNodes = game.storage.get('viewNodes', this.config.viewNodes);
    },

    initDragDrop: function() {
        var canvas = game.system.canvas;
        canvas.ondragover = this.dragover.bind(this);
        canvas.ondragleave = this.dragleave.bind(this);
        canvas.ondrop = this.filedrop.bind(this);
    },

    initLastScene: function() {
        if (!this.config.loadLastScene) return;

        if (!game.bamboo.currentScene) {
            game.bamboo.currentScene = game.storage.get('lastScene');
            this.config.loadLastScene = false;
        }
    },

    initCamera: function() {
        this.camera = new game.BambooCamera(this);
        this.scene.displayObject.position.set(this.camera.center.x, this.camera.center.y);
        this.editorContainer.position.set(this.camera.center.x, this.camera.center.y);
        this.boundary.update();
    },

    initScene: function() {
        var data = game.getSceneData(game.bamboo.currentScene);

        if (!data) {
            // Load default scene
            data = game.BambooScene.defaultJSON;
            data.width = this.config.width || this.config.systemWidth;
            data.height = this.config.height || this.config.systemHeight;
            game.storage.remove('lastScene');
        }
        else {
            game.storage.set('lastScene', data.name);
        }

        this.scene = new game.BambooScene(data);
    },

    initObjects: function() {
        this.controller = new game.BambooController(this);
        this.boundary = new game.BambooBoundary(this);
        this.menuBar = new game.BambooMenuBar(this);
        this.sideBar = new game.BambooSideBar(this);
    },

    initLayers: function() {
        this.mainContainer = new game.Container().addTo(this.stage);
        this.mainContainer.pivot.x = this.config.systemWidth / 2;
        this.mainContainer.pivot.y = this.config.systemHeight / 2;
        this.mainContainer.position.x = this.config.systemWidth / 2;
        this.mainContainer.position.y = this.config.systemHeight / 2;

        this.sceneContainer = this.scene.displayObject;
        this.sceneContainer.addTo(this.mainContainer);
        
        this.editorContainer = new game.Container().addTo(this.mainContainer);
        
        this.overlayContainer = this.boundary.container;
        this.overlayContainer.addTo(this.mainContainer);
    },

    loadScene: function(name) {
        if (game.bamboo.currentScene) game.removeBambooAssets(game.bamboo.currentScene);
        if (name) game.addBambooAssets(name);

        game.bamboo.currentScene = name;
        game.bamboo.ui.removeAll();

        var loader = new game.Loader('BambooEditor').start();
    },

    initWindows: function() {
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
    },

    showScenesWindow: function() {
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

    changeGrid: function() {
        if (this.mode.shiftDown) {
            this.config.gridSize /= 2;
            if (this.config.gridSize === 0) this.config.gridSize = 128;
            if (this.config.gridSize === 4) this.config.gridSize = 0;
        }
        else {
            this.config.gridSize *= 2;
            if (this.config.gridSize === 0) this.config.gridSize = 8;
            if (this.config.gridSize > 128) this.config.gridSize = 0;
        }
        game.storage.set('gridSize', this.config.gridSize);

        this.boundary.updateGrid();
    },

    toggleBoundaries: function() {
        this.boundary.boundaries.visible = !this.boundary.boundaries.visible;
    },

    // initOverlay: function() {
    //     this.overlay = document.createElement('div');
    //     this.overlay.style.position = 'absolute';
    //     this.overlay.style.left = '0px';
    //     this.overlay.style.top = '0px';
    //     this.overlay.style.width = '100%';
    //     this.overlay.style.height = '100%';
    //     this.overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    //     this.overlay.style.zIndex = 10;
    //     this.overlay.style.textAlign = 'center';
    //     this.overlay.style.lineHeight = window.innerHeight + 'px';
    //     this.overlay.style.display = 'none';
    //     this.overlay.style.pointerEvents = 'none';
    //     document.body.appendChild(this.overlay);
    // },

    // showOverlay: function() {
    //     this.overlay.style.display = 'block';
    // },

    // hideOverlay: function() {
    //     this.overlay.style.display = 'none';
    // },

    // setOverlayText: function(text) {
    //     this.overlay.innerHTML = text;
    //     return this;
    // },

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
            this.scene.nodes[i].initProperties(this.scene.nodes[i]._properties);
            delete this.scene.nodes[i]._properties;
            this.nodeAdded(this.scene.nodes[i]);
        }
    },

    addNode: function() {
        this.controller.deselectAllNodes();

        var nodeType = this.sideBar.nodesWindow.inputs['type'].value;

        var node = this.controller.createNode(nodeType, {
            name: this.getUniqueName(nodeType),
            parent: this.activeLayer.name
        });

        node.initProperties(node._properties);
        node.editorNode.layerChanged();
        node.editorNode.ready();

        if (node.displayObject && node.size.x === 0 && node.size.y === 0 && node.displayObject.width > 1 && node.displayObject.height > 1) {
            node.editorNode.setProperty('size', new game.Point(node.displayObject.width, node.displayObject.height));
        }
        if (node.size.x === 0 && node.size.y === 0) {
            node.editorNode.setProperty('size', new game.Point(32, 32));
        }
        node.editorNode.updateRect();

        this.controller.setActiveNode(node);
        this.sideBar.updateLayerList();
        this.changeState('Move');

        var parentPos = node.parent.getGlobalPosition();
        var pos = this.toGlobalSpace(this.prevMousePos);
        this.mode.state.offset.x -= pos.x - parentPos.x;
        this.mode.state.offset.y -= pos.y - parentPos.y;
        this.mode.state.update(this.prevMousePos.x, this.prevMousePos.y);
    },

    toggleViewNodes: function() {
        this.config.viewNodes = !this.config.viewNodes;
        game.storage.set('viewNodes', this.config.viewNodes);
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].parentSelectionRect.visible = this.config.viewNodes;
            this.nodes[i].connectedToLine.visible = this.config.viewNodes;
            this.nodes[i].nameText.visible = this.config.viewNodes;
            this.nodes[i].debugDisplayObject.visible = this.config.viewNodes;
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
                Math.round(layer.position.x + this.camera.position.x * -layer.speedFactor.x),
                Math.round(layer.position.y + this.camera.position.y * -layer.speedFactor.y)
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

            if (this.layers.length === 1) {
                if (this.config.background) {
                    var bg = new game.Sprite(this.config.background);
                    var bgScale = this.config.backgroundScale || 1;
                    bg.scale.set(bgScale, bgScale);
                    bg.addTo(this.layers[0].displayObject);
                }
            }
        }
        else {
            // force update for node-list
            if (this.activeLayer) this.sideBar.activeLayerChanged(this.activeLayer);
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
            this.sideBar.activeLayerChanged(this.activeLayer);
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
        this.sideBar.updateLayerList();
    },

    layerRemoved: function(layer) {
        this.sideBar.updateLayerList();
    },

    addImage: function(name) {
        if (this.images.indexOf(name) !== -1) return;
        this.images.push(name);
        this.images.sort();
        if (this.activeNode) this.activeNodeChanged(this.activeNode);
    },

    activeNodeChanged: function(node) {
        this.sideBar.activeNodeChanged(node);
    },

    showSceneSettings: function() {
        this.sideBar.showSceneSettings();
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
        var x = point.x - this.scene.position.x + this.camera.position.x - this.camera.center.x;
        var y = point.y - this.scene.position.y + this.camera.position.y - this.camera.center.y;
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
        this.focus();
        
        this.prevMousePos.x = event.global.x;
        this.prevMousePos.y = event.global.y;
        this.mode.mousedown(event);
    },

    mousemove: function(event) {
        if (this.menuBar.menuElem.active) this.menuBar.menuElem.activate();

        this.prevMousePos.x = (event.global.x / this.camera.zoom);
        this.prevMousePos.y = (event.global.y / this.camera.zoom);

        if (this.spaceDown) {
            this.camera.set(this.prevMousePos.x, this.prevMousePos.y);
        }

        this.mode.mousemove(event);
    },

    mouseup: function(event) {
        this.mode.mouseup(event);
    },

    mouseout: function() {
    },

    keydown: function(key) {
        if (key === 'ESC' && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
        if (key === 'ENTER' && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
        if (document.activeElement !== document.body) return;

        if (key === '1') return this.menuBar.toggleVisibility();
        if (key === '2') return this.sideBar.toggleVisibility();
        if (key === 'PLUS') return this.camera.zoomIn();
        if (key === 'MINUS') return this.camera.zoomOut();
        if (key === '0') return this.camera.zoomReset();
        this.mode.keydown(key);
    },

    keyup: function(key) {
        if (document.activeElement !== document.body) return;

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
            if (this.activeNode) this.activeNodeChanged(this.activeNode);
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
        if (this.activeNode) this.activeNodeChanged(this.activeNode);

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

        this.saveToFile(this.config.JSONSaveDir, filename, content);
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

        var dir = '../../game/' + this.config.moduleFolder + '/';
        this.saveToFile(dir, name + '.js', content);

        // Save main module
        var content = this.buildMainModule();
        var dir = '../../game/';
        this.saveToFile(dir, this.config.mainModule + '.js', content);

        console.log('Scene saved');
    },

    buildMainModule: function() {
        var content = 'game.module(\n    \'game.' + this.config.mainModule + '\'\n)\n';
        content += '.require(\n';
        content += '    \'bamboo.core\'';
        for (var name in game.scenes) {
            name = name.toLowerCase();
            content += ',\n';
            content += '    \'game.' + this.config.moduleFolder + '.' + name + '\'';
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

        var content = 'game.module(\n    \'game.' + this.config.moduleFolder + '.' + name + '\'\n)\n';
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
            if (request.responseText !== 'success') console.log('Error saving file: ' + filename);
        }
    },

    onResize: function() {
        this.mainContainer.pivot.x = game.system.width / 2;
        this.mainContainer.pivot.y = game.system.height / 2;
        this.mainContainer.position.x = game.system.width / 2;
        this.mainContainer.position.y = game.system.height / 2;

        this.camera.center.set(game.system.width / 2 - this.config.systemWidth / 2, game.system.height / 2 - this.config.systemHeight / 2);

        this.scene.displayObject.position.set(this.camera.center.x, this.camera.center.y);
        this.editorContainer.position.set(this.camera.center.x, this.camera.center.y);
        this.boundary.updateLines();
        this.boundary.update();

        // this.overlay.style.lineHeight = window.innerHeight + 'px';
    },

    filedrop: function(event) {
        event.preventDefault();
        this.hideOverlay();
        this.filedrop(event);
    },

    dragover: function() {
        this.setOverlayText('Drop here to add asset');
        this.showOverlay();
        return false;
    },

    dragleave: function() {
        this.hideOverlay();
        return false;
    },

    focus: function() {
        if (document.activeElement !== document.body) document.activeElement.blur();
    }
});

});
