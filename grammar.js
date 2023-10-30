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
      choice(seq($.semis, "module", $.modulepath, $.moduledecl), $.moduledecl),
    moduledecl: ($) =>
      choice(
        seq($._open_brace, $.semis, $.modulebody, $._close_brace, $.semis),
        seq($.semis, $.modulebody),
      ),
    modulebody: ($) =>
      choice(seq($.importdecl, $.semis1, $.modulebody), $.declarations),
    importdecl: ($) =>
      choice(
        seq($.pub, "import", $.modulepath),
        seq($.pub, "import", $.modulepath, "=", $.modulepath),
      ),
    modulepath: ($) => choice($.varid, $.qvarid),
    pub: (_) => optional("pub"),
    semis1: ($) => choice(seq($.semis1, $.semi), $.semi),
    semis: ($) => optional(seq($.semis, $.semi)),
    semi: ($) => $._semicolon,

    // Top level declarations
    declarations: ($) =>
      choice(seq($.fixitydecl, $.semis1, $.declarations), $.topdecls),
    fixitydecl: ($) => seq($.pub, $.fixity, $.oplist1),
    fixity: ($) =>
      choice(seq("infix", $.int), seq("infixr", $.int), seq("infixl", $.int)),
    oplist1: ($) => choice(seq($.oplist1, ",", $.identifier), $.identifier),
    topdecls: ($) => optional($.topdecls1),
    topdecls1: ($) =>
      choice(seq($.topdecls1, $.topdecl, $.semis1), seq($.topdecl, $.semis1)),
    topdecl: ($) =>
      choice(
        seq($.pub, $.puredecl),
        seq($.pub, $.aliasdecl),
        seq($.pub, $.externdecl),
        seq($.pub, $.typedecl),
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
        seq($.typeparams, "(", $.parameters, ")", $.annotres),
      ),
    externbody: ($) =>
      choice(
        seq($._open_brace, $.semis, $.externstats1, $._close_brace),
        seq($._open_brace, $.semis, $._close_brace),
      ),
    externstats1: ($) =>
      choice(
        seq($.externstats1, $.externstat, $.semis1),
        seq($.externstat, $.semis1),
      ),
    externstat: ($) =>
      choice(
        seq($.externtarget, $.externinline, $.string),
        seq($.externinline, $.string),
      ),
    externinline: (_) => optional("inline"),
    externimpbody: ($) =>
      choice(
        seq("=", $.externimp),
        seq($._open_brace, $.semis, $.externimps1, $._close_brace),
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
      seq("alias", $.typeid, $.typeparams, $.kannot, "=", $.type),
    typedecl: ($) =>
      choice(
        seq($.typemod, "type", $.typeid, $.typeparams, $.kannot, $.typebody),
        seq(
          $.structmod,
          "struct",
          $.typeid,
          $.typeparams,
          $.kannot,
          $.conparams,
        ),
        seq($.effectmod, "effect", $.varid, $.typeparams, $.kannot, $.opdecls),
        seq($.effectmod, "effect", $.typeparams, $.kannot, $.operation),
        seq(
          $.effectmod,
          "effect",
          $.varid,
          $.typeparams,
          $.kannot,
          "in",
          $.type,
          $.opdecls,
        ),
      ),
    typemod: ($) => choice($.structmod, "open", "extend", "co", "rec"),
    structmod: (_) => optional(choice("value", "reference")),
    effectmod: (_) => optional(choice("rec", "linear", seq("linear", "rec"))),
    typebody: ($) =>
      optional(seq($._open_brace, $.semis, $.constructors, $._close_brace)),
    typeid: ($) =>
      choice(
        seq("(", $.commas, ")"),
        seq("[", "]"),
        seq("<", ">"),
        seq("<", "|", ">"),
        $.varid,
      ),
    commas: ($) => optional($.commas1),
    commas1: ($) => seq($.commas, ","),
    constructors: ($) => optional(seq($.constructors1, $.semis1)),
    constructors1: ($) =>
      choice(seq($.constructors1, $.semis1, $.constructor), $.constructor),
    constructor: ($) =>
      choice(
        seq($.pub, $.con, $.conid, $.typeparams, $.conparams),
        seq($.pub, $.con, $.string, $.typeparams, $.conparams),
      ),
    con: (_) => optional("con"),
    conparams: ($) =>
      optional(
        choice(
          seq("(", $.parameters1, ")"),
          seq($._open_brace, $.semis, $.sconparams, $._close_brace),
        ),
      ),
    sconparams: ($) => optional(seq($.sconparams, $.parameter, $.semis1)),

    // Effect declarations
    opdecls: ($) => seq($._open_brace, $.semis, $.operations, $._close_brace),
    operations: ($) => optional(seq($.operations, $.operation, $.semis1)),
    operation: ($) =>
      choice(
        seq($.pub, "val", $.identifier, $.typeparams, ":", $.tatomic),
        seq(
          $.pub,
          "fun",
          $.identifier,
          $.typeparams,
          "(",
          $.parameters,
          ")",
          ":",
          $.tatomic,
        ),
        seq(
          $.pub,
          "ctl",
          $.identifier,
          $.typeparams,
          "(",
          $.parameters,
          ")",
          ":",
          $.tatomic,
        ),
      ),

    // Pure (top-level) Declarations
    puredecl: ($) =>
      choice(
        seq($.inlinemod, "val", $.binder, "=", $.blockexpr),
        seq($.inlinemod, "fun", $.funid, $.funbody),
      ),
    inlinemod: (_) => optional(choice("inline", "noinline")),
    fundecl: ($) => seq($.funid, $.funbody),
    binder: ($) => choice($.identifier, seq($.identifier, ":", $.type)),
    funid: ($) => choice($.identifier, seq("[", $.commas, "]"), $.string),
    funbody: ($) =>
      choice(
        seq($.typeparams, "(", $.pparameters, ")", $.bodyexpr),
        seq(
          $.typeparams,
          "(",
          $.pparameters,
          ")",
          ":",
          $.tresult,
          $.qualifier,
          $.block,
        ),
      ),
    annotres: ($) => optional(seq(":", $.tresult)),

    // Statements
    block: ($) => seq($._open_brace, $.semis, $.statements1, $._close_brace),
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
        seq($.appexpr, "(", $.arguments, ")"),
        seq($.appexpr, "[", $.arguments, "]"),
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
        seq($.ntlappexpr, "(", $.arguments, ")"),
        seq($.ntlappexpr, "[", $.arguments, "]"),
        seq($.ntlappexpr, ".", $.atom),
        $.atom,
      ),
    atom: ($) =>
      choice(
        $.qidentifier,
        $.qconstructor,
        $.literal,
        $.mask,
        seq("(", $.aexprs, ")"),
        seq("[", $.cexprs, "]"),
      ),
    literal: ($) => choice($.int, $.float, $.char, $.string),
    mask: ($) => seq("mask", $.behind, "<", $.tbasic, ">"),
    behind: (_) => optional("behind"),
    arguments: ($) => optional($.arguments1),
    arguments1: ($) => choice(seq($.arguments1, ",", $.argument), $.argument),
    argument: ($) => choice($.expr, seq($.identifier, "=", $.expr)),
    parameters: ($) => optional($.parameters1),
    parameters1: ($) =>
      choice(seq($.parameters1, ",", $.parameter), $.parameter),
    parameter: ($) =>
      choice(
        seq($.borrow, $.paramid, ":", $.type),
        seq($.borrow, $.paramid, ":", $.type, "=", $.expr),
      ),
    paramid: ($) => choice($.identifier, $.wildcard),
    borrow: (_) => optional("^"),
    pparameters: ($) => optional($.pparameters1),
    pparameters1: ($) =>
      choice(seq($.pparameters1, ",", $.pparameter), $.pparameter),
    pparameter: ($) =>
      choice(
        seq($.borrow, $.pattern),
        seq($.borrow, $.pattern, ":", $.type),
        seq($.borrow, $.pattern, ":", $.type, "=", $.expr),
        seq($.borrow, $.pattern, "=", $.expr),
      ),
    aexprs: ($) => optional($.aexprs1),
    aexprs1: ($) => choice(seq($.aexprs1, ",", $.aexpr), $.aexpr),
    cexprs: ($) => choice($.cexprs0, seq($.cexprs0, $.aexpr)),
    cexprs0: ($) => optional(seq($.cexprs0, $.aexpr, ",")),
    aexpr: ($) => seq($.expr, $.annot),
    annot: ($) => optional(seq(":", $.typescheme)),

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
    apatterns: ($) => optional($.apatterns1),
    apatterns1: ($) => choice(seq($.apatterns1, ",", $.apattern), $.apattern),
    apattern: ($) => seq($.pattern, $.annot),
    pattern: ($) =>
      choice(
        $.identifier,
        seq($.identifier, "as", $.pattern),
        $.conid,
        seq($.conid, "(", $.patargs, ")"),
        seq("(", $.apatterns, ")"),
        seq("[", $.apatterns, "]"),
        $.literal,
        $.wildcard,
      ),
    patargs: ($) => optional($.patargs1),
    patargs1: ($) => choice(seq($.patargs, ",", $.patarg), $.patarg),
    patarg: ($) => choice(seq($.identifier, "=", $.apattern), $.apattern),

    // Handlers
    handlerexpr: ($) =>
      choice(
        seq($.override, "handler", $.witheff, $.opclauses),
        seq($.override, "handle", $.witheff, $.ntlexpr, $.opclauses),
        seq("named", "handler", $.witheff, $.opclauses),
        seq("named", "handle", $.witheff, $.ntlexpr, $.opclauses),
      ),
    override: (_) => optional("override"),
    witheff: ($) => optional(seq("<", $.anntype, ">")),
    withstat: ($) =>
      choice(
        seq("with", $.basicexpr),
        seq("with", $.binder, "<-", $.basicexpr),
        seq("with", $.override, $.witheff, $.opclause),
        seq("with", $.binder, "<-", $.witheff, $.opclause),
      ),
    withexpr: ($) => seq($.withstat, "in", $.blockexpr),
    opclauses: ($) =>
      choice(
        seq($._open_brace, $.semis, $.opclauses1, $.semis1, $._close_brace),
        seq($._open_brace, $.semis, $._close_brace),
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
        seq($.controlmod, "ctl", $.qidentifier, $.opparams, $.bodyexpr),
        seq("return", "(", $.opparam, ")", $.bodyexpr),
      ),
    controlmod: (_) => optional(choice("final", "raw")),
    opparams: ($) => seq("(", $.opparams0, ")"),
    opparams0: ($) => optional($.opparams1),
    opparams1: ($) => choice(seq($.opparams1, ",", $.opparam), $.opparam),
    opparam: ($) => choice($.paramid, seq($.paramid, ":", $.type)),

    // Types
    tbinders: ($) => optional($.tbinders1),
    tbinders1: ($) => choice(seq($.tbinders1, ",", $.tbinder), $.tbinder),
    tbinder: ($) => seq($.varid, $.kannot),
    typescheme: ($) => seq($.someforalls, $.tarrow, $.qualifier),
    type: ($) =>
      choice(
        seq("forall", $.typeparams1, $.tarrow, $.qualifier),
        seq($.tarrow, $.qualifier),
      ),
    someforalls: ($) =>
      optional(
        choice(
          seq("some", $.typeparams1, "forall", $.typeparams1),
          seq("some", $.typeparams1),
          seq("forall", $.typeparams1),
        ),
      ),
    typeparams: ($) => optional($.typeparams1),
    typeparams1: ($) => seq("<", $.tbinders, ">"),
    qualifier: ($) => optional(seq("with", "(", $.predicates1, ")")),
    predicates1: ($) =>
      choice(seq($.predicates1, ",", $.predicate), $.predicate),
    predicate: ($) => $.typeapp,
    tarrow: ($) => choice(seq($.tatomic, "->", $.tresult), $.tatomic),
    tresult: ($) => choice(seq($.tatomic, $.tbasic), $.tatomic),
    tatomic: ($) =>
      choice(
        $.tbasic,
        seq("<", $.targuments1, "|", $.tatomic, ">"),
        seq("<", $.targuments, ">"),
      ),
    tbasic: ($) =>
      choice($.typeapp, seq("(", $.tparams, ")"), seq("[", $.anntype, "]")),
    typeapp: ($) => choice($.typecon, seq($.typecon, "<", $.targuments, ">")),
    typecon: ($) =>
      choice(
        $.varid,
        $.qvarid,
        $.wildcard,
        seq("(", $.commas1, ")"),
        seq("[", "]"),
        seq("(", "->", ")"),
      ),
    tparams: ($) => optional($.tparams1),
    tparams1: ($) => choice(seq($.tparams1, ",", $.tparam), $.tparam),
    tparam: ($) => choice(seq($.identifier, ":", $.anntype), $.anntype),
    targuments: ($) => optional($.targuments1),
    targuments1: ($) => choice(seq($.targuments1, ",", $.anntype), $.anntype),
    anntype: ($) => seq($.type, $.kannot),

    // Kinds
    kannot: ($) => optional(seq("::", $.kind)),
    kind: ($) =>
      choice(
        seq("(", $.kinds1, ")", "->", $.katom),
        seq($.katom, "->", $.kind),
        $.katom,
      ),
    kinds1: ($) => choice(seq($.kinds1, ",", $.kind), $.kind),
    katom: ($) => $.conid,

    // Character classes
    symbols: ($) => choice(repeat($.symbol), "/"),
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
    sign: (_) => optional("-"),
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
          $.sign,
          $.decimal,
          ".",
          $.digits,
          choice("e", "E"),
          optional(choice("-", "+")),
          repeat1($.digit),
        ),
        seq(
          $.sign,
          $.decimal,
          choice("e", "E"),
          optional(choice("-", "+")),
          repeat1($.digit),
        ),
        seq($.sign, $.decimal, ".", $.digits),
        seq(
          $.sign,
          $.hexadecimal,
          ".",
          $.hexdigits,
          choice("p", "P"),
          optional(choice("-", "+")),
          repeat1($.digit),
        ),
        seq(
          $.sign,
          $.hexadecimal,
          choice("p", "P"),
          optional(choice("-", "+")),
          repeat1($.digit),
        ),
        seq($.sign, $.hexadecimal, ".", $.hexdigits),
      ),
    int: ($) => choice(seq($.sign, $.hexadecimal), seq($.sign, $.decimal)),

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
