game.module(
    'bamboo.editor.nodes.rotator'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.rotator'
)
.body(function() {

game.addAsset('../src/bamboo/editor/media/rotator.png');

bamboo.nodes.Rotator.editor = bamboo.Node.editor.extend({
    init: function(node) {
        this._super(node);

        this.icon = new game.Sprite('../src/bamboo/editor/media/rotator.png');
        this.debugDisplayObject.addChild(this.icon);
    },

    update: function() {
        this.node.update();
    }
});

});
