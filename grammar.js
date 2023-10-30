/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "koka",
  externals: ($) => [
    $._open_brace,
    $._close_brace,
    $._semicolon,
    $._raw_string,
  ],
  rules: {
    // Program
    program: ($) =>
      seq(
        optional(seq(optional($.semis), "module", $.modulepath)),
        alias(
          choice(
            seq(
              $._open_brace,
              optional($.semis),
              alias(
                seq(
                  repeat(seq($.importdecl, $.semis1)),
                  repeat(seq($.fixitydecl, $.semis1)),
                  optional($.topdecls1),
                ),
                "modulebody",
              ),
              $._close_brace,
              optional($.semis),
            ),
            seq(
              optional($.semis),
              alias(
                seq(
                  repeat(seq($.importdecl, $.semis1)),
                  repeat(seq($.fixitydecl, $.semis1)),
                  optional($.topdecls1),
                ),
                "modulebody",
              ),
            ),
          ),
          "moduledecl",
        ),
      ),
    importdecl: ($) =>
      choice(
        seq(optional($.pub), "import", $.modulepath),
        seq(optional($.pub), "import", $.modulepath, "=", $.modulepath),
      ),
    modulepath: ($) => choice($.varid, $.qvarid),
    pub: (_) => "pub",
    semis1: ($) => choice(seq($.semis1, $.semi), $.semi),
    semis: ($) => seq(optional($.semis), $.semi),
    semi: ($) => $._semicolon,

    // Top level declarations
    fixitydecl: ($) => seq(optional($.pub), $.fixity, $.oplist1),
    fixity: ($) =>
      choice(seq("infix", $.int), seq("infixr", $.int), seq("infixl", $.int)),
    oplist1: ($) => choice(seq($.oplist1, ",", $.identifier), $.identifier),
    topdecls1: ($) =>
      choice(seq($.topdecls1, $.topdecl, $.semis1), seq($.topdecl, $.semis1)),
    topdecl: ($) =>
      choice(
        seq(optional($.pub), $.puredecl),
        seq(optional($.pub), $.aliasdecl),
        seq(optional($.pub), $.externdecl),
        seq(optional($.pub), $.typedecl),
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
          optional($.typeparams1),
          "(",
          optional($.parameters1),
          ")",
          optional($.annotres),
        ),
      ),
    externbody: ($) =>
      choice(
        seq($._open_brace, optional($.semis), $.externstats1, $._close_brace),
        seq($._open_brace, optional($.semis), $._close_brace),
      ),
    externstats1: ($) =>
      choice(
        seq($.externstats1, $.externstat, $.semis1),
        seq($.externstat, $.semis1),
      ),
    externstat: ($) =>
      choice(
        seq($.externtarget, optional($.externinline), $.string),
        seq(optional($.externinline), $.string),
      ),
    externinline: (_) => "inline",
    externimpbody: ($) =>
      choice(
        seq("=", $.externimp),
        seq($._open_brace, optional($.semis), $.externimps1, $._close_brace),
      ),
    externimps1: ($) =>
      choice(
        seq($.externimps1, $.externimp, $.semis1),
        seq($.externimp, $.semis1),
      ),
    externimp: ($) =>
      choice(
        seq($.externtarget, $.varid, $.string),
        seq($.externtarget, $._open_brace, $.externvals1, $._close_brace),
      ),
    externvals1: ($) =>
      choice(
        seq($.externvals1, $.externval, $.semis1),
        seq($.externval, $.semis1),
      ),
    externval: ($) => seq($.varid, "=", $.string),
    externtarget: (_) => choice("cs", "js", "c"),

    // Type declarations
    aliasdecl: ($) =>
      seq(
        "alias",
        $.typeid,
        optional($.typeparams1),
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
          optional($.typeparams1),
          optional($.kannot),
          optional($.typebody),
        ),
        seq(
          optional($.structmod),
          "struct",
          $.typeid,
          optional($.typeparams1),
          optional($.kannot),
          optional($.conparams),
        ),
        seq(
          optional($.effectmod),
          "effect",
          $.varid,
          optional($.typeparams1),
          optional($.kannot),
          $.opdecls,
        ),
        seq(
          optional($.effectmod),
          "effect",
          optional($.typeparams1),
          optional($.kannot),
          $.operation,
        ),
        seq(
          optional($.effectmod),
          "effect",
          $.varid,
          optional($.typeparams1),
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
        optional($.semis),
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
    commas: ($) => $.commas1,
    commas1: ($) => seq(optional($.commas), ","),
    constructors: ($) => seq($.constructors1, $.semis1),
    constructors1: ($) =>
      choice(seq($.constructors1, $.semis1, $.constructor), $.constructor),
    constructor: ($) =>
      choice(
        seq(
          optional($.pub),
          optional($.con),
          $.conid,
          optional($.typeparams1),
          optional($.conparams),
        ),
        seq(
          optional($.pub),
          optional($.con),
          $.string,
          optional($.typeparams1),
          optional($.conparams),
        ),
      ),
    con: (_) => "con",
    conparams: ($) =>
      choice(
        seq("(", $.parameters1, ")"),
        seq(
          $._open_brace,
          optional($.semis),
          optional($.sconparams),
          $._close_brace,
        ),
      ),
    sconparams: ($) => seq(optional($.sconparams), $.parameter, $.semis1),

    // Effect declarations
    opdecls: ($) =>
      seq(
        $._open_brace,
        optional($.semis),
        optional($.operations),
        $._close_brace,
      ),
    operations: ($) => seq(optional($.operations), $.operation, $.semis1),
    operation: ($) =>
      choice(
        seq(
          optional($.pub),
          "val",
          $.identifier,
          optional($.typeparams1),
          ":",
          $.tatomic,
        ),
        seq(
          optional($.pub),
          "fun",
          $.identifier,
          optional($.typeparams1),
          "(",
          optional($.parameters1),
          ")",
          ":",
          $.tatomic,
        ),
        seq(
          optional($.pub),
          "ctl",
          $.identifier,
          optional($.typeparams1),
          "(",
          optional($.parameters1),
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
      choice(
        seq(
          optional($.typeparams1),
          "(",
          optional($.pparameters1),
          ")",
          $.bodyexpr,
        ),
        seq(
          optional($.typeparams1),
          "(",
          optional($.pparameters1),
          ")",
          ":",
          $.tresult,
          optional($.qualifier),
          $.block,
        ),
      ),
    annotres: ($) => seq(":", $.tresult),

    // Statements
    block: ($) =>
      seq($._open_brace, optional($.semis), $.statements1, $._close_brace),
    statements1: ($) =>
      choice(
        seq($.statements1, $.statement, $.semis1),
        seq($.statement, $.semis1),
      ),
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
    bodyexpr: ($) => choice($.blockexpr, seq("->", $.blockexpr)),
    blockexpr: ($) => $.expr,
    expr: ($) =>
      choice($.withexpr, $.block, $.returnexpr, $.valexpr, $.basicexpr),
    basicexpr: ($) =>
      choice($.ifexpr, $.matchexpr, $.handlerexpr, $.fnexpr, $.opexpr),
    matchexpr: ($) => seq("match", $.ntlexpr),
    fnexpr: ($) => seq("fn", $.funbody),
    returnexpr: ($) => seq("return", $.expr),
    ifexpr: ($) =>
      choice(
        seq("if", $.ntlexpr, "then", $.blockexpr, $.elifs),
        seq("if", $.ntlexpr, "then", $.blockexpr),
        seq("if", $.ntlexpr, "return", $.expr),
      ),
    elifs: ($) =>
      choice(
        seq("elif", $.ntlexpr, "then", $.blockexpr, $.elifs),
        seq("else", $.blockexpr),
      ),
    valexpr: ($) => seq("val", $.apattern, "=", $.blockexpr, "in", $.expr),
    opexpr: ($) =>
      choice(seq($.opexpr, $.qoperator, $.prefixexpr), $.prefixexpr),
    prefixexpr: ($) =>
      choice(seq("!", $.prefixexpr), seq("~", $.prefixexpr), $.appexpr),
    appexpr: ($) =>
      choice(
        seq($.appexpr, "(", optional($.arguments1), ")"),
        seq($.appexpr, "[", optional($.arguments1), "]"),
        seq($.appexpr, ".", $.atom),
        seq($.appexpr, $.block),
        seq($.appexpr, $.fnexpr),
        $.atom,
      ),
    ntlexpr: ($) => $.ntlexpr,
    ntlopexpr: ($) =>
      choice(seq($.ntlopexpr, $.qoperator, $.ntlprefixexpr), $.ntlprefixexpr),
    ntlprefixexpr: ($) =>
      choice(
        seq("!", $.ntlprefixexpr),
        seq("~", $.ntlprefixexpr),
        $.ntlappexpr,
      ),
    ntlappexpr: ($) =>
      choice(
        seq($.ntlappexpr, "(", optional($.arguments1), ")"),
        seq($.ntlappexpr, "[", optional($.arguments1), "]"),
        seq($.ntlappexpr, ".", $.atom),
        $.atom,
      ),
    atom: ($) =>
      choice(
        $.qidentifier,
        $.qconstructor,
        $.literal,
        $.mask,
        seq("(", optional($.aexprs1), ")"),
        seq("[", optional($.cexprs), "]"),
      ),
    literal: ($) => choice($.int, $.float, $.char, $.string),
    mask: ($) => seq("mask", optional($.behind), "<", $.tbasic, ">"),
    behind: (_) => "behind",
    arguments1: ($) => choice(seq($.arguments1, ",", $.argument), $.argument),
    argument: ($) => choice($.expr, seq($.identifier, "=", $.expr)),
    parameters1: ($) =>
      choice(seq($.parameters1, ",", $.parameter), $.parameter),
    parameter: ($) =>
      choice(
        seq(optional($.borrow), $.paramid, ":", $.type),
        seq(optional($.borrow), $.paramid, ":", $.type, "=", $.expr),
      ),
    paramid: ($) => choice($.identifier, $.wildcard),
    borrow: (_) => "^",
    pparameters1: ($) =>
      choice(seq($.pparameters1, ",", $.pparameter), $.pparameter),
    pparameter: ($) =>
      choice(
        seq(optional($.borrow), $.pattern),
        seq(optional($.borrow), $.pattern, ":", $.type),
        seq(optional($.borrow), $.pattern, ":", $.type, "=", $.expr),
        seq(optional($.borrow), $.pattern, "=", $.expr),
      ),
    aexprs1: ($) => choice(seq($.aexprs1, ",", $.aexpr), $.aexpr),
    cexprs: ($) => choice($.cexprs0, seq(optional($.cexprs0), $.aexpr)),
    cexprs0: ($) => seq(optional($.cexprs0), $.aexpr, ","),
    aexpr: ($) => seq($.expr, optional($.annot)),
    annot: ($) => seq(":", $.typescheme),

    // Identifiers and operators
    qoperator: ($) => $.op,
    qidentifier: ($) => choice($.qvarid, $.qidop, $.identifier),
    identifier: ($) => choice($.varid, $.idop),
    qvarid: ($) => $.qid,
    varid: ($) =>
      choice(
        $.id,
        "c",
        "cs",
        "js",
        "file",
        "inline",
        "noinline",
        "open",
        "extend",
        "linear",
        "behind",
        "value",
        "reference",
        "scoped",
        "initially",
        "finally",
        "rec",
        "co",
      ),
    qconstructor: ($) => choice($.conid, $.qconid),

    // Matching
    matchrules: ($) => optional(seq($.matchrules1, $.semis1)),
    matchrules1: ($) =>
      choice(seq($.matchrules1, $.semis1, $.matchrule), $.matchrule),
    matchrule: ($) =>
      choice(
        seq($.patterns1, "|", $.expr, "->", $.blockexpr),
        seq($.patterns1, "->", $.blockexpr),
      ),
    patterns1: ($) => choice(seq($.patterns1, ",", $.pattern), $.pattern),
    apatterns1: ($) => choice(seq($.apatterns1, ",", $.apattern), $.apattern),
    apattern: ($) => seq($.pattern, optional($.annot)),
    pattern: ($) =>
      choice(
        $.identifier,
        seq($.identifier, "as", $.pattern),
        $.conid,
        seq($.conid, "(", optional($.patargs1), ")"),
        seq("(", optional($.apatterns1), ")"),
        seq("[", optional($.apatterns1), "]"),
        $.literal,
        $.wildcard,
      ),
    patargs1: ($) => choice(seq(optional($.patargs1), ",", $.patarg), $.patarg),
    patarg: ($) => choice(seq($.identifier, "=", $.apattern), $.apattern),

    // Handlers
    handlerexpr: ($) =>
      choice(
        seq(optional($.override), "handler", optional($.witheff), $.opclauses),
        seq(
          optional($.override),
          "handle",
          optional($.witheff),
          $.ntlexpr,
          $.opclauses,
        ),
        seq("named", "handler", optional($.witheff), $.opclauses),
        seq("named", "handle", optional($.witheff), $.ntlexpr, $.opclauses),
      ),
    override: (_) => "override",
    witheff: ($) => seq("<", $.anntype, ">"),
    withstat: ($) =>
      choice(
        seq("with", $.basicexpr),
        seq("with", $.binder, "<-", $.basicexpr),
        seq("with", optional($.override), optional($.witheff), $.opclause),
        seq("with", $.binder, "<-", optional($.witheff), $.opclause),
      ),
    withexpr: ($) => seq($.withstat, "in", $.blockexpr),
    opclauses: ($) =>
      choice(
        seq(
          $._open_brace,
          optional($.semis),
          $.opclauses1,
          $.semis1,
          $._close_brace,
        ),
        seq($._open_brace, optional($.semis), $._close_brace),
      ),
    opclauses1: ($) =>
      choice(seq($.opclauses1, $.semis1, $.opclausex), $.opclausex),
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
    opparams: ($) => seq("(", optional($.opparams1), ")"),
    opparams1: ($) => choice(seq($.opparams1, ",", $.opparam), $.opparam),
    opparam: ($) => choice($.paramid, seq($.paramid, ":", $.type)),

    // Types
    tbinders1: ($) => choice(seq($.tbinders1, ",", $.tbinder), $.tbinder),
    tbinder: ($) => seq($.varid, optional($.kannot)),
    typescheme: ($) =>
      seq(optional($.someforalls), $.tarrow, optional($.qualifier)),
    type: ($) =>
      choice(
        seq("forall", $.typeparams1, $.tarrow, optional($.qualifier)),
        seq($.tarrow, optional($.qualifier)),
      ),
    someforalls: ($) =>
      choice(
        seq("some", $.typeparams1, "forall", $.typeparams1),
        seq("some", $.typeparams1),
        seq("forall", $.typeparams1),
      ),
    typeparams1: ($) => seq("<", optional($.tbinders1), ">"),
    qualifier: ($) => seq("with", "(", $.predicates1, ")"),
    predicates1: ($) =>
      choice(seq($.predicates1, ",", $.predicate), $.predicate),
    predicate: ($) => $.typeapp,
    tarrow: ($) => choice(seq($.tatomic, "->", $.tresult), $.tatomic),
    tresult: ($) => choice(seq($.tatomic, $.tbasic), $.tatomic),
    tatomic: ($) =>
      choice(
        $.tbasic,
        seq("<", $.targuments1, "|", $.tatomic, ">"),
        seq("<", optional($.targuments1), ">"),
      ),
    tbasic: ($) =>
      choice(
        $.typeapp,
        seq("(", optional($.tparams1), ")"),
        seq("[", $.anntype, "]"),
      ),
    typeapp: ($) =>
      choice($.typecon, seq($.typecon, "<", optional($.targuments1), ">")),
    typecon: ($) =>
      choice(
        $.varid,
        $.qvarid,
        $.wildcard,
        seq("(", $.commas1, ")"),
        seq("[", "]"),
        seq("(", "->", ")"),
      ),
    tparams1: ($) => choice(seq($.tparams1, ",", $.tparam), $.tparam),
    tparam: ($) => choice(seq($.identifier, ":", $.anntype), $.anntype),
    targuments1: ($) => choice(seq($.targuments1, ",", $.anntype), $.anntype),
    anntype: ($) => seq($.type, optional($.kannot)),

    // Kinds
    kannot: ($) => seq("::", $.kind),
    kind: ($) =>
      choice(
        seq("(", $.kinds1, ")", "->", $.katom),
        seq($.katom, "->", $.kind),
        $.katom,
      ),
    kinds1: ($) => choice(seq($.kinds1, ",", $.kind), $.kind),
    katom: ($) => $.conid,

    // Character classes
    symbols: ($) => choice(repeat1($.symbol), "/"),
    symbol: (_) =>
      choice(
        "$",
        "%",
        "&",
        "*",
        "+",
        "@",
        "!",
        "\\",
        "^",
        "~",
        "=",
        ".",
        "-",
        ":",
        "?",
        "|",
        "<",
        ">",
      ),
    anglebar: (_) => choice("<", ">", "|"),
    angle: (_) => choice("<", ">"),
    sign: (_) => "-",
    conid: ($) => seq($.upper, repeat($.idchar), repeat($.final)),
    id: ($) => seq($.lower, repeat($.idchar), repeat($.final)),
    idchar: ($) => choice($.letter, $.digit, "_", "-"),
    hexesc: ($) =>
      choice(
        seq("x", $.hex, $.hex),
        seq("u", $.hex, $.hex, $.hex, $.hex),
        seq("U", $.hex, $.hex, $.hex, $.hex, $.hex, $.hex),
      ),
    charesc: (_) => choice("n", "r", "t", "\\", '"', "'"),
    decimal: ($) =>
      choice("0", seq(/[1-9]/, optional(seq(optional("_"), $.digits)))),
    hexadecimal: ($) => seq("0", choice("x", "X"), $.hexdigits),
    digits: ($) => seq(repeat1($.digit), repeat($.digitsep)),
    hexdigits: ($) => seq(repeat1($.hex), repeat($.hexsep)),
    digitsep: ($) => seq("_", repeat1($.digit)),
    hexsep: ($) => seq("_", repeat1($.hex)),
    letter: ($) => choice($.lower, $.upper),
    upper: (_) => /[A-Z]/,
    lower: (_) => /[a-z]/,
    digit: (_) => /[0-9]/,
    hex: (_) => /[0-9a-fA-F]/,
    space: (_) => /[ \t]/,
    newline: (_) => /\r?\n/,
    final: (_) => "'",
    graphicchar: (_) => /[ \x21-\x26\x28-\[\]-\x7E]/,
    graphicstr: (_) => /[ \x21\x23-\[\]-\x7E]/,
    uc: (_) => /[\x80-\xBF]/,
    u2: ($) => seq(/[\xC2-\xDF]/, $.uc),
    u3: ($) =>
      choice(
        seq(/[\xE0][\xA0-\xBF]/, $.uc),
        seq(/[\xE1-\xEC]/, $.uc, $.uc),
        seq(/[\xED][\x80-\x9F]/, $.uc),
        seq(/[\xEE-\xEF]/, $.uc, $.uc),
      ),
    u4: ($) =>
      choice(
        seq(/[\xF0][\x90-\xBF]/, $.uc),
        seq(/[\xF1-\xF3]/, $.uc, $.uc, $.uc),
        seq(/[\xF4][\x80-\x8F]/, $.uc, $.uc),
      ),
    utf8: ($) => choice($.u2, $.u3, $.u4),

    // Numbers
    float: ($) =>
      choice(
        seq(
          optional($.sign),
          $.decimal,
          ".",
          $.digits,
          choice("e", "E"),
          optional(choice("-", "+")),
          repeat1($.digit),
        ),
        seq(
          optional($.sign),
          $.decimal,
          choice("e", "E"),
          optional(choice("-", "+")),
          repeat1($.digit),
        ),
        seq(optional($.sign), $.decimal, ".", $.digits),
        seq(
          optional($.sign),
          $.hexadecimal,
          ".",
          $.hexdigits,
          choice("p", "P"),
          optional(choice("-", "+")),
          repeat1($.digit),
        ),
        seq(
          optional($.sign),
          $.hexadecimal,
          choice("p", "P"),
          optional(choice("-", "+")),
          repeat1($.digit),
        ),
        seq(optional($.sign), $.hexadecimal, ".", $.hexdigits),
      ),
    int: ($) =>
      choice(
        seq(optional($.sign), $.hexadecimal),
        seq(optional($.sign), $.decimal),
      ),

    // Identifiers and operators
    qconid: ($) => seq(repeat1(seq($.id, "/")), $.conid),
    qid: ($) => seq(repeat1(seq($.id, "/")), $.id),
    qidop: ($) => seq(repeat1(seq($.id, "/")), "(", $.symbols, ")"),
    idop: ($) => seq("(", $.symbols, ")"),
    op: ($) => $.symbols,
    wildcard: ($) => seq("_", repeat($.idchar)),

    // String
    string: ($) =>
      choice(
        $._raw_string,
        seq(
          '"',
          repeat(
            choice(
              $.graphicstr,
              seq("\\", $.hexesc),
              seq("\\", $.charesc),
              $.utf8,
            ),
          ),
          '"',
        ),
      ),
    char: ($) =>
      choice(
        seq("'", $.graphicchar, "'"),
        seq("'", "\\", $.hexesc, "'"),
        seq("'", "\\", $.charesc, "'"),
        seq("'", $.utf8, "'"),
      ),
  },
});
