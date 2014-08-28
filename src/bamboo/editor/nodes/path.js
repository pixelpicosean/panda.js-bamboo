game.module(
    'bamboo.editor.nodes.path'
)
.require(
    'bamboo.editor.node',
    'bamboo.runtime.nodes.path'
)
.body(function() {

bamboo.nodes.Path.inject({
    init: function() {
        this.displayObject = new game.Container();
    }
});

bamboo.nodes.Path.editor = bamboo.Node.editor.extend({
    helpText: 'Path: (A)dd point, (G)rab point, (D)elete point',
    color: 0x0000ee,
    selectedPointIndex: -1,
    moving: -1,

    init: function(node) {
        if (node.points.length === 0) {
            node.points.push(new game.Point());
        }

        this.lastMousePos = new game.Point();
        this._super(node);
        this.lineNode = new game.Graphics();
        
        this.debugDisplayObject.addChild(this.lineNode);
        
        this.selectionCircle = new game.Graphics();
        this.selectionCircle.beginFill(0xff0000, 0.9);
        this.selectionCircle.drawCircle(0, 0, 6);
        this.selectionCircle.visible = false;
        this.debugDisplayObject.addChild(this.selectionCircle);

        this.hoverCircle = new game.Graphics();
        this.hoverCircle.beginFill(0xffff00, 0.6);
        this.hoverCircle.drawCircle(0, 0, 12);
        this.hoverCircle.visible = false;
        
        this.debugDisplayObject.addChild(this.hoverCircle);
        this.redrawPath();
    },

    getBounds: function() {
        var ps = this.node.points;
        var minx = ps[0].x;
        var miny = ps[0].y;
        var maxx = minx;
        var maxy = miny;
        for (var i = 0; i < ps.length; i++) {
            if (minx > ps[i].x) minx = ps[i].x;
            else if (maxx < ps[i].x) maxx = ps[i].x;

            if (miny > ps[i].y) miny = ps[i].y;
            else if (maxy < ps[i].y) maxy = ps[i].y;
        }
        return {
            x: minx,
            y: miny,
            width: maxx - minx,
            height: maxy - miny
        };
    },

    enableEditMode: function(enabled) {
        if (enabled === this.editEnabled) return;
        
        this._super(enabled);
        this.editEnabled = enabled;
        if (enabled) {
            this.redrawPath();
            if (this.selectedPointIndex !== -1) {
                this.selectionCircle.visible = true;
                this.selectionCircle.position = this.node.points[this.selectedPointIndex];
            }
        } else {
            if (this.moving !== -1) {
                if (this.startedFrom) {
                    this.node.points[this.moving] = this.startedFrom;
                    this.selectionCircle.position = this.startedFrom;
                    this.startedFrom = null;
                } else {
                    this.node.removePoint(this.moving);
                }
                this.moving = -1;
                this.updateRect();
            }

            this.redrawPath();
            this.selectionCircle.visible = false;
            this.hoverCircle.visible = false;
            this.node.calculateLength();
        }
    },

    sizeChanged: function() {
        this._super();
        this.redrawPath();
    },

    redrawPath: function() {
        this.lineNode.clear();
        if (this.node.points.length === 0) return;

        var sx = this.node.scale.x;
        var sy = this.node.scale.y;

        this.lineNode.lineStyle(2, this.color);
        
        var ps = this.node.points;

        if (!this.node.spline) {
            this.lineNode.moveTo(ps[0].x * sx, ps[0].y * sy);
            for (var i = 1; i < ps.length; i++) {
                this.lineNode.lineTo(ps[i].x * sx, ps[i].y * sy);
            }
            if (this.node.loop) this.lineNode.lineTo(ps[0].x*sx, ps[0].y*sy);
        } else {
            var p1 = ps[0];
            var p0 = p1;
            if (this.node.loop)
                p0 = ps[this.node.points.length-1];
            var p2,p3;
            this.lineNode.moveTo(p1.x*sx, p1.y*sy);
            for (var i = 1; i < ps.length; i++) {
                p2 = ps[i];
                p3 = p2;
                if (i < ps.length - 1)
                    p3 = ps[i+1];
                else if (this.node.loop)
                    p3 = ps[0];
                for(var t = 1; t<21; t++) {
                    var f = t * 1.0/20.0;
                    var p = this.node.catmullRomEvaluate(p0,p1,p2,p3, f);
                    this.lineNode.lineTo(p.x*sx,p.y*sy);
                }
                p0 = p1;
                p1 = p2;
            }
            if (this.node.loop) {
                p2 = ps[0];
                p3 = p2;
                if (ps.length > 1)
                    p3 = ps[1];
                for(var t = 1; t<21; t++) {
                    var f = t * 1.0/20.0;
                    var p = this.node.catmullRomEvaluate(p0,p1,p2,p3, f);
                    this.lineNode.lineTo(p.x*sx,p.y*sy);
                }
            }
        }

        if (this.editEnabled) {
            this.lineNode.lineStyle(1, 0x000000);
            this.lineNode.beginFill(0x0000ff);
            for (var i = 0; i < ps.length; i++) {
                this.lineNode.drawCircle(ps[i].x*sx,ps[i].y*sy,5);
            }
        }
    },

    propertyChanged: function(property, value, oldValue) {
        if (property === 'loop' || property === 'spline') {
            this.updateRect();
            this.redrawPath();
            this.node.calculateLength();
        }
        this._super(property, value, oldValue);
    },

    getClosestPointIndex: function(v) {
        var closestPointIndex = null;
        var closestDistance = null;
        for (var i = 0; i < this.node.points.length; i++) {
            var dist = v.distance(this.node.points[i]);
            if (!closestDistance || dist < closestDistance) {
                closestPointIndex = i;
                closestDistance = dist;
            }
        }
        return closestPointIndex;
    },

    keydown: function(key) {
        if (key === 'ESC') {
            if (this.moving !== -1) {
                if (this.startedFrom) {
                    this.node.points[this.moving] = this.startedFrom;
                    this.selectionCircle.position = this.startedFrom;
                    this.startedFrom = null;
                } else {
                    this.node.removePoint(this.moving);
                }
                this.moving = -1;
                this.updateRect();
                this.redrawPath();
                this.node.calculateLength();
            }
            return;
        }
        if (key === 'A') {
            // were moving existing point, don't allow addition
            if (this.startedFrom) {
                console.log(this.startedFrom);
                return true;
            }

            // we were still moving last added point, commit the latest position and add another
            if (this.moving !== -1) {
                this.node.points[this.moving] = this.lastMousePos.clone();
                this.selectedPointIndex = this.moving;
                this.selectionCircle.position = this.node.points[this.moving];
                this.selectionCircle.visible = true;
            }

            if (this.selectedPointIndex === -1) {
                this.moving = this.node.points.length;
                this.node.addPoint(this.lastMousePos.clone());
            }
            else {
                this.moving = this.selectedPointIndex + 1;
                this.node.insertPoint(this.moving, this.lastMousePos.clone());
            }

            this.hoverCircle.visible = false;
            this.updateRect();
            this.redrawPath();
            this.node.calculateLength();
            return;
        }
        if (key === 'D') {
            if (this.moving !== -1) return;
            if (this.node.points.length === 1) return;
            if (this.selectedPointIndex !== -1) {
                this.node.removePoint(this.selectedPointIndex);
                this.selectedPointIndex = this.selectedPointIndex - 1;
                if (this.selectedPointIndex !== -1)
                    this.selectionCircle.position = this.node.points[this.selectedPointIndex];
                else
                    this.selectionCircle.visible = false;
                this.hoverCircle.visible = false;
                this.updateRect();
                this.redrawPath();
                this.node.calculateLength();
            }
            return;
        }
        if (key === 'G') {
            if (this.selectedPointIndex !== -1 && this.moving === -1) {
                this.startedFrom = this.node.points[this.selectedPointIndex];
                this.hoverCircle.visible = false;
                this.moving = this.selectedPointIndex;
            }
            return;
        }
    },

    mousemove: function(pos) {
        pos = this.node.toLocalSpace(pos);

        this.lastMousePos = pos;
        if (this.moving === -1) {
            var idx = this.getClosestPointIndex(pos);
            if (idx === null) return;
            if (pos.distance(this.node.points[idx]) < 20) {
                this.hoverCircle.position = this.node.points[idx];
                this.hoverCircle.visible = true;
            }
            else {
                this.hoverCircle.visible = false;
            }
            return;
        }

        // were moving
        this.node.points[this.moving] = pos;

        if (this.selectedPointIndex === this.moving) this.selectionCircle.position = pos;
        
        this.updateRect();
        this.redrawPath();
        this.node.calculateLength();
    },

    click: function(pos) {
        pos = this.node.toLocalSpace(pos);

        this.lastMousePos = pos;
        if (this.moving === -1) {
            var idx = this.getClosestPointIndex(pos);
            if (idx === null) return;
            if (pos.distance(this.node.points[idx]) < 20) {
                this.selectedPointIndex = idx;
                this.selectionCircle.position = this.node.points[idx];
                this.selectionCircle.visible = true;
            } else {
                this.selectionCircle.visible = false;
                this.selectedPointIndex = -1;
            }
            this.hoverCircle.visible = false;
            return;
        }

        // we were moving
        this.startedFrom = null;
        this.node.points[this.moving] = pos;
        this.selectedPointIndex = this.moving;
        this.selectionCircle.position = pos;
        this.selectionCircle.visible = true;
        this.moving = -1;
        this.updateRect();
        this.redrawPath();
        this.node.calculateLength();
    }
});

});
