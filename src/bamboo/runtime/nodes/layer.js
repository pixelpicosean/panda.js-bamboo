game.module(
    'bamboo.runtime.nodes.layer'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

bamboo.createNode('Layer', {
    ready: function() {
        if (this.cacheAsBitmap) {
            this.displayObject.cacheAsBitmap = true;
        }
    }
});

// TODO change speedFactor to vector
bamboo.addNodeProperty('Layer', 'speedFactor', 'vector', [1, 1]);
bamboo.addNodeProperty('Layer', 'cacheAsBitmap', 'boolean');
bamboo.addNodeProperty('Layer', 'fixed', 'boolean');

});
