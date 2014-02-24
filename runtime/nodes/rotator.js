game.module(
    'bamboo.runtime.nodes.rotator'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.nodes.Rotator = bamboo.Node.extend({
    duration: 1,
    timeOffset: 0,
    beginAngle: 0,
    endAngle: Math.PI*2.0,
    mode: 'loop',
    easing: game.Tween.Easing.Linear.None,


    init: function(world, properties) {
        this.displayObject = new game.Container();
        this.super(world, properties);
        this.needUpdates = true;
    },

    update: function(worldTime) {

        var f = ((worldTime+this.timeOffset) % this.duration) / this.duration;

        if (this.mode === 'backAndForth') {
            f *= 2.0;
            if (f > 1.0)
                f = 2.0 - f;
        }
        f = this.easing(f);
        this.rotation = this.beginAngle * (1-f) + this.endAngle * f;
    }
});

bamboo.nodes.Rotator.desc = {
    duration: new bamboo.Property(true, 'Duration', 'Duration.', bamboo.Property.TYPE.NUMBER),
    timeOffset: new bamboo.Property(true, 'Offset (s)', 'Time offset.', bamboo.Property.TYPE.NUMBER),
    beginAngle: new bamboo.Property(true, 'Begin angle', 'Begin angle.', bamboo.Property.TYPE.ANGLE),
    endAngle: new bamboo.Property(true, 'End angle', 'End angle.', bamboo.Property.TYPE.ANGLE),
    mode: new bamboo.Property(true, 'Loop mode', 'Loop mode', bamboo.Property.TYPE.ENUM, ['loop','backAndForth']),
    easing: new bamboo.Property(true, 'Easing', 'Easing curve', bamboo.Property.TYPE.EASING)
};

});
