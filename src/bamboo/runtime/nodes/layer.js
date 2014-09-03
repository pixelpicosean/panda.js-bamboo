game.module(
    'bamboo.runtime.nodes.layer'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

bamboo.createNode('Layer', {
    update: function() {
        this.displayObject.position.x = this.position.x + this.world.camera.position.x * -this.speedFactor;
        this.displayObject.position.y = this.position.y + this.world.camera.position.y * -this.speedFactor;
    }
});

bamboo.addNodeProperty('Layer', 'speedFactor', 'number', 1);

});
