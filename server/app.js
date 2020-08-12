const express = require("express");
const { spawn } = require("child_process");
const shell = require('shelljs');
var sudo = require('sudo-prompt');
var path = require('path');
var file_system = require('fs');
var archiver = require('archiver');
var generated = false;

const app = express();
app.use("/css",express.static("./src/css"));
app.use("/js",express.static("./src/js"));
app.use("/images",express.static("./src/images"));
app.use("/fonts",express.static("./src/fonts"));
app.use("/scss",express.static("./src/scss"));
const port = 3000;
const checkTime = 1000;
var ls = null;

app.get("/", (req, res) => {
    res.sendFile('index.html',{ root: "./src" });
});
app.get('/generate/:tagId', function(req, res) {
    ls = spawn(`acme.sh`,['--issue' , '--debug','-d', `${req.params.tagId}`,'--dns','--yes-I-know-dns-manual-mode-enough-go-ahead-please']);
    ls.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
      res.write(`${data}`);
      console.log("true");
    });
  
    ls.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    
    ls.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    
    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
        res.end();
    });
});

app.get('/confirm/:tagId',function(req,res)
{
    var generated = false
    ls = spawn(`acme.sh`,['--renew' , '--debug','-d', `${req.params.tagId}`,'--yes-I-know-dns-manual-mode-enough-go-ahead-please']);
    ls.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
        if (`${data}`.toLowerCase().includes("success"))
        {
            generated = true
        }
        //res.write(`${data}`);
        console.log("true");
    });

    ls.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    
    ls.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    
    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
        if (generated == true){
            var output = file_system.createWriteStream(__dirname.split('/server')[0]+`/zips/${req.params.tagId}.zip`);
            var archive = archiver('zip');

            output.on('close', function () {
                console.log(archive.pointer() + ' total bytes');
                console.log('archiver has been finalized and the output file descriptor has closed.');
                res.download(__dirname.split('/server')[0]+`/zips/${req.params.tagId}.zip`);
            });

            archive.on('error', function(err){
                throw err;
            });

            archive.pipe(output);

            // append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
            archive.directory(`/Users/arnavchawla/.acme.sh/${req.params.tagId}`, false);
            archive.finalize();
        }
        
    });
});

app.get('/download/:tagId', function(req,res){
  console.log(__dirname.split('/server')[0]+`/zips/${req.params.tagId}.zip`)
  res.sendFile(__dirname.split('/server')[0]+`/zips/${req.params.tagId}.zip`);
  
});
app.listen(port, function() {
    console.log(`Server listening on port ${port}`);
});
