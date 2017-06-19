# AWS S3 plugin for Gulp

## Installation
```bash
$ npm install gulp-aws-s3
```

## Configuration

### Using environment variables
```bash
export AWS_ACCESS_KEY_ID="<value>"
export AWS_SECRET_ACCESS_KEY="<value>"
export AWS_REGION="<value>"
export AWS_BUCKET="<value>"
```

### Using plugin `setup()` method
```javascript
var gulpAwsS3 = require('gulp-aws-s3').setup({
    key    : '<value>',
    secret : '<value>',
    region : '<value>',
    bucket : '<value>'
});
```

### During method execution
```javascript
...
    .pipe(gulpAwsS3.upload({<options>}, {
        key    : '<value>',
        secret : '<value>',
        region : '<value>',
        bucket : '<value>'
    });
...
```

## Api

### gulpAwsS3#upload(options:Object, config:Object)

Upload file to s3

The following options are supported:

* `acl` the canned ACL to apply to the object, defaults to `public-read`.
* `path` s3 base path, defaults to `/`.

Possible values of `acl` include: `private`, `public-read`, `public-read-write`, `authenticated-read`, `bucket-owner-read`, `bucket-owner-full-control`.

## Test
```bash
export AWS_ACCESS_KEY_ID="<value>"
export AWS_SECRET_ACCESS_KEY="<value>"
export AWS_REGION="<value>"
export AWS_BUCKET="<value>"

$ npm test
```

## License

The MIT License
