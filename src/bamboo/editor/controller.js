game.module(
    'bamboo.editor.controller'
)
.body(function() {

game.bamboo.Controller = game.Class.extend({
    init: function(editor) {
        this.editor = editor;
    },

    createNode: function(className, properties, editorNodeProperties) {
        properties.name = this.editor.getUniqueName(properties.name);

        game.bamboo.nodes[className].prototype.ready = function() {};
        var node = new game.bamboo.nodes[className](this.editor.scene, properties);

        if (!game.bamboo.nodes[className].editor) {
            var proto = game.bamboo.nodes[className].prototype;
            while (true) {
                if (proto.constructor.editor) break;
                proto = Object.getPrototypeOf(proto);
                if (proto === game.Class.prototype) break;
            }

            game.bamboo.nodes[className].editor = proto.constructor.editor;
        }

        var editorNode = new game.bamboo.nodes[className].editor(node, this.editor, editorNodeProperties);
        editorNode.connectedToLine.visible = this.editor.viewNodes;
        editorNode.parentSelectionRect.visible = this.editor.viewNodes;
        editorNode.nameText.visible = this.editor.viewNodes;
        editorNode.debugDisplayObject.visible = this.editor.viewNodes;

        if (typeof editorNode.update === 'function') this.editor.scene.activeNodes.push(editorNode);
        
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
        
        this.editor.scene.nodes.push(node);
        this.editor.nodes.push(editorNode);
        return node;
    },

    deleteNode: function(node) {
        this.deselectNode(node);
        this.editor.nodes.splice(this.editor.nodes.indexOf(node.editorNode), 1);
        this.editor.scene.nodes.splice(this.editor.scene.nodes.indexOf(node), 1);
        node.parent.displayObject.removeChild(node.displayObject);
        node.editorNode.displayObject.parent.removeChild(node.editorNode.displayObject);
        this.editor.nodeRemoved(node);

        for (var i = 0; i < node.children.length; i++) {
            this.deleteNode(node.children[i]);
        }
    },

    setNodeParent: function() {
        if (this.editor.selectedNodes.length > 1 && this.editor.activeNode) {
            var parent = this.editor.activeNode;
            
            for (var i = this.editor.selectedNodes.length - 1; i >= 0; i--) {
                var node = this.editor.selectedNodes[i];
                if (node !== parent) {
                    if (parent.parent === node) continue;
                    node.editorNode.setProperty('parent', parent);
                    this.editor.controller.deselectNode(node);
                }
            }
        }
        else if (this.editor.activeNode) {
            var parent = this.editor.activeLayer;
            var globalPos = this.editor.activeNode.getGlobalPosition();
            this.editor.activeNode.editorNode.setProperty('parent', parent);
            this.editor.activeNode.editorNode.setProperty('position', globalPos);
        }
    },

    deleteSelectedNodes: function() {
        if (this.editor.selectedNodes.length !== 0) {
            for (var i = this.editor.selectedNodes.length-1; i >= 0; i--) {
                this.editor.controller.deleteNode(this.editor.selectedNodes[i]);
            }
            this.editor.mode.state.cancel();
            this.editor.changeState('Select');
        }
    },

    selectAllNodes: function() {
        for (var i = 0; i < this.editor.nodes.length; i++) {
            var n = this.editor.nodes[i];
            if (n instanceof game.bamboo.nodes.Layer.editor) continue;
            if (n.layer === this.editor.activeLayer) {
                this.selectNode(n.node);
            }
        }
    },

    deselectAllNodes: function(layer) {
        for (var i = this.editor.selectedNodes.length-1; i >= 0; i--) {
            if (layer && this.editor.selectedNodes[i].editorNode.layer !== layer) continue;
            this.deselectNode(this.editor.selectedNodes[i]);
        }
        this.editor.changeState('Select');
    },

    selectNode: function(node) {
        if (!node) return;
        
        if (this.editor.selectedNodes.indexOf(node) !== -1) return;

        this.editor.selectedNodes.push(node);
        node.editorNode.selectionRect.visible = true;
        node.editorNode.anchorBox.visible = true;
        this.editor.nodeSelected(node);

        var markChildren = function(c) {
            for (var i = 0; i < c.length; i++) {
                var n = c[i];
                markChildren(n.scene.getConnectedNodes(n));
            }
        };

        // mark all children as parent selected
        markChildren(node.scene.getConnectedNodes(node));
    },

    deselectNode: function(node) {
        var idx = this.editor.selectedNodes.indexOf(node);
        if (idx === -1) return;

        this.editor.selectedNodes.splice(idx, 1);
        node.editorNode.selectionRect.visible = false;
        node.editorNode.anchorBox.visible = false;
        this.editor.nodeDeselected(node);

        var unmarkChildren = function(c, selectedNodes) {
            for (var i=0; i<c.length; i++) {
                var n = c[i];

                if (selectedNodes.indexOf(n) !== -1) continue;

                unmarkChildren(n.scene.getConnectedNodes(n), selectedNodes);
            }
        };

        unmarkChildren(node.scene.getConnectedNodes(node), this.editor.selectedNodes);
    },

    duplicateNode: function(node, parent) {
        var json = node.editorNode.toJSON();
        json.properties.name = this.editor.getUniqueName(json.properties.name);
        if (parent) json.properties.parent = parent.name;

        var newNode = this.createNode(json.class, json.properties);
        newNode.initProperties();
        newNode.editorNode.layerChanged();
        newNode.editorNode.ready();
        newNode.editorNode.setProperty('size', newNode.size);

        for (var i = 0; i < node.children.length; i++) {
            this.duplicateNode(node.children[i], newNode);
        }

        return newNode;
    },

    duplicateSelectedNodes: function() {
        var newNodes = [];
        
        for (var i = 0; i < this.editor.selectedNodes.length; i++) {
            var node = this.editor.selectedNodes[i];
            var newNode = this.duplicateNode(node);
            newNodes.push(newNode);
        }

        this.editor.controller.deselectAllNodes();
        
        if (newNodes.length === 1) this.setActiveNode(newNodes[0]);
        else this.setActiveNode();
        
        for (var i = 0; i < newNodes.length; i++) {
            this.selectNode(newNodes[i]);
        }
        
        this.editor.changeState('Move');
    },

    setActiveNode: function(node) {
        if (this.editor.activeNode === node) return;

        if (this.editor.activeNode) {
            this.editor.activeNode.editorNode.activeRect.visible = false;
            this.editor.activeNode.editorNode.anchorBox.visible = false;
        }

        this.editor.activeNode = node;
        
        if (node) {
            this.deselectAllNodes();
            this.selectNode(node);
            this.editor.activeNode.editorNode.selectionRect.visible = false;
            this.editor.activeNode.editorNode.anchorBox.visible = true;
            this.editor.activeNode.editorNode.activeRect.visible = true;
        }
        
        this.editor.activeNodeChanged(node);
    },

    setActiveLayer: function(layer) {
        if (this.editor.activeLayer === layer) return;
        this.editor.activeLayer = layer;
        this.editor.propertyPanel.activeLayerChanged(layer);

        for (var i = 0; i < this.editor.nodes.length; i++) {
            if (this.editor.nodes[i].layer === layer) {
                this.editor.nodes[i].displayObject.visible = true;
            }
            else {
                this.editor.nodes[i].displayObject.visible = false;
            }
        }

        this.deselectAllNodes();
        this.setActiveNode();
    },

    moveNodeDown: function(node) {
        var prevIndex;
        for (var i = 0; i < this.editor.scene.nodes.length; i++) {
            if (this.editor.scene.nodes[i].parent === node.parent) {
                if (typeof prevIndex === 'undefined' && this.editor.scene.nodes[i] === node) {
                    // Node already first
                    return;
                }
                if (this.editor.scene.nodes[i] === node) break;
                prevIndex = i;
            }
        }

        var prevNode = this.editor.scene.nodes[prevIndex];
        var thisIndex = this.editor.scene.nodes.indexOf(node);

        // Swap nodes
        this.editor.scene.nodes[prevIndex] = node;
        this.editor.scene.nodes[thisIndex] = prevNode;

        // Swap editor nodes
        prevIndex = this.editor.nodes.indexOf(prevNode.editorNode);
        thisIndex = this.editor.nodes.indexOf(node.editorNode);
        this.editor.nodes[prevIndex] = node.editorNode;
        this.editor.nodes[thisIndex] = prevNode.editorNode;

        // Swap displayObjects
        prevIndex = node.parent.displayObject.children.indexOf(prevNode.displayObject);
        thisIndex = node.parent.displayObject.children.indexOf(node.displayObject);
        node.parent.displayObject.children[prevIndex] = node.displayObject;
        node.parent.displayObject.children[thisIndex] = prevNode.displayObject;

        this.editor.propertyPanel.activeLayerChanged(node.editorNode.layer);
    },

    moveNodeUp: function(node) {
        var thisIndex;
        var nextIndex;
        for (var i = 0; i < this.editor.scene.nodes.length; i++) {
            if (this.editor.scene.nodes[i].parent === node.parent) {
                if (typeof thisIndex !== 'undefined' && typeof nextIndex === 'undefined') {
                    nextIndex = i;
                }
                if (this.editor.scene.nodes[i] === node) thisIndex = i;
            }
        }
        // Already last
        if (typeof nextIndex === 'undefined') return;

        var nextNode = this.editor.scene.nodes[nextIndex];

        // Swap nodes
        this.editor.scene.nodes[nextIndex] = node;
        this.editor.scene.nodes[thisIndex] = nextNode;

        // Swap editor nodes
        nextIndex = this.editor.nodes.indexOf(nextNode.editorNode);
        thisIndex = this.editor.nodes.indexOf(node.editorNode);
        this.editor.nodes[nextIndex] = node.editorNode;
        this.editor.nodes[thisIndex] = nextNode.editorNode;

        // Swap displayObjects
        nextIndex = node.parent.displayObject.children.indexOf(nextNode.displayObject);
        thisIndex = node.parent.displayObject.children.indexOf(node.displayObject);
        node.parent.displayObject.children[nextIndex] = node.displayObject;
        node.parent.displayObject.children[thisIndex] = nextNode.displayObject;

        this.editor.propertyPanel.activeLayerChanged(node.editorNode.layer);
    },

    moveNodeTop: function(node) {
        node = node || this.editor.activeNode;
        if (!node) return;

        // Move node
        var nodeIndex = this.editor.scene.nodes.indexOf(node);
        this.editor.scene.nodes.splice(nodeIndex, 1);
        this.editor.scene.nodes.push(node);

        // Move editor node
        nodeIndex = this.editor.nodes.indexOf(node.editorNode);
        this.editor.nodes.splice(nodeIndex, 1);
        this.editor.nodes.push(node.editorNode);

        // Move displayObject
        node.parent.displayObject.removeChild(node.displayObject);
        node.parent.displayObject.addChild(node.displayObject);

        this.editor.propertyPanel.activeLayerChanged(node.editorNode.layer);

        game.bamboo.console.log('Moved node to top');
    },

    moveNodeBottom: function(node) {
        node = node || this.editor.activeNode;
        if (!node) return;

        // Move node
        var nodeIndex = this.editor.scene.nodes.indexOf(node);
        this.editor.scene.nodes.splice(nodeIndex, 1);
        this.editor.scene.nodes.unshift(node);

        // Move editor node
        nodeIndex = this.editor.nodes.indexOf(node.editorNode);
        this.editor.nodes.splice(nodeIndex, 1);
        this.editor.nodes.unshift(node.editorNode);

        // Move displayObject
        node.parent.displayObject.removeChild(node.displayObject);
        node.parent.displayObject.addChildAt(node.displayObject, 0);

        this.editor.propertyPanel.activeLayerChanged(node.editorNode.layer);

        game.bamboo.console.log('Moved node to bottom');
    },

    moveLayerUp: function(layer) {
        var prevLayerIndex;
        for (var i = 0; i < this.editor.scene.nodes.length; i++) {
            if (this.editor.layers.indexOf(this.editor.scene.nodes[i]) !== -1) {
                // Layer found
                if (this.editor.scene.nodes[i] === layer) break;
                prevLayerIndex = i;
            }
        }
        if (typeof prevLayerIndex !== 'number') return;

        var layerIndex = this.editor.scene.nodes.indexOf(layer);
        var prevLayer = this.editor.scene.nodes[prevLayerIndex];
        // Swap layers
        this.editor.scene.nodes[prevLayerIndex] = layer;
        this.editor.scene.nodes[layerIndex] = prevLayer;

        var idx = layer.displayObject.parent.children.indexOf(layer.displayObject);
        if (idx === 0) return;
        layer.displayObject.parent.addChildAt(layer.displayObject, idx - 1);
        idx = this.editor.layers.indexOf(layer);
        this.editor.layers.splice(idx, 1);
        this.editor.layers.splice(idx - 1, 0, layer);
        this.editor.propertyPanel.updateLayerList();
    },
    
    moveLayerDown: function(layer) {
        var nextLayerIndex;
        for (var i = this.editor.scene.nodes.length - 1; i >= 0; i--) {
            if (this.editor.layers.indexOf(this.editor.scene.nodes[i]) !== -1) {
                // Layer found
                if (this.editor.scene.nodes[i] === layer) break;
                nextLayerIndex = i;
            }
        }
        if (typeof nextLayerIndex !== 'number') return;

        var layerIndex = this.editor.scene.nodes.indexOf(layer);
        var nextLayer = this.editor.scene.nodes[nextLayerIndex];
        // Swap layers
        this.editor.scene.nodes[nextLayerIndex] = layer;
        this.editor.scene.nodes[layerIndex] = nextLayer;

        var idx = layer.displayObject.parent.children.indexOf(layer.displayObject);
        if (idx === layer.displayObject.parent.children.length - 1) return;
        layer.displayObject.parent.addChildAt(layer.displayObject, idx + 1);
        idx = this.editor.layers.indexOf(layer);
        this.editor.layers.splice(idx, 1);
        this.editor.layers.splice(idx + 1, 0, layer);
        this.editor.propertyPanel.updateLayerList();
    },

    enableEditMode: function(node, enabled) {
        node.editableRect.visible = enabled;
        node.enableEditMode(enabled);
    }
});

});
