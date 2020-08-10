const express = require("express");
const { spawn } = require("child_process");
const shell = require('shelljs');
var sudo = require('sudo-prompt');
var path = require('path');
var file_system = require('fs');
var archiver = require('archiver');


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
    var options = {
        name: 'Electron'
      };
    ls = spawn(`certbot`,['certonly',`-d ${req.params.tagId}`,'--manual','--manual-public-ip-logging-ok','--preferred-challenges=dns']);
    ls.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
      if (data.includes("Press Enter to Continue")){
        res.send(`${data}`);
        console.log("true");
      }
      else if(data.includes("Congratulations")){
        const temp = `${data}`;
        var test = "";
        console.log(temp);
        test += temp.split("at:")[1].split(" Y")[0].trim()
        test += temp.split("at:")[2].split(" Y")[0].trim()
      //  res.send(`${test}`); 
      var output = file_system.createWriteStream(`/zips/${req.params.tagId}.zip`);
      var archive = archiver('zip');
      
      output.on('close', function () {
          console.log(archive.pointer() + ' total bytes');
          console.log('archiver has been finalized and the output file descriptor has closed.');
      });
      
      archive.on('error', function(err){
          throw err;
      });
      
      archive.pipe(output);
      
      // append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
      archive.directory(`/etc/letsencrypt/archive/${req.params.tagId}/`, false);
      archive.finalize();
      res.download(`./zips/${req.params.tagId}.zip`)
    }
    });
  
    ls.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    
    ls.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    
    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
    });
    
});
app.get('/confirm/:tagId',function(req,res)
{
    ls.stdin.write('\n');
    ls.stdout.on("data", data => {
    console.log(`stdout: ${data}`);
    if (data.includes("Press Enter to Continue")){
      res.send(`${data}`);
      console.log("true");
    }
    else if(data.includes("Congratulations")){
      const temp = `${data}`;
      var test = "";
      console.log(temp);
      test += temp.split("at:")[1].split(" Y")[0].trim()
      test += temp.split("at:")[2].split(" Y")[0].trim()
    //  res.send(`${test}`); 
    var output = file_system.createWriteStream(`/zips/${req.params.tagId}.zip`);
    var archive = archiver('zip');
    
    output.on('close', function () {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
    });
    
    archive.on('error', function(err){
        throw err;
    });
    
    archive.pipe(output);
    
    // append files from a sub-directory and naming it `new-subdir` within the archive (see docs for more options):
    archive.directory(`/etc/letsencrypt/archive/${req.params.tagId}/`, false);
    archive.finalize();
    res.download(`./zips/${req.params.tagId}.zip`)
  }
  });

  ls.stderr.on("data", data => {
      console.log(`stderr: ${data}`);
  });
  
  ls.on('error', (error) => {
      console.log(`error: ${error.message}`);
  });
  
  ls.on("close", code => {
      console.log(`child process exited with code ${code}`);
  });
});
app.listen(port, function() {
    console.log(`Server listening on port ${port}`);
});