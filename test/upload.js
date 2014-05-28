var assert      = require('assert'),
    es          = require('event-stream'),
    gutil       = require('gulp-util'),
    awsS3       = require('../index');

describe('upload', function() {

    it('should create fake file', function(done) {
        var stream     = awsS3.upload({ key : 'fake' }),
            fakeBuffer = new Buffer('fake'),
            fakeFile   = new gutil.File({ contents: fakeBuffer });

        stream.on('end', function() {
            done();
        });

        stream.write(fakeFile);
        stream.end();
    });
});