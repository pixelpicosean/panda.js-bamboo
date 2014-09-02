game.module(
    'bamboo.runtime.pool'
)
.require(
    'bamboo.runtime.point'
)
.body(function() {
    
bamboo.Pool = game.Class.extend({
    objects: [],

    init: function(count) {
        for (var i = 0; i < count; i++) {
            this.put(new game.Point());
        }
    },

    get: function() {
        if (this.objects.length === 0) console.log('POOL EMPTY');
        return this.objects.pop() || new game.Point();
    },

    put: function(point) {
        this.objects.push(point);
    }
});

bamboo.pool = new bamboo.Pool(bamboo.config.poolSize || 10);

});