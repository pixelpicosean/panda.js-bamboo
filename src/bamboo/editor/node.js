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
    node: null,
    displayObject: null,
    debugDisplayObject: null,
    selectionRect: null,
    selectionAxis: null,
    parentSelectionRect: null,
    connectedToLine: null,
    activeRect: null,
    activeAxis: null,
    editableRect: null,
    _cachedRect: null,
    _cachedScale: null,
    editEnabled: false,
    propertyChangeListeners: [],
    properties: {selectable: true, linkable: false},
    layer: null,
    movingOriginOffset: null,
    startOrigin: null,
    startMatrix: null,
    startPos: null,

    init: function(node) {
        this.node = node;
        this.node._editorNode = this;

        // create container for all editor-related graphics
        this.displayObject = new game.Container();
        this.node.displayObject.addChild(this.displayObject);

        this.debugDisplayObject = new game.Container();
        this.displayObject.addChild(this.debugDisplayObject);
        this.selectionRect = new game.Graphics();
        this.selectionAxis = new game.Sprite('../src/bamboo/editor/media/axis.png', 0,0);
        this.selectionAxis.anchor = {x: 0.305, y: 0.305};
        this.displayObject.addChild(this.selectionRect);
        this.displayObject.addChild(this.selectionAxis);

        this.parentSelectionRect = new game.Graphics();
        this.displayObject.addChild(this.parentSelectionRect);
        this.connectedToLine = new game.Graphics();
        this.displayObject.addChild(this.connectedToLine);

        this.activeRect = new game.Graphics();
        this.activeAxis = new game.Sprite('../src/bamboo/editor/media/axis_hover.png', 0,0);
        this.activeAxis.anchor = {x: 0.305, y: 0.305};
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

        this.node.displayObject.updateTransform();
        this.redrawConnectedToLine();
        this.connectedToLine.visible = false;
    },

    layerChanged: function() {
        // find new layer
        var n = this.node;
        while(n) {
            if (n instanceof bamboo.nodes.Layer) {
                this.layer = n;
                break;
            }
            n = n.connectedTo;
        }
    },

    sizeChanged: function() {
        this.updateRect();
    },

    redrawConnectedToLine: function() {
        this.connectedToLine.clear();
        if (this.node.connectedTo !== this.layer) {
            this.connectedToLine.lineStyle(1, 0xffffff);
            this.connectedToLine.moveTo(0,0);
            var p = this.node.toLocalSpace(this.node.connectedTo.getWorldPosition());
            this.connectedToLine.lineTo(p.x*this.node.scale.x, p.y*this.node.scale.y);
        }
    },

    updateRect: function() {
        var r = this.getBounds();
        if (this._cachedRect === r && this._cachedScale === this.node.scale) return;
        this._cachedRect = this.getBounds();
        this._cachedScale = this.node.scale.clone();
        this.displayObject.scale.x = 1.0 / this.node.scale.x;
        this.displayObject.scale.y = 1.0 / this.node.scale.y;

        r.x *= this.node.scale.x;
        r.width *= this.node.scale.x;
        r.y *= this.node.scale.y;
        r.height *= this.node.scale.y;

        this.selectionRect.clear();
        this.selectionRect.lineStyle(1, 0xff0000);
        this.selectionRect.beginFill(0xff0000, 0.2);
        this.selectionRect.drawRect(r.x-6,r.y-6,r.width+12,r.height+12);

        this.parentSelectionRect.clear();
        this.parentSelectionRect.lineStyle(2, 0xff00aa, 0.5);
        this.parentSelectionRect.drawRect(r.x-3,r.y-3,r.width+6,r.height+6);

        this.activeRect.clear();
        this.activeRect.beginFill(0xffaa00, 0.5);
        this.activeRect.drawRect(r.x-10,r.y-10,r.width+20,r.height+20);
        this.activeRect.endFill();
        this.activeRect.lineStyle(4, 0xffaa00, 1);
        this.activeRect.drawRect(r.x-6,r.y-6,r.width+12,r.height+12);

        this.editableRect.clear();
        this.editableRect.lineStyle(1, 0x0066ff);
        this.editableRect.beginFill(0x0066ff, 0.2);
        this.editableRect.drawRect(r.x-6,r.y-6,r.width+12,r.height+12);
    },

    enableEditMode: function(enabled) {
    },

    setProperty: function(property, value) {
        var oldValue = this.node[property];
        this.node[property] = value;
        this.propertyChanged(property, value, oldValue);
    },

    propertyChanged: function(property, value, oldValue) {
        if (property === 'scale') {
            this.sizeChanged();
        }
        else if (property === 'connectedTo') {
            var wp = oldValue.toWorldSpace(this.node.position);
            this.layerChanged();
            this.setProperty('position', value.toLocalSpace(wp));
        }
        else if (property === 'position') {
            this.node.displayObject.updateTransform();
            this.redrawConnectedToLine();
        }
        else if (property === 'rotation') {
            this.node.displayObject.updateTransform();
            this.redrawConnectedToLine();
        }
        else if (property === 'scale') {
            this.node.displayObject.updateTransform();
        }

        for(var i=0; i<this.propertyChangeListeners.length; i++) {
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
        return new game.Vec2();
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

    onclick: function(p) {
        if (this.movingOriginOffset) {
            p.subtract(this.movingOriginOffset);// <- origin total delta

            var wt = this.startMatrix;
            var id = 1.0 / (wt.a*wt.d - wt.b*wt.c);
            var d = new game.Vec2((wt.d * p.x - wt.b * p.y) * id,
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
            var d = new game.Vec2((wt.d * p.x - wt.b * p.y) * id,
                                    (wt.a * p.y - wt.c * p.x) * id);
            this.setOrigin(d.add(this.startOrigin));
            this.setProperty('position', this.node.connectedTo.toLocalSpace(p.add(this.startPos)));

            return true;
        }
        return false;
    }
});

});
