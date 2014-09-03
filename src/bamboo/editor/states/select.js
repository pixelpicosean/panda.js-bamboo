game.module(
    'bamboo.editor.states.select'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.StateSelect = bamboo.editor.State.extend({
    init: function(mode) {
        this._super(mode);
        
        if (this.mode.editor.activeNode) {
            this.helpText = 'Select state: (D)uplicate, (E)dit, BACKSPACE remove';
        }
        else {
            this.helpText = 'Select state: MOUSE select';
            this.mode.editor.showSettings();
        }
    },

    cancel: function() {
        this.mode.editor.controller.deselectAllNodes();
    },

    mousedown: function(event) {
        var mousePos = new game.Point(event.global.x, event.global.y);

        if (this.mode.editor.activeNode) {
            var node = this.mode.editor.getNodeAt(mousePos, this.mode.editor.activeLayer);

            if (this.mode.editor.activeNode === node) {
                this.mode.editor.changeState('Move');
            }
        }
    },

    apply: function(event) {
        var mousePos = new game.Point(event.global.x, event.global.y);
        var node;

        // if we have selected node, and its under the cursor, try to find next node
        if (this.mode.editor.activeNode && this.mode.editor.isNodeAt(mousePos, this.mode.editor.activeNode._editorNode)) {
            node = this.mode.editor.getNextNodeAt(mousePos, this.mode.editor.activeLayer, this.mode.editor.activeNode._editorNode);
        }

        if (!node) {
            node = this.mode.editor.getNodeAt(mousePos, this.mode.editor.activeLayer);
        }

        if (!node) {
            this.mode.editor.controller.deselectAllNodes();
            this.mode.editor.changeState('Select');
            return;
        }
        
        if (!this.mode.shiftDown && !this.mode.altDown) this.mode.editor.controller.deselectAllNodes();
        
        if (this.mode.altDown) {
            this.mode.editor.controller.deselectNode(node);
        } else {
            this.mode.editor.controller.selectNode(node);
            this.mode.editor.controller.setActiveNode(node);
        }

        this.mode.editor.changeState('Select');
    },

    assignGroup: function(number) {
        if (!bamboo.editor.SelectionGroups) {
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
        if (!this.mode.shiftDown && !this.mode.altDown)
            this.mode.editor.controller.deselectAllNodes();

        if (!bamboo.editor.SelectionGroups)
            return;

        if (this.mode.altDown) {
            for(var i=0; i<bamboo.editor.SelectionGroups[number].length; i++) {
                this.mode.editor.controller.deselectNode(bamboo.editor.SelectionGroups[number][i]);
            }
        } else {
            for(var i=0; i<bamboo.editor.SelectionGroups[number].length; i++) {
                this.mode.editor.controller.selectNode(bamboo.editor.SelectionGroups[number][i]);
            }
        }
    },

    keydown: function(key) {
        if (key === 'M') {
            if (this.mode.editor.activeNode) {
                this.mode.editor.world.width = this.mode.editor.activeNode.size.x;
                this.mode.editor.world.height = this.mode.editor.activeNode.size.y;
                this.mode.editor.boundaryLayer.resetGraphics();
            }
            return;
        }
        if (key === 'D') {
            if (this.mode.editor.activeNode) {
                var node = this.mode.editor.activeNode;
                var json = node._editorNode.toJSON();
                json.properties.name = json.class;
                var newNode = this.mode.editor.controller.createNode(json.class, json.properties);
                this.mode.editor.controller.deselectAllNodes();
                this.mode.editor.controller.setActiveNode(newNode);
                this.mode.editor.changeState('Move');

                var parentPos = node.getWorldPosition();
                var pos = this.mode.editor.toWorldSpace(this.mode.editor.prevMousePos);
                this.mode.state.offset.x -= pos.x - parentPos.x;
                this.mode.state.offset.y -= pos.y - parentPos.y;
                this.mode.state.update(this.mode.editor.prevMousePos.x, this.mode.editor.prevMousePos.y);

                return;
            }
        }
        if (key === 'E') {
            if (this.mode.editor.activeNode) return this.mode.editor.changeMode('Edit');
        }
        if (key === 'BACKSPACE') {
            if (this.mode.editor.selectedNodes.length !== 0) {
                for (var i = this.mode.editor.selectedNodes.length-1; i >= 0; i--) {
                    this.mode.editor.controller.deleteNode(this.mode.editor.selectedNodes[i]);
                }
                this.cancel();
                this.mode.editor.changeState('Select');
            }
            return true;
        }
    },

    onkeyup: function(keycode, p) {
        switch(keycode) {
            case 33:// Page Up - sink node
                if (this.mode.editor.activeNode) {
                    this.mode.editor.controller.moveNodeUp(this.mode.editor.activeNode);
                }
                return true;
            case 34:// Page Down - lift node
                if (this.mode.editor.activeNode) {
                    this.mode.editor.controller.moveNodeDown(this.mode.editor.activeNode);
                }
                return true;
            case 35:// End - lift to top most
                if (this.mode.editor.activeNode) {
                    this.mode.editor.controller.moveNodeTopMost(this.mode.editor.activeNode);
                }
                return true;
            case 36:// Home - sink to bottom most
                if (this.mode.editor.activeNode) {
                    this.mode.editor.controller.moveNodeBottomMost(this.mode.editor.activeNode);
                }
                return true;
            case 46:// DEL - delete
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
                if (this.mode.ctrlDown) {
                    this.assignGroup(number);
                } else {
                    this.selectGroup(number);
                }
                return true;
            case 65:// A - select all / add
                if (this.mode.shiftDown) {
                    this.mode.changeState(new bamboo.editor.CreateNodeState(this.mode));
                } else {
                    if (this.mode.editor.selectedNodes.length !== 0)
                        this.mode.editor.controller.deselectAllNodes();
                    else
                        this.mode.editor.controller.selectAllNodes();
                }
                return true;
            case 66:// B - box select
                this.mode.changeState(new bamboo.editor.BoxSelectState(this.mode, p));
                return true;
            case 68:// D - duplicate
                if (this.mode.editor.selectedNodes.length !== 0) {

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
                        if (idx !== -1) {
                            nodes[i].connectedTo = nodes[idx];
                        }
                        if (this.mode.editor.selectedNodes[i] === this.mode.editor.activeNode)
                            active = nodes[i];
                    }
                    this.mode.editor.controller.deselectAllNodes();
                    this.mode.editor.controller.setActiveNode(active);
                    this.mode.changeState(new bamboo.editor.NewNodeState(this.mode, p, nodes));
                }
                return true;
            case 70:// F - find node (move camera there)
                if (this.mode.editor.selectedNodes.length !== 0) {
                    var pivot;
                    if (this.mode.editor.activeNode) {
                        pivot = this.mode.editor.activeNode._editorNode.layer.toLocalSpace(this.mode.editor.activeNode.getWorldPosition());
                    } else {
                        pivot = new game.Point();
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
            case 80:// P - parent to / unparent
                if (this.mode.shiftDown) {
                    for(var i=0; i<this.mode.editor.selectedNodes.length; i++) {
                        var n = this.mode.editor.selectedNodes[i];
                        n._editorNode.setProperty('connectedTo', n._editorNode.layer);
                    }
                } else {
                    if (this.mode.editor.selectedNodes.length > 1 && this.mode.editor.activeNode) {
                        for(var i=0; i<this.mode.editor.selectedNodes.length; i++) {
                            var n = this.mode.editor.selectedNodes[i];
                            if (n === this.mode.editor.activeNode)
                                continue;
                            n._editorNode.setProperty('connectedTo', this.mode.editor.activeNode);
                        }
                    }
                }
                return true;
            case 82:// R - rotate
                if (this.mode.editor.selectedNodes.length !== 0) {
                    var pivot;
                    if (this.mode.editor.activeNode) {
                        pivot = this.mode.editor.activeNode.getWorldPosition();
                    } else {
                        pivot = new game.Point();
                        for(var i=0; i<this.mode.editor.selectedNodes.length; i++)
                            pivot.add(this.mode.editor.selectedNodes[i].getWorldPosition());
                        pivot.x /= this.mode.editor.selectedNodes.length;
                        pivot.y /= this.mode.editor.selectedNodes.length;
                    }
                    this.mode.changeState(new bamboo.editor.RotateNodeState(this.mode, p, this.mode.editor.selectedNodes, pivot));
                }
                return true;
            case 83:// S - scale
                if (this.mode.editor.selectedNodes.length !== 0) {
                    var pivot;
                    if (this.mode.editor.activeNode) {
                        pivot = this.mode.editor.activeNode.getWorldPosition();
                    } else {
                        pivot = new game.Point();
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

    filedrop: function(event) {
        for (var i = 0; i < event.dataTransfer.files.length; i++) {
            var file = event.dataTransfer.files[i];
            var parts = file.name.split('.');
            var suffix = parts[parts.length - 1];

            if (suffix !== 'png') {
                return this.mode.editor.showError('Only png images are supported!');
            }

            var reader = new FileReader();
            var editor = this.mode.editor;
            var filename = file.name;
            reader.onload = function(e) {
                var imgData = e.target.result;
                var texture = game.Texture.fromImage(imgData, true);

                if (game.TextureCache[filename]) throw 'Image ' + filename + ' already found.';

                game.TextureCache[filename] = texture;

                editor.addImage(filename);
            };
            reader.readAsDataURL(file);
        }

        return false;
    }
});

});
