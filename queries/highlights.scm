; Follows helix precedence; order may need to be reversed for other editors.

; Function calls

(appexpr
  function: (appexpr
    (atom
      (qidentifier
        [
          (qvarid)
          (qidop)
          (identifier
            [(varid) (idop)] @function)
        ] @function))))

(ntlappexpr
  function: (ntlappexpr
    (atom
      (qidentifier
        [
          (qvarid)
          (qidop)
          (identifier
            [(varid) (idop)] @function)
        ] @function))))

(appexpr
  field: (atom
    (qidentifier
      [
        (qvarid)
        (qidop)
        (identifier
          [(varid) (idop)] @function)
      ] @function)))

(ntlappexpr
  field: (atom
    (qidentifier
      [
        (qvarid)
        (qidop)
        (identifier
          [(varid) (idop)] @function)
      ] @function)))

[
  "initially"
  "finally"
] @function.special

; Function definitions

(puredecl
  (funid
    (identifier
      [(varid) (idop)] @function)))

(fundecl
  (funid
    (identifier
      [(varid) (idop)] @function)))

(operation
  (identifier
    [(varid) (idop)] @function))

; Identifiers

(puredecl
  (binder
    (identifier
      [(varid) (idop)] @constant)))

; TODO: Highlight vars differently once helix has an appropriate highlight query
; for that purpose.

(pparameter
  (pattern
    (identifier
      (varid) @variable.parameter)))

(paramid
  (identifier
    (varid) @variable.parameter))

(typeid
  (varid) @type)

(tbinder
  (varid) @type)

(typecon
  (varid) @type)

(qvarid
  (qid) @namespace)

(modulepath (varid) @namespace)

(qconid) @namespace

(qidop) @namespace

(varid) @variable

(conid) @constructor

; Operators

[
  "!"
  "~"
  "="
  ":="
  (idop)
  (op)
  (qidop)
] @operator

; Keywords

[
  "as"
  "behind"
  (externtarget)
  "forall"
  "handle"
  "handler"
  "in"
  "infix"
  "infixl"
  "infixr"
  "mask"
  "pub"
  "some"
] @keyword

[
  "con"
  "ctl"
  "fn"
  "fun"
] @keyword.function

"with" @keyword.control

[
  "elif"
  "else"
  "if"
  "match"
  "then"
] @keyword.control.conditional

[
  "import"
  "module"
] @keyword.control.import

[
  "alias"
  "effect"
  "struct"
  "type"
  "val"
  "var"
] @keyword.storage.type

[
  "abstract"
  "co"
  "extend"
  "extern"
  "fbip"
  "final"
  "fip"
  "inline"
  "linear"
  "named"
  "noinline"
  "open"
  "override"
  "raw"
  "rec"
  "reference"
  "scoped"
  "tail"
  "value"
] @keyword.storage.modifier

"return" @keyword.control.return

; Delimiters

(matchrule "|" @punctuation.delimiter)

[
  ","
  "->"
  "."
  ":"
  "::"
  "<-"
  ";"
] @punctuation.delimiter

[
  "<"
  ">"
  "("
  ")"
  "["
  "]"
  "{"
  "}"
] @punctuation.bracket

; Literals

[
  (string)
  (char)
] @string

(escape) @constant.character.escape

(float) @constant.numeric.float
(int) @constant.numeric.integer

; Comment

[
  (linecomment)
  (blockcomment)
] @comment
