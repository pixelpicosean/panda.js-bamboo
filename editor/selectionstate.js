game.module(
    'bamboo.editor.selectionstate'
)
.require(
    'bamboo.editor.state',
    'bamboo.editor.movenodestate',
    'bamboo.editor.rotatenodestate',
    'bamboo.editor.scalenodestate',
    'bamboo.editor.newnodestate',
    'bamboo.editor.createnodestate',
    'bamboo.editor.editnodemode',
    'bamboo.editor.gamemode'
)
.body(function() {

bamboo.editor.SelectionState = bamboo.editor.State.extend({
    hoveredNode: null,

    init: function(mode, p) {
        this.super(mode);
        this.hoverNode(this.mode.editor.getNodeAt(p, true));

        if(this.mode.editor.selectedNode)
            this.mode.editor.statusbar.setStatus('Select node, ESC clear selection, G(rab), R(otate), S(cale), D(uplicate), DEL(ete), A(dd new node), TAB to edit, ENTER to enter game');
        else
            this.mode.editor.statusbar.setStatus('Select node by clicking, ENTER to enter game');

        game.system.canvas.ondragover = function() { return false; };
        game.system.canvas.ondragend = function() { return false; };
        game.system.canvas.ondrop = this.onFileDrop.bind(this);
    },

    hoverNode: function(node) {
        if(this.hoveredNode === node)
            return;

        if(this.hoveredNode) {
            this.hoveredNode._editorNode.hoverRect.visible = false;
            this.hoveredNode._editorNode.hoverAxis.visible = false;
        }
        this.hoveredNode = node;
        if(this.hoveredNode) {
            this.hoveredNode._editorNode.hoverRect.visible = true;
            this.hoveredNode._editorNode.hoverAxis.visible = true;
        }
    },

    cancel: function() {
        this.hoverNode(null);
        this.mode.editor.controller.selectNode(null);
        game.system.canvas.ondrop = null;
    },

    apply: function() {
        this.mode.editor.controller.selectNode(this.hoveredNode);
        this.hoverNode(null);
        game.system.canvas.ondrop = null;
    },

    onmousemove: function(p) {
        this.hoverNode(this.mode.editor.getNodeAt(p, this.mode.editor.activeLayer));
    },

    onkeydown: function(keycode, p) {
        switch(keycode) {
            case 9:// TAB
            case 13:// ENTER
            case 46:// DEL
            case 65:// A
            case 68:// D
            case 71:// G
            case 82:// R
            case 83:// S
                return true;
        }
        return false;
    },
    onkeyup: function(keycode, p) {
        switch(keycode) {
            case 9:// TAB - edit mode
                if(this.mode.editor.selectedNode) {
                    this.hoverNode(null);
                    this.mode.editor.controller.changeMode(new bamboo.editor.EditNodeMode(this.mode.editor, this.mode.editor.selectedNode));
                }
                return true;
            case 13:// ENTER - enter game
                this.hoverNode(null);
                this.mode.editor.controller.changeMode(new bamboo.editor.GameMode(this.mode.editor));
                return true;
            case 46:// DEL - delete
                if(this.mode.editor.selectedNode) {
                    this.mode.editor.controller.deleteNode(this.mode.editor.selectedNode);
                    this.cancel();
                    this.mode.changeState(new bamboo.editor.SelectionState(this.mode, p));
                }
                return true;
            case 65:// A - add
                this.hoverNode(null);
                this.mode.changeState(new bamboo.editor.CreateNodeState(this.mode));
                return true;
            case 68:// D - duplicate
                if(this.mode.editor.selectedNode) {
                    this.hoverNode(null);
                    var json = this.mode.editor.selectedNode.toJSON();
                    var node = this.mode.editor.controller.createNode(json.class, json.properties, this.mode.editor.selectedNode._editorNode.properties);
                    this.mode.changeState(new bamboo.editor.NewNodeState(this.mode, p, node));
                }
                return true;
            case 71:// G - grab
                if(this.mode.editor.selectedNode) {
                    this.hoverNode(null);
                    this.mode.changeState(new bamboo.editor.MoveNodeState(this.mode, p, this.mode.editor.selectedNode));
                }
                return true;
            case 82:// R - rotate
                if(this.mode.editor.selectedNode) {
                    this.hoverNode(null);
                    this.mode.changeState(new bamboo.editor.RotateNodeState(this.mode, p, this.mode.editor.selectedNode));
                }
                return true;
            case 83:// S - scale
                if(this.mode.editor.selectedNode) {
                    this.hoverNode(null);
                    this.mode.changeState(new bamboo.editor.ScaleNodeState(this.mode, p, this.mode.editor.selectedNode));
                }
                return true;
        }
        return false;
    },

    onFileDrop: function(e) {
        e.preventDefault();

        for(var i=0; i<e.dataTransfer.files.length; i++) {
            var file = e.dataTransfer.files[i];

            var reader = new FileReader();
            var editorController = this.mode.editor.controller;
            reader.onload = function(e) {
                var imgData = e.target.result;
                var texture = PIXI.Texture.fromImage(imgData, true);
                PIXI.TextureCache[this.filename] = texture;
                editorController.addImage(this.filename, imgData);
            };
            reader.filename = file.name;
            reader.readAsDataURL(file);
        }

        return false;
    }
});

});
