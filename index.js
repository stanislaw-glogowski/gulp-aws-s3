var _   = require('underscore'),
    es  = require('event-stream'),
    AWS = require('aws-sdk');

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
        key    : process.env.AWS_ACCESS_KEY_ID     || null,
        secret : process.env.AWS_SECRET_ACCESS_KEY || null,
        region : process.env.AWS_REGION            || null,
        bucket : process.env.AWS_BUCKET            || null
    },

    /**
     * config setup
     * @returns {plugin}
     */
    setup : function() {
        var config = arguments[0] || {};
        _.each(this.defaults, function(value, key) {
            config[key] = config[key] ? config[key] : value;
        });
        this.config = config;
        return this;
    },

    /**
     * upload sub plugin
     * @returns {*}
     */
    upload : function() {
        var options = arguments[0] || {},
            config  = arguments[1] || {};

        _.each(this.config, function(value, key) {
            config[key] = config[key] ? config[key] : value;
        });

        _.defaults(options, {
            acl  : 'public-read',
            path : '/'
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

            if (file.path) {
                options.key = file.path.replace(file.base, options.path || '');
                options.key = options.key.replace(new RegExp('\\\\', 'g'), '/');
            }

            if (!options.key) {
                throw new Error('Missing option `key`');
            }

            var params = {
                Bucket : config.bucket,
                Key    : options.key,
                ACL    : options.acl,
                Body   : file.contents
            };

            s3.putObject(params, function(err) {
                callback(err);
            });
        });
    }
};

/**
 * expose
 * @type {*|plugin}
 */
module.exports = plugin.setup();