game.module(
    'bamboo.editor.controller'
)
.body(function() {

bamboo.Controller = game.Class.extend({
    init: function(editor) {
        this.editor = editor;
    },

    createNode: function(className, properties, editorNodeProperties) {
        properties.name = this.editor.getUniqueName(properties.name);

        bamboo.nodes[className].prototype.ready = function() {};
        var node = new bamboo.nodes[className](this.editor.world, properties);

        if (!node.displayObject) node.displayObject = new game.Container();

        if (!bamboo.nodes[className].editor) {
            var proto = bamboo.nodes[className].prototype;
            while (true) {
                if (proto.constructor.editor) break;
                proto = Object.getPrototypeOf(proto);
                if (proto === game.Class.prototype) break;
            }

            bamboo.nodes[className].editor = proto.constructor.editor;
        }

        var editorNode = new bamboo.nodes[className].editor(node, this.editor, editorNodeProperties);
        editorNode.connectedToLine.visible = this.editor.viewNodes;
        editorNode.parentSelectionRect.visible = this.editor.viewNodes;
        editorNode.nameText.visible = this.editor.viewNodes;

        if (typeof editorNode.update === 'function') this.editor.world.updateableNodes.push(editorNode);

        if (node.displayObject && node.size.x === 0 && node.size.y === 0 && node.displayObject.width > 1 && node.displayObject.height > 1) {
            editorNode.setProperty('size', new game.Point(node.displayObject.width, node.displayObject.height));
        }
        if (node.size.x === 0 && node.size.y === 0) {
            editorNode.setProperty('size', new game.Point(64, 64));
        }

        node.displayObject.addChild(editorNode.displayObject);
        
        switch (this.editor.editorNodeVisibility) {
            case 0:
                editorNode.debugDisplayObject.visible = false;
                break;
            case 1:
                editorNode.debugDisplayObject.visible = true;
                editorNode.debugDisplayObject.alpha = 0.25;
                break;
            case 2:
                editorNode.debugDisplayObject.visible = true;
                editorNode.debugDisplayObject.alpha = 1.0;
                break;
        }
        
        this.editor.world.nodes.push(node);
        this.editor.nodes.push(editorNode);
        this.editor.nodeAdded(node);
        return node;
    },

    deleteNode: function(node) {
        this.deselectNode(node);
        this.editor.nodes.splice(this.editor.nodes.indexOf(node._editorNode), 1);
        this.editor.world.nodes.splice(this.editor.world.nodes.indexOf(node), 1);
        node.parent.displayObject.removeChild(node.displayObject);
        this.editor.nodeRemoved(node);
    },

    selectAllNodes: function() {
        for (var i=0; i<this.editor.nodes.length; i++) {
            var n = this.editor.nodes[i];
            if (n instanceof bamboo.nodes.Layer.editor) continue;
            if (n.layer === this.editor.activeLayer) {
                this.selectNode(n.node);
            }
        }
    },

    deselectAllNodes: function() {
        for (var i = this.editor.selectedNodes.length-1; i >= 0; i--) {
            this.deselectNode(this.editor.selectedNodes[i]);
        }
    },

    selectNode: function(node) {
        if (!node) return;
        
        // node is already selected
        if (this.editor.selectedNodes.indexOf(node) !== -1) return;

        this.editor.selectedNodes.push(node);
        node._editorNode.selectionRect.visible = true;
        node._editorNode.selectionAxis.visible = true;
        // node._editorNode.connectedToLine.visible = true;
        this.editor.nodeSelected(node);

        var markChildren = function(c) {
            for (var i=0; i<c.length; i++) {
                var n = c[i];
                // n._editorNode.parentSelectionRect.visible = true;
                // n._editorNode.connectedToLine.visible = true;
                // TODO: if (selectedNodes.indexOf(n) !== -1) continue
                markChildren(n.world.getConnectedNodes(n));
            }
        };

        // mark all children as parent selected
        markChildren(node.world.getConnectedNodes(node));
    },

    deselectNode: function(node) {
        var idx = this.editor.selectedNodes.indexOf(node);
        if (idx === -1) return;

        this.editor.selectedNodes.splice(idx, 1);
        node._editorNode.selectionAxis.visible = false;
        node._editorNode.selectionRect.visible = false;
        // node._editorNode.connectedToLine.visible = false;
        this.editor.nodeDeselected(node);

        if (this.editor.activeNode === node) this.setActiveNode(null);

        var unmarkChildren = function(c, selectedNodes) {
            for (var i=0; i<c.length; i++) {
                var n = c[i];
                // n._editorNode.parentSelectionRect.visible = false;
                // n._editorNode.connectedToLine.visible = false;

                if (selectedNodes.indexOf(n) !== -1)
                    continue;

                unmarkChildren(n.world.getConnectedNodes(n), selectedNodes);
            }
        };

        unmarkChildren(node.world.getConnectedNodes(node), this.editor.selectedNodes);
    },

    setActiveNode: function(node) {
        if (this.editor.activeNode === node) return;

        if (this.editor.activeNode) {
            this.editor.activeNode._editorNode.activeRect.visible = false;
            this.editor.activeNode._editorNode.activeAxis.visible = false;
            // this.editor.activeNode._editorNode.nameText.visible = false;
        }

        this.editor.activeNode = node;

        if (this.editor.activeNode) {
            this.selectNode(this.editor.activeNode);
            this.editor.activeNode._editorNode.activeAxis.visible = true;
            this.editor.activeNode._editorNode.activeRect.visible = true;
            // this.editor.activeNode._editorNode.nameText.visible = true;
        }
        
        if (node) this.editor.activeNodeChanged(node);
    },

    setActiveLayer: function(layer) {
        this.editor.activeLayer = layer;
        this.editor.propertyPanel.activeLayerChanged(layer);
        this.deselectAllNodes();
        this.setActiveNode(layer);
    },

    moveNodeUp: function(node) {
        var idx = node.displayObject.parent.children.indexOf(node.displayObject);
        if (idx === 0)
            return;// already behind everything

        node.displayObject.parent.addChildAt(node.displayObject, idx-1);
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.editor.propertyPanel.activeNodeChanged(node);
    },

    moveNodeDown: function(node) {
        var idx = node.displayObject.parent.children.indexOf(node.displayObject);
        if (idx === node.displayObject.parent.children.length-1)
            return;// already in front of everything

        node.displayObject.parent.addChildAt(node.displayObject, idx+1);
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.editor.propertyPanel.activeNodeChanged(node);
    },

    moveNodeTopMost: function(node) {
        var idx = node.displayObject.parent.children.indexOf(node.displayObject);
        if (idx === node.displayObject.parent.children.length-1)
            return;// already in front of everything

        node.displayObject.parent.addChildAt(node.displayObject, node.displayObject.parent.children.length-1);
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.editor.propertyPanel.activeNodeChanged(node);
    },

    moveNodeBottomMost: function(node) {
        var idx = node.displayObject.parent.children.indexOf(node.displayObject);
        if (idx === 0)
            return;// already behind everything

        node.displayObject.parent.addChildAt(node.displayObject, 0);
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.editor.propertyPanel.activeNodeChanged(node);
    },

    moveLayerUp: function(layer) {
        var idx = layer.displayObject.parent.children.indexOf(layer.displayObject);
        if (idx === 0)
            return;// already behind everything
        layer.displayObject.parent.addChildAt(layer.displayObject, idx-1);
        idx = this.editor.layers.indexOf(layer);
        this.editor.layers.splice(idx, 1);
        this.editor.layers.splice(idx-1, 0, layer);
        this.editor.propertyPanel.updateLayerList();
    },
    
    moveLayerDown: function(layer) {
        var idx = layer.displayObject.parent.children.indexOf(layer.displayObject);
        if (idx === layer.displayObject.parent.children.length-1)
            return;// already on front of everything
        layer.displayObject.parent.addChildAt(layer.displayObject, idx+1);
        idx = this.editor.layers.indexOf(layer);
        this.editor.layers.splice(idx, 1);
        this.editor.layers.splice(idx+1, 0, layer);
        this.editor.propertyPanel.updateLayerList();
    },

    moveCameraTo: function(pos) {
        self = this.editor;
        var nHalfScreen = new game.Vec2(-this.editor.world.screenSize.width/2, -this.editor.world.screenSize.height/2);
        var tgtCamPos = this.editor.worldTargetPos.subtractc(nHalfScreen.add(pos).multiply(this.editor.zoom));
        this.editor.zoomPosTween = new game.Tween(self.cameraWorldPosition).to({x: tgtCamPos.x, y: tgtCamPos.y}, 250).easing(game.Tween.Easing.Quadratic.Out).onUpdate(function() {self.cameraWorldPosition = this;}).onComplete(function() {self.zoomPosTween = null;}).start();
    },

    enableEditMode: function(node, enabled) {
        if (enabled) {
            node._editorNode.selectionRect.visible = false;
            node._editorNode.editableRect.visible = true;
            node._editorNode.selectionAxis.visible = true;
        } else {
            node._editorNode.selectionRect.visible = true;
            node._editorNode.editableRect.visible = false;
            node._editorNode.selectionAxis.visible = false;
        }
    }
});

});
