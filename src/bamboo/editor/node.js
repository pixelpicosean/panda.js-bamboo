game.module(
    'bamboo.editor.node'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

game.addAsset('../src/bamboo/editor/media/anchorbox.png');

// TODO
game.Property.spriteSheet = -999999999 * 2;

game.Node.editor = game.Class.extend({
    editMode: false,
    propertyChangeListeners: [],
    properties: {
        selectable: true,
        linkable: false
    },
    textColor: 'white',
    activeColor: '0xffaa00',
    selectionColor: '0x00ff66',

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

        this.touchRect = new game.Container();
        this.touchRect.interactive = true;
        this.touchRect.click = game.scene.nodeClick.bind(game.scene, this.node);
        this.touchRect.mousedown = game.scene.nodeMouseDown.bind(game.scene, this.node);
        this.displayObject.addChild(this.touchRect);

        this.connectedToLine = new game.Graphics();
        this.connectedToLine.visible = false;
        this.displayObject.addChild(this.connectedToLine);

        this.nameText = new game.Text(this.node.name, { font: '12px Arial', fill: this.textColor });
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

        this.connectedToLine.visible = this.editor.config.viewNodes;
        this.parentSelectionRect.visible = this.editor.config.viewNodes;
        this.nameText.visible = this.editor.config.viewNodes;
        this.debugDisplayObject.visible = this.editor.config.viewNodes;

        if (typeof this.update === 'function') this.editor.scene.activeNodes.push(this);

        this.initDisplayObject();
    },

    initDisplayObject: function() {
        this.node.initDisplayObject();
    },

    ready: function() {
        this.node.parent.editorNode.displayObject.addChild(this.displayObject);
        this.displayObject.position.set(this.node.position.x, this.node.position.y);
        this.redrawConnectedToLine();
    },

    getProperties: function() {
        var props = this.node.getProperties();
        for (var name in this.customProperties) {
            props.unshift(name);
        }
        return props;
    },

    getPropertyType: function(name) {
        if (typeof this.customProperties[name] !== 'undefined') {
            
            for (var prop in game.Property) {
                if (this.customProperties[name] === game.Property[prop]) return prop;
            }

            var type = typeof this.customProperties[name];

            if (type === 'object') {
                if (typeof this.customProperties[name].length === 'number') return 'array';
                if (typeof this.customProperties[name].x === 'number' && typeof this.customProperties[name].y === 'number') return 'vector';
            }

            return type;
        }
        else return this.node.getPropertyType(name);
    },

    getPropertyValue: function(name) {
        if (typeof this.customProperties[name] !== 'undefined') {
            return this.customProperties[name];
        }
        return this.node[name];
    },

    layerChanged: function() {
        var node = this.node;
        while (node) {
            if (node instanceof game.nodes.Layer) {
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
            if (this.node.parent instanceof game.nodes.Layer) return;
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
        this.parentSelectionRect.rotation = this.node.rotation * (Math.PI / 180);

        this.activeRect.clear();
        this.activeRect.beginFill(parseInt(this.activeColor), 0.3);
        this.activeRect.drawRect(-this.node.size.x * this.node.anchor.x, -this.node.size.y * this.node.anchor.y, size.x, size.y);        
        this.activeRect.endFill();
        this.activeRect.rotation = this.node.rotation * (Math.PI / 180);

        this.selectionRect.clear();
        this.selectionRect.beginFill(parseInt(this.selectionColor), 0.2);
        this.selectionRect.drawRect(-this.node.size.x * this.node.anchor.x, -this.node.size.y * this.node.anchor.y, size.x, size.y);
        this.selectionRect.endFill();
        this.selectionRect.rotation = this.node.rotation * (Math.PI / 180);

        this.editableRect.clear();
        this.editableRect.lineStyle(1, 0x0066ff);
        this.editableRect.drawRect(-this.node.size.x * this.node.anchor.x - 6, -this.node.size.y * this.node.anchor.y - 6, size.x + 12, size.y + 12);

        this.touchRect.hitArea = new game.HitRectangle(-this.node.size.x * this.node.anchor.x, -this.node.size.y * this.node.anchor.y, size.x, size.y);
        this.touchRect.rotation = this.node.rotation * (Math.PI / 180);
    },

    enableEditMode: function(enabled) {
        this.editMode = enabled;
    },

    setProperty: function(property, value) {
        var oldValue = this.node[property];
        this.node._setProperty(property, value);
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

            if (value instanceof game.nodes.Layer) {
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
            this.updateRect();
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
        for (var name in game.nodes) {
            proto = Object.getPrototypeOf(this.node);
            if (proto === game.nodes[name].prototype) return name;
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
        var props = this.node.getProperties();
        
        var json = {};
        for (var i = props.length - 1; i >= 0; i--) {
            var name = props[i];
            var type = this.node.getPropertyType(name);

            var value = this.node[name];

            if (type === 'vector') value = { x: value.x, y: value.y };
            else if (type === 'node') value = value.name;

            // Skip if default value
            var defaultValue = this.node.constructor.prototype[name];
            if (value === defaultValue) continue;
            else if (type === 'vector') {
                if (value.x === defaultValue.x && value.y === defaultValue.y) continue;
            }
            else if (type === 'array') {
                // TODO
            }

            json[name] = value;
        }

        return {
            class: this.getClassName(),
            properties: json
        };
    }
});

});
