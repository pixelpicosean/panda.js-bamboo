game.module(
    'bamboo.editor.node'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

game.addAsset('src/bamboo/editor/media/axis.png');
game.addAsset('src/bamboo/editor/media/axis_hover.png');

bamboo.Node.editor = game.Class.extend({
    node: null,
    displayObject: null,
    selectionRect: null,
    selectionAxis: null,
    hoverRect: null,
    hoverAxis: null,
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

        this.selectionRect = new game.Graphics();
        this.selectionAxis = new game.Sprite(0,0, 'src/bamboo/editor/media/axis.png');
        this.selectionAxis.anchor = {x: 0.305, y: 0.305};
        this.displayObject.addChild(this.selectionRect);
        this.displayObject.addChild(this.selectionAxis);

        this.hoverRect = new game.Graphics();
        this.hoverAxis = new game.Sprite(0,0,'src/bamboo/editor/media/axis_hover.png');
        this.hoverAxis.anchor = {x: 0.305, y: 0.305};
        this.displayObject.addChild(this.hoverRect);
        this.displayObject.addChild(this.hoverAxis);

        this.editableRect = new game.Graphics();
        this.displayObject.addChild(this.editableRect);

        this.updateRect();
        this.selectionRect.visible = false;
        this.selectionAxis.visible = false;

        this.hoverRect.visible = false;
        this.hoverAxis.visible = false;

        this.editableRect.visible = false;
        this.layerChanged();
    },

    layerChanged: function() {
        // find new layer
        var n = this.node;
        while(n) {
            if(n instanceof bamboo.nodes.Layer) {
                this.layer = n;
                break;
            }
            n = n.connectedTo;
        }
    },

    sizeChanged: function() {
        this.updateRect();
    },

    updateRect: function() {
        var r = this.getBounds();
        if(this._cachedRect === r && this._cachedScale === this.node.scale)
            return;
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

        this.hoverRect.clear();
        this.hoverRect.lineStyle(4, 0xffaa00, 0.5);
        this.hoverRect.drawRect(r.x-6,r.y-6,r.width+12,r.height+12);

        this.editableRect.clear();
        this.editableRect.lineStyle(1, 0x0066ff);
        this.editableRect.beginFill(0x0066ff, 0.2);
        this.editableRect.drawRect(r.x-6,r.y-6,r.width+12,r.height+12);

    },

    enableEditMode: function(enabled) {
//        if(enabled) {
//            this.selectionRect.visible = false;
//            this.editableRect.visible = true;
//        } else {
//            this.selectionRect.visible = true;
//            this.editableRect.visible = false;
//        }
    },

    setProperty: function(property, value) {
        var oldValue = this.node[property];
        this.node[property] = value;
        this.propertyChanged(property, value, oldValue);
    },

    propertyChanged: function(property, value, oldValue) {
        if(property === 'scale') {
            this.sizeChanged();
        } else if(property === 'connectedTo') {
            var wp = oldValue.toWorldSpace(this.node.position);
            this.setProperty('position', value.toLocalSpace(wp));
            this.layerChanged();
        }
        for(var i=0; i<this.propertyChangeListeners.length; i++)
            this.propertyChangeListeners[i](property, value, oldValue);
    },

    addPropertyChangeListener: function(listener) {
        this.propertyChangeListeners.push(listener);
    },
    removePropertyChangeListener: function(listener) {
        var idx = this.propertyChangeListeners.indexOf(listener);
        this.propertyChangeListeners.splice(idx, 1);
    },

    onkeydown: function(keycode,p) {
        switch(keycode) {
            case 27:// ESC
            case 79:// O
                return true;
        }
        return false;
    },
    onkeyup: function(keycode,p) {
        switch(keycode) {
            case 27:// ESC - exit origin set
                if(this.movingOriginOffset) {
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
    onclick: function(p) {
        if(this.movingOriginOffset) {
            p.subtract(this.movingOriginOffset);// <- origin total delta

            var wt = this.startMatrix;
            var id = 1.0 / (wt.a*wt.d - wt.b*wt.c);
            var d = new game.Vector((wt.d * p.x - wt.b * p.y) * id,
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
    onmousemove: function(p) {
        if(this.movingOriginOffset) {
            p.subtract(this.movingOriginOffset);// <- origin total delta in world space

            var wt = this.startMatrix;
            var id = 1.0 / (wt.a*wt.d - wt.b*wt.c);
            var d = new game.Vector((wt.d * p.x - wt.b * p.y) * id,
                                    (wt.a * p.y - wt.c * p.x) * id);
            this.setOrigin(d.add(this.startOrigin));
            this.setProperty('position', this.node.connectedTo.toLocalSpace(p.add(this.startPos)));

            return true;
        }
        return false;
    },
    toLocalSpace: function(v) {
        var wt = this.displayObject.worldTransform;
        var id = 1.0 / (wt.a*wt.d - wt.b*wt.c);

        return new game.Vector((wt.d * (v.x - wt.tx) - wt.b * (v.y - wt.ty)) * id,
                               (wt.a * (v.y - wt.ty) - wt.c * (v.x - wt.tx)) * id);
    },

    toWorldSpace: function(v) {
        var wt = this.displayObject.worldTransform;
        return new game.Vector(wt.a * v.x + wt.b * v.y + wt.tx, wt.c * v.x + wt.d * v.y + wt.ty);
    },
});

});
