'use strict';

var chai      = require('chai');
var expect    = chai.expect;
var sinon     = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);

// test files
var base      = require('./base-test.json');
var locale    = require('./locale-test.json');
var client    = require('./client-test.json');

var builder   = require('../lib/builder');
var parser    = require('../lib/parser');

var dictionary;

describe('parser', function () {

  before(function () {
    dictionary = builder.build([base, locale, client]);
  });

  describe('traverse()', function () {
    it('should traverse complex properties with custom routing', function () {
      expect(parser.traverse(dictionary, 'routed', [2]))
      .to
      .equal('this is a plural(%d) statement');
    });

    it('should traverse nested complex properties with custom routing', function () {
      expect(parser.traverse(dictionary, 'routed', [1]))
      .to
      .equal('this is a nested singular(%d) statement');
    });

    it('should throw an error when nested properties are undefined', function () {
      expect(parser.traverse.bind(null, dictionary, 'bad.nested.path'))
      .to
      .throw('`bad` does not exist in this path context');
    });
  });

  describe('parse()', function () {

    it('should return a result', function () {
      expect(parser.parse(dictionary, 'test'))
      .to
      .equal('test');
    });

    it('should return a result when passed args', function () {
      expect(parser.parse(dictionary, dictionary.printfStringTest, ['parse test']))
      .to
      .equal('This is a parse test');
    });

    it('should parse nested properties and return a string', function () {
      expect(parser.parse(dictionary, dictionary.nestedMustacheTest))
      .to
      .equal('this is a nested mustache test');
    });

    it('should throw an error when missing args', function () {
      expect(parser.parse.bind(null, dictionary, dictionary.printfMixedTest))
      .to
      .throw('Missing parameters for string `%d %s, %d %s`');
    });
  });

  describe('printf()', function () {
    it('should accept optional parameters', function () {
      expect(parser.printf(dictionary.printfStringTest, ['test']))
      .to
      .equal('This is a test');
    });

    it('should accept more than 1 argument', function () {
      expect(parser.printf(dictionary.printfMixedTest, [1, 'fish', 2, 'fish']))
      .to
      .equal('1 fish, 2 fish');
    });

    it('should handle string params', function () {
      expect(parser.printf(dictionary.printfStringTest, ['test']))
      .to
      .equal('This is a test');
    });

    it('should handle number params', function () {
      expect(parser.printf(dictionary.printfNumberTest, [2]))
      .to
      .equal('1 + 1 = 2');
    });

    it('should handle mixed params', function () {
      expect(parser.printf(dictionary.printfMixedTest, [1, 'fish', 2, 'fish']))
      .to
      .equal('1 fish, 2 fish');
    });

    it('should handle params in nested properties', function () {
      expect(parser.printf(dictionary.nested.printfTest, ['test']))
      .to
      .equal('this is a nested printf test');
    });

    it('should ignore any extra args and NOT throw an error', function () {
      expect(parser.printf.bind(null, dictionary.test, [1, 'fish']))
      .to
      .not
      .throw(ReferenceError);
    });

    it('should throw an error when passing not enough args', function () {
      expect(parser.printf.bind(null, dictionary.printfMixedTest, [1, 'fish']))
      .to
      .throw('Mismatched number of parameters passed to: "%d %s, %d %s"');
    });

    it('should throw an error if passed anything other than string or number', function () {
      expect(parser.printf.bind(null, dictionary.printfStringTest, [{}]))
      .to
      .throw('Invalid args were passed to: "This is a %s"');
    });

    it('should throw an error if passed a number but expected a string', function () {
      expect(parser.printf.bind(null, dictionary.printfStringTest, [1]))
      .to
      .throw('Mismatched parameter types passed to: "This is a %s"');
    });

    it('should throw an error if passed a string but expected a number', function () {
      expect(parser.printf.bind(null, dictionary.printfNumberTest, ['one']))
      .to
      .throw('Mismatched parameter types passed to: "1 + 1 = %d"');
    });
  });

  describe('mustache()', function () {
    it('should use a sibling prop to build the string', function () {
      expect(parser.mustache(dictionary, dictionary.mustacheTest))
      .to
      .equal('This is a mustache test');
    });

    it('should handle mustaches in nested properties', function () {
      expect(parser.mustache(dictionary, dictionary.nestedMustacheTest))
      .to
      .equal('this is a nested mustache test');
    });
  });

  describe('mixin()', function () {
    it('should return a modified string done by a mixin function', function () {
      expect(parser.mixin(dictionary, dictionary.mixinTest))
      .to
      .equal('This is a Test');
    });

    it('should return a modified string done by a mixin function for a nested property', function () {
      expect(parser.mixin(dictionary, dictionary.nested.mixinTest))
      .to
      .equal('this is a nested mixin Test');
    });
  });

  describe('decode()', function () {
    it('should decode strictly valid HTML entities', function () {
      expect(parser.decode('&comma; &amp; &laquo; &euro;'))
      .to
      .equal(', & « €');
    });
  });
});
