/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "koka",
  externals: ($) => [$._open_brace, $._close_brace, $._semicolon],
  rules: {
    // 4.4. Context-free syntax

    // 4.4.1. Modules
    module: ($) =>
      seq(
        optional($.moduledecl),
        choice(
          seq(
            "{",
            repeat(";"),
            repeat($.importdecl),
            repeat($.fixitydecl),
            repeat($.topdecl),
            "}",
            repeat(";"),
          ),
          seq(
            repeat(";"),
            repeat($.importdecl),
            repeat($.fixitydecl),
            repeat($.topdecl),
          ),
        ),
      ),
    moduledecl: ($) => seq(repeat(";"), $.moduleid),
    moduleid: ($) => choice($.qvarid, $.varid),
    semi: (_) => seq(";", repeat(";")),

    // 4.4.2. Top level declarations
    importdecl: ($) =>
      seq(
        optional($.pub),
        "import",
        optional(seq($.moduleid, "=")),
        $.moduleid,
        $.semi,
      ),
    fixitydecl: ($) =>
      seq(
        optional($.pub),
        $.fixity,
        $.integer,
        $.identifier,
        repeat(seq(",", $.identifier)),
        $.semi,
      ),
    fixity: (_) => choice("infixl", "infixr", "infix"),
    topdecl: ($) =>
      choice(
        seq(optional($.pub), $.puredecl),
        seq(optional($.pub), $.aliasdecl),
        // TODO: Where is externdecl defined? `seq(optional($.pub), $.externdecl),`
        seq(optional($.pubabstract), $.typedecl),
        seq(optional($.pubabstract), $.effectdecl),
      ),
    pub: (_) => "pub",
    pubabstract: (_) => choice("pub", "abstract"),

    // 4.4.3. Type Declarations
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
          $.typemod,
          "type",
          $.typeid,
          optional($.typeparams),
          optional($.kannot),
          optional($.typebody),
        ),
        seq(
          $.structmod,
          "struct",
          $.typeid,
          optional($.typeparams),
          optional($.kannot),
          optional($.conparams),
        ),
      ),
    typemod: ($) => choice("co", "rec", "open", "extend", $.structmod),
    structmod: (_) => choice("value", "reference"),
    // TODO: Check this, what is the spec trying to say?
    typeid: ($) =>
      choice(
        $.varid,
        "[]",
        seq("(", repeat(","), ")"),
        seq("<", ">"),
        seq("<", "|", ">"),
      ),
    typeparams: ($) => seq("<", optional($.tbinders), ">"),
    tbinders: ($) => seq($.tbinder, repeat(seq(",", $.tbinder))),
    tbinder: ($) => seq($.varid, optional($.kannot)),
    typebody: ($) =>
      seq("{", repeat(";"), repeat(seq($.constructor_, $.semi)), "}"),
    constructor_: ($) =>
      seq(
        optional($.pub),
        optional("con"),
        $.conid,
        optional($.typeparams),
        optional($.conparams),
      ),
    conparams: ($) =>
      seq("{", repeat(";"), repeat(seq($.parameter, $.semi)), "}"),

    // 4.4.4. Value and Function Declarations
    puredecl: ($) =>
      choice(
        seq(optional($.inlinemod), "val", $.valdecl),
        seq(optional($.inlinemod), "fun", $.fundecl),
      ),
    inlinemod: (_) => choice("inline", "noinline"),
    valdecl: ($) => seq($.binder, "=", $.blockexpr),
    binder: ($) => seq($.identifier, optional(seq(":", $.type))),
    fundecl: ($) => seq($.funid, $.funbody),
    funbody: ($) => seq($.funparam, $.blockexpr),
    funparam: ($) =>
      seq(
        optional($.typeparams),
        $.pparameters,
        optional(seq(":", $.tresult)),
        $.qualifier,
      ),
    funid: ($) => choice($.identifier, seq("[", repeat(","), "]")),
    parameters: ($) =>
      seq("(", optional(seq($.parameter, repeat(seq(",", $.parameter)))), ")"),
    parameter: ($) =>
      seq(
        optional($.borrow),
        $.paramid,
        optional(seq(":", $.type)),
        optional(seq("=", $.expr)),
      ),
    pparameters: ($) =>
      seq(
        "(",
        optional(seq($.pparameter, repeat(seq(",", $.pparameter)))),
        ")",
      ),
    pparameter: ($) =>
      seq(
        optional($.borrow),
        $.pattern,
        optional(seq(":", $.type)),
        optional(seq("=", $.expr)),
      ),
    paramid: ($) => choice($.identifier, $.wildcard),
    borrow: (_) => "^",
    qidentifier: ($) =>
      choice(
        $.qvarid,
        // TODO: Where is qidop defined? `$.qidop,`
        $.identifier,
      ),
    identifier: ($) =>
      choice(
        $.varid,
        // TODO: Where is idop defined? `$.idop`
      ),
    qoperator: ($) => $.op,
    qconstructor: ($) => choice($.conid, $.qconid),

    // 4.4.5. Statements
    block: ($) => seq("{", repeat(";"), repeat(seq($.statement, $.semi)), "}"),
    statement: ($) =>
      choice(
        $.decl,
        $.withstat,
        seq($.withstat, "in", $.expr),
        $.returnexpr,
        $.basicexpr,
      ),
    decl: ($) =>
      choice(
        seq("fun", $.fundecl),
        seq("val", $.apattern, "=", $.blockexpr),
        seq("var", $.binder, ":=", $.blockexpr),
      ),

    // 4.4.6. Expressions
    blockexpr: ($) => $.expr,
    expr: ($) =>
      choice($.withexpr, $.block, $.returnexpr, $.valexpr, $.basicexpr),
    basicexpr: ($) =>
      choice($.ifexpr, $.fnexpr, $.matchexpr, $.handlerexpr, $.opexpr),
    ifexpr: ($) =>
      choice(
        seq(
          "if",
          $.ntlexpr,
          "then",
          $.blockexpr,
          repeat($.elif),
          optional(seq("else", $.blockexpr)),
        ),
        seq("if", $.ntlexpr, "return", $.expr),
      ),
    elif: ($) => seq("elif", $.ntlexpr, "then", $.blockexpr),
    matchexpr: ($) =>
      seq(
        "match",
        $.ntlexpr,
        "{",
        repeat(";"),
        repeat(seq($.matchrule, $.semi)),
        "}",
      ),
    returnexpr: ($) => seq("return", $.expr),
    fnexpr: ($) => seq("fn", $.funbody),
    valexpr: ($) => seq("val", $.apattern, "=", $.blockexpr, "in", $.expr),
    withexpr: ($) => seq($.withstat, "in", $.expr),
    withstat: ($) =>
      choice(
        seq($.withstat, "in", $.expr),
        seq("with", $.basicexpr),
        seq("with", $.binder, "<-", $.basicexpr),
        seq(
          "with",
          optional("override"),
          optional(seq("<", $.tbasic, ">")),
          $.opclause,
        ),
        seq(
          "with",
          $.binder,
          "<-",
          optional(seq("<", $.tbasic, ">")),
          $.opclause,
        ),
      ),

    // 4.4.7. Operator expressions
    opexpr: ($) => seq($.prefixexpr, repeat(seq($.qoperator, $.prefixexpr))),
    prefixexpr: ($) => seq(repeat(choice("!", "~")), $.appexpr),
    appexpr: ($) =>
      choice(
        seq($.appexpr, "(", optional($.arguments), ")"),
        seq($.appexpr, "[", optional($.arguments), "]"),
        seq($.appexpr, choice($.fnexpr, $.block)),
        seq($.appexpr, ".", $.atom),
        $.atom,
      ),
    ntlexpr: ($) =>
      seq($.ntlprefixexpr, repeat(seq($.qoperator, $.ntlprefixexpr))),
    ntlprefixexpr: ($) => seq(repeat(choice("!", "~")), $.ntlappexpr),
    ntlappexpr: ($) =>
      choice(
        seq($.ntlappexpr, "(", optional($.arguments), ")"),
        seq($.ntlappexpr, "[", optional($.arguments), "]"),
        seq($.ntlappexpr, ".", $.atom),
        $.atom,
      ),
    arguments: ($) => seq($.argument, repeat(seq(",", $.argument))),
    argument: ($) => seq(optional(seq($.identifier, "=")), $.expr),

    // 4.4.8. Atomic expressions
    atom: ($) =>
      choice(
        $.qidentifier,
        $.qconstructor,
        $.literal,
        $.mask,
        seq("(", ")"),
        seq("(", $.annexpr, ")"),
        seq("(", $.annexprs, ")"),
        seq(
          "[",
          optional(seq($.annexpr, repeat(seq(",", $.annexprs)), optional(","))),
          "]",
        ),
      ),
    literal: ($) =>
      choice(
        // TODO: Where is natural defined? `$.natural,`
        $.float,
        $.charlit,
        $.stringlit,
      ),
    mask: ($) => seq("mask", optional("behind"), "<", $.tbasic, ">"),
    annexprs: ($) => seq($.annexpr, repeat(seq(",", $.annexpr))),
    annexpr: ($) => seq($.expr, optional(seq(":", $.typescheme))),

    // 4.4.9. Matching
    matchrule: ($) =>
      seq($.patterns, optional(seq("|", $.expr)), "->", $.blockexpr),
    apattern: ($) => seq($.pattern, optional($.typescheme)),
    pattern: ($) =>
      choice(
        $.identifier,
        seq($.identifier, "as", $.apattern),
        seq($.qconstructor, optional(seq("(", optional($.patargs), ")"))),
        seq("(", optional($.apatterns), ")"),
        seq("[", optional($.apatterns), "]"),
        $.literal,
        $.wildcard,
      ),
    patterns: ($) => seq($.pattern, repeat(seq(",", $.pattern))),
    apatterns: ($) => seq($.apattern, repeat(seq(",", $.apattern))),
    patargs: ($) => seq($.patarg, repeat(seq(",", $.patarg))),
    patarg: ($) => seq(optional(seq($.identifier, "=")), $.apattern),

    // 4.4.10. Effect Declarations
    effectdecl: ($) =>
      choice(
        seq(
          optional($.named),
          optional("linear"),
          optional("rec"),
          "effect",
          $.varid,
          optional($.typeparams),
          optional($.kannot),
          optional($.opdecls),
        ),
        seq(
          "named",
          optional("linear"),
          optional("rec"),
          "effect",
          optional($.typeparams),
          optional($.kannot),
          $.opdecl,
        ),
        seq(
          $.named,
          optional("linear"),
          optional("rec"),
          "effect",
          $.varid,
          optional($.typeparams),
          optional($.kannot),
          "in",
          $.type,
          optional($.opdecls),
        ),
      ),
    named: (_) => "named",
    opdecls: ($) => seq("{", repeat(";"), repeat(seq($.opdecl, $.semi)), "}"),
    opdecl: ($) =>
      choice(
        seq(
          optional($.pub),
          "val",
          $.identifier,
          optional($.typeparams),
          ":",
          $.tatom,
        ),
        seq(
          optional($.pub),
          choice("fun", "ctl"),
          $.identifier,
          optional($.typeparams),
          $.parameters,
          ":",
          $.tatom,
        ),
      ),

    // 4.4.11. Handler Expressions
    handlerexpr: ($) =>
      choice(
        seq(
          optional("override"),
          "handler",
          optional(seq("<", $.tbasic, ">")),
          $.opclauses,
        ),
        seq(
          optional("override"),
          "handle",
          optional(seq("<", $.tbasic, ">")),
          "(",
          $.expr,
          ")",
          $.opclauses,
        ),
        seq("named", "handler", optional(seq("<", $.tbasic, ">")), $.opclauses),
        seq(
          "named",
          "handle",
          optional(seq("<", $.tbasic, ">")),
          "(",
          $.expr,
          ")",
          $.opclauses,
        ),
      ),
    opclauses: ($) =>
      seq("{", repeat(";"), repeat(seq($.opclausex, $.semi)), "}"),
    opclausex: ($) =>
      choice(
        $.opclause,
        seq("finally", $.blockexpr),
        seq("initially", "(", $.oparg, ")", $.blockexpr),
      ),
    opclause: ($) =>
      choice(
        seq("val", $.qidentifier, optional($.type), "=", $.blockexpr),
        seq("fun", $.qidentifier, $.opargs, $.blockexpr),
        seq(optional($.ctlmod), "ctl", $.qidentifier, $.opargs, $.blockexpr),
        seq("return", "(", $.oparg, ")", $.blockexpr),
      ),
    ctlmod: (_) => choice("final", "raw"),
    opargs: ($) =>
      seq("(", optional(seq($.oparg, repeat(seq(",", $.oparg)))), ")"),
    oparg: ($) => seq($.paramid, optional(seq(":", $.type))),

    // 4.4.12. Type schemes
    typescheme: ($) =>
      seq(
        optional(seq("some", $.typeparams)),
        optional(seq("forall", $.typeparams)),
        $.tarrow,
        optional($.qualifier),
      ),
    type: ($) =>
      seq(
        optional(seq("forall", $.typeparams)),
        $.tarrow,
        optional($.qualifier),
      ),
    qualifier: ($) => seq("with", "(", $.predicates, ")"),
    predicates: ($) => seq($.predicate, repeat(seq(",", $.predicate))),
    predicate: ($) => $.typeapp,

    // 4.4.13. Types
    tarrow: ($) => seq($.tatom, optional(seq("->", $.tresult))),
    tresult: ($) => seq($.tatom, optional($.tbasic)),
    tatom: ($) =>
      choice(
        $.tbasic,
        seq(
          "<",
          $.anntype,
          repeat(seq(",", $.anntype)),
          optional(seq("|", $.tatom)),
          ">",
        ),
        seq("<", ">"),
      ),
    tbasic: ($) =>
      choice(
        $.typeapp,
        seq("(", ")"),
        seq("(", $.tparam, ")"),
        seq($.tparam, repeat(seq(",", $.tparam))),
        seq("[", $.anntype, "]"),
      ),
    typeapp: ($) =>
      seq(
        $.typecon,
        optional(seq("<", $.anntype, repeat(seq(",", $.anntype)), ">")),
      ),
    typecon: ($) =>
      choice(
        $.varid,
        $.qvarid,
        $.wildcard,
        seq("(", ",", repeat(","), ")"),
        seq("[", "]"),
        seq("(", "->", ")"),
      ),
    tparam: ($) => seq(optional(seq($.varid, ":")), $.anntype),
    anntype: ($) => seq($.type, optional($.kannot)),

    // 4.4.14. Kinds
    kannot: ($) => seq("::", $.kind),
    kind: ($) =>
      choice(
        seq("(", $.kind, repeat(seq(",", $.kind)), ")", "->", $.kind),
        seq($.katom, "->", $.kind),
        $.katom,
      ),
    katom: (_) => choice("V", "X", "E", "H", "P", "S", "HX", "HX1"),

    // 4.2. Lexical grammar

    // 4.2.2. Identifiers
    qconid: ($) => seq($.modulepath, $.conid),
    qvarid: ($) => seq($.modulepath, $.lowerid),
    modulepath: ($) => seq($.lowerid, "/", repeat(seq($.lowerid, "/"))),
    conid: ($) => $.upperid,
    varid: ($) => $.lowerid, // TODO: !reserved
    lowerid: ($) => seq($.lower, seq(repeat($.idchar), repeat("'"))),
    upperid: ($) => seq($.upper, seq(repeat($.idchar), repeat("'"))),
    wildcard: ($) => seq("_", seq(repeat($.idchar), repeat("'"))),
    idchar: ($) => choice($.letter, $.digit, "_", "-"),

    // 4.2.3. Operators and symbols
    op: ($) => choice($.symbols, "||"), // TODO: !opreserved | optype
    symbols: ($) => choice(seq($.symbol, repeat($.symbol)), "|"),
    symbol: ($) =>
      choice(
        "$",
        "%",
        "&",
        "*",
        "+",
        "~",
        "!",
        "\\",
        "^",
        "#",
        "=",
        ".",
        ":",
        "-",
        "?",
        $.anglebar,
      ),
    anglebar: (_) => choice("<", ">", "|"),

    // 4.2.4. Literals
    // TODO: handle chars in stuff better
    charlit: ($) => seq("'", choice(/[^'\\]/, $.escape), "'"),
    stringlit: ($) => seq('"', repeat(choice(/[^"\\]/, $.escape)), '"'), // TODO: rawchars string literal
    escape: ($) => seq("\\", choice($.charesc, $.hexesc)),
    charesc: (_) => choice("n", "r", "t", "\\", '"', "'"),
    hexesc: ($) =>
      choice(
        seq("x", $.hexdigit, $.hexdigit),
        seq("u", $.hexdigit, $.hexdigit, $.hexdigit, $.hexdigit),
        seq(
          "U",
          $.hexdigit,
          $.hexdigit,
          $.hexdigit,
          $.hexdigit,
          $.hexdigit,
          $.hexdigit,
        ),
      ),
    float: ($) => seq(optional("-"), choice($.decfloat, $.hexfloat)),
    decfloat: ($) =>
      seq($.decimal, choice(seq(".", $.digits, optional($.decexp)), $.decexp)),
    decexp: ($) => seq(choice("e", "E"), $.exponent),
    hexfloat: ($) =>
      seq(
        $.hexadecimal,
        choice(".", $.hexdigits, optional($.hexexp), $.hexexp),
      ),
    hexexp: ($) => seq(choice("p", "P"), $.exponent),
    exponent: ($) => seq(optional(choice("-", "+")), $.digit, repeat($.digit)),
    integer: ($) => seq(optional("-"), choice($.decimal, $.hexadecimal)),
    decimal: ($) =>
      choice("0", seq($.posdigit, optional(seq(optional("_"), $.digits)))),
    hexadecimal: ($) => seq("0", choice("x", "X"), $.hexdigits),
    digits: ($) =>
      seq($.digit, repeat($.digit), repeat(seq("_", $.digit, repeat($.digit)))),
    hexdigits: ($) =>
      seq(
        $.hexdigit,
        repeat($.hexdigit),
        repeat(seq("_", $.hexdigit, repeat($.hexdigit))),
      ),

    // 4.2.6. Character classes
    letter: ($) => choice($.upper, $.lower),
    upper: (_) => /[A-Z]/,
    lower: (_) => /[a-z]/,
    digit: (_) => /[0-9]/,
    posdigit: (_) => /[1-9]/,
    hexdigit: (_) => /[a-fA-F0-9]/,
  },
});
