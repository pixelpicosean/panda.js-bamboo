game.module(
    'bamboo.editor.node'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

game.addAsset('../src/bamboo/editor/media/anchorbox.png');

game.bamboo.Node.editor = game.Class.extend({
    editMode: false,
    propertyChangeListeners: [],
    properties: {
        selectable: true,
        linkable: false
    },

    init: function(node, editor) {
        this.editor = editor;
        this.node = node;
        this.node.editorNode = this;

        this.displayObject = new game.Container();

        this.debugDisplayObject = new game.Container();
        this.displayObject.addChild(this.debugDisplayObject);

        this.selectionRect = new game.Graphics();
        this.selectionRect.visible = false;
        this.displayObject.addChild(this.selectionRect);

        this.activeRect = new game.Graphics();
        this.activeRect.visible = false;
        this.displayObject.addChild(this.activeRect);

        this.connectedToLine = new game.Graphics();
        this.connectedToLine.visible = false;
        this.displayObject.addChild(this.connectedToLine);

        this.nameText = new game.Text(this.node.name, { font: '12px Arial', fill: 'white' });
        this.nameText.alpha = 0.7;
        this.nameText.visible = false;
        this.displayObject.addChild(this.nameText);
        
        this.editableRect = new game.Graphics();
        this.editableRect.visible = false;
        this.displayObject.addChild(this.editableRect);

        this.parentSelectionRect = new game.Graphics();
        this.parentSelectionRect.visible = false;
        this.displayObject.addChild(this.parentSelectionRect);

        this.anchorBox = new game.Sprite('../src/bamboo/editor/media/anchorbox.png');
        this.anchorBox.anchor.set(0.5, 0.5);
        this.anchorBox.alpha = 0.5;
        this.anchorBox.visible = false;
        this.displayObject.addChild(this.anchorBox);
    },

    ready: function() {
        this.node.parent.editorNode.displayObject.addChild(this.displayObject);
        this.displayObject.position.set(this.node.position.x, this.node.position.y);
        this.redrawConnectedToLine();
    },

    layerChanged: function() {
        var node = this.node;
        while (node) {
            if (node instanceof game.bamboo.nodes.Layer) {
                this.layer = node;
                break;
            }
            node = node.parent;
        }
    },

    sizeChanged: function() {
        this.updateRect();
    },

    redrawConnectedToLine: function() {
        this.connectedToLine.clear();

        if (this.node.parent) {
            if (this.node.parent instanceof game.bamboo.nodes.Layer) return;
            if (this.node.parent instanceof game.BambooScene) return;
            this.connectedToLine.lineStyle(1, 0xffffff, 0.5);
            this.connectedToLine.moveTo(0,0);
            var point = this.node.toLocalSpace(this.node.parent.getGlobalPosition());
            this.connectedToLine.lineTo(point.x, point.y);
        }
    },

    updateRect: function() {
        var size = this.node.size.clone();

        this.debugDisplayObject.position.x = -this.node.size.x * this.node.anchor.x;
        this.debugDisplayObject.position.y = -this.node.size.y * this.node.anchor.y;

        this.nameText.setText(this.node.name);
        this.nameText.position.x = -this.node.size.x * this.node.anchor.x;
        this.nameText.position.y = -this.node.size.y * this.node.anchor.y - 18;

        this.parentSelectionRect.clear();
        this.parentSelectionRect.lineStyle(1, 0xffffff, 0.5);
        this.parentSelectionRect.drawRect(-this.node.size.x * this.node.anchor.x, -this.node.size.y * this.node.anchor.y, size.x, size.y);

        this.activeRect.clear();
        this.activeRect.beginFill(0xffaa00, 0.3);
        this.activeRect.drawRect(-this.node.size.x * this.node.anchor.x, -this.node.size.y * this.node.anchor.y, size.x, size.y);
        this.activeRect.endFill();

        this.selectionRect.clear();
        this.selectionRect.beginFill(0x00ff66, 0.2);
        this.selectionRect.drawRect(-this.node.size.x * this.node.anchor.x, -this.node.size.y * this.node.anchor.y, size.x, size.y);
        this.selectionRect.endFill();

        this.editableRect.clear();
        this.editableRect.lineStyle(1, 0x0066ff);
        this.editableRect.drawRect(-this.node.size.x * this.node.anchor.x - 6, -this.node.size.y * this.node.anchor.y - 6, size.x + 12, size.y + 12);
    },

    enableEditMode: function(enabled) {
        this.editMode = enabled;
    },

    setProperty: function(property, value) {
        var oldValue = this.node[property];
        this.node.setProperty(property, value);
        this.propertyChanged(property, value, oldValue);
    },

    propertyChanged: function(property, value, oldValue) {
        if (property === 'scale' || property === 'size' || property === 'anchor' || property === 'name') {
            this.sizeChanged();
        }
        else if (property === 'parent') {
            oldValue.editorNode.displayObject.removeChild(this.displayObject);
            value.editorNode.displayObject.addChild(this.displayObject);

            var newPos = value.toLocalSpace(this.node.position);
            this.setProperty('position', newPos);

            this.displayObject.position.set(this.node.position.x, this.node.position.y);

            if (value instanceof game.bamboo.nodes.Layer) {
                this.layerChanged();
                this.editor.controller.setActiveLayer(value);
                this.editor.controller.setActiveNode(this.node);
            }
        }
        else if (property === 'position') {            
            this.displayObject.position.set(this.node.position.x, this.node.position.y); 
            this.redrawConnectedToLine();
        }
        else if (property === 'rotation') {
            if (this.node.displayObject) this.node.displayObject.updateTransform();
            this.redrawConnectedToLine();
        }

        for (var i = 0; i < this.propertyChangeListeners.length; i++) {
            this.propertyChangeListeners[i](property, value, oldValue);
        }
    },

    addPropertyChangeListener: function(listener) {
        this.propertyChangeListeners.push(listener);
    },

    removePropertyChangeListener: function(listener) {
        var index = this.propertyChangeListeners.indexOf(listener);
        if (index !== -1) this.propertyChangeListeners.splice(index, 1);
    },

    keydown: function(key) {  
    },

    click: function(p) {
        if (this.movingOriginOffset) {
            p.subtract(this.movingOriginOffset);// <- origin total delta

            var wt = this.startMatrix;
            var id = 1.0 / (wt.a*wt.d - wt.b*wt.c);
            var d = new game.Point((wt.d * p.x - wt.b * p.y) * id,
                                    (wt.a * p.y - wt.c * p.x) * id);
            this.setOrigin(d.add(this.startOrigin));
            this.setProperty('position', this.node.connectedTo.toLocalSpace(p.add(this.startPos)));

            this.startOrigin = null;
            this.startPos = null;
            this.startMatrix = null;
            this.movingOriginOffset = null;
            return true;
        }
        return false;
    },
    
    mousemove: function(p) {
        if (this.movingOriginOffset) {
            p.subtract(this.movingOriginOffset);// <- origin total delta in global space

            var wt = this.startMatrix;
            var id = 1.0 / (wt.a*wt.d - wt.b*wt.c);
            var d = new game.Point((wt.d * p.x - wt.b * p.y) * id,
                                    (wt.a * p.y - wt.c * p.x) * id);
            this.setOrigin(d.add(this.startOrigin));
            this.setProperty('position', this.node.connectedTo.toLocalSpace(p.add(this.startPos)));

            return true;
        }
        return false;
    },

    getClassName: function() {
        var proto;
        for (var name in game.bamboo.nodes) {
            proto = Object.getPrototypeOf(this.node);
            if (proto === game.bamboo.nodes[name].prototype) return name;
        }
    },

    mousedown: function() {
    },

    mouseup: function() {
    },

    keyup: function() {
    },

    start: function() {
    },

    stop: function() {
    },

    toJSON: function() {
        var propClasses = this.node.getPropertyClasses();
        var jsonProperties = {};
        for (var name in propClasses) {
            jsonProperties[name] = propClasses[name].toJSON(this.node);
        }
        return {
            class: this.getClassName(),
            properties: jsonProperties
        };
    }
});

});
