window.bamboo = window.bamboo || {};
window.bamboo.editor = window.bamboo.editor || {};

game.module(
    'bamboo.editor.core'
)
.require(
    'bamboo.runtime.core',
    'bamboo.editor.editor',
    'bamboo.editor.ui',
    'bamboo.editor.nodes.layer',
    'bamboo.editor.node'
)
.body(function() {

bamboo.EditorScene = game.Scene.extend({
    editor: null,
    filesystem: null,
    backupFile: null,
    imagesFile: null,

    init: function() {
        this.installEventListeners();

        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'src/bamboo/editor/FileSaver.js';
        head.appendChild(script);
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'src/bamboo/editor/jszip.min.js';
        head.appendChild(script);

        document.body.insertAdjacentHTML('beforeend', '<div id="blockUi" style="width:100%;height:100%;background-color:#ffffff;opacity:0.5;position:absolute;z-index:10000;display:block;" onclick=""><img src="src/bamboo/editor/media/spiffygif_38x38.gif" style="left:50%;top:50%;position:absolute;"/></div>');

        // open filesystem and check if we have backup
        this.openFilesystem();
    },

    loadEditor: function(json, images) {
        if (this.editor) {
            this.editor.exit();
            this.stage.removeChild(this.editor.displayObject);
        }

        for (var i=0; i<images.length; i++) {
            game.TextureCache[images[i].name] = game.Texture.fromImage('data:image/png;base64,'+images[i].data, false);
        }

        this.editor = bamboo.Editor.createFromJSON(json);
        this.editor.images = images.sort(function(a,b) { return a.name > b.name ? 1 : -1;});
        this.editor.propertyPanel.activeLayerChanged(this.editor.activeLayer);
        this.stage.addChild(this.editor.displayObject);
    },

    loadFromZip: function(zipData, json) {
        var zip = new JSZip(zipData, {base64: true});
        var jsonText = json;
        if (!jsonText) jsonText = zip.file('level.json').asText();

        var zipImages = zip.folder('level').file(/.*/);

        // load level images
        var images = [];
        for (var i=0; i<zipImages.length; i++) {
            var imgData = JSZip.base64.encode(zipImages[i].asBinary());
            var imgName = zipImages[i].name;
            images.push({name:imgName, data:imgData});
        }

        this.loadEditor(jsonText, images);
        zip.remove('level.json').remove('level.js');
        this.editor.imageZip = zip;
        this.saveImagesZip(zip);
    },

    openFilesystem: function() {
        window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
        navigator.webkitPersistentStorage.requestQuota(50 * 1024 * 1024, this.onFSGotQuota.bind(this), function(e) { alert('Filesystem error: ' + e); });
    },

    onFSGotQuota: function(grantedBytes) {
        window.requestFileSystem(PERSISTENT, grantedBytes, this.onFSInit.bind(this), this.onFSError.bind(this));
    },

    onFSInit: function(fs) {
        this.filesystem = fs;
        // load backup json
        fs.root.getFile('backup.json', {create:true}, this.onBackupLoaded.bind(this), this.onFSError.bind(this));
    },

    onFSError: function(e) {
        console.log('Error: ' + e.name + ' - ' + e.message);
    },

    onBackupLoaded: function(backupFile) {
        // backup file loaded/created
        this.backupFile = backupFile;
        var self = this;

        // try to read file
        this.backupFile.file(function(f) {
            var reader = new FileReader();
            reader.onloadend = function(e) {

                // We have backup.json data available
                if (this.result === '' || !confirm('Load from backup?')) {
                    // if the file is empty(just created?) or if user doesn't want to use the backup

                    var json = '{"world":"World", "images":{}, "nodes": [{"class":"Layer", "properties":{"name":"main","position":{"x":0,"y":0},"rotation":0,"scale":{"x":1, "y":1},"connectedTo":null, "speedFactor":1 }}]}';
                    self.loadEditor(json, []);
                    self.editor.imageZip = new JSZip();
                    document.getElementById('blockUi').style.display = 'none';

                    // do backup every 10 sec
                    window.setInterval(self.doBackup.bind(self), 10000);
                    return;
                }

                var levelJSON = this.result;

                self.filesystem.root.getFile('images.zip', {create:false}, function(imagesFile) {
                    self.imagesFile = imagesFile;
                    imagesFile.file(function(f) {
                        var imgReader = new FileReader();
                        imgReader.onloadend = function(e) {
                            // len('data:;base64,') == 13
                            self.loadFromZip(this.result.slice(13), levelJSON);

                            document.getElementById('blockUi').style.display = 'none';

                            // do backup every 10 sec
                            window.setInterval(self.doBackup.bind(self), 10000);
                        };
                        imgReader.readAsDataURL(f);
                    }, self.onFSError.bind(self));
                }, self.onFSError.bind(self));
                
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

    saveImagesZip: function(zip) {
        var self = this;
        this.filesystem.root.getFile('tmp_images.zip', {create:true}, function(f) {
            f.createWriter(function(fw) {
                fw.onwriteend = function() {
                    // now we have the tmp_backup.json data ready on fs
                    // move the old one to oldbackup.json (for safety)
                    if (self.imagesFile) {
                        self.imagesFile.moveTo(self.filesystem.root, 'oldimages.zip', function(e){
                            self.imagesFile = e;
                            // moving is done, now move the new backup to backup.json
                            f.moveTo(self.filesystem.root, 'images.zip',function(e){
                                var oldImages = self.imagesFile;
                                self.imagesFile = e;
                                oldImages.remove(function() {}, self.onFSError.bind(self));
                            }, self.onFSError.bind(self));
                        }, self.onFSError.bind(self));
                    } else {
                        f.moveTo(self.filesystem.root, 'images.zip',function(e){
                            self.imagesFile = e;
                        }, self.onFSError.bind(self));
                    }
                };
                fw.onerror = function(e) {
                    console.log('Images zip write failed: ' + e.toString());
                    f.remove(function(){}, self.onFSError.bind(self));
                };

                var blob = zip.generate({type: 'blob'});
                fw.write(blob);
            }, self.onFSError.bind(self));
        }, this.onFSError.bind(this));
    },

    save: function() {
        var json = this.editor.world.toJSON();
        var images = this.editor.images;
        var neededImages = {};
        for (var i=0; i<json.nodes.length; i++) {
            var node = json.nodes[i];
            if (!node.properties.image || node.properties.image === '') continue;

            var imgName = node.properties.image;
            if (neededImages.hasOwnProperty(imgName)) continue;

            for (var j=0; j<images.length; j++) {
                if (images[j].name === imgName) {
                    neededImages[imgName] = images[j].data;
                    break;
                }
            }
        }

        var zip = new JSZip();
        var levelFolder = zip.folder('level');
        var jsonText = JSON.stringify(json, null, '    ');
        var js = 'game.module(\n    \'level\'\n)\n.body(function() {\n';
        js += 'game.level = JSON.stringify('+jsonText+');\n\n';

        for (var name in neededImages) {
            levelFolder.file(name.slice(6), neededImages[name], {base64:true});
            js += 'game.addAsset(\''+name+'\');\n';
        }

        js += '\n});\n';
        zip.file('level.js', js);
        zip.file('level.json', jsonText);

        var blob = zip.generate({type: 'blob'});
        saveAs(blob, 'level.zip');
    },

    update: function() {
        if (this.editor) this.editor.update(game.system.delta);
        this._super();
    },

    click: function(me) {
        var handled = false;
        if (this.editor && me.originalEvent.button === 0) handled = this.editor.onclick();
        if (handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },

    onmousedown: function(e) {
        if (this.editor && this.editor.onmousedown(e.button)) {
            e.stopPropagation();
            e.preventDefault();
        }
    },

    onmousemove: function(e) {
        var handled = false;
        if (this.editor)
            handled = this.editor.onmousemove(new Vec2(e.clientX, e.clientY));
        if (handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },

    onmouseup: function(e) {
        var handled = false;
        if (this.editor)
            handled = this.editor.onmouseup(e.button);
        if (handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },

    onmouseout: function(e) {
        var handled = false;
        if (this.editor)
            handled = this.editor.onmouseout();
        if (handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },

    onmousewheel: function(e) {
        var handled = false;
        if (this.editor)
            handled = this.editor.onmousewheel(e.wheelDelta);
        if (handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },

    onkeydown: function(e) {
        if (!this.editor) return;

        var tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (e.type !== 'keydown') return;

        var code = e.keyCode;
        if (code === 82) return;
        var handled = this.editor.onkeydown(code);
        if (handled) {
            e.stopPropagation();
            e.preventDefault();
        }
    },

    onkeyup: function(e) {
        if (!this.editor) return;

        var tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        if (e.type !== 'keyup') return;

        var code = e.keyCode;
        var handled = this.editor.onkeyup(code);
        if (handled) {
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

        if (e.dataTransfer.files.length !== 1) {
            alert('You must drop only one project file!');
            return false;
        }

        var file = e.dataTransfer.files[0];
        var parts = file.name.split('.');
        var suffix = parts[parts.length - 1];
        if (suffix !== 'zip') {
            alert('Project file must be a zip file!');
            return false;
        }

        document.getElementById('blockUi').style.display = 'block';

        var reader = new FileReader();
        reader.onload = function(e) {
            var zipData = e.target.result;
            var dataBegin = zipData.indexOf(';base64,');
            zipData = zipData.slice(dataBegin + 8);
            self.loadFromZip(zipData);

            document.getElementById('blockUi').style.display = 'none';
        };
        reader.filename = file.name;
        reader.readAsDataURL(file);

        return false;
    }
});

bamboo.start = function() {
    game.System.scale = false;
    game.System.center = false;
    game.System.left = 0;
    game.System.top = 0;

    var style = document.createElement('link');
    style.rel = 'stylesheet';
    style.type = 'text/css';
    style.href = 'src/bamboo/editor/style.css';
    document.getElementsByTagName('head')[0].appendChild(style);

    this.ui = new bamboo.Ui();

    game.start(bamboo.EditorScene, window.innerWidth, window.innerHeight - 40);
};

});
