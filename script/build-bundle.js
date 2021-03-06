/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module mdast:script
 * @fileoverview Bundle and mangle `mdast`.
 */

'use strict';

/* eslint-disable no-console */

/* eslint-env node */

/*
 * Dependencies.
 */

var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
var bail = require('bail');
var browserify = require('browserify');
var esprima = require('esprima');
var esmangle = require('esmangle');
var escodegen = require('escodegen');

var write = fs.writeFileSync;

var absolute = path.join.bind(null, __dirname, '..');

browserify(path.join(__dirname, '..', 'index.js'), {
    'standalone': 'mdast'
}).bundle(function (err, buf) {
    var ast;
    var comment;

    bail(err);

    write(absolute('mdast.js'), buf);

    console.log(chalk.green('✓') + ' wrote `mdast.js`');

    ast = esprima.parse(buf, {
        'loc': true,
        'range': true,
        'raw': true,
        'comment': true,
        'tolerant': true
    });

    comment = ast.comments[0].value;

    var doc = escodegen.generate(esmangle.mangle(esmangle.optimize(ast, {
        'destructive': true,
        'directive': true,
        'preserveCompletionValue': false,
        'legacy': false,
        'topLevelContext': null,
        'inStrictCode': true
    })), {
        'format': {
            'renumber': true,
            'hexadecimal': true,
            'escapeless': true,
            'compact': true,
            'semicolons': false,
            'parentheses': false
        }
    });

    write(absolute('mdast.min.js'), '/*' + comment + '*/\n' + doc);

    console.log(chalk.green('✓') + ' wrote `mdast.min.js`');
})
