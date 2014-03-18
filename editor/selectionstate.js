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
    mousePos: null,
    previousDropHandler: null,

    init: function(mode, p) {
        this.super(mode);

        this.mousePos = p;

        if(this.mode.editor.selectedNode)
            this.mode.editor.statusbar.setStatus('Select node, ESC clear selection, G(rab), R(otate), S(cale), D(uplicate), DEL(ete), A(dd new node), T(toggle properties), Z(toggle boundaries), TAB to edit, ENTER to enter game');
        else
            this.mode.editor.statusbar.setStatus('Select node by clicking, A(add new node), T(toggle properties), Z(toggle boundaries), ENTER to enter game');

        this.previousDropHandler = game.system.canvas.ondrop;
        game.system.canvas.ondrop = this.onFileDrop.bind(this);
    },

    cancel: function() {
        game.system.canvas.ondrop = this.previousDropHandler;
    },

    apply: function() {
        var node = null;

        // if we have selected node, and its under the cursor, try to find next node
        if(this.mode.editor.activeNode && this.mode.editor.isNodeAt(this.mousePos, this.mode.editor.activeNode._editorNode))
            node = this.mode.editor.getNextNodeAt(this.mousePos, this.mode.editor.activeLayer, this.mode.editor.activeNode._editorNode);

        if(!node)
            node = this.mode.editor.getNodeAt(this.mousePos, this.mode.editor.activeLayer);

        if(!this.mode.shiftDown)
            this.mode.editor.controller.deselectAllNodes();

        this.mode.editor.controller.selectNode(node);
        this.mode.editor.controller.setActiveNode(node);

        game.system.canvas.ondrop = this.previousDropHandler;
    },

    onmousemove: function(p) {
        this.mousePos = p;
    },

    onkeydown: function(keycode, p) {
        switch(keycode) {
            case 9:// TAB
            case 13:// ENTER
            case 33:// Page Up
            case 34:// Page Down
            case 35:// End
            case 36:// Home
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
                if(this.mode.editor.activeNode) {
                    this.mode.editor.controller.changeMode(new bamboo.editor.EditNodeMode(this.mode.editor, this.mode.editor.activeNode));
                }
                return true;
            case 13:// ENTER - enter game
                this.mode.editor.controller.changeMode(new bamboo.editor.GameMode(this.mode.editor));
                return true;
            case 33:// Page Up - sink node
                if(this.mode.editor.activeNode) {
                    this.mode.editor.controller.moveNodeUp(this.mode.editor.activeNode);
                }
                return true;
            case 34:// Page Down - lift node
                if(this.mode.editor.activeNode) {
                    this.mode.editor.controller.moveNodeDown(this.mode.editor.activeNode);
                }
                return true;
            case 35:// End - lift to top most
                if(this.mode.editor.activeNode) {
                    this.mode.editor.controller.moveNodeTopMost(this.mode.editor.activeNode);
                }
                return true;
            case 36:// Home - sink to bottom most
                if(this.mode.editor.activeNode) {
                    this.mode.editor.controller.moveNodeBottomMost(this.mode.editor.activeNode);
                }
                return true;
            case 46:// DEL - delete
                if(this.mode.editor.selectedNodes.length !== 0) {
                    for(var i=this.mode.editor.selectedNodes.length-1; i>=0; i--) {
                        this.mode.editor.controller.deleteNode(this.mode.editor.selectedNodes[i]);
                    }
                    this.cancel();
                    this.mode.changeState(new bamboo.editor.SelectionState(this.mode, p));
                }
                return true;
            case 65:// A - add
                this.mode.changeState(new bamboo.editor.CreateNodeState(this.mode));
                return true;
            case 68:// D - duplicate
                if(this.mode.editor.selectedNodes.length !== 0) {

                    // dublicate all selected nodes
                    var nodes = [];
                    for(var i=0; i<this.mode.editor.selectedNodes.length; i++) {
                        var n = this.mode.editor.selectedNodes[i];
                        var json = n.toJSON();
                        var node = this.mode.editor.controller.createNode(json.class, json.properties, n._editorNode.properties);
                        nodes.push(node);
                    }

                    // fix connections
                    for(var i=0; i<nodes.length; i++) {
                        var idx = this.mode.editor.selectedNodes.indexOf(nodes[i].connectedTo);
                        if(idx !== -1) {
                            nodes[i].connectedTo = nodes[idx];
                        }
                    }
                    this.mode.editor.controller.deselectAllNodes();
                    this.mode.changeState(new bamboo.editor.NewNodeState(this.mode, p, nodes));
                }
                return true;
            case 71:// G - grab
                if(this.mode.editor.selectedNodes.length !== 0) {
                    this.mode.changeState(new bamboo.editor.MoveNodeState(this.mode, p, this.mode.editor.selectedNodes));
                }
                return true;
            case 82:// R - rotate
                if(this.mode.editor.selectedNodes.length !== 0) {
                    var pivot;
                    if(this.mode.editor.activeNode) {
                        pivot = this.mode.editor.activeNode.getWorldPosition();
                    } else {
                        pivot = new Vec2();
                        for(var i=0; i<this.mode.editor.selectedNodes.length; i++)
                            pivot.add(this.mode.editor.selectedNodes[i].getWorldPosition());
                        pivot.x /= this.mode.editor.selectedNodes.length;
                        pivot.y /= this.mode.editor.selectedNodes.length;
                    }
                    this.mode.changeState(new bamboo.editor.RotateNodeState(this.mode, p, this.mode.editor.selectedNodes, pivot));
                }
                return true;
            case 83:// S - scale
                if(this.mode.editor.selectedNodes.length !== 0) {
                    var pivot;
                    if(this.mode.editor.activeNode) {
                        pivot = this.mode.editor.activeNode.getWorldPosition();
                    } else {
                        pivot = new Vec2();
                        for(var i=0; i<this.mode.editor.selectedNodes.length; i++)
                            pivot.add(this.mode.editor.selectedNodes[i].getWorldPosition());
                        pivot.x /= this.mode.editor.selectedNodes.length;
                        pivot.y /= this.mode.editor.selectedNodes.length;
                    }
                    this.mode.changeState(new bamboo.editor.ScaleNodeState(this.mode, p, this.mode.editor.selectedNodes, pivot));
                }
                return true;
        }
        return false;
    },

    onFileDrop: function(e) {
        e.preventDefault();

        if(e.dataTransfer.files.length === 1) {
            var parts = e.dataTransfer.files[0].name.split('.');
            if(parts[parts.length-1] === 'zip') {
                this.previousDropHandler(e);
                return false;
            }
        }

        for(var i=0; i<e.dataTransfer.files.length; i++) {
            var file = e.dataTransfer.files[i];
            var parts = file.name.split('.');
            var suffix = parts[parts.length-1];
            if(suffix !== 'png') {
                alert('Only png images are supported!');
                continue;
            }

            var reader = new FileReader();
            var editorController = this.mode.editor.controller;
            reader.onload = function(e) {
                var imgData = e.target.result;
                var texture = PIXI.Texture.fromImage(imgData, true);
                PIXI.TextureCache['level/'+this.filename] = texture;
                // len('data:image/png;base64,') == 22
                editorController.addImage('level/'+this.filename, imgData.slice(22));
            };
            reader.filename = file.name;
            reader.readAsDataURL(file);
        }

        return false;
    }
});

});
