game.module(
    'bamboo.editor.nodes.movingimage'
)
.require(
    'bamboo.editor.nodes.image',
    'bamboo.runtime.nodes.movingimage'
)
.body(function() {


bamboo.nodes.MovingImage.editor = bamboo.nodes.Image.editor.extend({
    init: function(node) {
        this._super(node);
    },

    propertyChanged: function(key, value, oldValue) {
        if(key === 'position')
            this.node.startPoint = value.clone();
        this.node.update(0);
        this._super(key, value, oldValue);
    }
});

});
