module foo/bar
// <- keyword.control.import
//     ^ namespace
//         ^ namespace

import baz/quux
// <- keyword.control.import
//     ^ namespace
//         ^ namespace

alias id<a> = a
// <- keyword.storage.type
//    ^ type
//      ^ punctuation.bracket
//       ^ type
//        ^ punctuation.bracket
//          ^ operator
//            ^ type

val x = baz/other/foo
// <- keyword.storage.type
//  ^ constant
//      ^ namespace
//          ^ namespace
//               ^ namespace
//                ^ namespace

val y = baz/Q(z)
// <- keyword.storage.type
//  ^ constant
//      ^ namespace
//         ^ namespace
//          ^ namespace
//           ^ punctuation.bracket
//            ^ variable
//             ^ punctuation.bracket

val y = baz/(++)
// <- keyword.storage.type
//  ^ constant
//      ^ namespace
//         ^ namespace
//          ^ namespace
//           ^ namespace
//             ^ namespace
