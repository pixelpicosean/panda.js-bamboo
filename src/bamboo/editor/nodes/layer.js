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

    propertyChanged: function(key, value, oldValue) {
        this._super(key, value, oldValue);
        this.node.update();
    },

    setVisibility: function(value) {
        this.visible = this.node.displayObject.visible = value;
    }
});

});
