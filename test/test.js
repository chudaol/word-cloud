var chai = require("chai");
var expect = chai.expect;
var WordCloud = require("../src/WordCloud.js");

describe("word-cloud", function () {
   describe("createVolumeMapEntry", function () {
     var wordCloud, config, topics;

     beforeEach(function () {
       config = {
         "minFontSize": 10,
         "numberOfSizes": 6,
         "topics": "topics.json"
       };
       topics = [{}];
       wordCloud = new WordCloud(config, topics);
     });
     it("should", function () {
        expect(wordCloud.createVolumeMapEntry(1, 2, 3)).to.eql({
          min: 7,
          max: 9,
          fontSize: 16
        });
     })
   });
});