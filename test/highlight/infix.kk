pub infixr 80  (^)
// <- keyword
//  ^ keyword
//         ^ constant.numeric.integer
//             ^ punctuation.bracket
//              ^ operator
//               ^ punctuation.bracket
pub infixl 70  (*), (%), (/), cdiv, cmod
// <- keyword
//  ^ keyword
//         ^ constant.numeric.integer
//             ^ punctuation.bracket
//              ^ operator
//               ^ punctuation.bracket
//                ^ punctuation.delimiter
//                  ^ punctuation.bracket
//                   ^ operator
//                    ^ punctuation.bracket
//                     ^ punctuation.delimiter
//                       ^ punctuation.bracket
//                        ^ operator
//                         ^ punctuation.bracket
//                          ^ punctuation.delimiter
//                            ^ variable
//                                ^ punctuation.delimiter
//                                  ^ variable
