/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: 'koka',
  rules: {
    source_file: $ => seq(),
  }
})
