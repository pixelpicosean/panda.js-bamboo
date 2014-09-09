game.module(
    'bamboo.editor.states.select'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.StateSelect = bamboo.editor.State.extend({
    enter: function() {        
        if (this.mode.editor.activeNode) {
            this.helpText = 'Select state: (D)uplicate, (E)dit, Set pare(n)t, BACKSPACE remove';
        }
        else {
            this.helpText = 'Select state: MOUSE select';
            this.mode.editor.showSettings();
        }
    },

    cancel: function() {
        this.mode.editor.controller.deselectAllNodes();
        this.mode.editor.controller.setActiveNode();
    },

    mousedown: function(event) {
        var mousePos = new game.Point(event.global.x, event.global.y);

        if (this.mode.editor.selectedNodes.length > 0) {
            var node = this.mode.editor.getNodeAt(mousePos, this.mode.editor.activeLayer);

            if (node && this.mode.editor.activeNode === node) {
                var resizeArea = 10;
                var pos = node.getWorldPosition();
                mousePos = this.mode.editor.toWorldSpace(mousePos);
                var bottomRightX = (pos.x - node.anchor.x * node.size.x) + node.size.x - resizeArea;
                var bottomRightY = (pos.y - node.anchor.y * node.size.y) + node.size.y - resizeArea;
                if (mousePos.x >= bottomRightX && mousePos.y >= bottomRightY) {
                    this.mode.editor.changeState('Resize');
                    return;
                }
            }

            if (this.mode.editor.selectedNodes.indexOf(node) !== -1) {
                this.mode.editor.changeState('Move');
            }
        }

        this._mousedown = true;
    },

    mousemove: function(event) {
        if (this._mousedown) this.mode.editor.changeState('BoxSelect');
    },

    mouseup: function(event) {
        this._mousedown = false;
    },

    click: function(event) {
        var mousePos = new game.Point(event.global.x, event.global.y);
        var node;

        if (!node) {
            node = this.mode.editor.getNodeAt(mousePos, this.mode.editor.activeLayer);
            if (node) {
                this.mode.editor.controller.setActiveLayer(node._editorNode.layer);
            }
        }

        if (!node) {
            this.mode.editor.controller.deselectAllNodes();
            this.mode.editor.controller.setActiveNode();
            this.mode.editor.changeState('Select');
            return;
        }
        
        if (!this.mode.shiftDown && !this.mode.altDown) this.mode.editor.controller.deselectAllNodes();
        
        if (this.mode.altDown) {
            this.mode.editor.controller.deselectNode(node);
        } else {
            if (this.mode.shiftDown && this.mode.editor.selectedNodes.indexOf(node) !== -1) {
                this.mode.editor.controller.deselectNode(node);
            }
            else {
                this.mode.editor.controller.selectNode(node);
            }
            if (!this.mode.shiftDown) this.mode.editor.controller.setActiveNode(node);
        }

        this.mode.editor.changeState('Select');
    },

    keydown: function(key) {
        if (key === 'N') {
            if (this.mode.editor.selectedNodes.length > 1 && this.mode.editor.activeNode) {
                var parent = this.mode.editor.activeNode;
                
                for (var i = this.mode.editor.selectedNodes.length - 1; i >= 0; i--) {
                    var node = this.mode.editor.selectedNodes[i];
                    if (node !== parent) {
                        node._editorNode.setProperty('parent', parent);
                        this.mode.editor.controller.deselectNode(node);
                    }
                }
            }
        }
        if (key === 'NUM_PLUS') {
            if (this.mode.editor.activeNode) {
                this.mode.editor.controller.moveNodeUp(this.mode.editor.activeNode);
            }
        }
        if (key === 'NUM_MINUS') {
            if (this.mode.editor.activeNode) {
                this.mode.editor.controller.moveNodeDown(this.mode.editor.activeNode);
            }
        }
        if (key === 'M') {
            if (this.mode.editor.activeNode) {
                this.mode.editor.world.width = this.mode.editor.activeNode.size.x;
                this.mode.editor.world.height = this.mode.editor.activeNode.size.y;
                this.mode.editor.boundaryLayer.resetGraphics();
            }
            return;
        }
        if (key === 'D') {
            var newNodes = [];
            for (var i = 0; i < this.mode.editor.selectedNodes.length; i++) {
                var node = this.mode.editor.selectedNodes[i];
                var json = node._editorNode.toJSON();
                json.properties.name = json.class;
                var newNode = this.mode.editor.controller.createNode(json.class, json.properties);
                newNode.initProperties();
                newNode._editorNode.layerChanged();
                newNode._editorNode.ready();

                newNode._editorNode.setProperty('size', newNode.size);

                newNodes.push(newNode);
            }
            this.mode.editor.controller.deselectAllNodes();
            if (newNodes.length === 1) this.mode.editor.controller.setActiveNode(newNodes[0]);
            else this.mode.editor.controller.setActiveNode();
            for (var i = 0; i < newNodes.length; i++) {
                this.mode.editor.controller.selectNode(newNodes[i]);
            }
            
            this.mode.editor.changeState('Move');
            return;
            if (this.mode.editor.activeNode) {
                var node = this.mode.editor.activeNode;
                var json = node._editorNode.toJSON();
                json.properties.name = json.class;
                var newNode = this.mode.editor.controller.createNode(json.class, json.properties);
                newNode.initProperties();
                newNode._editorNode.layerChanged();
                newNode._editorNode.ready();

                newNode._editorNode.setProperty('size', newNode.size);

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
    }
});

});
