game.module(
    'bamboo.runtime.nodes.animation'
)
.require(
    'bamboo.core'
)
.body(function() {

game.createNode('Animation', {
    init: function() {
        this.displayObject = new game.Animation([new game.Texture(new game.BaseTexture())]);
    },

    ready: function() {
        if (!this.triggered) this.displayObject.play();
        else this.displayObject.gotoAndStop(0);
    },

    trigger: function() {
        this.displayObject.gotoAndPlay(0);
    },

    setProperty: function(name, value) {
        this._super(name, value);
        if (name === 'spritesheet' && value) {
            var textures = [];
            var json = game.json[game.getMediaPath(value)];
            var frame = 0;
            for (var key in json.frames) {
                if (frame >= this.startFrame) textures.push(game.TextureCache[key]);
                frame++;
                if (this.frameCount > 0 && frame === this.frameCount) break;
            }
            this.displayObject.textures = textures;
        }
        if (name === 'speed') this.displayObject.animationSpeed = value;
        if (name === 'loop') this.displayObject.loop = value;
    }
});

// game.addNodeProperty('Animation', 'startFrame', 'number', 0);
// game.addNodeProperty('Animation', 'frameCount', 'number', 0);
// game.addNodeProperty('Animation', 'spritesheet', 'json');
// game.addNodeProperty('Animation', 'speed', 'number', 1);
// game.addNodeProperty('Animation', 'loop', 'boolean', true);
// game.addNodeProperty('Animation', 'triggered', 'boolean');

});
