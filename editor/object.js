game.module(
    'bamboo.editor.object'
)
.require(
    'bamboo.runtime.object',
    'bamboo.editor.objects.path'
)
.body(function() {

bamboo.getObjects = function() {
    var objs = [];
    for(var i in bamboo) {
        if(i.substring(0,6) === 'Object') objs.push(i);
    }
    return objs;
};

bamboo.getClassName = function(obj) {
    var objs = bamboo.getObjects();
    for (var i = objs.length - 1; i >= 0; i--) {
        if(obj instanceof bamboo[objs[i]]) return objs[i];
    };
    return null;
}

bamboo.Object.editor = game.Class.extend({

});

});