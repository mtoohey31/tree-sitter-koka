(block) @local.scope

(pattern
  (identifier
    (varid) @local.definition))

(decl
  (apattern
    (pattern
      (identifier
        (varid) @local.definition))))

(decl
  (binder
    (identifier
      (varid) @local.definition)))

(varid) @local.reference
