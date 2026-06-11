# Transitions & Animation [preview=md]

> [tip box yellow] This is considered an [experimental](/experimental) feature.

Imba has support for transitioning when elements are added to and removed from
the document. If you set an `ease` attribute on a tag, ie. `<my-element ease>`,
imba makes it possible to easily style the enter-state and exit-state of the
element and its children, as well as the timing and easing of this transition.

Imba does not ship with any prebuilt transitions. This might change in a later
version, but the idea is that the syntax for styling is powerful enough to
easily create your own transitions.

```imba
# ~preview=md
import 'util/styles'

css label d:hflex ja:center us:none
css input mx:1

# ---
tag App
    alerted = no
    <self @click=(alerted = !alerted)>
        if alerted
            <div.alert> "Important message"
# ---
let app = imba.mount <App.clickable>
```

In the above example, we attach the `<div>` to the dom only when `alerted` is true. In many cases you may want to smoothly transition the element in and out instead of abruptly removing it. To do this in imba, we simply add an `ease` property to the `<div>` in question.

```imba
# ~preview=md
# css div p:2 m:2 overflow:hidden min-width:80px
import 'util/styles'
# ---
tag App
    alerted = no
    <self @click=(alerted = !alerted)>
        if alerted
            <div.alert[opacity@off:0] ease> "Important message"
# ---
let app = imba.mount <App.clickable>
```

Now that we have declared that this element should ease, we use the `@off` style modifier to specify the appearance of the element when it is detached from the dom. In this case, we set that the opacity should be set to 0. Imba will transition to/from `@off` state smoothly, but all easings and durations can be customized. Imba takes care of keeping the element attached to the dom until all transitions have finished.

If you want separate transitions depending on whether the element is being attached or detached, you can use the `@in` and `@out` modifiers:



```imba
# ~preview=md
# css div p:2 m:2 overflow:hidden min-width:80px
import 'util/styles'

# ---
tag App
    alerted = no
    <self @click=(alerted = !alerted)>
        if alerted
            <div.alert[y@in:100px y@out:-100px] ease> "In from below, out above!"
# ---
let app = imba.mount <App.clickable>
```
Now you can see that it comes in from the left, but leaves to the right. If the element is re-attached while exiting or detached while still entering, the transition will gracefully revert. You can see this by clicking the checkbox rapidly.

You can easily transition nested elements inside the eased element as well.

```imba
# ~preview=md
# css div p:2 m:2 overflow:hidden min-width:80px
import 'util/styles'
# ---
tag App
    alerted = no
    <self @click=(alerted = !alerted)>
        if alerted
            <div.alert[o@off:0 y@off:100px ease:1s] ease>
                <div[scale@off:0]> "Important message"
# ---
let app = imba.mount <App.clickable>
```

Click to see the inner div scale during the transition. Also note that we did set the duration of the transition using the `ease` style property. You can specify the ease duration and timing function for each element, and also specify them individually for transforms, opacity and colors. See properties.
