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
    icon: null,

    init: function(node) {
        this._super(node);
        this.icon = new game.Sprite('../src/bamboo/editor/media/path_follower.png', 0,0);
        this.icon.anchor = {x: 0.5, y: 0.5};
        this.debugDisplayObject.addChild(this.icon);
    },

    getBounds: function() {
        return {x: -32, y: -32, width: 64, height: 64};
    },

    propertyChanged: function(property, value) {
        if(property === 'position' && (value.x !== 0 || value.y !== 0))
            this.setProperty('position', new game.Vec2());
        this.node.update(0);
    }
});

});
