game.module(
    'bamboo.editor.scalenodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.ScaleNodeState = bamboo.editor.State.extend({
    node: null,
    startValue: null,
    startDistance: null,

    init: function(mode, p, node) {
        this.super(mode);
        this.node = node;
        this.startValue = node.scale.clone();
        this.startDistance = node.getWorldPosition().distance(p);
    },

    cancel: function() {
        this.node._editorNode.setProperty('scale', this.startValue);
        this.node.displayObject.updateTransform();
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        var factor = this.node.getWorldPosition().distance(p) / this.startDistance;
        this.node._editorNode.setProperty('scale', this.startValue.clone().multiply(factor));
    },
});

});
