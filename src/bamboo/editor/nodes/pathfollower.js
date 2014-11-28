game.module(
    'bamboo.editor.nodes.pathfollower'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.pathfollower'
)
.body(function() {

game.addAsset('../src/bamboo/editor/media/path_follower.png');

game.bamboo.nodes.PathFollower.editor = game.bamboo.Node.editor.extend({
    init: function(node) {
        this._super(node);

        this.icon = new game.Sprite('../src/bamboo/editor/media/path_follower.png');
        this.debugDisplayObject.addChild(this.icon);
    },

    start: function() {
        this.node.origPosition = game.Point.from(this.node.position);
    },

    stop: function() {
        this.setProperty('position', this.node.origPosition);
        this.node.displayObject.scale.x = 1;
    },

    update: function() {
        this.node.update();
        this.displayObject.position.set(this.node.displayObject.position.x, this.node.displayObject.position.y);
        this.redrawConnectedToLine();
    }
});

});
