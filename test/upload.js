const gutil = require('gulp-util');
const awsS3 = require('../index');

describe('upload', () => {
  it('should create fake file', (done) => {
    const stream = awsS3.upload({ key: 'fake' });
    const fakeBuffer = new Buffer('fake');
    const fakeFile = new gutil.File({ contents: fakeBuffer });

    stream.on('end', () => done());
    stream.write(fakeFile);
    stream.end();
  });
});
