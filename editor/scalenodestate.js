game.module(
    'bamboo.editor.scalenodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.ScaleNodeState = bamboo.editor.State.extend({
    node: null,
    startValue: null,
    startDistance: null,
    lockToAxis: null,
    snap: false,

    init: function(mode, p, node) {
        this.super(mode);
        this.node = node;
        this.startValue = node.scale.clone();
        this.startDistance = node.getWorldPosition().distance(p);

        this.mode.editor.statusbar.setStatus('Scale node, ESC cancel, X,Y lock to axis, CTRL snap 0.1 increments');
    },

    cancel: function() {
        this.node._editorNode.setProperty('scale', this.startValue);
        this.node.displayObject.updateTransform();
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        var factor = this.node.getWorldPosition().distance(p) / this.startDistance;
        if(this.snap)
            factor = Math.round(factor*10)/10;

        if(this.lockToAxis === 'X')
            this.node._editorNode.setProperty('scale', new game.Vector(this.startValue.x*factor, this.startValue.y));
        else if(this.lockToAxis === 'Y')
            this.node._editorNode.setProperty('scale', new game.Vector(this.startValue.x, this.startValue.y*factor));
        else
            this.node._editorNode.setProperty('scale', this.startValue.clone().multiply(factor));
    },

    onkeydown: function(keycode) {
        switch(keycode) {
            case 17:// CTRL - snap
                this.snap = true;
                return true;
            case 88:// X
            case 89:// Y
                return true;
        }
        return false;
    },
    onkeyup: function(keycode) {
        switch(keycode) {
            case 17:// CTRL - snap
                this.snap = false;
                return true;
            case 88:// X - lock to x-axis
                if(this.lockToAxis === 'X') this.lockToAxis = null;
                else this.lockToAxis = 'X';
                return true;
            case 89:// Y - lock to y-axis
                if(this.lockToAxis === 'Y') this.lockToAxis = null;
                else this.lockToAxis = 'Y';
                return true;
        }
        return false;
    }
});

});
