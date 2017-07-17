const _ = require('lodash');
const es = require('event-stream');
const AWS = require('aws-sdk');
const mime = require('mime');
const gutil = require('gulp-util');

/**
 * plugin name
 * @type {string}
 */
const PLUGIN_NAME = 'gulp-aws-s3';

const plugin = {
  config: {},

  /**
   * default config values
   */
  defaults: {
    key: process.env.AWS_ACCESS_KEY_ID || null,
    secret: process.env.AWS_SECRET_ACCESS_KEY || null,
    region: process.env.AWS_REGION || null,
    bucket: process.env.AWS_BUCKET || null,
  },

  /**
   * config setup
   * @param config
   * @returns {plugin}
   */
  setup(config) {
    this.config = _.defaults({}, config, this.config, this.defaults);
    return this;
  },

  /**
   * upload sub plugin
   * @returns {*}
   */
  upload(opts = { acl: 'public-read', path: '' }, cfg = {}) {
    const options = opts;
    const config = cfg;

    _.each(this.config, (value, key) => {
      config[key] = config[key] ? config[key] : value;
    });

    if (!config.key) {
      throw new Error('Missing config `key`');
    }
    if (!config.secret) {
      throw new Error('Missing config `secret`');
    }
    if (!config.region) {
      throw new Error('Missing config `region`');
    }
    if (!config.bucket) {
      throw new Error('Missing config `bucket`');
    }

    return es.map((file, callback) => {
      if (!file.isBuffer()) {
        // fix: `Can't upload folders`
        // https://github.com/stanislaw-glogowski/gulp-aws-s3/issues/2
        // return false;
        return;
      }

      const s3 = new AWS.S3({
        accessKeyId: config.key,
        secretAccessKey: config.secret,
        region: config.region,
      });

      if (file.path) {
        options.key = file.path.replace(file.base, options.path || '');
        options.key = options.key.replace(new RegExp('\\\\', 'g'), '/');
      }

      if (!options.key) {
        throw new Error('Missing option `key`');
      }

      const keyParts = options.key.split('.');
      const extension = keyParts.length > 1 ? keyParts[keyParts.length - 1] : null;
      const params = {
        Bucket: config.bucket,
        Key: options.key,
        ACL: options.acl,
        Body: file.contents,
      };

      if (extension) {
        params.ContentType = mime.lookup(file.path);

        _.each(options.params || {}, (value, key) => params[key] = value)

        if (file.stat) {
          params.ContentLength = file.stat.size;
        }
      }

      s3.putObject(params, (err) => {
        const key = `'${gutil.colors.red(params.Key)}`;

        if (err) {
          gutil.log('S3::putObject', key, gutil.colors.red('error!'));
          throw err;
        }

        gutil.log('S3::putObject', key, 'sent.');
        gutil.beep();

        callback(err);
      });

      return null;
    });
  },
};

/**
 * expose
 * @type {*|plugin}
 */
module.exports = plugin;
