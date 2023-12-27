pub effect each
  // <- keyword
  // ^ keyword.storage.type
  //       ^ type
  ctl each(elems : list<a>) : a
  // <- keyword.function
  //  ^ function
  //      ^ punctuation.bracket
  //       ^ variable.parameter
  //             ^ punctuation.delimiter
  //               ^ type
  //                   ^ punctuation.bracket
  //                    ^ type
  //                     ^ punctuation.bracket
  //                      ^ punctuation.bracket
  //                        ^ punctuation.delimiter
  //                          ^ type
  ctl fail() : a
  // <- keyword.function
  //  ^ function
  //      ^ punctuation.bracket
  //       ^ punctuation.bracket
  //         ^ punctuation.delimiter
  //           ^ type

pub fun guard(pred : bool) : each ()
  // <- keyword
  // ^ keyword.function
  //    ^ function
  //         ^ punctuation.bracket
  //          ^ variable.parameter
  //               ^ punctuation.delimiter
  //                 ^ type
  //                     ^ punctuation.bracket
  //                       ^ punctuation.delimiter
  //                         ^ type
  //                              ^ punctuation.bracket
  //                               ^ punctuation.bracket
  if pred then () else fail()
  // <- keyword.control.conditional
  // ^ variable.parameter
  //      ^ keyword.control.conditional
  //           ^ punctuation.bracket
  //            ^ punctuation.bracket
  //              ^ keyword.control.conditional
  //                   ^ function
  //                       ^ punctuation.bracket
  //                        ^ punctuation.bracket

pub effect final ctl raise(msg : string) : ()
// <- keyword
//  ^ keyword.storage.type
//         ^ keyword.storage.modifier
//               ^ keyword.function
//                   ^ function
//                        ^ punctuation.bracket
//                         ^ variable.parameter
//                             ^ punctuation.delimiter
//                               ^ type
//                                     ^ punctuation.bracket
//                                       ^ punctuation.delimiter
//                                         ^ punctuation.bracket
//                                          ^ punctuation.bracket
