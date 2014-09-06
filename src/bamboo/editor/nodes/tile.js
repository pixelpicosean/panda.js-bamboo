game.module(
    'bamboo.editor.nodes.tile'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.tile'
)
.body(function() {

bamboo.nodes.Tile.editor = bamboo.Node.editor.extend({
    helpText: 'LEFT prev tile, RIGHT next tile',
    
    keydown: function(key) {
        if (key === 'RIGHT') {
            this.setProperty('tile', this.node.tile + 1);
        }
        if (key === 'LEFT') {
            this.setProperty('tile', this.node.tile - 1);
        }
    }
});

});
