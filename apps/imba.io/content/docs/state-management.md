# State Management

State management in Imba is quite straightforward compared to other frameworks. There's nothing like "set state" or a "store" concept. Your state can be kept in regular Javascript variables, to update your state, update the variables. Your app is re-rendered every time an event is handled or `imba.commit()` is called. Here's a simple example:

You can store the state in a variable at the root of an imba document:
```imba
let count = 0

tag Counter
    <self>
        <div> count
        <button @click=(count = count + 1)> "Add One"
```

Or as a property of a tag:
```imba
# store state as a property on a tag
tag Counter
    count = 0
    <self>
        <div> count
        <button @click=(count = count + 1)> "Add One"

tag App
    <self>
        <Counter count=10>
        <Counter count=5>
```


You can extend `element` with a getter which will make a property available in all tags. This is a convenient way to provide global application state everywhere.
```imba
let globalAppState = new MyAppState()

# Extend 'element' with a new property for getting an app state value
extend tag element
    get appState
        return globalAppState

# Now any tag can use the 'appState' property
tag Foo
  <self> appState.someValue
```