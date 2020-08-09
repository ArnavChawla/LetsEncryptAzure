const express = require("express");
const { spawn } = require("child_process");
const shell = require('shelljs');
var sudo = require('sudo-prompt');
var path = require('path');
var fs = require('fs');
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
function check() {
   setTimeout(() => {
       fs.readFile('/Users/arnavchawla/Desktop/dns-info.txt', 'utf8', function(err, data) {
          if (err) {
              // got error reading the file, call check() again
              check();
          } else {
              // we have the file contents here, so do something with it
              // can delete the source file too
          }
       });
   }, checkTime)
}

check();
app.get("/", (req, res) => {
    res.sendFile('index.html',{ root: "./src" });
});
app.get('/generate/:tagId', function(req, res) {
    var options = {
        name: 'Electron'
      };
    ls = spawn(`certbot`,['certonly',`-d ${req.params.tagId}`,'--manual','--manual-public-ip-logging-ok','--preferred-challenges=http']);
    ls.stdout.on("data", data => {
      console.log(`stdout: ${data}`);
      if (data.includes("Press Enter to Continue")){
       // res.send(`${data}`);
        console.log("true");
      }
      else if(data.includes("Congratulations")){
        const temp = `${data}`;
        var test = "";
        console.log(temp);
        test += temp.split("at:")[1].split(" Y")[0].trim()
        test += temp.split("at:")[2].split(" Y")[0].trim()
      //  res.send(`${test}`);
        var output = fs.createWriteStream(`./${req.params.tagId}.zip`);
        var archive = archiver('zip', {
            gzip: true,
            zlib: { level: 9 } 
        });
        
        archive.on('error', function(err) {
          throw err;
        });
        
        archive.pipe(output);
        
        // append files
        archive.file(`${temp.split("at:")[1].split(" Y")[0].trim()}`, {name:'first.pem'});
        archive.file(`${temp.split("at:")[2].split(" Y")[0].trim()}`, {name:'second.pem'});
        archive.finalize();
        const file = `./${req.params.tagId}.zip`;
        res.download(file);
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
    })
    
});
app.get('/confirm',function(req,res)
{
    ls.stdin.write('\n');
    ls.stdout.on("data", data => {
        const temp = `${data}`;
        var test = "";
        console.log(temp);
        test += temp.split("at:")[1].split(" Y")[0]
        test += temp.split("at:")[2].split(" Y")[0]
        res.send(`${data}`);
      });
    
    ls.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });
    
    ls.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });
    
    ls.on("close", code => {
        console.log(`child process exited with code ${code}`);
    })
});
app.listen(port, function() {
    console.log(`Server listening on port ${port}`);
});