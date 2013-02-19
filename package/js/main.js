// code adapted from HTML5 Rocks article by Eric Bidelman
// http://www.html5rocks.com/en/tutorials/file/filesystem/

// request a FileSystem
// create a file
// write to the file
// read from the file

var fileSystem; // not in the real world...

console.log("chrome.syncFileSystem: ", chrome.syncFileSystem);

chrome.syncFileSystem.onFileStatusChanged.addListener(function(fileInfo){
  log("File status changed: " + fileInfo.status);
  console.log("File Info: ", fileInfo);
});

chrome.syncFileSystem.requestFileSystem(function (fileSystem) {
  window.fileSystem = fileSystem;

  log("Got file system: " + fileSystem);
  chrome.syncFileSystem.getUsageAndQuota(fileSystem, function(storageInfo){
    console.log("Storage Info: ", storageInfo);
    log("storageInfo.usageBytes: " + storageInfo.usageBytes);
    log("storageInfo.quotaBytes: " + storageInfo.quotaBytes);
  });

  createFile("foo.txt");
});

function createFile(fullPath){
  fileSystem.root.getFile(fullPath, {create: true},
    function(fileEntry) {
      log("Created file: " + fileEntry.fullPath);
      console.log(fileEntry);
      console.log(fileSystem);
      logFileEntryStatus(fileEntry);
      writeToFile(fileEntry, "Hello chrome.syncFileSystem!");
  }, handleError);
}

function writeToFile(fileEntry, text){
  // Create a FileWriter object for fileEntry
  fileEntry.createWriter(function(fileWriter) {
    console.log(fileWriter);
    fileWriter.onwriteend = function(e) {
      // read from file
      log('Wrote text <em>' + text + '</em> to file ' + fileEntry.fullPath);
      readFromFile(fileEntry.fullPath);
    };
    fileWriter.onerror = function(e) {
      log('Write failed: ' + e.toString());
    };
    // Create a new Blob and write it to file
    var blob = new Blob([text], {type: "text/plain"}); // WebKitBlobBuilder deprecated
    fileWriter.write(blob);
    logFileEntryStatus(fileEntry);
  }, handleError);
}

function readFromFile(fullPath){
  fileSystem.root.getFile(fullPath, {}, function(fileEntry) {
    // Get a File object representing the file, then use FileReader to read its contents.
    fileEntry.file(function(file) {
       var reader = new FileReader();
       reader.onloadend = function(e) {
         log("Read text <em>" + this.result + "</em> from file " + fullPath);
       };
       reader.readAsText(file);
    }, handleError);

  }, handleError);
}

function handleError(e) {
  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      log('QUOTA_EXCEEDED_ERR');
      break;
    case FileError.NOT_FOUND_ERR:
      log('NOT_FOUND_ERR');
      break;
    case FileError.SECURITY_ERR:
      log('SECURITY_ERR');
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      log('INVALID_MODIFICATION_ERR');
      break;
    case FileError.INVALID_STATE_ERR:
      log('INVALID_STATE_ERR');
      break;
    default:
      log('Unknown error');
      break;
  };
}

var data = document.getElementById("data");
function log(text){
  data.innerHTML += text + "<br />";
}

function logFileEntryStatus(fileEntry){
  chrome.syncFileSystem.getFileStatus(fileEntry, function (status) {
    console.log(status);
    log("File Entry status: " + status);
  });
}
