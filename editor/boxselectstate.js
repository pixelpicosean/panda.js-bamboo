game.module(
    'bamboo.editor.boxselectstate'
)
.require(
    'bamboo.editor.state'
)
.body(function() {

bamboo.editor.BoxSelectState = bamboo.editor.State.extend({
    box: null,
    size: null,

    init: function(mode, p) {
        this.super(mode);

        this.box = new game.Graphics();
        this.size = new Vec2();
        this.box.position = mode.editor.activeLayer.toLocalSpace(p);
        this.mode.editor.activeLayer.displayObject.addChild(this.box);

        this.mode.editor.statusbar.setStatus('');//Position new node, C(snap to cursor), ESC to cancel (removes new node(s))');
    },

    cancel: function() {
        this.box.parent.removeChild(this.box);
    },

    apply: function() {
        this.box.parent.removeChild(this.box);
        if(!this.mode.shiftDown)
            this.mode.editor.controller.deselectAllNodes();

        var tl = this.mode.editor.activeLayer.toWorldSpace(this.box.position);
        var br = this.mode.editor.activeLayer.toWorldSpace(this.size.add(this.box.position));
        if(tl.x > br.x) {
            var h = tl.x;
            tl.x = br.x;
            br.x = h;
        }
        if(tl.y > br.y) {
            var h = tl.y;
            tl.y = br.y;
            br.y = h;
        }
        var r = {tl: tl, br: br};
        var nodes = this.mode.editor.findNodesInside(r, this.mode.editor.activeLayer);
        for(var i=0; i<nodes.length; i++)
            this.mode.editor.controller.selectNode(nodes[i]);
    },

    onmousemove: function(p) {
        this.box.clear();
        this.box.lineStyle(2, 0xffffff);
        this.box.beginFill(0xffffff, 0.1);
        this.size = this.mode.editor.activeLayer.toLocalSpace(p).subtract(this.box.position);
        this.box.drawRect(0,0,this.size.x,this.size.y);
    }
});

});
