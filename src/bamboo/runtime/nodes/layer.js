game.module(
    'bamboo.runtime.nodes.layer'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

bamboo.createNode('Layer', {
    ready: function() {
        if (this.cacheAsBitmap) {
            var size = game.config.bamboo.maxTextureSize || 2048;
            if (this.displayObject.width < size && this.displayObject.height < size) {
                size = Math.max(this.displayObject.width, this.displayObject.height);
            }
            
            var tx = Math.ceil(this.displayObject.width / size);
            var ty = Math.ceil(this.displayObject.height / size);
            var pos = new game.Point();
            var renderTexture;
            var sprites = [];
            var sprite;
            for (var y = 0; y < ty; y++) {
                for (var x = 0; x < tx; x++) {
                    pos.set(-x * size, -y * size);
                    renderTexture = new game.RenderTexture(size, size);
                    renderTexture.render(this.displayObject, pos);
                    sprite = new game.Sprite(renderTexture);
                    sprite.position.set(x * size, y * size);
                    sprites.push(sprite);
                }
            }
            for (var i = this.displayObject.children.length - 1; i >= 0; i--) {
                this.displayObject.removeChild(this.displayObject.children[i]);
            }
            for (var i = 0; i < sprites.length; i++) {
                this.displayObject.addChild(sprites[i]);
            }
        }
    }
});

bamboo.addNodeProperty('Layer', 'speedFactor', 'vector', [1, 1]);
bamboo.addNodeProperty('Layer', 'cacheAsBitmap', 'boolean');
bamboo.addNodeProperty('Layer', 'fixed', 'boolean');

});
