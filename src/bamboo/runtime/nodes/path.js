game.module(
    'bamboo.runtime.nodes.path'
)
.require(
    'bamboo.core',
    'bamboo.runtime.node'
)
.body(function() {

/**
    @class Path
    @namespace bamboo.Nodes
**/
bamboo.createNode('Path', {
    points: [],
    segmentDistances: [],
    splineSegmentDistances: [],
    length: 0,

    ready: function() {
        this.calculateLength();
    },

    addPoint: function(point) {
        this.points.push(point);
    },
    
    insertPoint: function(index, point) {
        this.points.splice(index, 0, point);
    },

    removePoint: function(index) {
        this.points.splice(index, 1);
    },

    getClosestPoint: function(point) {
        var closestDistance = Number.MAX_VALUE;
        var closestPoint = bamboo.pool.get();
        var dist;
        for (var i = 0; i < this.points.length; i++) {
            dist = this.points[i].distance(point);
            if (dist < closestDistance) {
                closestPoint.copy(this.points[i]);
                closestDistance = dist;
            }
        }
        return closestPoint;
    },

    getClosestLineSegment: function(point) {
        var closestDistance = Number.MAX_VALUE;
        var segmentIndex;
        var distPoint;
        var dist;
        for (var i = 1; i < this.points.length; i++) {
            distPoint = this.getClosestPositionOnLineSegment(this.points[i - 1], this.points[i], point);
            dist = distPoint.distance(point);
            if (dist < closestDistance) {
                segmentIndex = i - 1;
                closestDistance = dist;
            }
            bamboo.pool.put(distPoint);
        }
        if (this.loop) {
            distPoint = this.getClosestPositionOnLineSegment(this.points[this.points.length - 1], this.points[0], point);
            dist = distPoint.distance(point);
            if (dist < closestDistance) {
                segmentIndex = this.points.length;
                closestDistance = dist;
            }
            bamboo.pool.put(distPoint);
        }
        return segmentIndex;
    },

    /**
        Get closest position on path from point.
        @method getClosestPosition
        @param {Vector} point
    **/
    getClosestPosition: function(point) {
        var closestDistance = Number.MAX_VALUE;
        var closestPoint = bamboo.pool.get();
        var distPoint;
        var dist;
        // TODO spline
        for (var i = 1; i < this.points.length; i++) {
            distPoint = this.getClosestPositionOnLineSegment(this.points[i - 1], this.points[i], point);
            dist = distPoint.distance(point);
            if (dist < closestDistance) {
                closestPoint.copy(distPoint);
                closestDistance = dist;
            }
            bamboo.pool.put(distPoint);
        }
        if (this.loop) {
            distPoint = this.getClosestPositionOnLineSegment(this.points[this.points.length - 1], this.points[0], point);
            dist = distPoint.distance(point);
            if (dist < closestDistance) {
                closestPoint.copy(distPoint);
                closestDistance = dist;
            }
            bamboo.pool.put(distPoint);
        }
        return closestPoint;
    },

    getClosestPositionOnLineSegment: function(a, b, v) {
        var result = bamboo.pool.get();

        var delta = b.subtractc(a);
        var p = v.subtractc(a);
        
        var t = delta.dot(p) / delta.lengthSq();

        if (t < 0) result.copy(a);
        else if (t > 1) result.copy(b);
        else result.set(delta.x * t + a.x, delta.y * t + a.y);

        bamboo.pool.put(delta);
        bamboo.pool.put(p);

        return result;
    },

    calculateLength: function() {
        this.length = 0;
        this.segmentDistances.length = 0;
        this.segmentDistances.push(0);

        var points = this.points;

        if (this.spline) {
            this.splineSegmentDistances.length = 0;
            var p1 = points[0];
            var p0 = p1;
            if (this.loop) p0 = points[points.length - 1];
            var p2, p3;
            var lastp = bamboo.pool.get();
            lastp.set(points[0].x, points[0].y);
            for (var i = 1; i < points.length; i++) {
                p2 = points[i];
                p3 = p2;
                if (i < points.length - 1) p3 = points[i + 1];
                else if (this.loop) p3 = points[0];

                var splineDistances = [];
                for (var t = 1; t < 21; t++) {
                    var f = t * 1.0 / 20.0;
                    var p = this.catmullRomEvaluate(p0, p1, p2, p3, f);
                    this.length += p.distance(lastp);
                    splineDistances.push(this.length);
                    lastp.x = p.x;
                    lastp.y = p.y;
                    bamboo.pool.put(p);
                }
                this.segmentDistances.push(this.length);
                this.splineSegmentDistances.push(splineDistances);
                p0 = p1;
                p1 = p2;
            }
            if (this.loop) {
                p2 = points[0];
                p3 = p2;
                if (points.length > 1) p3 = points[1];
                var splineDistances = [];
                for (var t = 1; t < 21; t++) {
                    var f = t * 1.0 / 20.0;
                    var p = this.catmullRomEvaluate(p0, p1, p2, p3, f);
                    this.length += p.distance(lastp);
                    splineDistances.push(this.length);
                    lastp.x = p.x;
                    lastp.y = p.y;
                    bamboo.pool.put(p);
                }
                this.segmentDistances.push(this.length);
                this.splineSegmentDistances.push(splineDistances);
            }
            bamboo.pool.put(lastp);
        }
        else {
            var prevPoint = points[0];
            var point;
            for (var i = 1; i < points.length; i++) {
                point = points[i];
                this.length += point.distance(prevPoint);
                this.segmentDistances.push(this.length);
                prevPoint = point;
            }
            if (this.loop) {
                this.length += points[0].distance(prevPoint);
                this.segmentDistances.push(this.length);
            }
        }
    },

    /**
        Get position on path, based on distance.
        @method getPositionAtDistance
        @param {Number} dist
    **/
    getPositionAtDistance: function(dist) {
        if (dist < 0) dist = this.length + (dist % this.length);
        if (dist > this.length) dist = dist % this.length;

        var i;
        for (i = 0; i < this.segmentDistances.length; i++) {
            if (this.segmentDistances[i] > dist) break;
        }
        if (i === this.segmentDistances.length) i = this.segmentDistances.length - 1;

        if (this.spline) {
            var splineDistances = this.splineSegmentDistances[i - 1];
            var t;
            for (t = 0; t < splineDistances.length - 1; t++) {
                if (splineDistances[t] > dist) break;
            }
            var f;
            if (t === 0) {
                f = (dist - this.segmentDistances[i - 1]) / (splineDistances[t] - this.segmentDistances[i - 1]);
            }
            else {
                f = (dist - splineDistances[t - 1]) / (splineDistances[t] - splineDistances[t - 1]);
            }

            f = (t + f) * 1 / 20;

            var p1 = this.points[i - 1];
            var p0 = p1;
            var p2 = this.points[i];
            var p3 = p2;
            if (i > 1) p0 = this.points[i - 2];
            else if (this.loop) p0 = this.points[this.points.length - 1];

            if (i < this.points.length - 1) {
                p3 = this.points[i + 1];
            }
            else if (this.loop && i === this.points.length) {
                p2 = this.points[0];
                p3 = this.points[1];
            }
            else if (this.loop && i === this.points.length - 1) {
                p3 = this.points[0];
            }

            return this.catmullRomEvaluate(p0, p1, p2, p3, f);
        }
        else {
            // interpolate
            var delta;
            if (i === this.points.length) {
                // loop
                delta = this.points[0].subtractc(this.points[i - 1]).normalize();
            }
            else {
                delta = this.points[i].subtractc(this.points[i - 1]).normalize();
            }
            return delta.multiply(dist - this.segmentDistances[i - 1]).add(this.points[i - 1]);
        }
    },

    catmullRomEvaluate: function(p0, p1, p2, p3, t) {
        var c0 = ((-t + 2.0) * t - 1.0) * t * 0.5;
        var c1 = (((3.0 * t - 5.0) * t) * t + 2.0) * 0.5;
        var c2 = ((-3.0 * t + 4.0) * t + 1.0) * t * 0.5;
        var c3 = ((t - 1.0) * t * t) * 0.5;

        var point = bamboo.pool.get();
        point.set(p0.x * c0 + p1.x * c1 + p2.x * c2 + p3.x * c3, p0.y * c0 + p1.y * c1 + p2.y * c2 + p3.y * c3);
        return point;
    }
});

/**
    Is path looping.
    @property {Boolean} loop
**/
bamboo.addNodeProperty('Path', 'loop', 'boolean');
/**
    Is path spline.
    @property {Boolean} spline
**/
bamboo.addNodeProperty('Path', 'spline', 'boolean');
/**
    List of points in path.
    @property {Array} points
**/
game.bamboo.nodes.Path.properties.points = new game.bamboo.Property('', '', game.bamboo.Property.TYPE.ARRAY, [], new game.bamboo.Property('', '', game.bamboo.Property.TYPE.VECTOR));

});
