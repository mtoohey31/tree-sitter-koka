fun min-by-rec(l : list<a>, ordering : a -> float64, default : a, smallest : float64, result : a) : a
    match l
      Nil -> result
      Cons(x, tail) ->
        if ordering(x) < smallest then
          min-by-rec(tail, ordering, default, ordering(x), x)
          //               ^ variable.parameter
          //                         ^ variable.parameter
          //                                  ^ variable.parameter
        else
          min-by-rec(tail, ordering, default, smallest, result)
