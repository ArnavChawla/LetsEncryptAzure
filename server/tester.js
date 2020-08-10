var file_system = require('fs');
var archiver = require('archiver');

var output = file_system.createWriteStream(__dirname.split('/server')[0]+'/zips/target.zip');
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
archive.directory("/etc/letsencrypt/archive/justadev.me/", false);
archive.finalize();
