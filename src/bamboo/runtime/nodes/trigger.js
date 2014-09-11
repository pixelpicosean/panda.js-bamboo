game.module(
    'bamboo.runtime.nodes.trigger'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

bamboo.createNode('Trigger', {
    activated: false,

    update: function() {
        if (this.activator && this.target) {
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
                if (!this.activated) {
                    if (typeof this.target.trigger === 'function') {
                        this.target.trigger(this);
                        if (this.onetime) this.target = null;
                    }
                }
                this.activated = true;
            }
            else {
                this.activated = false;
            }

            bamboo.pool.put(targetPos);
            bamboo.pool.put(thisPos);
        }
    }
});

bamboo.addNodeProperty('Trigger', 'activator', 'node');
bamboo.addNodeProperty('Trigger', 'target', 'node');
bamboo.addNodeProperty('Trigger', 'onetime', 'boolean');

});
