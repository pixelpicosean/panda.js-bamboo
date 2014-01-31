game.module(
    'editor.core',
    '1.0.0'
)
.require(
    'editor.window'
)
.body(function() {

var link = document.createElement('link');
link.rel = 'stylesheet';
link.type = 'text/css';
link.href = 'src/editor/style.css';
document.getElementsByTagName('head')[0].appendChild(link);

var test = new game.Window('Title');
test.addContent('Hello window!');
test.addInputText('x', 100);
test.addInputText('y', 200);
test.addInputText('alpha', '1.0');
test.addInputText('rotation', Math.PI);
test.addButton('OK', function() {
    for(var i in this.inputs) {
        console.log(this.inputs[i].name + ': ' + this.inputs[i].value);
    }
    this.remove();
});
test.show();

});