"use strict";

/*global require, module*/
var DEFAULT_NUMBER_FONT_SIZES, DEFAULT_MIN_SIZE, COLORS, DEFAULT_FONT_STEP, _;

DEFAULT_NUMBER_FONT_SIZES = 6;
DEFAULT_MIN_SIZE = 10;
DEFAULT_FONT_STEP = 2;
COLORS = {
  GREEN: "green",
  RED: "red",
  GRAY: "gray"
};
_ = require("underscore");

module.exports = (function () {
  /**
   * Defines a constructor for Word Cloud
   *
   * @param {Object} config
   * @param {Array} topics
   * @constructor
   */
  function WordCloud(config, topics) {
    this.config = config || {};
    this.topics = topics;
    this.config.minFontSize = this.config.minFontSize || DEFAULT_MIN_SIZE;
    this.config.numberOfSizes = this.config.numberOfSizes || DEFAULT_NUMBER_FONT_SIZES;
    this.config.fontStep = this.config.fontStep || DEFAULT_FONT_STEP;
    this.volumeToSizes = this.mapVolumeToSizes();
  }
  /**
   * Creates a volume map entry based on a step, level and minimum possible value
   *
   * @param {Number} min
   * @param {Number} step
   * @param {Number} level
   * @returns {Object}
   */
  WordCloud.prototype.createVolumeMapEntry = function (min, step, level) {
    return {
      min: (min + level * step),
      max: min + (level + 1) * step,
      fontSize: this.config.minFontSize + level * this.config.fontStep
    };
  };
  /**
   * Creates a map for the topics volumes to the font sizes
   *
   * @returns {Array}
   */
  WordCloud.prototype.mapVolumeToSizes = function () {
    var volumes, min, max, step, map;

    volumes = _.chain(this.topics)
      .pluck("volume")
      .uniq()
      .sortBy()
      .value();
    min = _.first(volumes) || 1;
    max = _.last(volumes) || 10;
    step = (max + 1 - min) / this.config.numberOfSizes;
    map = [];
    _.times(this.config.numberOfSizes, _.bind(function (level) {
      map.push(this.createVolumeMapEntry(min, step, level));
    }, this));

    return map;
  };
  /**
   *
   * @param topic
   */
  WordCloud.prototype.getFontSize = function (topic) {
    var volume, volumeEntry;

    volume = topic.volume;
    volumeEntry = _.find(this.volumeToSizes, function (entry) {
      return volume >= entry.min && volume < entry.max;
    }) || {};

    return volumeEntry.fontSize;
  };
  /**
   *
   * @param topic
   */
  WordCloud.prototype.getClassName = function (topic) {
    var sentimentScore;

    sentimentScore = topic.sentimentScore;
    if (sentimentScore < 40) {
      return COLORS.RED;
    }

    if (sentimentScore > 60) {
      return COLORS.GREEN;
    }

    return COLORS.GRAY;
  };
  /**
   * Parses a given topic
   * @param topic
   */
  WordCloud.prototype.parseTopic = function (topic) {
    var json;

    json = _.extend({}, topic);
    json.className = this.getClassName(topic);
    json.fontSize = this.getFontSize(topic);
    json.selected = false;

    return json;
  };
  /**
   * Parses all the topics
   */
  WordCloud.prototype.parse = function () {
    return _.map(this.topics, this.parseTopic, this);
  };
  /**
   * Returns a topic with the biggest volume
   */
  WordCloud.prototype.getTheBiggest = function () {
    return _.last(_.sortBy(this.topics, "volume"));
  };
  return WordCloud;
})();
