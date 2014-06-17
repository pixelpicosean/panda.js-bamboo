game.module(
    'bamboo.runtime.nodes.movingimage'
)
.require(
    'bamboo.runtime.nodes.image'
)
.body(function() {

bamboo.nodes.MovingImage = bamboo.nodes.Image.extend({
    startPoint: null,
    endPoint: null,
    duration: 1.0,
    timeOffset: 0.0,
    mode: 'loop',
    direction: 'forward',
    easing: game.Tween.Easing.Linear.None,


    init: function(world, properties) {
        this.endPoint = new Vec2(0,0);
        this._super(world, properties);
        this.needUpdates = true;
        this.startPoint = this.position.clone();
    },
    update: function(worldTime) {

        var f = ((worldTime+this.timeOffset) % this.duration) / this.duration;
        var e;
        if(this.mode === 'loop') {
            e = this.easing;
            if(this.direction === 'backward')
                f = 1.0 - f;
        } else if(this.mode === 'backAndForth') {
            var rounds = Math.floor((worldTime+this.timeOffset) / this.duration);
            if(this.direction === 'backward')
                f = 1.0 - f;
            if(rounds % 2 === 0) {
                e = this.easing;
            } else {
                f = 1.0 - f;
                e = this.easing;
            }
        }

        this.position = this.startPoint.multiplyAddc(this.endPoint, e(f));
    }
});


bamboo.nodes.MovingImage.desc = {
    endPoint: new bamboo.Property(true, 'End Point', 'Relative to position', bamboo.Property.TYPE.VECTOR),
    duration: new bamboo.Property(true, 'Duration', 'Duration for one round', bamboo.Property.TYPE.NUMBER),
    timeOffset: new bamboo.Property(true, 'Offset (s)', 'Time offset from the start', bamboo.Property.TYPE.NUMBER),
    mode: new bamboo.Property(true, 'Loop mode', 'Loop mode', bamboo.Property.TYPE.ENUM, ['loop','backAndForth']),
    direction: new bamboo.Property(true, 'Direction', 'Starting direction', bamboo.Property.TYPE.ENUM, ['forward','backward']),
    easing: new bamboo.Property(true, 'Easing', 'Easing curve', bamboo.Property.TYPE.EASING)
};

});
