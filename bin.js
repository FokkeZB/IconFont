#!/usr/bin/env node

'use strict';

var
  fs = require('fs'),
  path = require('path');

var
  program = require('commander'),
  updateNotifier = require('update-notifier'),
  chalk = require('chalk'),
  css = require('css'),
  _ = require('underscore');

var
  pkg = require('./package.json');

updateNotifier({
  packageName: pkg.name,
  packageVersion: pkg.version
}).notify();

css.stringifyRule = function(rule, options) {
  options = options || {};
  options.compress = options.compress !== false;

  return this.stringify({
    stylesheet: {
      rules: [rule]
    }
  }, options);
};

program
  .version(pkg.version, '-v, --version')
  .description(pkg.description)
  .usage('<stylesheet> [js]')
  .parse(process.argv);

var ln = program.args.length;

if (ln === 0) {
  program.help();
}

if (ln > 2) {
  console.error(chalk.red('Just one stylesheet please'));
  process.exit(1);
}

var stylesheet = path.normalize(program.args[0]);
var js;

if (ln === 2) {
  js = path.normalize(program.args[1]);
} else {
  js = stylesheet.replace(/\.css$/, '.js');
}

fs.readFile(stylesheet, function(err, data) {

  if (err) {
    console.error(chalk.red(err));
    process.exit(1);
  }

  var code = data.toString();

  var obj = css.parse(code, stylesheet);

  if (!obj.stylesheet || !obj.stylesheet.rules) {
    console.error(chalk.red('Cannot find rules in the root'));
    process.exit(1);
  }

  var icons = {};
  var prefixes = [];

  _.each(obj.stylesheet.rules, function(rule) {

    if (!rule.selectors || !rule.declarations) {
      return;
    }

    var declaration = _.findWhere(rule.declarations, {
      property: 'content'
    });

    if (!declaration) {
      return;
    }

    var content = declaration.value;

    var matches = content.match(/^("|')(.+)\1$/i);

    if (!matches) {
      console.warn(chalk.yellow('Skipping content without string value: ') + chalk.blue(css.stringifyRule(rule)));
      return;
    }

    var string = matches[2];

    if (string.match(/^\\[a-z0-9]{1,4}$/i)) {
      string = '\\u' + (new Array(4 + 2 - string.length)).join('0') + string.substr(1);
    }

    _.each(rule.selectors, function(selector) {

      var matches2 = selector.match(/^\.(([a-z0-9]+-)?[a-z0-9]+(?:-[a-z0-9]+)*):before$/i);

      if (!matches) {
        return;
      }

      var name = matches2[1];
      var prefix = matches2[2];

      if (name === 'icon-fold') {
        console.log(matches, string);
      }

      if (prefixes.indexOf(prefix) === -1) {
        prefixes.push(prefix);
      }

      icons[name] = string;
    });
  });

  var ln = _.size(icons);

  if (ln === 0) {
    console.error(chalk.red('Found no icons'));
    process.exit(1);
  }

  var prefix = (prefixes.length === 1) ? prefixes[0] : null;

  data = 'module.exports = {\n';

  _.each(_.keys(icons), function(name, i) {
    var unicode = icons[name];

    if (prefix) {
      name = name.substr(prefix.length);
    }

    if (name.indexOf('-') !== -1) {
      name = name.replace(/(\-[a-z0-9])/g, function($1) {
        return $1.toUpperCase().replace('-', '');
      });
    }

    data += '  ' + name + ': "' + unicode + '"' + ((i === ln - 1) ? '' : ',') + '\n';
  });

  data += '};';

  fs.writeFile(js, data, null, function(err) {

    if (err) {
      console.error(chalk.red(err));
      process.exit(1);
    }

    console.info(chalk.green('Written ' + ln + ' icons to: ' + js));
  });

});