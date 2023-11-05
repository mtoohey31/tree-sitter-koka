type something
  // <- keyword.storage.type
  // ^ type
  Foo
  // <- constructor
  Bar(a, b)
  // <- constructor
  // ^ punctuation.bracket
  //  ^ variable.parameter
  //   ^ punctuation.delimiter
  //     ^ variable.parameter
  //      ^ punctuation.bracket
  Baz(x : xt, y : yt)
  // <- constructor
  // ^ punctuation.bracket
  //  ^ variable.parameter
  //    ^ punctuation.delimiter
  //      ^ type
  //        ^ punctuation.delimiter
  //          ^ variable.parameter
  //            ^ punctuation.delimiter
  //              ^ type
  //                ^ punctuation.bracket
