fun main() {
  // <- keyword.function
  // ^ function
  //    ^ punctuation.bracket
  //     ^ punctuation.bracket
  //       ^ punctuation.bracket
  val xs = [1,2,3,]
  // <- keyword.storage.type
  //  ^ variable
  //     ^ operator
  //       ^ punctuation.bracket
  //        ^ constant.numeric.integer
  //         ^ punctuation.delimiter
  //          ^ constant.numeric.integer
  //           ^ punctuation.delimiter
  //            ^ constant.numeric.integer
  //             ^ punctuation.delimiter
  //              ^ punctuation.bracket
  xs.length
  // <- variable
  //^ punctuation.delimiter
  // ^ variable.other.member
}
