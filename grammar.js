/**
 * @file Parser and grammar for an Ink language fork
 * @author Vincent Huang <vincent.yh.huang@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "engleri",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
