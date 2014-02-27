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
    startAngle: 0,
    amplitude: Math.PI,
    mode: 'loop',
    easing: game.Tween.Easing.Linear.None,


    init: function(world, properties) {
        this.displayObject = new game.Container();
        this.super(world, properties);
        this.needUpdates = true;
    },

    update: function(worldTime) {

        var f = ((worldTime+this.timeOffset+this.duration*0.5) % this.duration) / this.duration;

        if (this.mode === 'backAndForth') {
            var rounds = Math.floor((worldTime+this.timeOffset+this.duration*0.5) / this.duration);
            if(rounds % 2 !== 0)
                f = 1 - f;
        }
        f = this.easing(f);
        this.rotation = this.startAngle + this.amplitude * (f*2 - 1);
    }
});

bamboo.nodes.Rotator.desc = {
    duration: new bamboo.Property(true, 'Duration', 'Duration.', bamboo.Property.TYPE.NUMBER),
    timeOffset: new bamboo.Property(true, 'Offset (s)', 'Time offset.', bamboo.Property.TYPE.NUMBER),
    startAngle: new bamboo.Property(false, '', '', bamboo.Property.TYPE.NUMBER),
    amplitude: new bamboo.Property(true, 'Amplitude', 'Angle amplitude in one direction', bamboo.Property.TYPE.ANGLE),
    mode: new bamboo.Property(true, 'Loop mode', 'Loop mode', bamboo.Property.TYPE.ENUM, ['loop','backAndForth']),
    easing: new bamboo.Property(true, 'Easing', 'Easing curve', bamboo.Property.TYPE.EASING)
};

});
