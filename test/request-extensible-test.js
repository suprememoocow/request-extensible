/**
 * These tests are need some serious work. This is just an initial effort, but mocking should
 * at least be used.
 */
var requestExt = require('..');
var assert = require('assert');

describe('request-extensible', function() {

  describe('no extensions', function() {
    var request;

    before(function() {
      request = requestExt();
    });

    describe('it should obtain json', function() {
      var err, response, body;

      before(function(done) {
        request({ url: 'https://api.github.com', json:true, headers: { 'User-Agent' : 'request-extensible' } }, function(_err, _response, _body) {
          err = _err;
          response = _response;
          body = _body;
          done();
        });

      });

      it('should not error', function() {
        assert(!err);
      });

      it('should return a response', function() {
        assert(response);
        assert(Object.keys(response).length > 5);
      });

      it('should return a body', function() {
        assert(body);
        assert(Object.keys(body).length > 5);
      });

    });

    describe('it should error', function() {
      var err, response, body;

      before(function(done) {
        request({ url: 'https://does_not_exist.does_not_exist', json:true, headers: { 'User-Agent' : 'request-extensible' } }, function(_err, _response, _body) {
          err = _err;
          response = _response;
          body = _body;
          done();
        });

      });

      it('should error', function() {
        assert(err);
      });

      it('should not return a response', function() {
        assert(!response);
      });

      it('should not return a body', function() {
        assert(!body);
      });

    });

  });

  describe('downstream extensions', function() {
    var request;

    before(function() {
      request = requestExt({
        extensions: [
          function(options, callback, next) {
            options.json = true;
            if (!options.headers) options.headers = {};
            options.headers['User-Agent'] = 'request-extensible';
            return next(options, callback);
          }
        ]
      });
    });

    describe('it should obtain json', function() {
      var err, response, body;

      before('', function(done) {
        request({ url: 'https://api.github.com' }, function(_err, _response, _body) {
          err = _err;
          response = _response;
          body = _body;
          done();
        });

      });

      it('should not error', function() {
        assert(!err);
      });

      it('should return a response', function() {
        assert(response);
        assert(Object.keys(response).length > 5);
      });

      it('should return a body', function() {
        assert(body);
        assert(Object.keys(body).length > 5);
      });

    });

    describe('it should error', function() {
      var err, response, body;

      before(function(done) {
        request({ url: 'https://does_not_exist.does_not_exist', json:true, headers: { 'User-Agent' : 'request-extensible' } }, function(_err, _response, _body) {
          err = _err;
          response = _response;
          body = _body;
          done();
        });

      });

      it('should error', function() {
        assert(err);
      });

      it('should not return a response', function() {
        assert(!response);
      });

      it('should not return a body', function() {
        assert(!body);
      });

    });

  });


  describe('upstream extensions', function() {
    var request;

    before(function() {
      request = requestExt({
        extensions: [
          function(options, callback, next) {
            return next(options, function(err, response, body) {
              if (err) {
                return callback(null, null, { hello: true });
              }

              return callback(err, response, body);
            });

          }
        ]
      });
    });

    describe('it should obtain json', function() {
      var err, response, body;

      before('', function(done) {
        request({ url: 'https://api.github.com', json:true, headers: { 'User-Agent' : 'request-extensible' } }, function(_err, _response, _body) {
          err = _err;
          response = _response;
          body = _body;
          done();
        });

      });

      it('should not error', function() {
        assert(!err);
      });

      it('should return a response', function() {
        assert(response);
        assert(Object.keys(response).length > 5);
      });

      it('should return a body', function() {
        assert(body);
        assert(Object.keys(body).length > 5);
      });

    });

    describe('it should not error', function() {
      var err, response, body;

      before(function(done) {
        request({ url: 'https://does_not_exist.does_not_exist', json:true, headers: { 'User-Agent' : 'request-extensible' } }, function(_err, _response, _body) {
          err = _err;
          response = _response;
          body = _body;
          done();
        });

      });

      it('should error', function() {
        assert(!err);
      });

      it('should not return a response', function() {
        assert(!response);
      });

      it('should not return a body', function() {
        assert(body);
        assert.strictEqual(body.hello, true);
      });

    });

  });
});
