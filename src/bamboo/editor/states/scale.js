game.module(
    'bamboo.editor.states.scale'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.StateScale = bamboo.editor.State.extend({
    pivot: null,
    nodes: [],
    startValues: [],
    startDistance: null,
    lockToAxis: null,
    snap: false,

    init: function(mode, p, selectedNodes, pivot) {
        this._super(mode);

        this.pivot = pivot;

        for(var i=0; i<selectedNodes.length; i++) {
            var n = selectedNodes[i];
            var found = false;
            var parent = n.connectedTo;
            while(!(parent instanceof bamboo.nodes.Layer)) {
                if(selectedNodes.indexOf(parent) !== -1) {
                    found = true;
                    break;
                }
                parent = parent.connectedTo;
            }
            if(!found) {
                this.nodes.push(n);
                this.startValues.push({p: n.getWorldPosition(), s:n.scale.clone()});
            }
        }

        this.startDistance = pivot.distance(p);

        this.mode.editor.statusbar.setStatus('Scale node, ESC cancel, X,Y lock to axis, CTRL snap 0.1 increments');
    },

    cancel: function() {
        for(var i=0; i<this.nodes.length; i++) {
            var n = this.nodes[i];
            n._editorNode.setProperty('position', n.connectedTo.toLocalSpace(this.startValues[i].p));
            n._editorNode.setProperty('scale', this.startValues[i].s);
            n.displayObject.updateTransform();
        }
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        var factor = this.pivot.distance(p) / this.startDistance;
        if(this.snap)
            factor = Math.round(factor*10)/10;

        var s = new game.Vec2(factor, factor);
        if(this.lockToAxis === 'X')
            s.y = 1;
        else if(this.lockToAxis === 'Y')
            s.x = 1;

        for(var i=0; i<this.nodes.length; i++) {
            var n = this.nodes[i];
            var p = this.startValues[i].p.subtractc(this.pivot);
            p.x *= s.x;
            p.y *= s.y;
            p.add(this.pivot);
            n._editorNode.setProperty('position', n.connectedTo.toLocalSpace(p));
            n._editorNode.setProperty('scale', new game.Vec2(this.startValues[i].s.x*s.x, this.startValues[i].s.y*s.y));
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
