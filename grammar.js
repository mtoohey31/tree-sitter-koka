/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "koka",
  externals: ($) => [$._open_brace, $._close_brace, $._semi, $._raw_string],
  extras: ($) => [/[ \t\r\n]/, $.linecomment, $.blockcomment],
  conflicts: ($) => [
    // Context-free syntax doesn't specify operator precedences.
    [$.prefixexpr, $.appexpr],
    // Necessary for allowing statements at the top level, which we want to do
    // so this can be used to highlight code blocks.
    [$.binder, $.pattern],
    [$.puredecl, $.fundecl],
  ],
  word: ($) => $.id,
  rules: {
    // Program
    program: ($) =>
      choice(
        seq(
          optional(seq(optional($._semis), "module", $.modulepath)),
          alias(
            choice(
              seq(
                $._open_brace,
                optional($._semis),
                alias(
                  seq(
                    repeat(seq($.importdecl, $._semis)),
                    repeat(seq($.fixitydecl, $._semis)),
                    optional($._topdecls),
                  ),
                  $.modulebody,
                ),
                $._close_brace,
                optional($._semis),
              ),
              seq(
                optional($._semis),
                alias(
                  seq(
                    repeat(seq($.importdecl, $._semis)),
                    repeat(seq($.fixitydecl, $._semis)),
                    optional($._topdecls),
                  ),
                  $.modulebody,
                ),
              ),
            ),
            "moduledecl",
          ),
        ),
        prec(-1, seq(optional($._semis), $.statements)),
      ),
    importdecl: ($) =>
      seq(
        optional("pub"),
        "import",
        $.modulepath,
        optional(seq("=", $.modulepath)),
      ),
    modulepath: ($) => choice($.varid, $.qvarid),
    _semis: ($) => repeat1($._semi),

    // Top level declarations
    fixitydecl: ($) => seq(optional("pub"), $.fixity, $.oplist),
    fixity: ($) => seq(choice("infix", "infixl", "infixr"), $.int),
    oplist: ($) => commaSep1($.identifier),
    _topdecls: ($) => repeat1(seq($.topdecl, $._semis)),
    topdecl: ($) =>
      choice(
        seq(
          optional("pub"),
          choice($.puredecl, $.aliasdecl, $.externdecl, $.typedecl),
        ),
        seq("abstract", $.typedecl),
      ),

    // External declarations
    externdecl: ($) =>
      choice(
        seq("inline", "extern", $.funid, $.externtype, $.externbody),
        seq("noinline", "extern", $.funid, $.externtype, $.externbody),
        seq("extern", $.funid, $.externtype, $.externbody),
        seq("extern", "import", $.externimpbody),
      ),
    externtype: ($) =>
      choice(
        seq(":", $.typescheme),
        seq(
          optional($.typeparams),
          "(",
          optional($.parameters),
          ")",
          optional($.annotres),
        ),
      ),
    externbody: ($) =>
      seq(
        $._open_brace,
        optional($._semis),
        repeat(seq($.externstat, $._semis)),
        $._close_brace,
      ),
    externstat: ($) =>
      seq(optional($.externtarget), optional("inline"), $.string),
    externimpbody: ($) =>
      choice(
        seq("=", $.externimp),
        seq(
          $._open_brace,
          optional($._semis),
          repeat1(seq($.externimp, $._semis)),
          $._close_brace,
        ),
      ),
    externimp: ($) =>
      choice(
        seq($.externtarget, $.varid, $.string),
        seq(
          $.externtarget,
          $._open_brace,
          repeat1(seq($.externval, $._semis)),
          $._close_brace,
        ),
      ),
    externval: ($) => seq($.varid, "=", $.string),
    externtarget: (_) => choice("cs", "js", "c"),

    // Type declarations
    aliasdecl: ($) =>
      seq(
        "alias",
        $.typeid,
        optional($.typeparams),
        optional($.kannot),
        "=",
        $.type,
      ),
    typedecl: ($) =>
      choice(
        seq(
          optional($.typemod),
          "type",
          $.typeid,
          optional($.typeparams),
          optional($.kannot),
          optional($.typebody),
        ),
        seq(
          optional($.structmod),
          "struct",
          $.typeid,
          optional($.typeparams),
          optional($.kannot),
          optional($.conparams),
        ),
        seq(
          optional($.effectmod),
          "effect",
          $.varid,
          optional($.typeparams),
          optional($.kannot),
          choice($.opdecls, $.operation),
        ),
        seq(
          optional($.effectmod),
          "effect",
          $.varid,
          optional($.typeparams),
          optional($.kannot),
          "in",
          $.type,
          $.opdecls,
        ),
      ),
    typemod: ($) => choice($.structmod, "open", "extend", "co", "rec"),
    structmod: (_) => choice("value", "reference"),
    effectmod: (_) => choice("rec", "linear", seq("linear", "rec")),
    typebody: ($) =>
      seq(
        $._open_brace,
        optional($._semis),
        optional($.constructors),
        $._close_brace,
      ),
    typeid: ($) =>
      choice(
        seq("(", optional($.commas), ")"),
        seq("[", "]"),
        seq("<", ">"),
        seq("<", "|", ">"),
        $.varid,
      ),
    commas: (_) => repeat1(","),
    constructors: ($) => repeat1(seq($.constructor, $._semis)),
    constructor: ($) =>
      seq(
        optional("pub"),
        optional("con"),
        choice($.conid, $.string),
        optional($.typeparams),
        optional($.conparams),
      ),
    conparams: ($) =>
      choice(
        seq("(", $.parameters, ")"),
        seq(
          $._open_brace,
          optional($._semis),
          optional($.sconparams),
          $._close_brace,
        ),
      ),
    sconparams: ($) => repeat1(seq($.parameter, $._semis)),

    // Effect declarations
    opdecls: ($) =>
      seq(
        $._open_brace,
        optional($._semis),
        optional($.operations),
        $._close_brace,
      ),
    operations: ($) => repeat1(seq($.operation, $._semis)),
    operation: ($) =>
      choice(
        seq(
          optional("pub"),
          "val",
          $.identifier,
          optional($.typeparams),
          ":",
          $.tatomic,
        ),
        seq(
          optional("pub"),
          choice("fun", "ctl"),
          $.identifier,
          optional($.typeparams),
          "(",
          optional($.parameters),
          ")",
          ":",
          $.tatomic,
        ),
      ),

    // Pure (top-level) Declarations
    puredecl: ($) =>
      choice(
        seq(optional($.inlinemod), "val", $.binder, "=", $.blockexpr),
        seq(optional($.inlinemod), "fun", $.funid, $.funbody),
      ),
    inlinemod: (_) => choice("inline", "noinline"),
    fundecl: ($) => seq($.funid, $.funbody),
    binder: ($) => choice($.identifier, seq($.identifier, ":", $.type)),
    funid: ($) =>
      choice($.identifier, seq("[", optional($.commas), "]"), $.string),
    funbody: ($) =>
      seq(
        optional($.typeparams),
        "(",
        optional($.pparameters),
        ")",
        choice($.bodyexpr, seq(":", $.tresult, optional($.qualifier), $.block)),
      ),
    annotres: ($) => seq(":", $.tresult),

    // Statements
    block: ($) =>
      seq($._open_brace, optional($._semis), $.statements, $._close_brace),
    statements: ($) => repeat1(seq($.statement, $._semis)),
    statement: ($) =>
      choice(
        $.decl,
        $.withstat,
        seq($.withstat, "in", $.blockexpr),
        $.returnexpr,
        $.basicexpr,
      ),
    decl: ($) =>
      choice(
        seq("fun", $.fundecl),
        seq("val", $.apattern, "=", $.blockexpr),
        seq("var", $.binder, ":=", $.blockexpr),
      ),

    // Expressions
    bodyexpr: ($) => seq(optional("->"), $.blockexpr),
    blockexpr: ($) => $.expr,
    expr: ($) =>
      choice($.withexpr, $.block, $.returnexpr, $.valexpr, $.basicexpr),
    basicexpr: ($) =>
      choice($.ifexpr, $.matchexpr, $.handlerexpr, $.fnexpr, $.opexpr),
    matchexpr: ($) =>
      seq(
        "match",
        $.ntlexpr,
        $._open_brace,
        optional($._semis),
        $.matchrules,
        $._close_brace,
      ),
    fnexpr: ($) => seq("fn", $.funbody),
    returnexpr: ($) => seq("return", $.expr),
    ifexpr: ($) =>
      prec.right(
        seq(
          "if",
          $.ntlexpr,
          choice(
            seq("then", $.blockexpr, optional($.elifs)),
            seq("return", $.expr),
          ),
        ),
      ),
    elifs: ($) =>
      seq(
        repeat(seq("elif", $.ntlexpr, "then", $.blockexpr)),
        "else",
        $.blockexpr,
      ),
    valexpr: ($) => seq("val", $.apattern, "=", $.blockexpr, "in", $.expr),
    opexpr: ($) =>
      prec.right(seq($.prefixexpr, repeat(seq($.qoperator, $.prefixexpr)))),
    prefixexpr: ($) => choice(seq(choice("!", "~"), $.prefixexpr), $.appexpr),
    appexpr: ($) =>
      choice(
        seq(
          $.appexpr,
          choice(
            seq("(", optional($.arguments), ")"),
            seq("[", optional($.arguments), "]"),
            seq(".", $.atom),
            seq($.block),
            seq($.fnexpr),
          ),
        ),
        $.atom,
      ),
    ntlexpr: ($) => $.ntlopexpr,
    ntlopexpr: ($) =>
      prec.right(
        seq($.ntlprefixexpr, repeat(seq($.qoperator, $.ntlprefixexpr))),
      ),
    ntlprefixexpr: ($) =>
      choice(seq(choice("!", "~"), $.ntlprefixexpr), $.ntlappexpr),
    ntlappexpr: ($) =>
      choice(
        seq(
          $.ntlappexpr,
          choice(
            seq("(", optional($.arguments), ")"),
            seq("[", optional($.arguments), "]"),
            seq(".", $.atom),
          ),
        ),
        $.atom,
      ),
    atom: ($) =>
      choice(
        $.qidentifier,
        $.qconstructor,
        $.literal,
        $.mask,
        seq("(", optional($.aexprs), ")"),
        seq("[", optional($.cexprs), "]"),
      ),
    literal: ($) => choice($.int, $.float, $.char, $.string),
    mask: ($) => seq("mask", optional("behind"), "<", $.tbasic, ">"),
    arguments: ($) => commaSep1($.argument),
    argument: ($) => seq(optional(seq($.identifier, "=")), $.expr),
    parameters: ($) => commaSep1($.parameter),
    parameter: ($) =>
      seq(
        optional($.borrow),
        $.paramid,
        ":",
        $.type,
        optional(seq("=", $.expr)),
      ),
    paramid: ($) => choice($.identifier, $.wildcard),
    borrow: (_) => "^",
    pparameters: ($) =>
      choice(seq($.pparameters, ",", $.pparameter), $.pparameter),
    pparameter: ($) =>
      seq(
        optional($.borrow),
        $.pattern,
        optional(seq(":", $.type)),
        optional(seq("=", $.expr)),
      ),
    aexprs: ($) => commaSep1($.aexpr),
    cexprs: ($) => seq(commaSep1($.aexpr), optional(",")),
    aexpr: ($) => seq($.expr, optional($.annot)),
    annot: ($) => seq(":", $.typescheme),

    // Identifiers and operators
    qoperator: ($) => $.op,
    qidentifier: ($) => prec.right(choice($.qvarid, $.qidop, $.identifier)),
    identifier: ($) => choice($.varid, $.idop),
    qvarid: ($) => $.qid,
    varid: ($) => prec.right($.id),
    qconstructor: ($) => choice($.conid, $.qconid),

    // Matching
    matchrules: ($) => seq($.matchrule, repeat(seq($._semis, $.matchrule))),
    matchrule: ($) =>
      seq($.patterns, optional(seq("|", $.expr)), "->", $.blockexpr),
    patterns: ($) => commaSep1($.pattern),
    apatterns: ($) => commaSep1($.apattern),
    apattern: ($) => seq($.pattern, optional($.annot)),
    pattern: ($) =>
      choice(
        seq($.identifier, optional(seq("as", $.pattern))),
        seq($.conid, optional(seq("(", optional($.patargs), ")"))),
        seq("(", optional($.apatterns), ")"),
        seq("[", optional($.apatterns), "]"),
        $.literal,
        $.wildcard,
      ),
    patargs: ($) => commaSep1($.patarg),
    patarg: ($) => seq(optional(seq($.identifier, "=")), $.apattern),

    // Handlers
    handlerexpr: ($) =>
      choice(
        seq(
          optional(choice("override", "named")),
          "handler",
          optional($.witheff),
          $.opclauses,
        ),
        seq(
          optional(choice("override", "named")),
          "handle",
          optional($.witheff),
          $.ntlexpr,
          $.opclauses,
        ),
      ),
    witheff: ($) => seq("<", $.anntype, ">"),
    withstat: ($) =>
      choice(
        seq("with", $.basicexpr),
        seq(
          "with",
          $.binder,
          "<-",
          choice($.basicexpr, seq(optional($.witheff), $.opclause)),
        ),
        seq("with", optional("override"), optional($.witheff), $.opclause),
      ),
    withexpr: ($) => seq($.withstat, "in", $.blockexpr),
    opclauses: ($) =>
      seq(
        $._open_brace,
        optional($._semis),
        optional(
          seq($.opclausex, repeat(seq($._semis, $.opclausex)), $._semis),
        ),
        $._close_brace,
      ),
    opclausex: ($) =>
      choice(
        seq("finally", $.bodyexpr),
        seq("initially", "(", $.opparam, ")", $.bodyexpr),
        $.opclause,
      ),
    opclause: ($) =>
      choice(
        seq("val", $.qidentifier, "=", $.blockexpr),
        seq("val", $.qidentifier, ":", $.type, "=", $.blockexpr),
        seq("fun", $.qidentifier, $.opparams, $.bodyexpr),
        seq(
          optional($.controlmod),
          "ctl",
          $.qidentifier,
          $.opparams,
          $.bodyexpr,
        ),
        seq("return", "(", $.opparam, ")", $.bodyexpr),
      ),
    controlmod: (_) => choice("final", "raw"),
    opparams: ($) => seq("(", optional(commaSep1($.opparam)), ")"),
    opparam: ($) => seq($.paramid, optional(seq(":", $.type))),

    // Types
    tbinders: ($) => commaSep1($.tbinder),
    tbinder: ($) => seq($.varid, optional($.kannot)),
    typescheme: ($) =>
      seq(optional($.someforalls), $.tarrow, optional($.qualifier)),
    type: ($) =>
      seq(
        optional(seq("forall", $.typeparams)),
        $.tarrow,
        optional($.qualifier),
      ),
    someforalls: ($) =>
      choice(
        seq("some", $.typeparams, optional(seq("forall", $.typeparams))),
        seq("forall", $.typeparams),
      ),
    typeparams: ($) => seq("<", optional($.tbinders), ">"),
    qualifier: ($) => seq("with", "(", $.predicates, ")"),
    predicates: ($) => commaSep1($.predicate),
    predicate: ($) => $.typeapp,
    tarrow: ($) => seq($.tatomic, optional(seq("->", $.tresult))),
    tresult: ($) => seq($.tatomic, optional($.tbasic)),
    tatomic: ($) =>
      choice(
        $.tbasic,
        seq(
          "<",
          optional(seq($.targuments, optional(seq("|", $.tatomic)))),
          ">",
        ),
      ),
    tbasic: ($) =>
      choice(
        $.typeapp,
        seq("(", optional($.tparams), ")"),
        seq("[", $.anntype, "]"),
      ),
    typeapp: ($) =>
      seq($.typecon, optional(seq("<", optional($.targuments), ">"))),
    typecon: ($) =>
      choice(
        $.varid,
        $.qvarid,
        $.wildcard,
        seq("(", $.commas, ")"),
        seq("[", "]"),
        seq("(", "->", ")"),
      ),
    tparams: ($) => commaSep1($.tparam),
    tparam: ($) => seq(optional(seq($.identifier, ":")), $.anntype),
    targuments: ($) => commaSep1($.anntype),
    anntype: ($) => seq($.type, optional($.kannot)),

    // Kinds
    kannot: ($) => seq("::", $.kind),
    kind: ($) =>
      choice(
        seq("(", $.kinds, ")", "->", $.katom),
        seq($.katom, optional(seq("->", $.kind))),
      ),
    kinds: ($) => commaSep1($.kind),
    katom: ($) => $.conid,

    // Character classes
    _symbols: (_) => /[$%&*+@!\\^~=.\-:?|<>]+|\//,
    conid: ($) => alias(/[A-Z][a-zA-Z0-9_-]*'*/, $.id),
    id: (_) => /[a-z][a-zA-Z0-9_-]*'*/,
    escape: (_) =>
      token.immediate(
        /\\([nrt\\"']|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|U[0-9a-fA-F]{6})/,
      ),

    // Comments
    linecomment: (_) => /\/\/[^\n]+/,
    blockcomment: ($) =>
      seq("/*", repeat(choice(/[^*]|\*[^/]/, $.blockcomment)), "*/"),

    // Numbers
    float: (_) =>
      choice(
        /-?(0|[1-9](_?[0-9]+(_[0-9]+)*)?)((\.[0-9]+(_[0-9]+)*)?[eE][-+]?[0-9]+|\.[0-9]+(_[0-9]+)*)/,
        /-?0[xX][0-9a-fA-F]+(_[0-9a-fA-F]+)*((\.[0-9a-fA-F]+(_[0-9a-fA-F]+)*)?[pP][-+]?[0-9]+|\.[0-9a-fA-F]+(_[0-9a-fA-F]+)*)/,
      ),
    int: (_) =>
      choice(
        /-?(0|[1-9](_?[0-9]+(_[0-9]+)*)?)/,
        /-?0[xX][0-9a-fA-F]+(_[0-9a-fA-F]+)*/,
      ),

    // Identifiers and operators
    qconid: ($) => seq(repeat1(seq($.id, "/")), $.conid),
    qid: ($) => prec.right(seq(repeat1(seq($.id, "/")), $.id)),
    qidop: ($) => seq(repeat1(seq($.id, "/")), "(", $._symbols, ")"),
    idop: ($) => seq("(", $._symbols, ")"),
    op: ($) => $._symbols,
    wildcard: (_) => prec.right(seq("_", repeat(/[a-zA-Z0-9_-]/))),

    // String
    string: ($) =>
      choice(
        $._raw_string,
        seq(
          '"',
          repeat(choice(token.immediate(/[^\\"]/), $.escape)),
          token.immediate('"'),
        ),
      ),
    char: ($) =>
      seq(
        "'",
        choice(token.immediate(/[^\\']/), $.escape),
        token.immediate("'"),
      ),
  },
});

/**
 * Creates a rule to match one or more of the rules separated by a comma
 *
 * @param {Rule} rule
 *
 * @return {SeqRule}
 *
 */
function commaSep1(rule) {
  return seq(rule, repeat(seq(",", rule)));
}
