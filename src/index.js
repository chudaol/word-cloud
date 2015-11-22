"use strict";

/*global require*/
var WordCloud, _, wordCloud, config, topics, parsedTopics, selected, Vue, app;

_ = require("underscore");

config = require("../config.json");
WordCloud = require("./WordCloud");
Vue = require("vue");
topics = require(".././topics.json").topics;

wordCloud = new WordCloud(config, topics);
parsedTopics = wordCloud.parse();
selected = wordCloud.getTheBiggest();
_.findWhere(parsedTopics, {id: selected.id}).selected = true;
// register the description component
Vue.component("description-item", {
  props: ["label", "text", "className"],
  template: "#description-item-template"
});
// register the topic component
Vue.component("topic", {
  props: {
    model: Object
  },
  template: "#topic-template",
  computed: {
    className: function () {
      return this.model.className;
    },
    fontSize: function () {
      return "font-size-" + this.model.fontSize;
    },
    selected: function () {
      return this.model.selected;
    }
  },
  methods: {
    onClick: function (ev) {
      ev.preventDefault();
      ev.stopPropagation();
      this.model.selected = true;
      this.$dispatch("selected-topic", this.model);
    }
  }
});

app = new Vue({
  el: "#words",
  data: {
    topics: _.shuffle(parsedTopics),
    selected: selected
  },
  events: {
    "selected-topic": function (topic) {
      _.each(this.topics, function (topic) {
        topic.selected = false;
      });
      topic.selected = true;
      this.selected = topic;
    }
  }
});
