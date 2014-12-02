game.module(
    'bamboo.runtime.pool'
)
.require(
    'bamboo.runtime.point'
)
.body(function() {
'use strict';

game.bamboo.pool = {
    objects: [],

    get: function() {
        // if (this.objects.length === 0 && !bamboo.editor && game.Debug.enabled) console.log('POOL EMPTY');
        return this.objects.pop() || new game.Point();
    },

    put: function(point) {
        this.objects.push(point);
    }
};

var poolSize = game.config.bamboo.poolSize || 10;
for (var i = 0; i < poolSize; i++) {
    game.bamboo.pool.put(new game.Point());
}

});
