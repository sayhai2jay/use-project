const _ = require('lodash');
const favicons = require('favicons');
const async = require('async');
const fs = require('fs-extra');

module.exports = {
  improve: 'apostrophe-global',

  construct: function (self, options) {

    let destinationDir = options.destinationDir || '/favicons/';
    let tempDir = self.apos.modules['apostrophe-attachments'].uploadfs.getTempPath() + '/tempAposFavicons';
    let faviconFields = [
      {
        name: 'aposFavicon',
        label: 'Favicon Image',
        type: 'singleton',
        widgetType: 'apostrophe-images',
        options: {
          aspectRatio: [ 1, 1 ],
          minSize: [ 12, 12 ],
          limit: [ 1 ]
        }
      },
      {
        name: 'aposFaviconLinks',
        label: 'Favicon Link Tags',
        type: 'string',
        contextual: true,
      }
    ];

    var config = _.merge((options.faviconConfig || {}), {
      appName: null,
      appDescription: null,
      developerName: null,
      developerURL: null,
      dir: "auto",
      lang: "en-US",
      background: "#fff",
      theme_color: "#fff",
      display: "standalone",
      orientation: "any",
      start_url: "/?homescreen=1",
      version: "1.0",
      logging: false,
      icons: {
        android: true,
        appleIcon: true,
        appleStartup: true,
        coast: true,
        favicons: true,
        firefox: true,
        windows: true,
        yandex: true
      }
    });

    options.addFields = (options.addFields || []).concat(faviconFields);
    options.arrangeFields = (options.arrangeFields || []).concat([{
      name: 'aposFaviconTab',
      label: 'Favicon',
      fields: ['aposFavicon', 'aposFaviconLinks']
    }]);

    self.pushAsset('script', 'user', { when: 'user' });

    // Before save, make a note of our favicon field so that we can see if it changed later
    const superConvert = self.convert;
    self.convert = function (req, piece, callback) {
      if (piece.aposFavicon && piece.aposFavicon.items.length) {
        piece._originalFaviconRelationship = piece.aposFavicon.items[0].relationships
      }
      return superConvert(req, piece, callback);
    };

    // Check on changes made to the favicon widget in afterSave
    const superAfterSave = self.afterSave;
    self.afterSave = function (req, piece, options, callback) {
      
      // This intentionally returns control to the browser while the module crunches on a potentially
      // long resizing process. We will monitor the progress on the front-end by hitting a status route
      
      superAfterSave(req, piece, options, callback);

      // Exec the real work as a child process because otherwise
      // the synchronous code in the `favicon` module pins the
      // entire application for the entire runtime, blocking web requests

      const args = [ 'apostrophe-global:build-favicons', '--notify-user-id=' + req.user._id ];
      if (self.apos.modules['apostrophe-workflow']) {
        args.push('--workflow-locale=' + req.locale);
      }
      require('child_process').fork(self.apos.root.filename, args);

    };

    self.addTask('build-favicons', `
Rebuild the favicon and similar files based on the current selection
in the global preferences. Returns immediately if the selection has
not changed or has not been made. Normally called for you when
the global preferences are saved.`,
      function(apos, argv, callback) {

      const images = self.apos.modules['apostrophe-images'];
      const attachments = self.apos.modules['apostrophe-attachments'];
      let compare;
      let filesToWrite;
      let piece;
      const req = self.apos.tasks.getReq();

      return async.series([
        findGlobal,
        body
      ], callback);

      function findGlobal(callback) {
        return self.findGlobal(req, function(err, _piece) {
          if (err) {
            return callback(err);
          }
          piece = _piece;
          return callback(null);
        });
      }

      function body(callback) {

        if (piece.aposFavicon && piece.aposFavicon.items.length) {
          compare = piece.aposFavicon.items[0].relationships;
        }

        if (piece.aposFavicon.items.length !== 0 && ((piece._originalFaviconRelationship && JSON.stringify(piece._originalFaviconRelationship) !== JSON.stringify(compare) && piece.aposFavicon.items[0] !== undefined) || piece._originalFaviconRelationship === undefined)) {

          apos.notify(argv['notify-user-id'], 'Processing favicon files...');

          // Set in motion the actual work of creating the favicons
          return async.waterfall([
            cleanup,
            getImage,
            generateFavicons,
            copyToUploadfs,
            saveLinks,
            function(result, callback) {
              return cleanup(callback);
            }
          ], function(err) {
            if (err) {
              apos.notify(argv['notify-user-id'], 'An error occurred processing the favicon files.', callback);
            } else {
              apos.notify(argv['notify-user-id'], 'Favicon processing complete.', callback);
            }
          });

        } else {
          // If we made it here there was no change to our target field, carry on
          return callback(null);
        }

        ////////////
        // Things needed for generating the favicons
        ////////////

        // Removes the temp directories and files this module write to fs
        // It's also run before operation to clear any prior temp stuff still hanging out
        function cleanup(callback) {
          return async.series([
            _.partial(fs.access, tempDir, fs.constants.W_OK),
            _.partial(fs.remove, tempDir)
          ], function(err) {
            // nonfatal, we may not have made them
            return callback(null);
          });
        };

        // Retrieve the file path to the favicon image
        function getImage(callback) {
          return images.find(req, {
            '_id': piece.aposFavicon.items[0].pieceIds[0]
          }).toObject(function (err, image) {
            if (err) {
              return callback(err);
            }
            // Use the existing resized image closest to 512 pixels
            // wide and tall, without being smaller, as the source image.
            // This addresses a major performance problem encountered
            // otherwise with the favicon module as it resizes the original
            // naively over and over for every conversion it performs
            const sizes = (self.apos.attachments.uploadfs.options.imageSizes || []);
            let size;
            sizes.forEach((s) => {
              if ((s.width > 512) && (s.height > 512)) {
                if ((!size) || (size.width * size.height > s.width * s.height)) {
                  size = s;
                }
              }
            });
            const sizeExtension = size ? (size.name + '.') : '';
            let originalPath = '/attachments/' + image.attachment._id + '-' + image.attachment.name + '.' + sizeExtension + image.attachment.extension;
            let tempPath = attachments.uploadfs.getTempPath() + '/' + self.apos.utils.generateId() + '.' + image.attachment.extension;

            return attachments.uploadfs.copyOut(originalPath, tempPath, function(err) {
              if (err) {
                return callback(err);
              }
              return callback(null, tempPath);
            });

          });
        };

        // Generate the individual favicon files
        // Temporarily write them to disk while we get ready to pass them to uploadfs
        function generateFavicons(path, callback) {
          config.path = attachments.uploadfs.getUrl() + destinationDir;
          return favicons(path, config, function (err, response) {
            if (err) {
              return callback(err);
            }

            fs.mkdirSync(tempDir);
            filesToWrite = response.images.concat(response.files);
            return async.each(filesToWrite, function (file, callback) {

              fs.writeFile(tempDir + '/' + file.name, file.contents, function (err) {
                if (err) {
                  return console.log(err);
                }
                return callback();
              });
            }, function (err) {
              fs.unlink(path, function () {});
              if (err) {
                return callback(err);
              }
              return callback(null, response);
            });
          });
        };

        // Hand each file to uploadfs
        function copyToUploadfs(response, callback) {
          return async.each(filesToWrite, function (file, callback) {
            return attachments.uploadfs.copyIn(tempDir + '/' + file.name, destinationDir + file.name, callback);
          }, function (err) {
            if (err) {
              return callback(err);
            }
            return callback(null, response);
          });
        };

        // Save the generated tag markup to the global doc
        function saveLinks(response, callback) {
          piece.aposFaviconLinks = response.html.join('');
          return self.apos.docs.db.update({ _id: piece._id }, { $set: { aposFaviconLinks: response.html.join('') } }, callback);
        }
      }
    });
  }
};