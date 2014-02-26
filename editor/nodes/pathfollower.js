game.module(
    'bamboo.editor.nodes.pathfollower'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.pathfollower'
)
.body(function() {

game.addAsset('src/bamboo/editor/media/path_follower.png');

bamboo.nodes.PathFollower.editor = bamboo.Node.editor.extend({
    icon: null,

    init: function(node) {
        this.super(node);
        this.icon = new game.Sprite(0,0,'src/bamboo/editor/media/path_follower.png');
        this.icon.anchor = {x: 0.5, y: 0.5};
        this.displayObject.addChild(this.icon);
    },

    getBounds: function() {
        return {x: -32, y: -32, width: 64, height: 64};
    },
});

});
