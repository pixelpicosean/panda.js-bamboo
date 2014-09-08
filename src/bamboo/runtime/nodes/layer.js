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

bamboo.addNodeProperty('Layer', 'speedFactor', 'number', 1);
bamboo.addNodeProperty('Layer', 'cacheAsBitmap', 'boolean');
bamboo.addNodeProperty('Layer', 'fixed', 'boolean');

});
