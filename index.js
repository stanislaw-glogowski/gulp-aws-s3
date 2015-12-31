var _     = require('lodash'),
    es    = require('event-stream'),
    AWS   = require('aws-sdk'),
    mime  = require('mime'),
    gutil = require('gulp-util');

/**
 * plugin name
 * @type {string}
 */
const PLUGIN_NAME = 'gulp-aws-s3';

var plugin = {
    config : {},

    /**
     * default config values
     */
    defaults : {
        key    : process.env.AWS_ACCESS_KEY_ID || null,
        secret : process.env.AWS_SECRET_ACCESS_KEY || null,
        region : process.env.AWS_REGION || null,
        bucket : process.env.AWS_BUCKET || null
    },

    /**
     * config setup
     * @param config
     * @returns {plugin}
     */
    setup : function(config) {
        this.config = _.defaults({}, config, this.config, this.defaults);
        return this;
    },

    /**
     * upload sub plugin
     * @returns {*}
     */
    upload : function() {
        var options = arguments[0] || {},
            config = arguments[1] || {};

        _.each(this.config, function(value, key) {
            config[key] = config[key] ? config[key] : value;
        });

        _.defaults(options, {
            acl  : 'public-read',
            path : ''
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

        return es.map(function(file, callback) {
            if (!file.isBuffer()) {
                return false;
            }

            var s3 = new AWS.S3({
                accessKeyId     : config.key,
                secretAccessKey : config.secret,
                region          : config.region
            });

            if (!options.key && file.path) {
                options.key = file.path.replace(file.base, options.path || '');
                options.key = options.key.replace(new RegExp('\\\\', 'g'), '/');
            }

            if (!options.key) {
                throw new Error('Missing option `key`');
            }

            var keyParts = options.key.split('.'),
                extension = keyParts.length > 1 ? keyParts[keyParts.length - 1] : null,
                params = {
                    Bucket : config.bucket,
                    Key    : options.key,
                    ACL    : options.acl,
                    Body   : file.contents
                };

            if (extension) {
                params['ContentType'] = mime.lookup(file.path);

                _.each(options.params || {}, function(value, key) {
                    params[key] = value;

                })

                if (file.stat) {
                    params['ContentLength'] = file.stat.size;
                }
            }

            s3.putObject(params, function(err) {
                if (err) {
                    gutil.log('S3::putObject', "'" + gutil.colors.red(options.key) + "'", gutil.colors.red('error!'));
                    throw err;
                } else {
                    gutil.log('S3::putObject', "'" + gutil.colors.cyan(options.key) + "'", 'send');
                    gutil.beep();
                }
                callback(err);
            });
        });
    }
};

/**
 * expose
 * @type {*|plugin}
 */
module.exports = plugin;
