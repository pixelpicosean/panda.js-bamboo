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

        if (this.tweenData.position.x !== x || this.tweenData.position.y !== y) {
            target.position.set(this.tweenData.position.x, this.tweenData.position.y);
            this.initTween(target.position, { x: x, y: y });
        }

        if (this.tweenData.size.x !== width || this.tweenData.size.y !== height) {
            target.width = this.tweenData.size.x;
            target.height = this.tweenData.size.y;
            this.initTween(target, { width: width, height: height });
        }
    },

    initTween: function(target, values) {
        var tween = new game.Tween(target);
        tween.to(values, this.duration);
        tween.easing(this.easing);
        tween.delay(this.delay);
        tween.repeat(this.repeat);
        tween.yoyo(!!this.yoyo);
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

});
