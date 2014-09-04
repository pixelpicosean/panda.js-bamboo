game.module(
    'bamboo.runtime.nodes.camera'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

bamboo.createNode('Camera', {
    ready: function() {
        this.camera = new game.Camera();
        this.camera.minX = this.camera.minY = 0;
        this.camera.maxX = this.world.width - game.system.width;
        this.camera.maxY = this.world.height - game.system.height;
        this.camera.offset.x += this.offset.x;
        this.camera.offset.y += this.offset.y;
        this.camera.setPosition(this.position.x, this.position.y);
        if (this.target) {
            this.camera.follow(this.target.displayObject);
        }
        this.update();
    },

    update: function() {
        var layer;
        for (var i = 0; i < this.world.layers.length; i++) {
            layer = this.world.layers[i];
            layer.displayObject.position.set(
                layer.position.x + this.camera.position.x * -layer.speedFactor,
                layer.position.y + this.camera.position.y * -layer.speedFactor
            );
        }
    }
});

bamboo.addNodeProperty('Camera', 'target', 'node');
bamboo.addNodeProperty('Camera', 'offset', 'vector');

});
