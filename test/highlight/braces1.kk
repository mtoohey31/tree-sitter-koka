module foo
// <- keyword.control.import
//     ^ namespace

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

  fun helper()
  // <- keyword.function
  //  ^ function
  //        ^ punctuation.bracket
  //         ^ punctuation.bracket
    return ~!1
    // <- keyword.control.return
    //     ^ operator
    //      ^ operator
    //       ^ constant.numeric.integer
}


fun map(f,xs) {
  // <- keyword.function
  // ^ function
  //   ^ punctuation.bracket
  //    ^ variable.parameter
  //     ^ punctuation.delimiter
  //      ^ variable.parameter
  //        ^ punctuation.bracket
  //          ^ punctuation.bracket
  match(xs) {
    // <- keyword.control.conditional
    // ^ punctuation.bracket
    //  ^ variable.parameter
    //    ^ punctuation.bracket
    //      ^ punctuation.bracket
    Nil | n -> Nil
    // <- constructor
    //  ^ punctuation.delimiter
    //    ^ variable
    //      ^ punctuation.delimiter
    //         ^ constructor
    Cons(x,xx) -> { var y := f(x); val yy = map(f,xx); Cons(y,yy) }
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
    //                       ^ function
    //                        ^ punctuation.bracket
    //                          ^ punctuation.bracket
    //                           ^ punctuation.delimiter
    //                             ^ keyword.storage.type
    //                                 ^ variable
    //                                    ^ operator
    //                                      ^ function
    //                                         ^ punctuation.bracket
    //                                          ^ variable.parameter
    //                                           ^ punctuation.delimiter
    //                                            ^ variable
    //                                              ^ punctuation.bracket
    //                                               ^ punctuation.delimiter
    //                                                 ^ constructor
    //                                                     ^ punctuation.bracket
    //                                                      ^ variable
    //                                                       ^ punctuation.delimiter
    //                                                        ^ variable
    //                                                          ^ punctuation.bracket
  }
}
