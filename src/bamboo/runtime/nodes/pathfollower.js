game.module(
    'bamboo.runtime.nodes.pathfollower'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.nodes.PathFollower = bamboo.Node.extend({
    mode: 'loop',
    direction: 'forward',

    init: function(world, properties) {
        this.displayObject = new game.Container();
    },

    ready: function() {
    },

    update: function() {
        if (!this.parent.length) return;

        var f = ((this.world.time + this.timeOffset) % this.duration) / this.duration;
        var e;

        if (this.mode === 'loop') {
            e = this.easing;
            if (this.direction === 'backward') f = 1.0 - f;
        } else {
            var rounds = Math.floor((this.world.time + this.timeOffset) / this.duration);
            if (this.direction === 'backward') f = 1.0 - f;
            if (rounds % 2 === 0) {
                e = this.easing;
            } else {
                f = 1.0 - f;
                e = this.easing;
            }
        }

        var curDistance = this.parent.length * e(f);
        var newPos = this.parent.getPositionAtDistance(curDistance);
        // console.log(newPos.x, newPos.y);
        // this.parent.toLocalSpace(newPos, newPos);
        // newPos.x -= this.position.x;
        // newPos.y -= this.position.y;
        // this.position.copy(newPos);
        this.displayObject.position.x = this.position.x + newPos.x;
        this.displayObject.position.y = this.position.y + newPos.y;
        // this.setProperty('position', newPos);
        bamboo.pool.put(newPos);
    }
});

bamboo.nodes.PathFollower.props = {
    duration: new bamboo.Property(true, 'Duration', 'Duration for one round', bamboo.Property.TYPE.NUMBER, 1),
    timeOffset: new bamboo.Property(true, 'Offset (s)', 'Time offset from the start', bamboo.Property.TYPE.NUMBER, 0),
    mode: new bamboo.Property(true, 'Loop mode', 'Loop mode', bamboo.Property.TYPE.ENUM, ['loop', 'backAndForth']),
    direction: new bamboo.Property(true, 'Direction', 'Starting direction', bamboo.Property.TYPE.ENUM, ['forward', 'backward']),
    easing: new bamboo.Property(true, 'Easing', 'Easing curve', bamboo.Property.TYPE.EASING, 'Linear')
};

});
