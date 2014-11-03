game.module(
    'bamboo.runtime.nodes.animation'
)
.require(
    'bamboo.core'
)
.body(function() {

bamboo.createNode('Animation', {
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
            var path = value;
            if (game.config.mediaFolder) path = game.config.mediaFolder + '/' + path;
            var json = game.json[path];
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

bamboo.addNodeProperty('Animation', 'startFrame', 'number', 0);
bamboo.addNodeProperty('Animation', 'frameCount', 'number', 0);
bamboo.addNodeProperty('Animation', 'spritesheet', 'json');
bamboo.addNodeProperty('Animation', 'speed', 'number', 1);
bamboo.addNodeProperty('Animation', 'loop', 'boolean', true);
bamboo.addNodeProperty('Animation', 'triggered', 'boolean');

});
