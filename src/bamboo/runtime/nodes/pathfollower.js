game.module(
    'bamboo.runtime.nodes.pathfollower'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.createNode('PathFollower', {
    offset: 0,
    active: false,

    init: function() {
        this.displayObject = new game.Container();
        this.origPosition = new game.Point();
    },

    ready: function() {
        if (!this.triggered) this.start();
    },

    trigger: function() {
        if (!this.triggered) return;
        this.stop();
        this.start();
    },

    start: function() {
        this.active = true;
        this.offset = this.world.time;
        this.origPosition.copy(this.position);
    },

    stop: function() {
        this.active = false;
        this.position.copy(this.origPosition);
        this.setProperty('position', this.position);
    },

    update: function() {
        if (!this.active) return;
        if (!this.parent.length) return;

        var elapsed = ((this.world.time - this.offset) % this.duration) / this.duration;

        if (!this.loop && this.world.time - this.offset >= this.duration) elapsed = 1;

        if (this.yoyo && this.loop) {
            var rounds = Math.floor((this.world.time - this.offset) / this.duration);
            if (rounds % 2 === 1) elapsed = 1.0 - elapsed;
        }

        var curDistance = this.parent.length * this.easing(elapsed);
        var newPos = this.parent.getPositionAtDistance(curDistance);
        this.position.x = this.origPosition.x + newPos.x;
        this.position.y = this.origPosition.y + newPos.y;
        this.setProperty('position', this.position);
        bamboo.pool.put(newPos);
    }
});

bamboo.addNodeProperty('PathFollower', 'duration', 'number', 2);
bamboo.addNodeProperty('PathFollower', 'loop', 'boolean');
bamboo.addNodeProperty('PathFollower', 'yoyo', 'boolean');
bamboo.addNodeProperty('PathFollower', 'triggered', 'boolean');
bamboo.addNodeProperty('PathFollower', 'easing', 'easing');

});
