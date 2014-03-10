window.bamboo = window.bamboo || {};
window.bamboo.editor = window.bamboo.editor || {};

game.module(
    'bamboo.editor.core'
)
.require(
    'bamboo.runtime.core',
    'bamboo.editor.editor',
    'bamboo.editor.ui',
    'bamboo.editor.node'
)
.body(function() {

bamboo.EditorScene = game.Scene.extend({
    editor: null,
    filesystem: null,
    backupFile: null,

    init: function() {
        this.installEventListeners();

        this.openFilesystem();

        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'src/bamboo/editor/FileSaver.js';
        head.appendChild(script);
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'src/bamboo/editor/jszip.min.js';
        head.appendChild(script);
    },

    loadEditor: function(json) {
        if(this.editor) {
            this.editor.exit();
            this.stage.removeChild(this.editor.displayObject);
        }


        // load level images
        var images = JSON.parse(json).images;
        for(var name in images) {
            PIXI.TextureCache[name] = PIXI.Texture.fromImage(images[name], true);
        }


        this.editor = bamboo.Editor.createFromJSON(json);
        this.stage.addChild(this.editor.displayObject);
    },

    openFilesystem: function() {
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        navigator.webkitPersistentStorage.requestQuota(50*1024*1024, this.onFSGotQuota.bind(this),
                                                       function(e) { alert('Filesystem error: '+e);});
    },

    onFSGotQuota: function(grantedBytes) {
        //console.log('Got bytes: '+grantedBytes);
        window.requestFileSystem(PERSISTENT, grantedBytes, this.onFSInit.bind(this), this.onFSError.bind(this));
    },
    onFSInit: function(fs) {
        this.filesystem = fs;
        fs.root.getFile('backup.json', {create:true}, this.onBackupLoaded.bind(this), this.onFSError.bind(this));
        //console.log('Opened file system: ' + fs.name);

    },
    onFSError: function(e) {
        console.log('Error: ' + e.name + ' - ' + e.message);
    },
    onBackupLoaded: function(backupFile) {
        this.backupFile = backupFile;
        var self = this;

        this.backupFile.file(function(f) {
            var reader = new FileReader();
            reader.onloadend = function(e) {
                var json = '{"world":"World", "images":{}, "nodes": [{"class":"Layer", "properties":{"name":"main","position":{"x":0,"y":0},"rotation":0,"scale":{"x":1, "y":1},"connectedTo":null, "speedFactor":1 }}]}';
                if(this.result !== '' && confirm('Load from backup?'))
                    json = this.result;

                self.loadEditor(json);

                // do backup every 10 sec
                window.setInterval(self.doBackup.bind(self), 10000);
            };

            reader.readAsText(f);
        }, this.onFSError.bind(this));
    },
    doBackup: function() {
        var self = this;
        this.filesystem.root.getFile('tmp_backup.json', {create:true}, function(f) {
            f.createWriter(function(fw) {
                fw.onwriteend = function() {
                    // now we have the tmp_backup.json data ready on fs
                    // move the old one to oldbackup.json (for safety)
                    self.backupFile.moveTo(self.filesystem.root, 'oldbackup.json', function(e){
                        self.backupFile = e;
                        // moving is done, now move the new backup to backup.json
                        f.moveTo(self.filesystem.root, 'backup.json',function(e){
                            var oldBackup = self.backupFile;
                            self.backupFile = e;
                            oldBackup.remove(function() {}, self.onFSError.bind(self));
                        }, self.onFSError.bind(self));
                    }, self.onFSError.bind(self));
                };
                fw.onerror = function(e) {
                    console.log('Backup write failed: ' + e.toString());
                    f.remove(function(){}, self.onFSError.bind(self));
                };

                var blob = new Blob([JSON.stringify(self.editor.world.toJSON())], {type: 'text/plain'});
                fw.write(blob);
            }, self.onFSError.bind(self));
        }, this.onFSError.bind(this));
    },

    save: function() {
        //var blob = new Blob([JSON.stringify(this.editor.world.toJSON())], {type: 'text/plain'});
        var blob = new Blob([JSON.stringify(this.editor.world.toJSON(), null, '  ')], {type: 'text/plain'});
        saveAs(blob, 'level.json');
    },

    export: function() {
        var json = this.editor.world.toJSON();
        var images = json.images;
        var neededImages = {};
        delete json.images;
        for(var i=0; i<json.nodes.length; i++) {
            var node = json.nodes[i];
            if(node.properties.image && node.properties.image !== '') {
                if(!neededImages.hasOwnProperty(node.properties.image))
                    // len('data:image/png;base64.') == 22
                    neededImages[node.properties.image] = images[node.properties.image].slice(22);
                node.properties.image = 'level/'+node.properties.image;
            }
        }
        var zip = new JSZip();
        var folder = zip.folder('level');

        var js = 'game.module(\n    \'level\'\n)\n.body(function() {\n';
        js += 'game.level = JSON.stringify('+JSON.stringify(json, null, '    ')+');\n\n';
        for(var name in neededImages) {
            folder.file(name, neededImages[name], {base64:true});
            js += '    game.addAsset(\'level/'+name+'\');\n';
        }
        js += '\n});\n';
        zip.file('level.js', js);

        var blob = zip.generate({type: 'blob'});
        saveAs(blob, 'level.zip');
    },

    update: function() {
        if(this.editor)
            this.editor.update(game.system.delta);
        this.super();
    },

    click: function(me) {
        if(this.editor && me.originalEvent.button === 0)
            this.editor.onclick();
    },
    onmousedown: function(e) {
        if(this.editor)
            this.editor.onmousedown(e.button);
    },
    onmousemove: function(e) {
        if(this.editor)
            this.editor.onmousemove(new Vec2(e.clientX, e.clientY));
    },
    onmouseup: function(e) {
        if(this.editor)
            this.editor.onmouseup(e.button);
    },
    onmouseout: function(e) {
        if(this.editor)
            this.editor.onmouseout();
    },
    onmousewheel: function(e) {
        if(this.editor)
            this.editor.onmousewheel(e.wheelDelta);
    },
    onkeydown: function(e) {
        if(!this.editor)
            return;

        var tag = e.target.tagName;
        if(tag === 'INPUT' || tag === 'TEXTAREA')
            return;

        if(e.type !== 'keydown')
            return;

        var code = e.keyCode;
        var handled = this.editor.onkeydown(code);
        if(handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },
    onkeyup: function(e) {
        if(!this.editor)
            return;

        var tag = e.target.tagName;
        if(tag === 'INPUT' || tag === 'TEXTAREA')
            return;

        if(e.type !== 'keyup')
            return;

        var code = e.keyCode;
        var handled = this.editor.onkeyup(code);
        if(handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },


    installEventListeners: function() {
        var canvas = game.system.canvas;
        canvas.addEventListener('mousedown', this.onmousedown.bind(this), false);
        canvas.addEventListener('mousemove', this.onmousemove.bind(this), false);
        canvas.addEventListener('mouseup', this.onmouseup.bind(this), false);
        canvas.addEventListener('mouseout', this.onmouseout.bind(this), false);
        canvas.addEventListener('mousewheel', this.onmousewheel.bind(this), false);
        window.addEventListener('keydown', this.onkeydown.bind(this), false);
        window.addEventListener('keyup', this.onkeyup.bind(this), false);

        canvas.ondragover = function() { return false; };
        canvas.ondragend = function() { return false; };
        canvas.ondrop = this.onFileDrop.bind(this);
    },

    onFileDrop: function(e) {
        var self = this;
        e.preventDefault();

        if(e.dataTransfer.files.length !== 1) {
            alert('You must drop only one project file!');
            return false;
        }

        var file = e.dataTransfer.files[0];
        var parts = file.name.split('.');
        var suffix = parts[parts.length-1];
        if(suffix !== 'json') {
            alert('Project file must have .json suffix!');
            return false;
        }


        var reader = new FileReader();
        reader.onload = function(e) {
            var json = e.target.result;
            self.loadEditor(json);
        };
        reader.filename = file.name;
        reader.readAsText(file);

        return false;
    }
});


bamboo.start = function() {
    game.Debug.position.desktop = game.Debug.POSITION.TOPRIGHT;
    game.System.resize = false;
    game.System.center = false;
    game.System.left = 0;
    game.System.top = 0;

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = 'src/bamboo/editor/style.css';
    document.getElementsByTagName('head')[0].appendChild(style);

    this.ui = new bamboo.Ui();

    // TODO: read from json?
    game.System.orientation = game.System.LANDSCAPE;
    game.start(bamboo.EditorScene, window.innerWidth, window.innerHeight-40);
};

});
