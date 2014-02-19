game.module(
    'bamboo.editor.nodes.rotator'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.rotator'
)
.body(function() {

bamboo.nodes.Rotator.editor = bamboo.Node.editor.extend({
    icon: null,

    init: function(node) {
        this.super(node);
        this.icon = new game.Sprite(0,0,'media/rotator.png');
        this.icon.anchor = {x: 0.5, y: 0.5};
        this.displayObject.addChild(this.icon);
    },

    getBounds: function() {
        return {x: -32, y: -32, width: 64, height: 64};
    },
});

});
