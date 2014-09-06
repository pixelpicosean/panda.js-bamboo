game.module(
    'bamboo.editor.nodes.layer'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.layer'
)
.body(function() {

bamboo.nodes.Layer.editor = bamboo.Node.editor.extend({
    visible: true,
    locked: false,

    ready: function() {
        this.displayObject.removeChild(this.nameText);
        this.displayObject.removeChild(this.parentSelectionRect);
        this.editor.nodeLayer.addChild(this.displayObject);
    },

    propertyChanged: function(key, value, oldValue) {
        if (key === 'size') {
            if (value.x === 0 && value.y === 0) {
                value.x = value.y = 128;
            }
        }
        this._super(key, value, oldValue);
    },

    setVisibility: function(value) {
        this.visible = this.node.displayObject.visible = value;
    },

    setLocked: function(value) {
        this.locked = value;
        if (this.locked) {
            this.editor.controller.deselectAllNodes(this.node);
            this.editor.controller.setActiveNode();
        }
    }
});

});
