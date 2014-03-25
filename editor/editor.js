game.module(
    'bamboo.editor.editor'
)
.require(
    'bamboo.runtime.world',
    'bamboo.editor.propertypanel',
    'bamboo.editor.statusbar',
    'bamboo.editor.boundarylayer',
    'bamboo.editor.editorcontroller',
    'bamboo.editor.nodemode'
)
.body(function() {

bamboo.Editor = game.Class.extend({
    controller: null,
    mode: null,
    prevMousePos: null,
    displayObject: null,
    overlay: null,
    world: null,
    nodes: [],
    editorNodeVisibility: 2,// 0=hidden, 1=partly visible, 2=fully visible

    // for zooming
    _zoom: 1,
    targetZoom: 1,
    targetCameraWorldPosition: null,

    layers: [],
    activeLayer: null,

    activeNode: null,
    selectedNodes: [],

    // used during dragging camera (mouse wheel)
    cameraOffset: null,
    boundaryLayer: null,
    worldTargetPos: null,

    // windows
    propertyPanel: null,
    statusbar: null,

    images: [],
    imageZip: null,

    init: function(world) {
        world.inEditor = true;
        this.controller = new bamboo.EditorController(this);
        this.prevMousePos = new Vec2();
        this.displayObject = new game.Container();
        this.world = world;
        this.worldTargetPos = new Vec2(game.system.width/2 - this.world.screenSize.width/2,
                                              game.system.height/2 - this.world.screenSize.height/2);
        this.world.position = this.worldTargetPos.clone();
        this.displayObject.addChild(this.world.displayObject);
        this.overlay = new game.Container();
        this.displayObject.addChild(this.overlay);

        this.targetCameraWorldPosition = new Vec2();

        this.boundaryLayer = new bamboo.BoundaryLayer(this);
        this.overlay.addChild(this.boundaryLayer.displayObject);

        this.propertyPanel = new bamboo.PropertyPanel(this);
        this.statusbar = new bamboo.StatusBar();

        // set initial mode
        this.mode = new bamboo.editor.NodeMode(this, new Vec2());
    },

    exit: function() {
        this.propertyPanel.visible = false;
        this.statusbar.window.hide();
        this.statusbar.saveWindow.hide();
    },

    getUniqueName: function(name) {
        if(!this.world.findNode(name))
            return name;

        var parts = name.split('.');
        if(parts.length > 1) {
            var suffix = parts[parts.length-1];
            if(suffix.length === 4 && !isNaN(parseFloat(suffix)) && isFinite(suffix))
                name = name.slice(0, name.length-5);
        }

        var i = 1;
        while(true) {
            var newName = name+'.'+('000'+i).slice(-4);
            if(!this.world.findNode(newName))
                return newName;

            i++;
        }
    },

    findNodesInside: function(rect, layer) {
        var nodes = [];
        for(var i=0; i<this.nodes.length; i++) {
            var n = this.nodes[i];
            if(n.layer !== layer || n.node instanceof bamboo.nodes.Layer)
                continue;

            var r = n._cachedRect;
            var a = [];
            a.push(n.node.toWorldSpace(new Vec2(r.x,r.y)));
            a.push(n.node.toWorldSpace(new Vec2(r.x,r.y+r.height)));
            a.push(n.node.toWorldSpace(new Vec2(r.x+r.width,r.y)));
            a.push(n.node.toWorldSpace(new Vec2(r.x+r.width,r.y+r.height)));
            for(var j=0; j<4; j++) {
                if(a[j].x >= rect.tl.x && a[j].x <= rect.br.x &&
                   a[j].y >= rect.tl.y && a[j].y <= rect.br.y) {
                    nodes.push(n.node);
                    break;
                }
            }
        }
        return nodes;
    },

    nodeAdded: function(node) {
        if(node instanceof bamboo.nodes.Layer) {
            this.layers.push(node);
            this.layerAdded(node);
        } else {
            // force update for node-list
            this.propertyPanel.activeLayerChanged(this.activeLayer);
        }
    },
    nodeRemoved: function(node) {
        if(node instanceof bamboo.nodes.Layer) {
            var idx = this.layers.indexOf(node);
            this.layers.splice(idx, 1);
            this.layerRemoved(node);
        } else {
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

    imageAdded: function(name, data) {
        // hack to update properties-panel
        this.propertyPanel.activeNodeChanged(this.activeNode);
        this.imageZip.folder('level').file(name.slice(6), data, {base64: true});
        game.scene.saveImagesZip(this.imageZip);
    },

    nodeSelected: function(node) {
    },
    nodeDeselected: function(node) {
    },

    activeNodeChanged: function(node) {
        this.propertyPanel.activeNodeChanged(node);
    },

    getNodeAt: function(p, layer) {
        for(var i=this.nodes.length-1; i>=0; i--) {
            var n = this.nodes[i];
            if(layer && n.layer !== layer)
                continue;

            var l = n.node.toLocalSpace(p);
            var r = n._cachedRect;
            var sx = 6/n.node.scale.x;
            var sy = 6/n.node.scale.y;
            if(l.x >= r.x-sx && l.x <= r.x+r.width+sx &&
               l.y >= r.y-sy && l.y <= r.y+r.height+sy) {
                return n.node;
            }
        }
        return null;
    },
    getNextNodeAt: function(p, layer, node) {
        // far enough flags z-order, so when finding next node, we first
        // loop until we find the 'starting' node, and start searching from that
        // TODO: we could probably use indexOf to find the starting index instead of looping
        var farEnough = false;
        for(var i=this.nodes.length-1; i>=0; i--) {
            if(!farEnough) {
                if(this.nodes[i] === node)
                    farEnough = true;
                continue;
            }

            var n = this.nodes[i];
            if(layer && n.layer !== layer)
                continue;

            var l = n.node.toLocalSpace(p);
            var r = n._cachedRect;
            var sx = 6/n.node.scale.x;
            var sy = 6/n.node.scale.y;
            if(l.x >= r.x-sx && l.x <= r.x+r.width+sx &&
               l.y >= r.y-sy && l.y <= r.y+r.height+sy) {
                return n.node;
            }
        }
        return null;
    },
    isNodeAt: function(p, n) {
        var l = n.node.toLocalSpace(p);
        var r = n._cachedRect;
        var sx = 6/n.node.scale.x;
        var sy = 6/n.node.scale.y;
        if(l.x >= r.x-sx && l.x <= r.x+r.width+sx &&
           l.y >= r.y-sy && l.y <= r.y+r.height+sy)
            return true;
        return false;
    },

    buildNodeDropdown: function(window, key, node) {
        var self = this;
        var addNodeInputOption = function(window, key, node, prefix) {
            var nodes = self.world.getConnectedNodes(node);
            for(var i=0; i<nodes.length; i++) {
                var p = prefix;
                var np = prefix;
                if(i === nodes.length-1) {
                    p += '┗ ';
                    np += '  ';
                } else {
                    p +=  '┣ ';
                    np += '┃ ';
                }
                window.addInputSelectOption(key, nodes[i].name, p+'['+nodes[i].getClassName()+'] - '+nodes[i].name);
                addNodeInputOption(window, key, nodes[i], np);
            }
        };

        var nodes = this.world.getConnectedNodes(node);
        for(var i=0; i<nodes.length; i++) {
            window.addInputSelectOption(key, nodes[i].name, '['+nodes[i].getClassName()+'] - '+nodes[i].name);
            addNodeInputOption(window, key, nodes[i], ' ');
        }
    },


    update: function(dt) {
        this.mode.update(dt);
    },

    onclick: function() {
        this.mode.onclick(this.prevMousePos.clone());
    },
    onmousedown: function(button) {
        // if mouse down in canvas, unfocus element
        if(document.activeElement !== document.body)
            document.activeElement.blur();

        if(this.mode instanceof bamboo.editor.GameMode)
            return;// in game, do nothing

        if(button === 1) {
            this.cameraOffset = this.prevMousePos.subtractc(this.cameraWorldPosition);
            return true;
        }
    },
    onmousemove: function(p) {
        this.prevMousePos = p;
        if(this.mode instanceof bamboo.editor.GameMode)
            return;// in game, do nothing

        if(this.cameraOffset) {
            this.targetCameraWorldPosition = p.subtractc(this.cameraOffset);
            this.cameraWorldPosition = this.targetCameraWorldPosition.clone();
        }
        this.mode.onmousemove(p.clone());
    },
    onmouseup: function(button) {
        if(this.mode instanceof bamboo.editor.GameMode)
            return;// in game, do nothing

        if(button === 1) {
            this.cameraOffset = null;
            return true;
        }
    },
    onmouseout: function() {
        if(this.mode instanceof bamboo.editor.GameMode)
            return;// in game, do nothing

        if(this.cameraOffset)
            this.cameraOffset = null;
    },
    onmousewheel: function(delta) {
        if(this.mode instanceof bamboo.editor.GameMode)
            return;// in game, do nothing

        delta = Math.max(-1, Math.min(1, delta));

        var zoom = this.targetZoom * Math.pow(1.5, delta);
        if(zoom < 0.05 || zoom > 6)
            return;

        var offset = this.prevMousePos.subtractc(this.targetCameraWorldPosition);
        this.targetCameraWorldPosition = this.prevMousePos.subtractc(offset.multiply(Math.pow(1.5, delta)));

        if(this.zoomTween) this.zoomTween.stop();
        if(this.zoomPosTween) this.zoomPosTween.stop();

        var self = this;
        this.zoomTween = new game.Tween(this, {zoom: zoom}, 250, {easing: game.Tween.Easing.Quadratic.Out, onComplete: function() {self.zoomTween = null;}}).start();
        this.zoomPosTween = new game.Tween(this.cameraWorldPosition, {x: this.targetCameraWorldPosition.x, y: this.targetCameraWorldPosition.y}, 250, {easing: game.Tween.Easing.Quadratic.Out, onUpdate: function() {self.cameraWorldPosition = this;}, onComplete: function() {self.zoomPosTween = null;}}).start();

        this.targetZoom = zoom;
    },

    onkeydown: function(keycode) {
        if(this.mode instanceof bamboo.editor.GameMode) {
            return this.mode.onkeydown(keycode, this.prevMousePos.clone());
        }

        // overrides from editor
        switch(keycode) {
            case 72:// H
            case 84:// T
            case 86:// V
            case 90:// Z
                return true;
        }

        // if not overridden, pass to mode
        return this.mode.onkeydown(keycode, this.prevMousePos.clone());
    },
    onkeyup: function(keycode) {
        if(this.mode instanceof bamboo.editor.GameMode) {
            return this.mode.onkeyup(keycode, this.prevMousePos.clone());
        }

        // overrides from editor
        switch(keycode) {
            case 72:// H - boundaries
                this.boundaryLayer.boundariesVisible = !this.boundaryLayer.boundariesVisible;
                return true;
            case 84:// T - properties
                this.propertyPanel.visible = !this.propertyPanel.visible;
                return true;
            case 86:// V - editor node visibility
                this.editorNodeVisibility = (this.editorNodeVisibility+1)%3;
                switch(this.editorNodeVisibility) {
                    case 0:
                        for(var i=0; i<this.nodes.length; i++) {
                            this.nodes[i].debugDisplayObject.visible = false;
                        } break;
                    case 1:
                        for(var i=0; i<this.nodes.length; i++) {
                            this.nodes[i].debugDisplayObject.visible = true;
                            this.nodes[i].debugDisplayObject.alpha = 0.25;
                        } break;
                    case 2:
                        for(var i=0; i<this.nodes.length; i++) {
                            this.nodes[i].debugDisplayObject.alpha = 1.0;
                        } break;
                }
                return true;
            case 90:// Z - boundary dim
                this.boundaryLayer.dimVisible = !this.boundaryLayer.dimVisible;
                return true;
        }

        // if not overridden, pass to mode
        return this.mode.onkeyup(keycode, this.prevMousePos.clone());
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
        this.worldTargetPos.x = game.system.width/2 - value*this.world.screenSize.width/2;
        this.worldTargetPos.y = game.system.height/2 - value*this.world.screenSize.height/2;
    }
});

Object.defineProperty(bamboo.Editor.prototype, 'cameraWorldPosition', {
    get: function() {
        return this.world.cameraPosition.multiplyc(-this.zoom).add(this.world.position);
    },
    set: function(value) {
        var tgtCamPos = value.subtract(this.worldTargetPos);

        var w = this.world;
        tgtCamPos.multiply(-1/this.zoom);
        w.setCameraPos(tgtCamPos);
        w.position.x = this.worldTargetPos.x + this.zoom*(w.cameraPosition.x - tgtCamPos.x);
        w.position.y = this.worldTargetPos.y + this.zoom*(w.cameraPosition.y - tgtCamPos.y);

        this.boundaryLayer.updateBoundary();
        for(var i=0; i<this.layers.length; i++)
            this.layers[i].update(0);
    }
});


bamboo.Editor.createFromJSON = function(levelJSON) {
    var jsonWorld = JSON.parse(levelJSON);
    var world = new bamboo[jsonWorld.world]();
    world.images = jsonWorld.images;
    var editor = new bamboo.Editor(world);
    for(var i=0; i<jsonWorld.nodes.length; i++) {
        var node = jsonWorld.nodes[i];
        editor.controller.createNode(node.class, node.properties);
    }
    return editor;
};

});
