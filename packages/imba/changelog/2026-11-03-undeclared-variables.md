Parameter defaults that need their own variables work now. JavaScript evaluates a default in the parameter list, where the variables of the function body are not visible. The compiler declared the variables of a default in the body, so `def between v = 1 < calc! < 3` threw `ReferenceError: $1 is not defined` when the argument was omitted. The same happened with `delete`, a loop or `if let` in a default. A tag literal or a `switch` in a default gave invalid JavaScript, and a closure in a default, as in `def run cb = (do active)`, used an undeclared `self`. Each default now declares its own variables.

In the defaults of a `do` closure, a name now refers to a variable, not to a new parameter. So `do(a, b = a)` no longer reports `Cannot redeclare variable`, and `do(a, b = active)` reads `self.active`.

Field values that need their own variables also work now. `doubled = (for item in items then item * 2)` threw `ReferenceError` when an instance was created, and the same loop in a `static` field threw when the class was defined. The variables of static field values and decorator arguments are now declared in the `static {}` block of the class.

A `try` in an expression, as in `id(try 1 < count < 3 catch e no)`, also declares its variables now. Before, the `catch` caught the `ReferenceError`, so the expression gave the `catch` value without an error.

A loop or `switch` in an expression, as in `[(for item in items then item * 2)]`, now runs in an arrow function, so it uses the `self` of the method. Before, it ran in a plain function, where `self` is undefined, so reading a property of `self` threw `TypeError`.

The compiler now reports an error when its output uses a variable that it does not declare: `Compiler bug: the output uses '$1' but does not declare it`. Before, such output threw `ReferenceError` only when the code ran. A loop in a decorator argument and a temporary variable in a computed member name still have this problem. They now give this error when you compile, not when the class is defined.
