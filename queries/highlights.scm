; Follows helix precedence; order may need to be reversed for other editors.

; Operators

[
  (idop)
  (op)
  (qidop)
] @operator

; Keywords

; TODO: Split these up more if possible.
[
  (pub)
  "infix"
  "infixl"
  "infixr"
  "rec"

  ; specialid
  "co"
  "open"
  "extend"
  (behind)
  "linear"
  "value"
  "reference"
  "inline"
  "noinline"
  "initially"
  "finally"
  "c"
  "cs"
  ; "file"

  "as" ; pattern matching
  (con) ; type constructors
  "ctl" ; effect controls

  "extern"

  "final" ; controlmod

  "forall"
  "handle"
  "handler"
  "in"
  "mask"
  "named"
  (override)
  "raw"
  ; "scoped"
  "some"

] @keyword

[
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
] @keyword.storage.modifier

"return" @keyword.control.return

; Delimiters

; TODO: Look into how this interacts with operators.
[
  ","
  "->"
  "."
  ":"
  "::"
  ; TODO: ;
  "<-"
] @punctuation.delimiter

[
  "("
  ")"
  "["
  "]"
  ; TODO: "{"
  ; TODO: "}"
] @punctuation.bracket

; Literals

[
  (string)
  (char)
] @string

; TODO: (esc) @constant.character.escape

(float) @constant.numeric.float
(int) @constant.numeric.integer

; Comment

; TODO: (comment) @comment
