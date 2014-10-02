game.module(
    'bamboo.runtime.nodes.camera'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

/**
    Camera that follows it's target.
    @class Camera
    @namespace bamboo.Nodes
**/
bamboo.createNode('Camera', {
    ready: function() {
        this.camera = new game.Camera();
        this.camera.minX = this.camera.minY = 0;
        this.camera.maxX = this.world.width - game.system.width;
        this.camera.maxY = this.world.height - game.system.height;
        this.camera.offset.x += this.offset.x;
        this.camera.offset.y += this.offset.y;
        if (this.target) this.camera.follow(this.target.displayObject);
        if (this.target && this.startFromTarget) this.camera.setPosition(this.target.displayObject.position.x, this.target.displayObject.position.y);
        else this.camera.setPosition(this.position.x + game.system.width / 2, this.position.y + game.system.height / 2);
        this.update();
    },

    update: function() {
        var layer;
        for (var i = 0; i < this.world.layers.length; i++) {
            layer = this.world.layers[i];
            if (layer.fixed) continue;
            layer.displayObject.position.set(
                ~~(layer.position.x + this.camera.position.x * -layer.speedFactor.x),
                ~~(layer.position.y + this.camera.position.y * -layer.speedFactor.y)
            );
        }
    }
});

/**
    @property {Node} target
**/
bamboo.addNodeProperty('Camera', 'target', 'node');
/**
    Camera offset from center of screen.
    @property {Vector} offset
**/
bamboo.addNodeProperty('Camera', 'offset', 'vector');
/**
    Should camera start from it's target's position.
    @property {Boolean} startFromTarget
**/
bamboo.addNodeProperty('Camera', 'startFromTarget', 'boolean');

});
