game.module(
    'bamboo.editor.movenodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.MoveNodeState = bamboo.editor.State.extend({
    node: null,
    startValue: null,
    offset: null,
    lockToAxis: null,
    snap: false,

    init: function(mode, p, node) {
        this.super(mode);
        this.node = node;
        this.startValue = node.getWorldPosition();
        this.offset = p;

        this.mode.editor.statusbar.setStatus('Move node, ESC cancel, X,Y lock to axis, CTRL to snap 10px grid');
    },

    cancel: function() {
        this.node._editorNode.setProperty('position', this.node.connectedTo.toLocalSpace(this.startValue));
        this.node.displayObject.updateTransform();
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        p.subtract(this.offset);
        if(this.snap) {
            p.x = Math.round(p.x/10)*10;
            p.y = Math.round(p.y/10)*10;
        }

        if(this.lockToAxis === 'X')
            p.y = 0;
        else if(this.lockToAxis === 'Y')
            p.x = 0;


        this.node._editorNode.setProperty('position', this.node.connectedTo.toLocalSpace(p.add(this.startValue)));
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
