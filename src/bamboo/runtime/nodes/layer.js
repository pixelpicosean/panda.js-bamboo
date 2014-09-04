game.module(
    'bamboo.runtime.nodes.layer'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {
'use strict';

bamboo.createNode('Layer');

bamboo.addNodeProperty('Layer', 'speedFactor', 'number', 1);

});
