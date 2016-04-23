        var r = new Resumable({
                target: 'upload/',
                query: {},
                maxChunkRetries: 4,
                testChunks: true,
                maxFiles: 3,
                prioritizeFirstAndLastChunk: true,
                simultaneousUploads: 20,
                chunkSize: 1 * 1024* 1024,
                generateUniqueIdentifier: function(file)
                {
                var stamp=file.size+"-"+Date.parse(file.lastModifiedDate)+"-"+file.name;
                //alert(stamp);
                return stamp;
                }

        });

        var results=$('#results');

        r.assignBrowse(document.getElementById('add-file-btn'));

        $('#start-upload-btn').click(function(){
                r.upload();
        });

        $('#pause-upload-btn').click(function(){
                if (r.files.length>0) {
                        if (r.isUploading()) {
                                return r.pause();
                        }
                        return r.upload();
                }
        });

        var progressBar = new ProgressBar($('#upload-progress'));

        r.on('fileAdded', function(file, event){
                progressBar.fileAdded();

                var template =
                '<hr><div id="' + file.uniqueIdentifier + '">' +
                '<div class="fileName">' + file.fileName + ' (' + file.file.type + ')' + '&nbsp;&nbsp;&nbsp;&nbsp;<prog>0%</prog> </div>' +
                '<span class="meter" style="width:0%;"></span>' +
                '</div>' +
                '</div>';

                results.append(template);

        });

	 r.on('fileSuccess', function(file, message){
                var p="upload/merge?filename="+file.uniqueIdentifier+"&chunks_num="+file.chunks.length

                $.ajax({
                        type:    "POST",
                        url:     p,
                        //data:    {"postComment":""},
                        success: function(data) {
                                <!-- alert(data) -->

                                var c=document.getElementById(file.uniqueIdentifier );
                                c.innerHTML+=" file uploaded <a target='_blank' href='uploads/"+file.uniqueIdentifier+"'> here</a> "+
                                "<button onclick=\"prompt('Press Ctrl + C, then Enter to copy to clipboard','"+ window.location.protocol  +
                                "//" + window.location.host +
                                "/.uploader106/uploads/"+file.uniqueIdentifier+
                                "')\">Click to Copy URL</button>";

                                $('[id="' + file.uniqueIdentifier +'"]').find('prog').html('');
                        },
                        error:   function(jqXHR, textStatus, errorThrown) {
                                alert("Error, status = " + textStatus + ", " +
                                "error thrown: " + errorThrown
                                );
                        }
                });
                $('[id="' + file.uniqueIdentifier +'"]').find('prog').html('(upload complete please wait chunk merging...)');
        });


	r.on('progress', function(){
                progressBar.uploading(r.progress()*100);
                $('#pause-upload-btn').find('.glyphicon').removeClass('glyphicon-play').addClass('glyphicon-pause');
        });

        r.on('fileProgress', function (file) {
                var progress = Math.floor(file.progress() * 100);
                $('[id="' + file.uniqueIdentifier +'"]').find('prog').html('&nbsp;' + progress + '%');
        });

        r.on('pause', function(){
                $('#pause-upload-btn').find('.glyphicon').removeClass('glyphicon-pause').addClass('glyphicon-play');
        });

        r.on('complete', function(){
                progressBar.finish();
                timer.stop('tst');
        });

	function ProgressBar(ele) {
                this.thisEle = $(ele);
                this.fileAdded = function() {
                        (this.thisEle).removeClass('hide').find('.progress-bar').css('width','0%');
                },

                this.uploading = function(progress) {
                        (this.thisEle).find('.progress-bar').attr('style', "width:"+progress+'%');
                },

                this.finish = function() {
                        (this.thisEle).addClass('hide').find('.progress-bar').css('width','0%');
                }
        }
