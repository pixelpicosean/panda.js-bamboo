game.module(
    'bamboo.editor.nodes.tile'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.tile'
)
.body(function() {

game.createEditorNode('Tile', {
    frames: [],
    currentFrame: 0,

    ready: function() {
        this._super();
        if (this.node.tileset) {
            this.getFrames();
            for (var i = 0; i < this.frames.length; i++) {
                if (this.frames[i] === this.node.frame) this.currentFrame = i;
            }
        }
    },

    getFrames: function() {
        var json = game.json[game.config.mediaFolder + '/' + this.node.tileset];
        for (var name in json.frames) {
            this.frames.push(name);
        }
    },

    propertyChanged: function(key, value, oldValue) {
        if (key === 'tileset') {
            this.getFrames();
            this.setProperty('frame', this.frames[this.currentFrame]);
        }
        if (key === 'frame') return;
        
        this._super(key, value, oldValue);
    },

    keydown: function(key) {
        if (key === 'RIGHT') {
            if (this.currentFrame < this.frames.length - 1) {
                this.currentFrame++;
                this.setProperty('frame', this.frames[this.currentFrame]);
                this.setProperty('size', new game.Point(this.node.displayObject.width, this.node.displayObject.height));
            }
        }
        if (key === 'LEFT') {
            if (this.currentFrame > 0) {
                this.currentFrame--;
                this.setProperty('frame', this.frames[this.currentFrame]);
                this.setProperty('size', new game.Point(this.node.displayObject.width, this.node.displayObject.height));
            }
        }
    }
});

// game.addNodeProperty('Tile', 'tileset', 'json');

});
