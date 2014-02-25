game.module(
    'bamboo.editor.rotatenodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.RotateNodeState = bamboo.editor.State.extend({
    node: null,
    startValue: null,
    offset: null,
    snap: false,

    init: function(mode, p, node) {
        this.super(mode);
        this.node = node;
        this.startValue = node.rotation;
        this.offset = p.subtract(node.getWorldPosition());

        this.mode.editor.statusbar.setStatus('Rotate node, ESC to cancel, CTRL to snap 5° increments');
    },

    cancel: function() {
        this.node._editorNode.setProperty('rotation', this.startValue);
        this.node.displayObject.updateTransform();
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        var angle = this.offset.angle(p.subtract(this.node.getWorldPosition()));
        if(this.snap) {
            var inDeg = 180 * angle / Math.PI;
            inDeg = Math.round(inDeg/5)*5;
            angle = Math.PI * inDeg / 180;
        }

        angle += this.startValue;
        angle = ((angle % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
        this.node._editorNode.setProperty('rotation', angle);
    },
    onkeydown: function(keycode) {
        switch(keycode) {
            case 17:// CTRL - snap
                this.snap = true;
                return true;
        }
        return false;
    },
    onkeyup: function(keycode) {
        switch(keycode) {
            case 17:// CTRL - snap
                this.snap = false;
                return true;
        }
        return false;
    }
});

});
