game.module(
    'bamboo.runtime.nodes.path'
)
.require(
    'bamboo.runtime.node'
)
.body(function() {

bamboo.nodes.Path = bamboo.Node.extend({
    points: [],
    loop: false,
    spline: false,
    length: 0,
    segmentDistances: [],
    splineSegmentDistances: null,

    init: function(world, properties) {
        this.displayObject = new game.Container();
        this._super(world, properties);
        if (!this.points || this.points.length === 0)
            this.points = [new game.Vec2()];
        this.calculateLength();
    },

    addPoint: function(p) {
        this.points.push(p);
    },
    
    insertPoint: function(idx, p) {
        this.points.splice(idx, 0, p);
    },

    removePoint: function(idx) {
        this.points.splice(idx, 1);
    },

    getClosestPoint: function(p) {
        var closestDistanceSq = Number.MAX_VALUE;
        var closestPoint = null;
        for(var i=1; i<this.points.length; i++) {
            var v = this.getClosestPointOnLineSegment(this.points[i-1], this.points[i], p);
            var distSq = v.distanceSq(p);
            if (distSq < closestDistanceSq) {
                closestPoint = v;
                closestDistanceSq = distSq;
            }
        }
        return closestPoint;
    },

    calculateLength: function() {
        var ps = this.points;

        this.segmentDistances = [0];
        this.splineSegmentDistances = [];
        this.length = 0.0;
        if (!this.spline) {
            var lastp = ps[0];
            for(var i=1; i<ps.length; i++) {
                var p = ps[i];
                this.length += p.distance(lastp);
                this.segmentDistances.push(this.length);
                lastp = p;
            }
            if (this.loop) {
                this.length += ps[0].distance(lastp);
                this.segmentDistances.push(this.length);
            }

        } else {
            var p1 = ps[0];
            var p0 = p1;
            if (this.loop)
                p0 = this.points[this.points.length-1];
            var p2,p3;
            var lastp = ps[0];
            for(var i = 1; i < ps.length; i++) {
                p2 = ps[i];
                p3 = p2;
                if (i < ps.length - 1)
                    p3 = ps[i+1];
                else if (this.loop)
                    p3 = ps[0];

                var splineDistances = [];
                for(var t = 1; t<21; t++) {
                    var f = t * 1.0/20.0;
                    var p = this.catmullRomEvaluate(p0,p1,p2,p3, f);
                    this.length += p.distance(lastp);
                    splineDistances.push(this.length);
                    lastp = p;
                }
                this.segmentDistances.push(this.length);
                this.splineSegmentDistances.push(splineDistances);
                p0 = p1;
                p1 = p2;
            }
            if (this.loop) {
                p2 = ps[0];
                p3 = p2;
                if (ps.length > 1)
                    p3 = ps[1];
                var splineDistances = [];
                for(var t = 1; t<21; t++) {
                    var f = t * 1.0/20.0;
                    var p = this.catmullRomEvaluate(p0,p1,p2,p3, f);
                    this.length += p.distance(lastp);
                    splineDistances.push(this.length);
                    lastp = p;
                }
                this.segmentDistances.push(this.length);
                this.splineSegmentDistances.push(splineDistances);
            }
        }
    },

    getPositionAtDistance: function(l) {
        // TODO: binary search..
        if (l < 0)
            l = 0;
        if (l > this.length)
            l = this.length;

        var i = 0;
        for(i=0; i<this.segmentDistances.length; i++) {
            if (this.segmentDistances[i] > l) {
                break;
            }
        }
        if (i === this.segmentDistances.length)
            i = this.segmentDistances.length-1;

        if (!this.spline) {
            // interpolate
            var delta;
            if (i === this.points.length) {
                // loop
                delta = this.points[0].subtractc(this.points[i-1]).normalize();
            } else {
                delta = this.points[i].subtractc(this.points[i-1]).normalize();
            }
            return delta.multiply(l-this.segmentDistances[i-1]).add(this.points[i-1]);


        } else {
            var splineDistances = this.splineSegmentDistances[i-1];
            var t;
            for(t=0; t<20; t++) {
                if (splineDistances[t] > l)
                    break;
            }
            var f;
            if (t === 0)
                f = (l - this.segmentDistances[i-1]) / (splineDistances[t] - this.segmentDistances[i-1]);
            else
                f = (l - splineDistances[t-1]) / (splineDistances[t] - splineDistances[t-1]);

            f = (t + f) * 1.0 / 20.0;

            var p1 = this.points[i-1];
            var p0 = p1;
            var p2 = this.points[i];
            var p3 = p2;
            if (i > 1)
                p0 = this.points[i-2];
            else if (this.loop)
                p0 = this.points[this.points.length-1];

            if (i < this.points.length-1)
                p3 = this.points[i+1];
            else if (this.loop && i === this.points.length) {
                p2 = this.points[0];
                p3 = this.points[1];
            } else if (this.loop && i === this.points.length-1)
                p3 = this.points[0];

            return this.catmullRomEvaluate(p0,p1,p2,p3, f);
        }
    },

    getClosestPointOnLineSegment: function(a, b, v) {
        var delta = b.subtractc(a);
        var p = v.subtractc(a);

        var t = delta.dot(p) / delta.lengthSq();
        if (t < 0)
            return a;
        if (t > 1)
            return b;
        return delta.multiply(t).add(a);
    },

    catmullRomEvaluate: function(p0,p1,p2,p3,t) {
        var c0 = ((-t + 2.0) * t - 1.0) * t * 0.5;
        var c1 = (((3.0 * t - 5.0) * t) * t + 2.0) * 0.5;
        var c2 = ((-3.0 * t + 4.0) * t + 1.0) * t * 0.5;
        var c3 = ((t - 1.0) * t * t) * 0.5;

        return new game.Vec2(
            p0.x*c0 + p1.x*c1 + p2.x*c2 + p3.x*c3,
            p0.y*c0 + p1.y*c1 + p2.y*c2 + p3.y*c3);
    }
});

bamboo.nodes.Path.desc = {
    loop: new bamboo.Property(true, 'Loop', 'Connect endpoints', bamboo.Property.TYPE.BOOLEAN),
    spline: new bamboo.Property(true, 'Spline', 'Use spline-smoothing', bamboo.Property.TYPE.BOOLEAN),
    points: new bamboo.Property(false, '', '', bamboo.Property.TYPE.ARRAY, new bamboo.Property(false, '','',bamboo.Property.TYPE.VECTOR))
};

});
