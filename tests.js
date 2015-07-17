var testingInstanceGet = false;
var testingInstanceParent = false;
var testingData = false;

Template.noop.created = function () {
  this._testTemplateFieldNoop = 50;
};

Template.testTemplate.created = function () {
  this._testTemplateField = 42;
};

Template.testTemplate.helpers({
  data: function () {
    return _.extend({}, this, {data1: 'foo'});
  }
});

Template.testTemplate1.created = function () {
  this._testTemplateField1 = 43;
};

Template.testTemplate1.helpers({
  data: function () {
    // We add data2, but remove data1.
    return _.omit(_.extend({}, this, {data2: 'bar'}), 'data1');
  }
});

Template.testTemplate2.created = function () {
  this._testTemplateField3 = {testField : 44};
};

Template.testTemplate2.helpers({
  testInstanceGet: function () {
    if (testingInstanceGet) return EJSON.stringify(Template.instance().get(this.fieldName));
  },

  testInstanceParent: function () {
    if (!testingInstanceParent) return;

    var ancestors = [];
    var template = Template.instance();
    while (template) {
      // Only fields which start with _.
      ancestors.push(_.pick(template, _.filter(_.keys(template), function (key) {
        return key.substr(0, 1) === '_' &&
          key !== '_allSubsReadyDep' &&
          key !== '_allSubsReady' &&
          key !== '_subscriptionHandles';
      })));
      template = template.parent(this.numLevels, this.includeBlockHelpers);
    }
    return EJSON.stringify(ancestors);
  },

  testData: function () {
    if (testingData) return EJSON.stringify(Template.parentData(this.numLevels));
  }
});

Template.testTemplate3.events({
  'click #button': function () {
    return true;
  }
});

Template.testTemplate4.events({
  'mousemove .current': function () {
    return true;
  }
});

Template.testTemplate8.hooks({
  rendered: function () {
    this._testTemplateField4 = 14;
  }
});

Template.testTemplate9.hooks({
  created: function () {
    this._testTemplateField5 = 14;
  }
});

Template.testTemplate9.helpers({
  copyAsHelper: function () {
    return 'copyAs';
  }
});

Template.testTemplate17.hooks({
  created: function () {
    this._testTemplateField7 = 14;
  },
  rendered: function () {
    this._testTemplateField7 = 15;
  },
  destroyed: function () {
    this._testTemplateField7 = 16;
  },
});

Template.onCreated(function () {
  this.testTemplateField14 = 14;
});

Template.onRendered(function () {
  this.testTemplateField15 = 15;
});

Template.onDestroyed(function () {
  this.testTemplateField16 = 16;
});

Tinytest.add('template-extension - get', function (test) {
  testingInstanceGet = true;
  try {
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateField'}), '42');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateField1'}), '43');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateField3.testField'}), '44');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_testTemplateFieldNoop'}), '50');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {fieldName: '_nonexistent'}), '');
  }
  finally {
    testingInstanceGet = false;
  }
});

Tinytest.add('template-extension - parent', function (test) {
  testingInstanceParent = true;
  try {
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 1, includeBlockHelpers: false}), '[{"_testTemplateField3":{"testField":44}},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 1, includeBlockHelpers: true}), '[{"_testTemplateField3":{"testField":44}},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {includeBlockHelpers: false}), '[{"_testTemplateField3":{"testField":44}},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {includeBlockHelpers: true}), '[{"_testTemplateField3":{"testField":44}},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: undefined, includeBlockHelpers: false}), '[{"_testTemplateField3":{"testField":44}},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: undefined, includeBlockHelpers: true}), '[{"_testTemplateField3":{"testField":44}},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: null, includeBlockHelpers: false}), '[{"_testTemplateField3":{"testField":44}},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: null, includeBlockHelpers: true}), '[{"_testTemplateField3":{"testField":44}},{"_testTemplateFieldNoop":50},{"_testTemplateField1":43},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 2, includeBlockHelpers: false}), '[{"_testTemplateField3":{"testField":44}},{"_testTemplateField":42}]');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 2, includeBlockHelpers: true}), '[{"_testTemplateField3":{"testField":44}},{"_testTemplateField1":43}]');
  }
  finally {
    testingInstanceParent = false;
  }
});

Tinytest.add('template-extension - parentData', function (test) {
  testingData = true;
  try {
    // Testing default behavior.
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {}), '{"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: undefined}), '{"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: null}), '{"numLevels":null,"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 0}), '{"numLevels":0,"data2":"bar"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 1}), '{"numLevels":1,"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 2}), '{"numLevels":2}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: 3}), 'null');

    // Testing a function.
    var hasField = function (fieldName) {
      return function (data) {
        return fieldName in data;
      };
    };

    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: hasField('data1')}), '{"data1":"foo"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: hasField('data2')}), '{"data2":"bar"}');
    test.equal(Blaze.toHTMLWithData(Template.testTemplate, {numLevels: hasField('data3')}), 'null');
  }
  finally {
    testingData = false;
  }
});

Tinytest.add('template-extension - inheritsHelpersFrom', function (test) {
  Template.testTemplate3.inheritsHelpersFrom('testTemplate2');
  test.equal(Template.testTemplate2.__helpers[' testInstanceGet'], Template.testTemplate3.__helpers[' testInstanceGet']);
});

Tinytest.add('template-extension - inheritsHelpersFrom array', function (test) {
  Template.testTemplate4.inheritsHelpersFrom(['testTemplate1', 'testTemplate2']);
  test.equal(Template.testTemplate2.__helpers[' testInstanceGet'], Template.testTemplate4.__helpers[' testInstanceGet']);
  test.equal(Template.testTemplate1.__helpers[' data'], Template.testTemplate4.__helpers[' data']);
});

Tinytest.add('template-extension - inheritsEventsFrom', function (test) {
  Template.testTemplate5.inheritsEventsFrom('testTemplate3');
  test.equal(Template.testTemplate3.__eventMaps, Template.testTemplate5.__eventMaps);
});

Tinytest.add('template-extension - inheritsEventsFrom array', function (test) {
  Template.testTemplate6.inheritsEventsFrom(['testTemplate3', 'testTemplate4']);
  test.equal(Template.testTemplate3.__eventMaps[0], Template.testTemplate6.__eventMaps[0]);
  test.equal(Template.testTemplate4.__eventMaps[0], Template.testTemplate6.__eventMaps[1]);
});

Tinytest.add('template-extension - inheritsHooksFrom', function (test) {
  Template.testTemplate7.inheritsHooksFrom('testTemplate');
  Template.testTemplate7.created();
  test.equal(Template.testTemplate7._testTemplateField, 42);
});

Tinytest.add('template-extension - inheritsHooksFrom array', function (test) {
  Template.testTemplate9.inheritsHooksFrom(['testTemplate', 'testTemplate8']);
  Template.testTemplate9.created();
  Template.testTemplate9.rendered();
  test.equal(Template.testTemplate9._testTemplateField, 42);
  test.equal(Template.testTemplate9._testTemplateField4, 14);
});

Tinytest.add('template-extension - copyAs', function (test) {
  Template.testTemplate9.copyAs('testTemplate10');
  Template.testTemplate10.created();
  test.equal(Blaze.toHTML(Template.testTemplate10),'<h1>copyAs</h1>');
  test.equal(Template.testTemplate10._testTemplateField5, 14);
});

Tinytest.add('template-extension - copyAs array', function (test) {
  Template.testTemplate9.copyAs(['testTemplate11', 'testTemplate12']);
  Template.testTemplate11.created();
  Template.testTemplate12.created();
  test.equal(Blaze.toHTML(Template.testTemplate11),'<h1>copyAs</h1>');
  test.equal(Blaze.toHTML(Template.testTemplate12),'<h1>copyAs</h1>');
  test.equal(Template.testTemplate11._testTemplateField5, 14);
  test.equal(Template.testTemplate12._testTemplateField5, 14);
});

Tinytest.add('template-extension - copyAs returns newly created template', function (test) {
  var result = Template.testTemplate.copyAs('testTemplate3');
  test.instanceOf(result, Blaze.Template);
});

Tinytest.add('template-extension - copyAs returns newly created template array', function (test) {
  var result = Template.testTemplate.copyAs(['testTemplate3', 'testTemplate4']);
  test.instanceOf(result, Array);
  test.instanceOf(result[0], Blaze.Template);
  test.instanceOf(result[1], Blaze.Template);
});

Tinytest.add('template-extension - replaces', function (test) {
  Template.testTemplate9.replaces('testTemplate14');
  Template.testTemplate14.inheritsHelpersFrom('testTemplate9');
  test.equal(Blaze.toHTML(Template.testTemplate14),'<h1>copyAs</h1>');
});

Tinytest.add('template-extension - replaces array', function (test) {
  Template.testTemplate9.replaces(['testTemplate15', 'testTemplate16']);
  Template.testTemplate15.inheritsHelpersFrom('testTemplate9');
  Template.testTemplate16.inheritsHelpersFrom('testTemplate9');
  test.equal(Blaze.toHTML(Template.testTemplate15),'<h1>copyAs</h1>');
  test.equal(Blaze.toHTML(Template.testTemplate16),'<h1>copyAs</h1>');
});

Tinytest.add('template-extension - hooks', function (test) {
  Template.testTemplate17.created();
  test.equal(Template.testTemplate17._testTemplateField7, 14);
  Template.testTemplate17.rendered();
  test.equal(Template.testTemplate17._testTemplateField7, 15);
  Template.testTemplate17.destroyed();
  test.equal(Template.testTemplate17._testTemplateField7, 16);
});

Tinytest.add('template-extension - onCreated', function (test) {
  Template.testTemplate20.created();
  test.equal(Template.testTemplate20.testTemplateField14, 14);
});

Tinytest.add('template-extension - onRendered', function (test) {
  Template.testTemplate20.rendered();
  test.equal(Template.testTemplate20.testTemplateField15, 15);
});

Tinytest.add('template-extension - onDestroyed', function (test) {
  Template.testTemplate20.destroyed();
  test.equal(Template.testTemplate20.testTemplateField16, 16);
});
