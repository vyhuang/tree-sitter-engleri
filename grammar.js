/**
 * @file Parser and grammar for an Ink language fork
 * @author Vincent Huang <vincent.yh.huang@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

const SPECIAL_SEQUENCES = {
  glue: "<>",
  divert: "->",
  thread: "<-"
};

// back slashes have to be escaped twice...
const INK_NON_TEXT_CHAR = "|{}\\n\\r#";                               // "|{}\n\r#"
const INK_NON_TEXT_CHAR_CHOICE = INK_NON_TEXT_CHAR + "\\[\\]";        // "|{}\n\r#[]"
const INK_NON_TEXT_CHAR_STRING = INK_NON_TEXT_CHAR_CHOICE + "\\\"";   // "|{}\n\r#[]""
const NON_TEXT_CHAR = "|{}#\\n\\r\\[\\]$~";                           // "|{}\n\r[]~$"
const NON_PURE_TEXT_CHAR = NON_TEXT_CHAR + "<>\\\\";                  // "|{}\n\r[]~$<>\"
const TAG_TEXT_CHAR_REGEX = "([[:alpha:]]|[\$:\\_\\-\\. ])+";         // "[a-z][A-Z]$:_-. "

module.exports = grammar({
  name: "engleri",

  extras: $ => [
    $._inlineWS,
    // /[\r\n]/, // TODO: remove later
  ],

  conflicts: $ => [
    //[$._inlineLogicOrGlueOrTags, $._contentText],
    [$.conditionExpression, $._innerExpressions],
  ],

  rules: {
    source_file: $ => $.TOP,

    TOP: $ => repeat1(choice(
      // $.KnotDefinition,
      // $.StitchDefinition,
      // $.divert,
      // $.choice,
      // $.varDeclaration
      // $.constDeclaration
      // $.externalDeclaration
      // $.includeStatement
      // $.logicLine
      $.mixedLine,
    )),

    KnotDefinition: $ => "",

    StitchDefinition: $ => "",

    InnerBlock: $ => "",

    KnotDeclaration: $ => "",
    StitchDeclaration: $ => "",

    divert: $ => "",
    choice: $ => "",
    gather: $ => "",
    varDeclaration: $ => "",
    constDeclaration: $ => "",
    externalDeclaration: $ => "",
    includeStatement: $ => "",
    logicLine: $ => "",
    mixedLine: $ => prec.left(seq(repeat($._mixedTextAndLogic), $._multiNewlines)),
    parseDashNotArrow: $ => "",

    _mixedTextAndLogic: $ => 
      prec.left(
      seq(
        repeat($._inlineWS),
        repeat1(
          prec.left(
          choice(
            $._contentText,
            $._inlineLogicOrGlueOrTags,
          ))
        ),
        // $.__multiDivert
        repeat($._inlineWS),
      )),

    _contentText: $ => 
      repeat1(
          choice(
            $.text,
            $.textEsc,
        )
      ),

    _inlineLogicOrGlueOrTags: $ => 
      prec.left(choice(
        seq(/\{[ \t]*/, $._inlineLogic, /}[ \t]*/), 
        $.glue,
        repeat1($.tag)
      )),

    _inlineLogic: $ => $._innerLogic,

    _innerLogic: $ => choice($.explicitSequence, $.conditionExpression, $._innerExpressions),

    explicitSequence: $ => {

      const SEQUENCE_TYPES = [
        ["once", "!"],
        ["cycle", "&"],
        ["shuffle", "~"],
        ["stopping", "$"], 
        ["click", "?"], // not in Ink spec
      ];

      return seq(
        field("type", 
          repeat1(
            choice(
              ...SEQUENCE_TYPES.map(
                ([typeName, typeSymbol]) => choice(typeName, typeSymbol))
              )
            ) 
          ),
        /:/,
        $._sequenceObjects,
      );
    },

    _sequenceObjects: $ => choice($._inlineSequenceObjects), // $._multilineSequenceObjects),
    
    _inlineSequenceObjects: $ => 
      prec.left(repeat1(choice($.sequenceDivider, $._mixedTextAndLogic))),
    
    sequenceDivider: $ => /[ \t]*\|[ \t]*/,

    _multilineSequenceObjects: $ => "",

    _placeholderText: $ => $.text,


    conditionExpression: $ => /[ \t]+/,

    _innerExpressions: $ => /[ \t]+/,


    // tags
    tag: $ => seq(/[ \t]*#/, new RustRegex(TAG_TEXT_CHAR_REGEX)),

    __multiDivert: $ => "",

    // text
    textEsc: $ => /(\\.)+/,
    text: $ => new RustRegex(`[^${NON_PURE_TEXT_CHAR}]+`),

    // non-text symbols
    _divert_symbol: $ => new RustRegex(SPECIAL_SEQUENCES.divert),
    _thread_symbol: $ => new RustRegex(SPECIAL_SEQUENCES.thread),
    glue: $ => new RustRegex(SPECIAL_SEQUENCES.glue),

    // Whitespace
    _inlineWS: $ => /[ \t]/,
    _newline: $ => seq(repeat($._inlineWS), /[\r\n]/),
    _endOfLine: $ => choice($._newline),
    _multiNewlines: $ => repeat1($._newline),
  }
});
