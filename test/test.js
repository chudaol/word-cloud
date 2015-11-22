"use strict";
/*global require, describe, beforeEach, it*/
var chai, sinon, expect, WordCloud;

chai = require("chai");
sinon = require("sinon");
expect = chai.expect;
WordCloud = require("../src/WordCloud.js");

describe("word-cloud", function () {
  var wordCloud, config, topics;

  beforeEach(function () {
    config = {
      minFontSize: 10,
      numberOfSizes: 6,
      topics: "topics.json"
    };
    topics = [{}];
    wordCloud = new WordCloud(config, topics);
  });

  describe("createVolumeMapEntry", function () {
    it("should return 10 and 11 for minimum value 10 and step 1 and level 0", function () {
      expect(wordCloud.createVolumeMapEntry(10, 1, 0)).to.eql({
        min: 10,
        max: 11,
        fontSize: 10
      });
    });

    it("should return 7 and 9 for min and max and 16 for font size for 1, 2, 3", function () {
      expect(wordCloud.createVolumeMapEntry(1, 2, 3)).to.eql({
        min: 7,
        max: 9,
        fontSize: 40
      });
    });
  });

  describe("mapVolumeToSizes", function () {
    it("should return the array of length of number of sizes in config", function () {
      sinon.stub(wordCloud, "createVolumeMapEntry").returns(1);
      expect(wordCloud.mapVolumeToSizes()).to.eql([1, 1, 1, 1, 1, 1]);

      wordCloud.createVolumeMapEntry.restore();
    });

    it("should return a map for given topics taking in account config font step and number of sizes", function () {
      topics = [
        {volume: 1},
        {volume: 2},
        {volume: 3}
      ];

      config = {
        numberOfSizes: 3
      };

      wordCloud = new WordCloud(config, topics);
      expect(wordCloud.mapVolumeToSizes()).to.eql([
        {min: 1, max: 2, fontSize: 10},
        {min: 2, max: 3, fontSize: 20},
        {min: 3, max: 4, fontSize: 30}
      ]);
    });

    it("should create a map with default values if topics are empty", function () {
      topics = [];

      config = {
        numberOfSizes: 3
      };

      wordCloud = new WordCloud(config, topics);
      sinon.stub(wordCloud, "createVolumeMapEntry").returns(1);
      expect(wordCloud.mapVolumeToSizes()).to.eql([1, 1, 1]);
      wordCloud.createVolumeMapEntry.restore();
    });
  });

  describe("getFontSize", function () {
    it("should return a font size of the map entry for which topic's volume is between min and max", function () {
      wordCloud.volumeToSizes = [
        {min: 1, max: 2, fontSize: 1},
        {min: 2, max: 3, fontSize: 2},
        {min: 3, max: 4, fontSize: 3}
      ];

      expect(wordCloud.getFontSize({volume: 1})).to.equal(1);
      expect(wordCloud.getFontSize({volume: 2})).to.equal(2);
      expect(wordCloud.getFontSize({volume: 3})).to.equal(3);
      expect(wordCloud.getFontSize({volume: 4})).to.equal(undefined);
    });
  });

  describe("getClassName", function () {
    it("should return RED for the topic with sentiment score less than 40", function () {
      expect(wordCloud.getClassName({sentimentScore: 2})).to.equal("red");
      expect(wordCloud.getClassName({sentimentScore: 39})).to.equal("red");
      expect(wordCloud.getClassName({sentimentScore: 0})).to.equal("red");
      expect(wordCloud.getClassName({sentimentScore: 40})).not.to.equal("red");
    });

    it("should return GRAY for the topic with sentiment score greater or equal than 40 and less than 60", function () {
      expect(wordCloud.getClassName({sentimentScore: 40})).to.equal("gray");
      expect(wordCloud.getClassName({sentimentScore: 50})).to.equal("gray");
      expect(wordCloud.getClassName({sentimentScore: 59})).to.equal("gray");
      expect(wordCloud.getClassName({sentimentScore: 60})).to.equal("gray");
    });

    it("should return GREEN for the topic with sentiment score greater or equal than 60", function () {
      expect(wordCloud.getClassName({sentimentScore: 60})).not.to.equal("green");
      expect(wordCloud.getClassName({sentimentScore: 61})).to.equal("green");
      expect(wordCloud.getClassName({sentimentScore: 80})).to.equal("green");
    });
  });

  describe("parseTopic", function () {
    it("should return an object enriched with the result of getClassName, getFontSize and selected false", function () {
      sinon.stub(wordCloud, "getClassName").returns("alice");
      sinon.stub(wordCloud, "getFontSize").returns("bob");
      expect(wordCloud.parseTopic({foo: "bar"})).to.eql({
        className: "alice",
        fontSize: "bob",
        foo: "bar",
        selected: false
      });

      wordCloud.getClassName.restore();
      wordCloud.getFontSize.restore();
    });
  });

  describe("parse", function () {
    it("should return the array containing the result of parseTopic method for each of the given topics", function () {
      sinon.stub(wordCloud, "parseTopic").returns({alice: "bob"});

      wordCloud.topics = [1, 2, 3];
      expect(wordCloud.parse()).to.eql([{alice: "bob"}, {alice: "bob"}, {alice: "bob"}]);
      wordCloud.parseTopic.restore();
    });
  });

  describe("getTheBiggest", function () {
    it("should return undefined", function () {
      wordCloud.topics = [];
      expect(wordCloud.getTheBiggest()).to.equal(undefined);
    });

    it("should return the topic with the biggest volume for unordered list of topics", function () {
      wordCloud.topics = [{volume: 3}, {volume: 2}, {volume: 1}];
      expect(wordCloud.getTheBiggest()).to.eql({volume: 3});
    });

    it("should return the topic with the biggest volume for ordered list of topics", function () {
      wordCloud.topics = [{volume: 1}, {volume: 2}, {volume: 3}];
      expect(wordCloud.getTheBiggest()).to.eql({volume: 3});
    });
  });
});
