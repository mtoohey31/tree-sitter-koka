module foo/bar
// <- keyword.control.import
//     ^ namespace

import baz/quux
// <- keyword.control.import
//     ^ namespace

alias id<a> = a
// <- keyword.storage.type
//    ^ type
//      ^ punctuation.bracket
//       ^ type
//        ^ punctuation.bracket
//          ^ operator
//            ^ variable
