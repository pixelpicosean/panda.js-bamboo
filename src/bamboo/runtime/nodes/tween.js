game.module(
    'bamboo.runtime.nodes.tween'
)
.require(
    'bamboo.core'
)
.body(function() {

/**
    @class Tween
    @namespace bamboo.Nodes
**/
bamboo.createNode('Tween', {
    tweens: [],

    ready: function() {
        if (!this.triggered) this.start();
    },

    trigger: function() {
        this.start();
    },

    start: function() {
        var target = this.parent.displayObject;
        var x = target.position.x;
        var y = target.position.y;
        var width = target.width;
        var height = target.height;

        if (this.tweenData.position.x !== 0 || this.tweenData.position.y !== 0) {
            target.position.set(x - this.tweenData.position.x, y - this.tweenData.position.y);
            this.initTween(target.position, { x: x, y: y });
        }

        if (this.tweenData.size.x !== 0 || this.tweenData.size.y !== 0) {
            target.width = width - this.tweenData.size.x;
            target.height = height - this.tweenData.size.y;
            this.initTween(target, { width: width, height: height });
        }
    },

    onComplete: function() {
        if (this.triggerOnComplete) this.parent.trigger(this);
    },

    onStart: function() {
        if (this.triggerOnStart) this.parent.trigger(this);
        if (this.startSound) game.audio.playSound(this.startSound);
    },

    initTween: function(target, values) {
        var tween = new game.Tween(target);
        tween.to(values, this.duration);
        tween.easing(this.easing);
        tween.delay(this.delay);
        tween.repeat(this.repeat);
        tween.yoyo(!!this.yoyo);
        if (this.tweens.length === 0) {
            tween.onStart(this.onStart.bind(this));
            tween.onComplete(this.onComplete.bind(this));
        }
        tween.start();
        this.tweens.push(tween);
    }
});

bamboo.addNodeProperty('Tween', 'tweenData', 'object');
bamboo.addNodeProperty('Tween', 'duration', 'number', 1000);
bamboo.addNodeProperty('Tween', 'repeat', 'number', 0);
bamboo.addNodeProperty('Tween', 'delay', 'number', 0);
bamboo.addNodeProperty('Tween', 'yoyo', 'boolean');
bamboo.addNodeProperty('Tween', 'easing', 'easing');
bamboo.addNodeProperty('Tween', 'triggered', 'boolean');
bamboo.addNodeProperty('Tween', 'triggerOnStart', 'boolean');
bamboo.addNodeProperty('Tween', 'triggerOnComplete', 'boolean');
bamboo.addNodeProperty('Tween', 'startSound', 'audio');

});
