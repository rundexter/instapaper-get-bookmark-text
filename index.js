var Instapaper = require('instapaper'),
    _ = require('lodash'),
    qs = require('querystring'),
    util = require('./util.js');

var apiUrl = 'https://www.instapaper.com/api/1.1';

var pickInputs = {
        'bookmark_id': 'bookmark_id'
    };

module.exports = {

    /**
     * Authorize module.
     *
     * @param dexter
     * @returns {*}
     */
    authModule: function (dexter) {
        var auth = {},
            consumerKey = dexter.environment('instapaper_consumer_key'),
            consumerSecret = dexter.environment('instapaper_consumer_secret'),

            username = dexter.environment('instapaper_username'),
            password = dexter.environment('instapaper_password');

        if (consumerKey && consumerSecret && username && password) {
            auth.consumerKey = consumerKey;
            auth.consumerSecret = consumerSecret;
            auth.user = username;
            auth.pass = password;

        } else {
            this.fail('A [instapaper_consumer_key, instapaper_consumer_secret, instapaper_username, instapaper_password] environment need for this module.');
        }

        return _.isEmpty(auth)? false : auth;
    },
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {

        var auth = this.authModule(dexter),
            client = Instapaper(auth.consumerKey, auth.consumerSecret, {apiUrl: apiUrl}),
            inputs = util.pickStringInputs(step, pickInputs);

        client.setUserCredentials(auth.user, auth.pass);

        client.authenticate()
            .bind(this)
            .then(function(oauth) {
                var opts = {body: qs.stringify(inputs)};
                opts.oauth_token        = oauth.token;
                opts.oauth_token_secret = oauth.secret;
                opts.url                = apiUrl + '/bookmarks/get_text';

                return client.POST(opts);
            })
            .spread(function(response, request) {
                this.complete({ html: response });
            }.bind(this)).catch(function(err) {
                this.fail(err);
            }.bind(this));
    }
};
