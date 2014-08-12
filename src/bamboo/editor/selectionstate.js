game.module(
    'bamboo.editor.selectionstate'
)
.require(
    'bamboo.editor.state',
    'bamboo.editor.movenodestate',
    'bamboo.editor.rotatenodestate',
    'bamboo.editor.scalenodestate',
    'bamboo.editor.boxselectstate',
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
        this._super(mode);

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

        if(!this.mode.shiftDown && !this.mode.altDown)
            this.mode.editor.controller.deselectAllNodes();

        if(this.mode.altDown) {
            this.mode.editor.controller.deselectNode(node);
        } else {
            this.mode.editor.controller.selectNode(node);
            this.mode.editor.controller.setActiveNode(node);
        }

        game.system.canvas.ondrop = this.previousDropHandler;
    },

    assignGroup: function(number) {
        if(!bamboo.editor.SelectionGroups) {
            bamboo.editor.SelectionGroups = [];
            for(var i=0;i<10;i++) bamboo.editor.SelectionGroups.push([]);
        }

        // clear previous
        bamboo.editor.SelectionGroups[number].length = 0;
        for(var i=0; i<this.mode.editor.selectedNodes.length; i++) {
            bamboo.editor.SelectionGroups[number].push(this.mode.editor.selectedNodes[i]);
        }
    },

    selectGroup: function(number) {
        if(!this.mode.shiftDown && !this.mode.altDown)
            this.mode.editor.controller.deselectAllNodes();

        if(!bamboo.editor.SelectionGroups)
            return;

        if(this.mode.altDown) {
            for(var i=0; i<bamboo.editor.SelectionGroups[number].length; i++) {
                this.mode.editor.controller.deselectNode(bamboo.editor.SelectionGroups[number][i]);
            }
        } else {
            for(var i=0; i<bamboo.editor.SelectionGroups[number].length; i++) {
                this.mode.editor.controller.selectNode(bamboo.editor.SelectionGroups[number][i]);
            }
        }
    },

    onmousemove: function(p) {
        this.mousePos = p;
    },

    onkeydown: function(keycode, p) {
        switch(keycode) {
            case 8:// Backspace
            case 9:// TAB
            case 13:// ENTER
            case 33:// Page Up
            case 34:// Page Down
            case 35:// End
            case 36:// Home
            case 46:// DEL
            case 48:// 0
            case 49:// 1
            case 50:// 2
            case 51:// 3
            case 52:// 4
            case 53:// 5
            case 54:// 6
            case 55:// 7
            case 56:// 8
            case 57:// 9
            case 65:// A
            case 66:// B
            case 68:// D
            case 70:// F
            case 71:// G
            case 80:// P
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
            case 8:
                if(this.mode.editor.selectedNodes.length !== 0) {
                    for(var i=this.mode.editor.selectedNodes.length-1; i>=0; i--) {
                        this.mode.editor.controller.deleteNode(this.mode.editor.selectedNodes[i]);
                    }
                    this.cancel();
                    this.mode.changeState(new bamboo.editor.SelectionState(this.mode, p));
                }
                return true;
            case 48:// 0
            case 49:// 1
            case 50:// 2
            case 51:// 3
            case 52:// 4
            case 53:// 5
            case 54:// 6
            case 55:// 7
            case 56:// 8
            case 57:// 9
                var number = keycode - 48;
                if(this.mode.ctrlDown) {
                    this.assignGroup(number);
                } else {
                    this.selectGroup(number);
                }
                return true;
            case 65:// A - select all / add
                if(this.mode.shiftDown) {
                    this.mode.changeState(new bamboo.editor.CreateNodeState(this.mode));
                } else {
                    if(this.mode.editor.selectedNodes.length !== 0)
                        this.mode.editor.controller.deselectAllNodes();
                    else
                        this.mode.editor.controller.selectAllNodes();
                }
                return true;
            case 66:// B - box select
                this.mode.changeState(new bamboo.editor.BoxSelectState(this.mode, p));
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

                    var active = null;
                    // fix connections
                    for(var i=0; i<nodes.length; i++) {
                        var idx = this.mode.editor.selectedNodes.indexOf(nodes[i].connectedTo);
                        if(idx !== -1) {
                            nodes[i].connectedTo = nodes[idx];
                        }
                        if(this.mode.editor.selectedNodes[i] === this.mode.editor.activeNode)
                            active = nodes[i];
                    }
                    this.mode.editor.controller.deselectAllNodes();
                    this.mode.editor.controller.setActiveNode(active);
                    this.mode.changeState(new bamboo.editor.NewNodeState(this.mode, p, nodes));
                }
                return true;
            case 70:// F - find node (move camera there)
                if(this.mode.editor.selectedNodes.length !== 0) {
                    var pivot;
                    if(this.mode.editor.activeNode) {
                        pivot = this.mode.editor.activeNode._editorNode.layer.toLocalSpace(this.mode.editor.activeNode.getWorldPosition());
                    } else {
                        pivot = new Vec2();
                        for(var i=0; i<this.mode.editor.selectedNodes.length; i++) {
                            var n = this.mode.editor.selectedNodes[i];
                            pivot.add(n._editorNode.layer.toLocalSpace(n.getWorldPosition()));
                        }
                        pivot.x /= this.mode.editor.selectedNodes.length;
                        pivot.y /= this.mode.editor.selectedNodes.length;
                    }
                    
                    this.mode.editor.controller.moveCameraTo(pivot);
                }
                return true;
            case 71:// G - grab
                if(this.mode.editor.selectedNodes.length !== 0) {
                    this.mode.changeState(new bamboo.editor.MoveNodeState(this.mode, p, this.mode.editor.selectedNodes));
                }
                return true;
            case 80:// P - parent to / unparent
                if(this.mode.shiftDown) {
                    for(var i=0; i<this.mode.editor.selectedNodes.length; i++) {
                        var n = this.mode.editor.selectedNodes[i];
                        n._editorNode.setProperty('connectedTo', n._editorNode.layer);
                    }
                } else {
                    if(this.mode.editor.selectedNodes.length > 1 && this.mode.editor.activeNode) {
                        for(var i=0; i<this.mode.editor.selectedNodes.length; i++) {
                            var n = this.mode.editor.selectedNodes[i];
                            if(n === this.mode.editor.activeNode)
                                continue;
                            n._editorNode.setProperty('connectedTo', this.mode.editor.activeNode);
                        }
                    }
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
