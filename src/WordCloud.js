"use strict";

/*global require, module*/
var DEFAULT_NUMBER_FONT_SIZES, DEFAULT_MIN_SIZE, COLORS, _;

DEFAULT_NUMBER_FONT_SIZES = 6;
DEFAULT_MIN_SIZE = 10;
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
      fontSize: this.config.minFontSize * (level + 1)
    };
  };
  /**
   * Creates a map for the topics volumes to the font sizes
   *
   * @returns {Array} an array of object with min and max volume and corresponding fontSize, e.g.
   * <pre>
   *   [
   *     {min: 1, max: 2, fontSize: 10},
   *     {min: 2, max: 3, fontSize: 12},
   *     {min: 3, max: 4, fontSize: 14}
   *   ]
   * </pre>
   * It means that for topics with volume between 1 and 2 the font size will be 10,
   * for topics with volume between 2 and 3 the font size will be 12, etc
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
   * Calculates the font size for a given topic analyzing its volume
   *
   * @param {Object} topic
   * @returns {Number}
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
   * Generates a class name for a given topic
   *
   * @param {Object} topic
   * @returns {String} red/green/gray
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
   *
   * @param {Object} topic
   * @returns {Object}
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
   *
   * @returns {Array}
   */
  WordCloud.prototype.parse = function () {
    return _.map(this.topics, this.parseTopic, this);
  };
  /**
   * Returns a topic with the biggest volume
   *
   * @returns {Object|undefined}
   */
  WordCloud.prototype.getTheBiggest = function () {
    return _.last(_.sortBy(this.topics, "volume"));
  };
  return WordCloud;
})();
