var r;
var browse_assigned=0;
generate_resumable();


function generate_resumable()
{
	$('#results').children().remove(); //removes results from previous resumable

	if(browse_assigned==1){
		r.assignBrowse('');
		$("input:file").remove();
		var old_browse_button = document.getElementById("add-file-btn");
		var new_browse_button = old_browse_button.cloneNode(true);
		old_browse_button.parentNode.replaceChild(new_browse_button, old_browse_button);
	}

	var get_value=document.getElementById("simultaneous_uploads");
	var simultaneous_uploads=get_value.value;

	get_value=document.getElementById("chunksize");
	var chunk_size= get_value.value * 1024 * 1024;
	//alert(chunk_size);

	 r = new Resumable({
		target: 'upload/',
		query: {},
		maxChunkRetries: 4,
		testChunks: true,
		maxFiles:  8,
		prioritizeFirstAndLastChunk: false,
		simultaneousUploads: simultaneous_uploads,
		chunkSize: chunk_size,
		generateUniqueIdentifier: function(file){
			var stamp=file.size+"-"+Date.parse(file.lastModifiedDate)+"-"+file.name;
			//alert(stamp);
			return stamp;
		}

	});
	var results=$('#results');

	r.assignBrowse(document.getElementById('add-file-btn'));

	browse_assigned=1;

	$('#start-upload-btn').click(function(){
		if (results.children().length > 0) {
			r.upload();
		}
		else{
			alert("no files to upload");
		}
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


		var template = '<div id="' + file.uniqueIdentifier + '">' +
			'<div class="fileBar">' + file.fileName + '&nbsp;&nbsp;&nbsp;&nbsp;<prog>0%</prog>' +
			'<button type="button" class="dismiss" id="button' + file.uniqueIdentifier + '">X</button>'+
			'</div>' +
			'<span class="meter" style="width:0%;"></span>' +
			'<div class="progress" id="prog'+file.uniqueIdentifier+'">' +
			'<div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" style="width: 0%">' +
			'<span class="sr-only"></span>'+
			'</div>'+
			'</div>'+
			'</div>';


		results.append(template);



	});


	$(document).on('click', '.dismiss', function () {
		var self = $(this),
		parent = self.parent().parent(),
		identifier = $(parent).attr('id');
		file=r.getFromUniqueIdentifier(identifier);
		parent.remove();
		r.removeFile(file);
	});

	r.on('fileSuccess', function(file, message){
		var p="upload/merge?filename="+file.uniqueIdentifier+"&chunks_num="+file.chunks.length+"&chunk_size="+chunk_size;
		$('[id="prog'+file.uniqueIdentifier+'"]').remove();
		$('[id="button'+file.uniqueIdentifier+'"]').remove();
		$.ajax({
			type:    "POST",
			url:     p,
			//data:    {"postComment":""},
			success: function(data) {
				stats=data.split(":");
				merge_time=stats[0];
				c_num=stats[1];
				c_size=stats[2];

				var c=document.getElementById(file.uniqueIdentifier );
				c.innerHTML+=" file uploaded <a target='_blank' href='uploads/"+file.uniqueIdentifier+"'> here</a> "+
				"<button onclick=\"prompt('Press Ctrl + C, then Enter to copy to clipboard','"+ window.location.protocol  +
				"//" + window.location.host +
				"/.uploader106/uploads/"+file.uniqueIdentifier+
				"')\">Click to Copy URL</button> </br>"; //<table><tr><td> merge time:"+merge_time+"s </td><td> number of chunks: "+c_num+" </td> <td> chunk size: "+c_size+
				//" </td><td> upload time: "+$("#tst").val()+" </td></tr></table>";


				$('[id="' + file.uniqueIdentifier +'"]').find('prog').html('');


				var table = document.getElementById("resultTable");
    				var row = table.insertRow(table.rows.length);
    				var cell1 = row.insertCell(0);
    				var cell2 = row.insertCell(1);
				var cell3 = row.insertCell(2);
                                var cell4 = row.insertCell(3);
				var cell5 = row.insertCell(4);
                                var cell6 = row.insertCell(5);
				var cell7 = row.insertCell(6);

    				cell1.innerHTML = file.fileName;
    				cell2.innerHTML = file.file.type;
				cell3.innerHTML = file.file.size;
                                cell4.innerHTML = c_num;
				cell5.innerHTML = c_size;
                                cell6.innerHTML = merge_time;
                                cell7.innerHTML = $("#tst").val();
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

		var pr="#prog"+file.uniqueIdentifier;
		$('[id="prog'+file.uniqueIdentifier+'"]').find('.progress-bar').attr('style', "width:"+progress+'%');
		//document.getElementById("prog"+file.uniqueIdentifier).find('.progress-bar').attr('style', "width:"+progress+'%');
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
}
