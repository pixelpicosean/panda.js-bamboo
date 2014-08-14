game.module(
    'bamboo.runtime.nodes.pathfollower'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.nodes.PathFollower = bamboo.Node.extend({
    duration: 1.0,
    timeOffset: 0.0,
    mode: 'loop',
    direction: 'forward',
    easing: game.Tween.Easing.Linear.None,

    init: function(world, properties) {
        this.displayObject = new game.Container();
        this._super(world, properties);
        if (!(this.connectedTo instanceof bamboo.nodes.Path))
            throw 'Path follower must be connected to path!';
        this.needUpdates = true;
        if (this.direction === 'forward')
            this.position = this.connectedTo.getPositionAtDistance(0);
        else
            this.position = this.connectedTo.getPositionAtDistance(this.connectedTo.length);
    },

    update: function(worldTime) {
        if (this.connectedTo.length === 0)
            return;

        var f = ((worldTime+this.timeOffset) % this.duration) / this.duration;
        var e;
        if (this.mode === 'loop') {
            e = this.easing;
            if (this.direction === 'backward')
                f = 1.0 - f;
        } else if (this.mode === 'backAndForth') {
            var rounds = Math.floor((worldTime+this.timeOffset) / this.duration);
            if (this.direction === 'backward')
                f = 1.0 - f;
            if (rounds % 2 === 0) {
                e = this.easing;
            } else {
                f = 1.0 - f;
                e = this.easing;
            }
        }
        var curDistance = this.connectedTo.length * e(f);
        this.position = this.connectedTo.getPositionAtDistance(curDistance);
    }
});

bamboo.nodes.PathFollower.props = {
    duration: new bamboo.Property(true, 'Duration', 'Duration for one round', bamboo.Property.TYPE.NUMBER),
    timeOffset: new bamboo.Property(true, 'Offset (s)', 'Time offset from the start', bamboo.Property.TYPE.NUMBER),
    mode: new bamboo.Property(true, 'Loop mode', 'Loop mode', bamboo.Property.TYPE.ENUM, ['loop','backAndForth']),
    direction: new bamboo.Property(true, 'Direction', 'Starting direction', bamboo.Property.TYPE.ENUM, ['forward','backward']),
    easing: new bamboo.Property(true, 'Easing', 'Easing curve', bamboo.Property.TYPE.EASING)
};

});
