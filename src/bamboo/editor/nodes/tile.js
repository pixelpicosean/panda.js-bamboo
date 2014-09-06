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

    enableEditMode: function(enabled) {
        this.editMode = enabled;
        if (enabled) {
            // this.tileset = new game.Sprite(game.config.mediaFolder + this.node.tileset);
            // this.debugDisplayObject.addChild(this.tileset);
            // this.node.displayObject.visible = false;
        }
        else {
            // this.node.displayObject.visible = true;
            // this.debugDisplayObject.removeChild(this.tileset);
        }
    },

    mousemove: function(pos) {
        pos = this.node.toLocalSpace(pos);
        pos.x += this.node.anchor.x * this.node.size.x;
        pos.y += this.node.anchor.y * this.node.size.y;
    },

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
