The compiler now warns about a `let` or `const` that a postfix `if` or `unless` guards, as in `let asset = source.asset if source`. The declaration is only available inside the `if`, so the code after the line cannot read the variable. A later `asset` in a method reads `self.asset`, and in a function it reads a global, without an error. Declare the variable on the line before the `if` and assign it in the `if`.

In the output for tsc, a typed `if let x\string = y` no longer gives `if (x:string = y)`, which is not valid TypeScript. The declaration keeps the type.
