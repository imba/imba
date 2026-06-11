# Style Modifiers

Modifiers are css [pseudo-classes](https://developer.mozilla.org/en-US/docs/Web/CSS/Pseudo-classes) with superpowers. They can be used in selectors wherever you would normally use a pseudo-class. All css pseudo-classes are available as modifiers, but Imba offers additional modifiers to make responsive styling easy, as well as a ton of other convenient modifiers you can read about further down. See the [guide](/docs/css/syntax#modifier-syntax) for additional details.

### Reference

<api-list>css.own.modifiers</api-list>

### Breakpoints

You can set your own custom pixel breakpoints by specifying any number you want after the `@` or `@!` symbols.
`@` for min-width, and `@!` for max-width.

```imba
css div@700 display:block # -> @media (min-width: 700px)
css div@!650 display:none # -> @media (max-width: 650px)
css div width:100% @700:80% @1300:1200px
```