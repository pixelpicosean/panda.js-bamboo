game.module(
    'bamboo.runtime.nodes.pathfollower'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

bamboo.createNode('PathFollower', {
    active: true,
    offset: 0,

    trigger: function() {
        this.offset = this.world.time;
        this.active = true;
    },

    ready: function() {
        this.origPosition = game.Point.from(this.position);
        if (this.triggered) this.active = false;
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

        if (this.reverse) elapsed = 1 - elapsed;

        var curDistance = this.parent.length * this.easing(elapsed);
        var newPos = this.parent.getPositionAtDistance(curDistance);
        newPos.x -= this.parent.points[0].x;
        newPos.y -= this.parent.points[0].y;
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
bamboo.addNodeProperty('PathFollower', 'reverse', 'boolean');
bamboo.addNodeProperty('PathFollower', 'easing', 'easing');

});
