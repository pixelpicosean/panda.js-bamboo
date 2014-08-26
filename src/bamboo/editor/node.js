game.module(
    'bamboo.editor.node'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

game.addAsset('../src/bamboo/editor/media/axis.png');
game.addAsset('../src/bamboo/editor/media/axis_hover.png');

bamboo.Node.editor = game.Class.extend({
    helpText: '',
    editEnabled: false,
    propertyChangeListeners: [],
    properties: {
        selectable: true,
        linkable: false
    },

    init: function(node) {
        this.node = node;
        this.node._editorNode = this;
        if (!this.node.displayObject) {
            this.node.displayObject = new game.Container();
            this.node.parent.displayObject.addChild(this.node.displayObject);
        }

        // create container for all editor-related graphics
        this.displayObject = new game.Container();

        this.debugDisplayObject = new game.Container();
        this.displayObject.addChild(this.debugDisplayObject);
        this.selectionRect = new game.Graphics();
        this.selectionAxis = new game.Sprite('../src/bamboo/editor/media/axis.png');
        this.selectionAxis.anchor = { x: 0.305, y: 0.305 };
        this.displayObject.addChild(this.selectionRect);
        this.displayObject.addChild(this.selectionAxis);

        this.parentSelectionRect = new game.Graphics();
        this.displayObject.addChild(this.parentSelectionRect);
        this.connectedToLine = new game.Graphics();
        this.displayObject.addChild(this.connectedToLine);

        this.activeRect = new game.Graphics();
        this.activeAxis = new game.Sprite('../src/bamboo/editor/media/axis_hover.png');
        this.activeAxis.anchor = { x: 0.305, y: 0.305 };
        this.displayObject.addChild(this.activeRect);
        this.displayObject.addChild(this.activeAxis);

        this.editableRect = new game.Graphics();
        this.displayObject.addChild(this.editableRect);

        this.updateRect();
        this.selectionRect.visible = false;
        this.selectionAxis.visible = false;

        this.parentSelectionRect.visible = false;

        this.activeRect.visible = false;
        this.activeAxis.visible = false;

        this.editableRect.visible = false;
        this.layerChanged();

        this.redrawConnectedToLine();
        this.connectedToLine.visible = false;

        this.node.displayObject.addChild(this.displayObject);
    },

    layerChanged: function() {
        // find new layer
        var node = this.node;
        while (node) {
            if (node instanceof bamboo.nodes.Layer) {
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
            this.connectedToLine.lineStyle(1, 0xffffff);
            this.connectedToLine.moveTo(0,0);
            var p = this.node.toLocalSpace(this.node.parent.getWorldPosition());
            // var p = this.node.toLocalSpace(this.node.parent.position);
            // p.x -= this.node.parent.position.x;
            // p.y -= this.node.parent.position.y;
            this.connectedToLine.lineTo(p.x * this.node.scale.x, p.y * this.node.scale.y);
        }
    },

    getBounds: function() {
        return {
            x: 0,
            y: 0,
            width: this.node.displayObject.width || 100,
            height: this.node.displayObject.height || 100
        };
    },

    updateRect: function() {
        // var r = this.getBounds();
        
        // if (this._cachedRect === r && this._cachedScale === this.node.scale) return;

        var size = this.node.size.clone();
        // this._cachedRect = r;
        this._cachedScale = this.node.scale.clone();
        this._cachedSize = this.node.size.clone();
        
        this.displayObject.scale.x = this.node.scale.x;
        this.displayObject.scale.y = this.node.scale.y;

        size.x *= this.node.scale.x;
        size.y *= this.node.scale.y;

        this.selectionRect.clear();
        this.selectionRect.lineStyle(1, 0xff0000);
        this.selectionRect.beginFill(0xff0000, 0.2);
        this.selectionRect.drawRect(-6, -6, size.x + 12, size.y + 12);

        this.parentSelectionRect.clear();
        this.parentSelectionRect.lineStyle(2, 0xff00aa, 0.5);
        this.parentSelectionRect.drawRect(-3, -3, size.x + 6, size.y + 6);

        this.activeRect.clear();
        this.activeRect.beginFill(0xffaa00, 0.2);
        this.activeRect.drawRect(0, 0, size.x, size.y);
        this.activeRect.endFill();

        this.activeRect.lineStyle(2, 0xffaa00, 1);
        this.activeRect.drawRect(-1, -1, size.x + 2, size.y + 2);

        this.editableRect.clear();
        this.editableRect.lineStyle(1, 0x0066ff);
        this.editableRect.beginFill(0x0066ff, 0.2);
        this.editableRect.drawRect(-6, -6, size.x + 12, size.y + 12);
    },

    enableEditMode: function(enabled) {
    },

    setProperty: function(property, value) {
        var oldValue = this.node[property];
        this.node[property] = value;
        this.propertyChanged(property, value, oldValue);
    },

    propertyChanged: function(property, value, oldValue) {
        if (property === 'scale' || property === 'size') {
            this.sizeChanged();
        }
        else if (property === 'connectedTo') {
            var wp = oldValue.toWorldSpace(this.node.position);
            this.layerChanged();
            this.setProperty('position', value.toLocalSpace(wp));
        }
        else if (property === 'position') {
            if (this.node.displayObject) this.node.displayObject.position.set(value.x, value.y);
            // this.displayObject.position.set(value.x, value.y);
            this.redrawConnectedToLine();
        }
        else if (property === 'rotation') {
            if (this.node.displayObject) this.node.displayObject.updateTransform();
            this.redrawConnectedToLine();
        }
        else if (property === 'scale') {
            if (this.node.displayObject) this.node.displayObject.updateTransform();
        }

        for (var i = 0; i < this.propertyChangeListeners.length; i++) {
            this.propertyChangeListeners[i](property, value, oldValue);
        }
    },

    addPropertyChangeListener: function(listener) {
        this.propertyChangeListeners.push(listener);
    },

    removePropertyChangeListener: function(listener) {
        var idx = this.propertyChangeListeners.indexOf(listener);
        this.propertyChangeListeners.splice(idx, 1);
    },

    setOrigin: function() {},

    getOrigin: function() {
        return new game.Point();
    },

    onkeyup: function(keycode,p) {
        switch(keycode) {
            case 27:// ESC - exit origin set
                if (this.movingOriginOffset) {
                    this.setProperty('position', this.node.connectedTo.toLocalSpace(this.startPos));
                    this.setOrigin(this.startOrigin);
                    this.startOrigin = null;
                    this.startPos = null;
                    this.startMatrix = null;
                    this.movingOriginOffset = null;
                    return true;
                }
                return false;
            case 79:// O - set origin
                this.startOrigin = this.getOrigin();
                this.startPos = this.node.getWorldPosition();
                this.startMatrix = new PIXI.Matrix();
                this.startMatrix.fromArray(this.node.displayObject.worldTransform.toArray());
                this.movingOriginOffset = p;
                return true;
        }
        return false;
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
            p.subtract(this.movingOriginOffset);// <- origin total delta in world space

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

    toJSON: function() {
        var propDescs = this.node.getPropertyDescriptors();
        var jsonProperties = {};
        for (var key in propDescs) {
            jsonProperties[key] = bamboo.Property.toJSON(this.node, key, propDescs[key]);
        }
        return {
            class: this.node.getClassName(),
            properties: jsonProperties
        };
    }
});

bamboo.nodes.Null.editor = bamboo.Node.editor.extend();

});
