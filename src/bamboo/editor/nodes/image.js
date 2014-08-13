game.module(
    'bamboo.editor.nodes.image'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.image'
)
.body(function() {

game.addAsset('../src/bamboo/editor/media/image_placeholder.png');

bamboo.nodes.Image.editor = bamboo.Node.editor.extend({
    init: function(node) {
        this._super(node);
        if(!node.image)
            this.setProperty('image', '../src/bamboo/editor/media/image_placeholder.png');
    },

    getBounds: function() {
        var o = this.getOrigin();
        return {x: -o.x, y: -o.y, width: this.node.displayObject.texture.width, height: this.node.displayObject.texture.height };
    },

    getOrigin: function() {
        var a = this.node.anchor;
        return new game.Vec2(a.x*this.node.displayObject.texture.width, a.y*this.node.displayObject.texture.height);
    },

    setOrigin: function(p) {
        var a = new game.Vec2(p.x/this.node.displayObject.texture.width, p.y/this.node.displayObject.texture.height);
        this.setProperty('anchor', a);
    },

    propertyChanged: function(key, value, oldValue) {
        if(key === 'image')
            this.sizeChanged();
        if(key === 'anchor')
            this.updateRect();
        this._super(key, value, oldValue);
    }
});

});
