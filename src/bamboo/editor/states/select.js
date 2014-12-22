game.module(
    'bamboo.editor.states.select'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

game.bamboo.editor.createState('Select', {
    enter: function() {
        if (!this.editor.activeNode) this.editor.showSceneSettings();
    },

    cancel: function() {
        this.editor.controller.deselectAllNodes();
        this.editor.controller.setActiveNode();
    },

    mousedown: function(event) {
        this._mousedown = true;
    },

    nodeMouseDown: function(node, event) {
        if (this.editor.activeNode === node) {
            var mousePos = new game.Point(event.global.x, event.global.y);
            var resizeArea = 10;
            var pos = node.getGlobalPosition();
            mousePos = this.editor.toGlobalSpace(mousePos);
            var bottomRightX = (pos.x - node.anchor.x * node.size.x) + node.size.x - resizeArea;
            var bottomRightY = (pos.y - node.anchor.y * node.size.y) + node.size.y - resizeArea;
            if (mousePos.x >= bottomRightX && mousePos.y >= bottomRightY) {
                // return this.editor.changeState('Resize');
            }
        }

        if (this.editor.selectedNodes.indexOf(node) !== -1) {
            this.editor.changeState('Move');
        }
    },

    mousemove: function(event) {
        if (this._mousedown) {
            this.editor.changeState('BoxSelect');
        }
    },

    mouseup: function(event) {
        this._mousedown = false;
    },

    nodeClick: function(node) {
        if (this.editor.selectedNodes.indexOf(node) !== -1) return;
        
        this.editor.controller.setActiveLayer(node.editorNode.layer);

        if (this.mode.shiftDown) {
            if (this.editor.selectedNodes.indexOf(node) !== -1) this.editor.controller.deselectNode(node);
            else this.editor.controller.selectNode(node);
        }
        else {
            this.editor.controller.setActiveNode(node);
        }
    },

    click: function(event) {
        if (this.mode.shiftDown) return;

        this.editor.controller.deselectAllNodes();
        this.editor.controller.setActiveNode();
    },

    keydown: function(key) {
        if (key === 'RIGHT') {
            var node;
            for (var i = 0; i < this.editor.selectedNodes.length; i++) {
                node = this.editor.selectedNodes[i];
                if (this.mode.altDown) {
                    node.editorNode.setProperty('rotation', node.rotation += 5);
                }
                else {
                    var newPos = this.mode.shiftDown ? 10 : 1;
                    node.editorNode.setProperty('position', new game.Point(node.position.x + newPos, node.position.y));
                }
            }
        }
        if (key === 'LEFT') {
            var node;
            for (var i = 0; i < this.editor.selectedNodes.length; i++) {
                node = this.editor.selectedNodes[i];
                if (this.mode.altDown) {
                    node.editorNode.setProperty('rotation', node.rotation -= 5);
                }
                else {
                    var newPos = this.mode.shiftDown ? 10 : 1;
                    node.editorNode.setProperty('position', new game.Point(node.position.x - newPos, node.position.y));    
                }
            }
        }
        if (key === 'UP') {
            var node;
            for (var i = 0; i < this.editor.selectedNodes.length; i++) {
                node = this.editor.selectedNodes[i];
                var newPos = this.mode.shiftDown ? 10 : 1;
                node.editorNode.setProperty('position', new game.Point(node.position.x, node.position.y - newPos));
            }
        }
        if (key === 'DOWN') {
            var node;
            for (var i = 0; i < this.editor.selectedNodes.length; i++) {
                node = this.editor.selectedNodes[i];
                var newPos = this.mode.shiftDown ? 10 : 1;
                node.editorNode.setProperty('position', new game.Point(node.position.x, node.position.y + newPos));
            }
        }
        if (key === 'N') {
            this.editor.controller.setNodeParent();
            return;
        }
        if (key === 'NUM_PLUS') {
            if (this.editor.activeNode) {
                this.editor.controller.moveNodeUp(this.editor.activeNode);
            }
        }
        if (key === 'NUM_MINUS') {
            if (this.editor.activeNode) {
                this.editor.controller.moveNodeDown(this.editor.activeNode);
            }
        }
        if (key === 'M') {
            if (this.editor.activeNode) {
                this.editor.scene.width = this.editor.activeNode.size.x;
                this.editor.scene.height = this.editor.activeNode.size.y;
                this.editor.boundaryLayer.resetGraphics();
            }
            return;
        }
        if (key === 'D') {
            this.editor.controller.duplicateSelectedNodes();
        }
        if (key === 'E') {
            if (this.editor.activeNode) return this.editor.changeMode('Edit');
        }
        if (key === 'BACKSPACE') {
            this.editor.controller.deleteSelectedNodes();
            return;
        }
    }
});

});
