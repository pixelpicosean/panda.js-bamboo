game.module(
    'bamboo.editor.editor'
)
.require(
    'bamboo.runtime.world',
    'bamboo.editor.propertypanel',
    'bamboo.editor.statusbar',
    'bamboo.editor.editorcontroller',
    'bamboo.editor.selectionstate',
    'bamboo.editor.gamestate'
)
.body(function() {

bamboo.Editor = game.Class.extend({
    controller: null,
    state: null,
    prevMousePos: null,
    displayObject: null,
    world: null,
    nodes: [],

    layers: [],
    selectedNode: null,

    cameraOffset: null,

    // windows
    propertyPanel: null,
    statusBar: null,

    init: function(world) {
        this.controller = new bamboo.EditorController(this);
        this.state = new bamboo.editor.SelectionState(this);
        this.prevMousePos = new game.Vector();
        this.displayObject = new game.Container();
        this.world = world;
        this.displayObject.addChild(this.world.displayObject);

        this.propertyPanel = new bamboo.PropertyPanel(this);
        this.statusBar = new bamboo.StatusBar();
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
        if(node instanceof bamboo.nodes.Layer)
            this.layers.push(node);
    },
    nodeRemoved: function(node) {
        if(node instanceof bamboo.nodes.Layer) {
            var idx = this.layers.indexOf(node);
            this.layers.splice(idx, 1);
        }
    },
    nodeSelected: function(node) {
        this.propertyPanel.nodeSelected(node);
    },

    getNodeAt: function(p, selectable) {
        for(var i=this.nodes.length-1; i>=0; i--) {
            var n = this.nodes[i];
            var l = n.node.toLocalSpace(p);
            var r = n._cachedRect;
            if(l.x >= r.x && l.x <= r.x+r.width &&
               l.y >= r.y && l.y <= r.y+r.height) {
                if(!selectable || n.properties.selectable)
                    return n.node;
            }
        }
        return null;
    },

    update: function(dt) {
        for(var i=0; i<this.layers.length; i++)
            this.layers[i].update(0);
    },

    onclick: function() {
        if(this.state instanceof bamboo.editor.GameState) {
            // in game, just forward to game state and return
            this.state.onclick(this.prevMousePos);
            return;
        }
        this.state.apply();
        this.controller.changeState(new bamboo.editor.SelectionState(this, this.prevMousePos));
    },
    onmousedown: function(button) {
        if(this.state instanceof bamboo.editor.GameState)
            return;// in game, do nothing

        if(button === 1)
            this.cameraOffset = this.prevMousePos.clone().add(this.world.cameraPosition);
    },
    onmousemove: function(p) {
        this.prevMousePos = p;
        if(this.cameraOffset)
            this.world.cameraPosition = this.cameraOffset.clone().subtract(p);
        this.state.onmousemove(p.clone());
    },
    onmouseup: function(button) {
        if(this.state instanceof bamboo.editor.GameState)
            return;// in game, do nothing

        if(button === 1)
            this.cameraOffset = null;
    },
    onmouseout: function() {
        if(this.cameraOffset)
            this.cameraOffset = null;
    },

    onkeydown: function(keycode) {
        // if in game, ignore keyboard (except esc)
        if(this.state instanceof bamboo.editor.GameState) {
            if(keycode === 27)// ESC
                return true;
            return false;
        }

        // overrides from editor
        switch(keycode) {
            case 27:// ESC
            case 84:// T
                return true;
        }

        // if not overridden, pass to state
        return this.state.onkeydown(keycode, this.prevMousePos.clone());
    },
    onkeyup: function(keycode) {
        // if in game, ignore keyboard (except esc)
        if(this.state instanceof bamboo.editor.GameState) {
            if(keycode === 27) {// ESC
                this.state.cancel();
                this.controller.changeState(new bamboo.editorSelectionState(this. this.prevMousePos));
                return true;
            }
            return false;
        }

        // overrides from editor
        switch(keycode) {
            case 27:// ESC
                this.state.cancel();
                this.controller.changeState(new bamboo.editor.SelectionState(this, this.prevMousePos));
                return true;
            case 84:// T - properties
                this.propertyPanel.visible = !this.propertyPanel.visible;
                return true;
        }

        // if not overridden, pass to state
        return this.state.onkeyup(keycode, this.prevMousePos.clone());
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
