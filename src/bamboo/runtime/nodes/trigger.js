game.module(
    'bamboo.runtime.nodes.trigger'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

game.createNode('Trigger', {
    activated: false,

    hitTest: function() {
        var result = false;
        if (this.activator) {
            var targetPos = this.activator.getWorldPosition();
            targetPos.x -= this.activator.size.x * this.activator.anchor.x;
            targetPos.y -= this.activator.size.y * this.activator.anchor.y;

            var thisPos = this.getWorldPosition();
            thisPos.x -= this.size.x * this.anchor.x;
            thisPos.y -= this.size.y * this.anchor.y;

            if (targetPos.x + this.activator.size.x >= thisPos.x &&
                targetPos.x <= thisPos.x + this.size.x &&
                targetPos.y + this.activator.size.y >= thisPos.y &&
                targetPos.y <= thisPos.y + this.size.y) {
                result = true;
            }

            bamboo.pool.put(targetPos);
            bamboo.pool.put(thisPos);
        }
        return result;
    },

    update: function() {
        if (this.activator && this.target) {
            if (this.hitTest()) {
                if (!this.activated) {
                    if (typeof this.target.trigger === 'function') {
                        this.target.trigger(this);
                        if (this.onetime) this.target = null;
                    }
                }
                this.activated = true;
            }
            else this.activated = false;
        }
    }
});

// game.addNodeProperty('Trigger', 'activator', 'node');
// game.addNodeProperty('Trigger', 'target', 'node');
// game.addNodeProperty('Trigger', 'onetime', 'boolean');

});
