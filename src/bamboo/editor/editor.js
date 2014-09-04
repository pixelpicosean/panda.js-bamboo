game.module(
    'bamboo.editor.editor'
)
.body(function() {

bamboo.Editor = game.Class.extend({
    nodes: [],
    editorNodeVisibility: 2, // 0=hidden, 1=partly visible, 2=fully visible
    _zoom: 1,
    targetZoom: 1,
    layers: [],
    selectedNodes: [],
    images: [],
    windowsHidden: false,
    viewNodes: false,
    camera: {},

    init: function(data) {
        if (!data) {
            data = bamboo.World.defaultJSON;
            data.width = game.System.width;
            data.height = game.System.height;
        }
        this.world = new bamboo.World(data);

        this.gridSize = game.storage.get('gridSize', 16);

        this.camera.position = new game.Point();
        this.displayObject = new game.Container();
        this.controller = new bamboo.Controller(this);
        this.prevMousePos = new game.Point(game.system.width / 2, game.system.height / 2);
        
        this.worldTargetPos = new game.Point(game.system.width / 2 - game.System.width / 2, game.system.height / 2 - game.System.height / 2);
        this.world.displayObject.position.set(this.worldTargetPos.x, this.worldTargetPos.y);
        this.displayObject.addChild(this.world.displayObject);
        
        this.overlay = new game.Container();
        this.displayObject.addChild(this.overlay);

        this.targetCameraWorldPosition = this.worldTargetPos.clone();
        // this.cameraPosition = new game.Point(this.world.camera.position.x, this.world.camera.position.y);
        this.boundaryLayer = new bamboo.BoundaryLayer(this);
        this.overlay.addChild(this.boundaryLayer.displayObject);

        this.statusBar = new bamboo.StatusBar();
        this.toolBar = new bamboo.ToolBar(this);
        this.propertyPanel = new bamboo.PropertyPanel(this);

        this.changeMode('Main');
        this.cameraWorldPosition = new game.Point(
            this.worldTargetPos.x - this.camera.position.x,
            this.worldTargetPos.y - this.camera.position.y
        );

        this.errorWindow = new bamboo.UiWindow('center', 'center', 400, 124);
        this.errorWindow.setTitle('Error');

        this.initNodes();
        this.initNodeProperties();

        for (var i = 0; i < this.layers.length; i++) {
            if (this.layers[i].name === 'main') {
                this.controller.setActiveLayer(this.layers[i]);
                break;
            }
        }

        this.updateLayers();
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
        this.changeMode('Main');
        this.changeState('Add');
    },

    toggleViewNodes: function() {
        this.viewNodes = !this.viewNodes;
        for (var i = 0; i < this.nodes.length; i++) {
            this.nodes[i].parentSelectionRect.visible = this.viewNodes;
            this.nodes[i].connectedToLine.visible = this.viewNodes;
            this.nodes[i].nameText.visible = this.viewNodes;
        }
    },

    showError: function(error) {
        this.errorWindow.clear();
        this.errorWindow.addText(error + '<br><br>');
        this.errorWindow.addButton('OK', this.hideError.bind(this));
        this.errorWindow.show();
    },

    hideError: function() {
        this.errorWindow.hide();
    },

    updateLayers: function() {
        var layer;
        for (var i = 0; i < this.layers.length; i++) {
            // this.layers[i].update();
            layer = this.layers[i];
            layer.displayObject.position.set(
                layer.position.x + this.camera.position.x * -layer.speedFactor,
                layer.position.y + this.camera.position.y * -layer.speedFactor
            );
        }
    },

    changeMode: function(mode, param) {
        if (this.mode) this.mode.exit();
        this.mode = new bamboo.editor['Mode' + mode.ucfirst()](this, param);
        this.mode.enter();
        this.updateStatus();
    },

    changeState: function(state, param) {
        this.mode.state = new bamboo.editor['State' + state.ucfirst()](this.mode, param);
        this.updateStatus();
    },

    updateStatus: function() {
        var status = this.mode.helpText;
        if (this.mode.state) status += '<br>' + this.mode.state.helpText;
        this.statusBar.setStatus(status);
    },

    exit: function() {
        this.propertyPanel.visible = false;
        this.statusBar.window.hide();
        this.statusBar.saveWindow.hide();
    },

    getUniqueName: function(name) {
        if (!this.findNode(name)) return name;

        var parts = name.split('.');
        if (parts.length > 1) {
            var suffix = parts[parts.length-1];
            if (suffix.length === 4 && !isNaN(parseFloat(suffix)) && isFinite(suffix))
                name = name.slice(0, name.length - 5);
        }

        var i = 1;
        while (true) {
            var newName = name + ('000' + i).slice(-4);
            if (!this.world.findNode(newName)) return newName;
            i++;
        }
    },

    findNodesInside: function(rect, layer) {
        var nodes = [];
        for (var i = 0; i < this.nodes.length; i++) {
            var n = this.nodes[i];
            if (n.layer !== layer || n.node instanceof bamboo.nodes.Layer) continue;

            var r = n._cachedRect;
            var a = [];
            a.push(n.node.toWorldSpace(new game.Point(r.x, r.y)));
            a.push(n.node.toWorldSpace(new game.Point(r.x, r.y+r.height)));
            a.push(n.node.toWorldSpace(new game.Point(r.x+r.width, r.y)));
            a.push(n.node.toWorldSpace(new game.Point(r.x+r.width, r.y+r.height)));
            for(var j=0; j < 4; j++) {
                if (a[j].x >= rect.tl.x && a[j].x <= rect.br.x &&
                   a[j].y >= rect.tl.y && a[j].y <= rect.br.y) {
                    nodes.push(n.node);
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
    },

    layerAdded: function(layer) {
        this.activeLayer = layer;
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

    nodeSelected: function(node) {
    },

    nodeDeselected: function(node) {
    },

    activeNodeChanged: function(node) {
        this.propertyPanel.activeNodeChanged(node);
    },

    showSettings: function() {
        this.propertyPanel.showSettings();
    },

    getNodeAt: function(point, ignoreLockedLayers) {
        var pos = this.toWorldSpace(point);

        for (var i = this.nodes.length - 1; i >= 0; i--) {
            var _editorNode = this.nodes[i];
            
            if (!_editorNode.layer) continue;
            if (ignoreLockedLayers && _editorNode.layer._editorNode.locked) continue;

            var node = _editorNode.node;
            if (node instanceof bamboo.nodes.Layer) continue;
            
            var loc = node.getWorldPosition();
            loc.x -= node.size.x * node.anchor.x;
            loc.y -= node.size.y * node.anchor.y;
        
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

    isNodeAt: function(p, n) {
        return false;

        var l = n.node.toLocalSpace(p);
        var r = n._cachedRect;
        var sx = 6/n.node.scale.x;
        var sy = 6/n.node.scale.y;
        if (l.x >= r.x-sx && l.x <= r.x+r.width+sx &&
           l.y >= r.y-sy && l.y <= r.y+r.height+sy)
            return true;
        return false;
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

    click: function(event) {
        this.mode.click(event);
    },

    mousedown: function(event) {
        this.mode.mousedown(event);
    },

    toWorldSpace: function(point) {
        var x = point.x - this.world.position.x + this.camera.position.x - this.worldTargetPos.x;
        var y = point.y - this.world.position.y + this.camera.position.y - this.worldTargetPos.y;

        return new game.Point(x, y);
    },

    mousemove: function(event) {
        this.prevMousePos.x = event.global.x;
        this.prevMousePos.y = event.global.y;

        if (this.mode instanceof bamboo.editor.ModeGame) {
            return this.mode.mousemove(event);
        }

        if (this.cameraOffset) {
            this.targetCameraWorldPosition.x = event.global.x - this.cameraOffset.x;
            this.targetCameraWorldPosition.y = event.global.y - this.cameraOffset.y;
            this.cameraWorldPosition = this.targetCameraWorldPosition.clone();
        }

        this.mode.mousemove(event);
    },

    mouseup: function(event) {
        if (this.mode instanceof bamboo.editor.ModeGame) {
            return this.mode.mouseup(event);
        }
    },

    mouseout: function() {
        if (this.mode instanceof bamboo.editor.ModeGame) {
            return this.mode.mouseout();
        }
    },

    keydown: function(key) {
        this.mode.keydown(key);
    },

    keyup: function(key) {
        this.mode.keyup(key);
    },

    onmousewheel: function(delta) {
        if (this.mode instanceof bamboo.editor.ModeGame) return false;// in game, do nothing

        delta = Math.max(-1, Math.min(1, delta));

        var zoom = this.targetZoom * Math.pow(1.5, delta);
        if (zoom < 0.05 || zoom > 6) return;

        var offset = this.prevMousePos.subtractc(this.targetCameraWorldPosition);
        this.targetCameraWorldPosition = this.prevMousePos.subtractc(offset.multiply(Math.pow(1.5, delta)));

        if (this.zoomTween) this.zoomTween.stop();
        if (this.zoomPosTween) this.zoomPosTween.stop();

        if (this.mode instanceof bamboo.editor.NodeMode) this.mode.zoomChanged(zoom);

        var self = this;
        this.zoomPosTween = new game.Tween(this.cameraWorldPosition).to({x: this.targetCameraWorldPosition.x,y:this.targetCameraWorldPosition.y}, 250).easing(game.Tween.Easing.Quadratic.Out).onUpdate(function() {self.cameraWorldPosition = this;}).onComplete(function() {self.zoomPosTween = null;}).start();
        this.zoomTween = new game.Tween(this).to({zoom: zoom}, 250).easing(game.Tween.Easing.Quadratic.Out).onComplete(function() {self.zoomTween = null;}).start();

        this.targetZoom = zoom;
        return true;
    },
    
    onkeyup: function(keycode) {
        if (this.mode instanceof bamboo.editor.ModeGame) {
            return this.mode.onkeyup(keycode, this.prevMousePos.clone());
        }

        // overrides from editor
        switch (keycode) {
            case 67:// C
                this.cameraOffset = null;
                return true;
            case 72:// H - boundaries
                
                return true;
            case 84:// T - properties
                this.propertyPanel.visible = !this.propertyPanel.visible;
                return true;
            case 86:// V - editor node visibility
                this.editorNodeVisibility = (this.editorNodeVisibility+1)%3;
                switch (this.editorNodeVisibility) {
                    case 0:
                        for (var i=0; i<this.nodes.length; i++) {
                            this.nodes[i].debugDisplayObject.visible = false;
                        } break;
                    case 1:
                        for (var i=0; i<this.nodes.length; i++) {
                            this.nodes[i].debugDisplayObject.visible = true;
                            this.nodes[i].debugDisplayObject.alpha = 0.25;
                        } break;
                    case 2:
                        for (var i=0; i<this.nodes.length; i++) {
                            this.nodes[i].debugDisplayObject.alpha = 1.0;
                        } break;
                }
                return true;
            case 90:// Z - boundary dim
                
                return true;
        }

        // if not overridden, pass to mode
        return this.mode.onkeyup(keycode, this.prevMousePos.clone());
    },

    filedrop: function(event) {
        if (this.mode.filedrop) this.mode.filedrop(event);
    },

    update: function() {
        this.mode.update();
    },

    downloadAsJSON: function() {
        var json = this.world.toJSON();
        var filename = json.name.toLowerCase() + '.json';
        var data = JSON.stringify(json, null, '    ');

        var blob = new Blob([data]);
        game.saveAs(blob, filename);
    },

    saveAsJSON: function() {
        var json = this.world.toJSON();
        var filename = json.name.toLowerCase() + '.json';
        var content = JSON.stringify(json, null, '    ');

        this.saveToFile('../../../media/', filename, content);
    },

    downloadAsModule: function() {
        var json = this.world.toJSON();
        var name = json.name.toLowerCase();
        var filename = json.name.toLowerCase() + '.js';
        var data = this.buildModuleFromJSON(json);

        var blob = new Blob([data]);
        game.saveAs(blob, filename);
    },

    saveAsModule: function() {
        var json = this.world.toJSON();
        var name = json.name.toLowerCase();
        var content = this.buildModuleFromJSON(json);

        this.saveToFile('../../game/scenes/', name + '.js', content);
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

        var images = [];
        for (var i = 0; i < json.nodes.length; i++) {
            for (var key in json.nodes[i].properties) {
                if (key === 'image' && images.indexOf(json.nodes[i].properties[key]) === -1) {
                    images.push(json.nodes[i].properties[key]);
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
        for (var i = 0; i < images.length; i++) {
            content += 'game.addAsset(\'' + images[i] + '\');\n';
        }
        if (images.length > 0) content += '\n';
        content += 'game.json[\'game.scenes.' + name + '\'] = ' + JSON.stringify(json, null, '    ');
        content += '\n\n});\n';

        return content;
    },

    saveToFile: function(folder, filename, content) {
        var query = [];
        query.push('folder=' + encodeURIComponent(folder));
        query.push('filename=' + encodeURIComponent(filename));
        query.push('content=' + encodeURIComponent(content));

        var request = new XMLHttpRequest();
        request.open('POST', 'src/bamboo/editor/save.php');
        request.onreadystatechange = this.saveToFileComplete.bind(this, request);
        request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        request.send(query.join('&'));
    },

    saveToFileComplete: function(request) {
        if (request.readyState === 4) {
            if (request.responseText === 'success') console.log('Scene saved to file');
            else this.showError('Error saving to file');
        }
    }
});

Object.defineProperty(bamboo.Editor.prototype, 'zoom', {
    get: function() {
        return this._zoom;
    },
    set: function(value) {
        this._zoom = value;
        this.world.displayObject.scale.x = value;
        this.world.displayObject.scale.y = value;
        this.worldTargetPos.x = game.system.width/2 - value*game.System.width/2;
        this.worldTargetPos.y = game.system.height/2 - value*game.System.height/2;
    }
});

Object.defineProperty(bamboo.Editor.prototype, 'cameraWorldPosition', {
    get: function() {
        var point = new game.Point(
            this.camera.position.x * -this.zoom + this.worldTargetPos.x,
            this.camera.position.y * -this.zoom + this.worldTargetPos.y
        );
        return point;
        // return this.world.camera.position.multiplyc(-this.zoom).add(this.worldTargetPos);
    },
    set: function(value) {
        var tgtCamPos = value.subtract(this.worldTargetPos);

        tgtCamPos.multiply(-1 / this.zoom);
        this.camera.position.x = tgtCamPos.x;
        this.camera.position.y = tgtCamPos.y;
        this.boundaryLayer.updateBoundary();
        this.updateLayers();
    }
});

});