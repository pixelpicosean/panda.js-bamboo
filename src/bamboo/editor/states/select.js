game.module(
    'bamboo.editor.states.select'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

game.bamboo.editor.createState('Select', {
    enter: function() {        
        if (!this.mode.editor.activeNode) this.mode.editor.showSettings();
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
                var pos = node.getGlobalPosition();
                mousePos = this.mode.editor.toGlobalSpace(mousePos);
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
        var button = event.originalEvent.button;
        var mousePos = new game.Point(event.global.x, event.global.y);
        var node;

        if (!node) {
            node = this.mode.editor.getNodeAt(mousePos, this.mode.editor.activeLayer);
            if (node) {
                this.mode.editor.controller.setActiveLayer(node.editorNode.layer);
            }
        }

        if (!node) {
            this.mode.editor.controller.deselectAllNodes();
            this.mode.editor.controller.setActiveNode();
            this.mode.editor.changeState('Select');
            return;
        }
        
        if (!this.mode.shiftDown && !this.mode.altDown && button < 2) this.mode.editor.controller.deselectAllNodes();
        
        if (this.mode.altDown) {
            this.mode.editor.controller.deselectNode(node);
        } else {
            if (this.mode.shiftDown && this.mode.editor.selectedNodes.indexOf(node) !== -1) {
                this.mode.editor.controller.deselectNode(node);
            }
            else {
                this.mode.editor.controller.selectNode(node);
            }
            if (!this.mode.shiftDown && button < 2) this.mode.editor.controller.setActiveNode(node);
        }

        this.mode.editor.changeState('Select');
    },

    keydown: function(key) {
        if (key === 'RIGHT') {
            var node;
            for (var i = 0; i < this.mode.editor.selectedNodes.length; i++) {
                node = this.mode.editor.selectedNodes[i];
                var newPos = this.mode.shiftDown ? node.size.x : this.mode.editor.gridSize || 1;
                node.editorNode.setProperty('position', new game.Point(node.position.x + newPos, node.position.y));
            }
        }
        if (key === 'LEFT') {
            var node;
            for (var i = 0; i < this.mode.editor.selectedNodes.length; i++) {
                node = this.mode.editor.selectedNodes[i];
                var newPos = this.mode.shiftDown ? node.size.x : this.mode.editor.gridSize || 1;
                node.editorNode.setProperty('position', new game.Point(node.position.x - newPos, node.position.y));
            }
        }
        if (key === 'UP') {
            var node;
            for (var i = 0; i < this.mode.editor.selectedNodes.length; i++) {
                node = this.mode.editor.selectedNodes[i];
                var newPos = this.mode.shiftDown ? node.size.y : this.mode.editor.gridSize || 1;
                node.editorNode.setProperty('position', new game.Point(node.position.x, node.position.y - newPos));
            }
        }
        if (key === 'DOWN') {
            var node;
            for (var i = 0; i < this.mode.editor.selectedNodes.length; i++) {
                node = this.mode.editor.selectedNodes[i];
                var newPos = this.mode.shiftDown ? node.size.y : this.mode.editor.gridSize || 1;
                node.editorNode.setProperty('position', new game.Point(node.position.x, node.position.y + newPos));
            }
        }
        if (key === 'N') {
            this.mode.editor.controller.setNodeParent();
            return;
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
                this.mode.editor.scene.width = this.mode.editor.activeNode.size.x;
                this.mode.editor.scene.height = this.mode.editor.activeNode.size.y;
                this.mode.editor.boundaryLayer.resetGraphics();
            }
            return;
        }
        if (key === 'D') {
            this.mode.editor.controller.duplicateSelectedNodes();
        }
        if (key === 'E') {
            if (this.mode.editor.activeNode) return this.mode.editor.changeMode('Edit');
        }
        if (key === 'BACKSPACE') {
            this.mode.editor.controller.deleteSelectedNodes();
            return;
        }
    }
});

});
