game.module(
    'bamboo.editor.newnodestate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.NewNodeState = bamboo.editor.State.extend({
    nodes: [],
    offset: null,
    startValues: [],

    init: function(mode, p, nodes) {
        this.super(mode);

        for(var i=0; i<nodes.length; i++) {
            var n = nodes[i];
            var found = false;
            var parent = n.connectedTo;
            while(!(parent instanceof bamboo.nodes.Layer)) {
                if(nodes.indexOf(parent) !== -1) {
                    found = true;
                    break;
                }
                parent = parent.connectedTo;
            }
            if(!found) {
                this.startValues.push(n.getWorldPosition());
                this.nodes.push(n);
                this.mode.editor.controller.selectNode(n);
            }
        }

        this.offset = p;

        this.mode.editor.statusbar.setStatus('Position new node, C(snap to cursor), ESC to cancel (removes new node(s))');
    },

    cancel: function() {
        this.mode.editor.controller.deselectAllNodes();
        for(var i=0; i<this.nodes.length; i++) {
            this.mode.editor.controller.deleteNode(this.nodes[i]);
        }
    },

    apply: function() {
        // nothing to do, node is alread at right position
    },

    onmousemove: function(p) {
        var delta = p.subtract(this.offset);
        for(var i=0; i<this.nodes.length; i++) {
            var n = this.nodes[i];
            n._editorNode.setProperty('position', n.connectedTo.toLocalSpace(delta.addc(this.startValues[i])));
        }
    },

    onkeydown: function(keycode,p) {
        switch(keycode) {
            case 67://C
                return true;
        }
        return false;
    },
    onkeyup: function(keycode,p) {
        switch(keycode) {
            case 67:// C - snap to cursor
                this.offset = new Vec2();
                for(var i=0; i<this.startValues.length; i++) {
                    this.offset.add(this.startValues[i]);
                }
                this.offset.x /= this.startValues.length;
                this.offset.y /= this.startValues.length;
                this.onmousemove(p);
                return true;
        }
        return false;
    }
});

});
