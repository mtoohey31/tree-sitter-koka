fun main() {
  // <- keyword.function
  // ^ function
  //    ^ punctuation.bracket
  //     ^ punctuation.bracket
  //       ^ punctuation.bracket
  print("hi");  print("world")
  // ^ function
  //   ^ punctuation.bracket
  //    ^ string
  //        ^ punctuation.bracket
  //         ^ punctuation.delimiter
  //            ^ function
  //                 ^ punctuation.bracket
  //                  ^ string
  //                         ^ punctuation.bracket
  print("!")
  // ^ function
  //   ^ punctuation.bracket
  //    ^ string
  //       ^ punctuation.bracket
}
// <- punctuation.bracket


fun map(f,xs) {
  // <- keyword.function
  // ^ function
  //   ^ punctuation.bracket
  //    ^ variable
  //     ^ punctuation.delimiter
  //      ^ variable
  //        ^ punctuation.bracket
  //          ^ punctuation.bracket
  match(xs) {
    // <- keyword.control.conditional
    // ^ punctuation.bracket
    //  ^ variable
    //    ^ punctuation.bracket
    //      ^ punctuation.bracket
    Nil -> Nil
    // <- constructor
    //  ^ punctuation.delimiter
    //     ^ constructor
    Cons(x,xx) -> { val y = f(x); val yy = map(f,xx); Cons(y,yy) }
    // <- constructor
    //  ^ punctuation.bracket
    //   ^ variable
    //    ^ punctuation.delimiter
    //     ^ variable
    //       ^ punctuation.bracket
    //         ^ punctuation.delimiter
    //            ^ punctuation.bracket
    //              ^ keyword.storage.type
    //                  ^ variable
    //                    ^ operator
    //                      ^ function
    //                       ^ punctuation.bracket
    //                        ^ variable
    //                         ^ punctuation.bracket
    //                          ^ punctuation.delimiter
    //                            ^ keyword.storage.type
    //                                ^ variable
    //                                   ^ operator
    //                                     ^ function
    //                                        ^ punctuation.bracket
    //                                         ^ variable
    //                                          ^ punctuation.delimiter
    //                                           ^ variable
    //                                             ^ punctuation.bracket
    //                                              ^ punctuation.delimiter
    //                                                ^ constructor
    //                                                    ^ punctuation.bracket
    //                                                     ^ variable
    //                                                      ^ punctuation.delimiter
    //                                                       ^ variable
    //                                                         ^ punctuation.bracket
    //                                                           ^ punctuation.bracket
  }
  // <- punctuation.bracket
}
// <- punctuation.bracket
