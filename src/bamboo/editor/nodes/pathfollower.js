game.module(
    'bamboo.editor.nodes.pathfollower'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.pathfollower'
)
.body(function() {

game.addAsset('../src/bamboo/editor/media/path_follower.png');

bamboo.nodes.PathFollower.editor = bamboo.Node.editor.extend({
    init: function(node) {
        this._super(node);

        this.icon = new game.Sprite('../src/bamboo/editor/media/path_follower.png');
        this.debugDisplayObject.addChild(this.icon);
    },

    update: function() {
        this.node.update();
    }
});

});
