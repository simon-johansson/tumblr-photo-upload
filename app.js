var fs = require('fs-extra'),
    async = require('async'),
    Tumblr = require('tumblrwks'),
    secrets = require('secrets');

/*
  For accessToken and accessSecret, user need to grant access of your app. I recommend to use: https://github.com/jaredhanson/passport-tumblr
*/
var tumblr = new Tumblr(secrets.keys, secrets.blog);

function getExtension(filename) {
    var i = filename.lastIndexOf('.');
    return (i < 0) ? '' : filename.substr(i);
}

var walk = function(dir, done) {
  var results = [];
  fs.readdir(dir, function(err, list) {
    if (err) return done(err);
    var pending = list.length;
    if (!pending) return done(null, results);
    list.forEach(function(file) {
      file = dir + '/' + file;
      fs.stat(file, function(err, stat) {
        if (stat && stat.isDirectory()) {
          walk(file, function(err, res) {
            results = results.concat(res);
            if (!--pending) done(null, results);
          });
        } else {
          if(getExtension(file) === '.DS_Store'){
            // Nope
          } else {
            // console.log(getExtension(file));
            results.push(file);
          }
          if (!--pending) done(null, results);
        }
      });
    });
  });
};

function readUploadDeleteImage (imagePath, clb) {
  fs.readFile(imagePath, function(err, data) {
    if (err) clb(err, null);
    tumblr.post('/post', {type: 'photo', data: [data]}, function(err, json){
      if (err) clb(err, null);
      else{
        console.log("Success! Uploaded", imagePath);

				fs.move(imagePath, '/tmp/uploaded/' + imagePath.split('/').pop(), function(err) {
					if (err) clb(err, null);
					else {
					  console.log('Successfully moved', imagePath.split('/').pop());
					  clb(null, imagePath);
					}
				});
      }
    });
  });
}

// console.log(__dirname);

walk("/Users/simon/Downloads/save/test", function(err, filePaths) {
  console.log('Number of files:', filePaths.length);
  console.log(filePaths);
  async.map(filePaths, readUploadDeleteImage, function(err, results){
    if (err) console.log(err);
    var string = results.length + '/' + filePaths.length + ' files uploaded and deleted';
    console.log(string);
  });
});


// walk("/tmp/images", function(err, results) {
//   if (err) throw err;
//   results.forEach(function(el) {
//     // var photo = fs.readFileSync(el);
//     fs.readFile(el, function (err, data) {
//       if (err) throw err;
//       tumblr.post('/post', {type: 'photo', data: [data]}, function(err, json){
//         if (err){
//           console.log(err);
//         } else {
//           console.log("Success! Uploaded", el);
//           fs.unlink(el, function (err) {
//             if (err){
//               console.log(err);
//             } else {
//               console.log('Successfully deleted', el);
//             }
//           });
//         }
//       });
//     });
//   });
// });

// TODO
// Kunna ladda upp bilder från vilken mapp som helst
