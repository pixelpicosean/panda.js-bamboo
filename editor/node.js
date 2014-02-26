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

    onkeydown: function(keycode,p) {},
    onkeyup: function(keycode,p) {},
    onclick: function(p) {},
    onmousemove: function(p) {}
});

});
