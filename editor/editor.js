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

    layers: [],
    activeLayer: null,
    selectedNode: null,

    // used during dragging camera (mouse wheel)
    cameraOffset: null,
    boundaryLayer: null,
    worldTargetPos: null,

    // windows
    propertyPanel: null,
    statusbar: null,

    init: function(world) {
        this.controller = new bamboo.EditorController(this);
        this.prevMousePos = new game.Vector();
        this.displayObject = new game.Container();
        this.world = world;
        this.worldTargetPos = new game.Vector(game.system.width/2 - this.world.screenSize.width/2,
                                              game.system.height/2 - this.world.screenSize.height/2);
        this.world.position = this.worldTargetPos.clone();
        this.displayObject.addChild(this.world.displayObject);
        this.overlay = new game.Container();
        this.displayObject.addChild(this.overlay);

        this.boundaryLayer = new bamboo.BoundaryLayer(this);

        this.propertyPanel = new bamboo.PropertyPanel(this);
        this.statusbar = new bamboo.StatusBar();

        // set initial mode
        this.mode = new bamboo.editor.NodeMode(this, new game.Vector());
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



    nodeAdded: function(node) {
        if(node instanceof bamboo.nodes.Layer) {
            this.layers.push(node);
            this.layerAdded(node);
        }
    },
    nodeRemoved: function(node) {
        if(node instanceof bamboo.nodes.Layer) {
            var idx = this.layers.indexOf(node);
            this.layers.splice(idx, 1);
            this.layerRemoved(node);
        }
    },
    layerAdded: function(layer) {
        this.activeLayer = layer;
        this.propertyPanel.updateLayerList();
    },
    layerRemoved: function(layer) {
        this.propertyPanel.updateLayerList();
    },

    nodeSelected: function(node) {
        this.propertyPanel.nodeSelected(node);
    },

    getNodeAt: function(p, layer) {
        for(var i=this.nodes.length-1; i>=0; i--) {
            var n = this.nodes[i];
            var l = n.node.toLocalSpace(p);
            var r = n._cachedRect;
            if(l.x >= r.x && l.x <= r.x+r.width &&
               l.y >= r.y && l.y <= r.y+r.height) {
                if(!layer || n.layer === layer)
                    return n.node;
            }
        }
        return null;
    },

    update: function(dt) {
        this.mode.update(dt);
    },

    onclick: function() {
        this.mode.onclick(this.prevMousePos.clone());
    },
    onmousedown: function(button) {
        if(this.mode instanceof bamboo.editor.GameMode)
            return;// in game, do nothing

        if(button === 1)
            this.cameraOffset = this.prevMousePos.clone().add(this.world.cameraPosition.clone().subtract(this.world.position));
    },
    onmousemove: function(p) {
        this.prevMousePos = p;
        if(this.mode instanceof bamboo.editor.GameMode)
            return;// in game, do nothing

        if(this.cameraOffset) {
            var w = this.world;
            var tgtCamPos = this.cameraOffset.clone().subtract(p).add(this.worldTargetPos);
            w.setCameraPos(tgtCamPos);
            w.position.x = this.worldTargetPos.x + (w.cameraPosition.x - tgtCamPos.x);
            w.position.y = this.worldTargetPos.y + (w.cameraPosition.y - tgtCamPos.y);

            this.boundaryLayer.updateBoundary();
            for(var i=0; i<this.layers.length; i++)
                this.layers[i].update(0);
        }
        this.mode.onmousemove(p.clone());
    },
    onmouseup: function(button) {
        if(this.mode instanceof bamboo.editor.GameMode)
            return;// in game, do nothing

        if(button === 1)
            this.cameraOffset = null;
    },
    onmouseout: function() {
        if(this.mode instanceof bamboo.editor.GameMode)
            return;// in game, do nothing

        if(this.cameraOffset)
            this.cameraOffset = null;
    },

    onkeydown: function(keycode) {
        if(this.mode instanceof bamboo.editor.GameMode) {
            return this.mode.onkeydown(keycode, this.prevMousePos.clone());
        }

        // overrides from editor
        switch(keycode) {
            case 66:// B
            case 84:// T
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
            case 66:// B - boundaries
                this.boundaryLayer.boundariesVisible = !this.boundaryLayer.boundariesVisible;
                return true;
            case 84:// T - properties
                this.propertyPanel.visible = !this.propertyPanel.visible;
                return true;
            case 90:// Z - boundary dim
                this.boundaryLayer.dimVisible = !this.boundaryLayer.dimVisible;
                return true;
        }

        // if not overridden, pass to mode
        return this.mode.onkeyup(keycode, this.prevMousePos.clone());
    }
});

bamboo.Editor.createFromJSON = function(levelJSON) {
    var jsonWorld = JSON.parse(levelJSON);
    var world = new bamboo[jsonWorld.world]();
    var editor = new bamboo.Editor(world);
    for(var i=0; i<jsonWorld.nodes.length; i++) {
        var node = jsonWorld.nodes[i];
        editor.controller.createNode(node.class, node.properties);
    }
    return editor;
};

});
