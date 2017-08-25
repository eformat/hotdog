var express = require('express');
var app = express();
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var exec = require('child_process').exec;
var hotdog = process.env.HOT_DOG || true;
var model_server = process.env.MODEL_SERVER || '192.168.137.2:32195';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){
  //var ret = "<table><tr><th>Guess</th><th>Score</th></th></tr>";

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
    // 'docker exec tflow bazel-bin/tensorflow_serving/example/inception_client --server=192.168.137.2:30562 --image=/tmp/' + file.name
    //exec('docker exec tflow bazel-bin/tensorflow_serving/example/inception_client --server=192.168.137.2:32195 --image=/tmp/' + file.name,
    exec('/serving/bazel-bin/tensorflow_serving/example/inception_client --server=' + model_server + ' --image=/opt/uploads/' + file.name,
        function (error, stdout, stderr) {
          var string_regex = /string_val: ([\S ]+)/g;
          var float_regex = /float_val: ([0-9\.]+)/g;
          var string_result = stdout.match(string_regex);
          var float_result = stdout.match(float_regex);
          var i=0;
          var ret = '';

//          console.log(process.env)
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          
          string_result.forEach(function(name){           
            var sname = name.substring(13).slice(0,-1);
            if (i == 0) {
              if (hotdog === true) {
                if (sname.indexOf('hotdog') > -1) {
                  ret += "<span><img src='images/hotdog.jpg' height='120' width='340'></span>"
                } else {
                  ret += "<span><img src='images/nothotdog.jpg' height='120' width='340'></span>"
                }
              }
              ret += "<table><tr><th>Guess</th><th>Score</th></th></tr>";
            }        

            var value = float_result[i].substring(11);
            console.log(sname + " : " + value);
            ret += "<tr><td align='left'>" + sname + "</td>" + "<td>" + value + "</td></tr>"
            i++;
          });
          //console.log('stdout: ' + stdout);
          //console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
          }
          ret += '</table>';
          ret += '<img height="200" width="200" src="/' + file.name +'">'
          res.end(ret);
        });
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  //form.on('end', function() {
  //  res.end('success');
  //});

  // parse the incoming request containing the form data
  form.parse(req);

});

var server = app.listen(8080, function(){
  console.log('Server listening on port 8080');
});
