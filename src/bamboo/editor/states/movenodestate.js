game.module(
    'bamboo.editor.states.movenodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.MoveNodeState = bamboo.editor.State.extend({
    helpText: 'Move state: MOUSE confirm',
    nodes: [],
    startValues: [],
    offset: null,
    lockToAxis: null,
    snap: false,

    init: function(mode, p, selectedNodes) {
        this._super(mode);

        for (var i = 0; i < selectedNodes.length; i++) {
            var n = selectedNodes[i];
            var found = false;
            var parent = n.connectedTo;
            while (!(parent instanceof bamboo.nodes.Layer)) {
                if(selectedNodes.indexOf(parent) !== -1) {
                    found = true;
                    break;
                }
                parent = parent.connectedTo;
            }
            if (!found) {
                this.nodes.push(n);
                this.startValues.push(n.getWorldPosition());
            }
        }
        this.offset = p;

        this.mode.editor.statusbar.setStatus(this.mode.helpText + '<br>' + this.helpText);
    },

    cancel: function() {
        for (var i = 0; i < this.nodes.length; i++) {
            var n = this.nodes[i];
            n._editorNode.setProperty('position', n.connectedTo.toLocalSpace(this.startValues[i]));
            n.displayObject.updateTransform();
        }
    },

    apply: function() {
        // nothing to do, nodes are already at right positions
    },

    mousemove: function(event) {
        var p = new game.Vec2(event.global.x, event.global.y);

        p.subtract(this.offset);

        if (this.snap) {
            p.x = Math.round(p.x / 10) * 10;
            p.y = Math.round(p.y / 10) * 10;
        }

        if (this.lockToAxis === 'X') p.y = 0;
        else if (this.lockToAxis === 'Y') p.x = 0;

        for (var i = 0; i < this.nodes.length; i++) {
            var n = this.nodes[i];
            n._editorNode.setProperty('position', n.connectedTo.toLocalSpace(p.addc(this.startValues[i])));
        }
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

    keydown: function(key) {
    },

    keyup: function(key) {
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
