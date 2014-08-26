game.module(
    'bamboo.editor.states.rotate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.StateRotate = bamboo.editor.State.extend({
    pivot: null,
    nodes: [],
    startValues: [],
    offset: null,
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
                this.startValues.push({p: n.getWorldPosition(), a:n.rotation});
            }
        }


        this.offset = p.subtract(pivot);

        this.mode.editor.statusbar.setStatus('Rotate node, ESC to cancel, CTRL to snap 5° increments');
    },

    cancel: function() {
        for(var i=0; i<this.nodes.length; i++) {
            var n = this.nodes[i];
            n._editorNode.setProperty('position', n.connectedTo.toLocalSpace(this.startValues[i].p));
            n._editorNode.setProperty('rotation', this.startValues[i].a);
            n.displayObject.updateTransform();
        }
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        var angle = this.offset.angle(p.subtract(this.pivot));
        if(this.snap) {
            var inDeg = 180 * angle / Math.PI;
            inDeg = Math.round(inDeg/5)*5;
            angle = Math.PI * inDeg / 180;
        }

        var c = Math.cos(angle);
        var s = Math.sin(angle);

        for(var i=0; i<this.nodes.length; i++) {
            var n = this.nodes[i];
            var p = this.startValues[i].p.subtractc(this.pivot);
            var np = new game.Vec2(c*p.x - s*p.y, s*p.x + c*p.y);
            np.add(this.pivot);
            var a = angle + this.startValues[i].a;
            a = ((a % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
            n._editorNode.setProperty('position', n.connectedTo.toLocalSpace(np));
            n._editorNode.setProperty('rotation', a);
        }
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
