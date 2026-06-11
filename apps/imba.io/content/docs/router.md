# Router

Imba comes with a built-in router that works on both the client and
server. It requires no setup and simply introduces the
[route](api://Element.route) and [route-to](api://Element.route-to)
properties on elements.

```imba
# [preview=md] [titlebar] [route=/home]
tag app
	<self>

		<nav[d:box g:4 c:blue6]>
			<a route-to='/home'> 'Home'
			<a route-to='/about'> 'About'

		<[d:box h:100%]>

			<div route='/home'>
				'Home page.'

			<div route='/about'>
				'About page.'

imba.mount <app>
```

Elements with the `route` property will display when the provided
route matches the contents of the address bar.

`route-to` essentially works like `href`,
except it:
- Enables nested routes.
- Automatically adds an `active` class to the element whenever the
	route it links to is matching.

### Exact Routes

Any route that ends with `/` will be treated as an exact route.

```imba
# [preview=md] [titlebar] [route=/home]
tag app
	<self>

		<nav[d:box g:4 c:blue6]>
			<a route-to='/home'> 'Home'
			<a route-to='/home/test'> 'Test'

		<[d:box h:100%]>

			<div route='/home/'>
				'Home page.'

imba.mount <app>
```

Notice how the `Test` path doesn't go to the home page because
the home page route ends in a slash (`/home/`).

### Wildcard Routes

Any route that ends with `*` will be treated as a catch-all for that
path. Let's fix the previous example:

```imba
# [preview=md] [titlebar] [route=/home]
tag app
	<self>

		<nav[d:box g:4 c:blue6]>
			<a route-to='/home'> 'Home'
			<a route-to='/home/test'> 'Test'

		<[d:box h:100%]>

			<div route='/home/*'>
				'Home page.'

imba.mount <app>
```

We can use this to create a fallback route with `route='/*'` that will
match all routes.


> [tip box blue] For the time being, routes that don't end in a slash will also be
considered wildcard routes. That means that `/home/*` and `/home` are
the same.

## Nested Routes

Routes that do not start with `/` will be treated as nested routes,
and resolve relative to the closest parent route. This works for both
`route` and `route-to`.

```imba
# [preview=md] [titlebar] [route=/home]
tag app
	<self>

		<[d:box h:100%]>

			<div route='/home'>
				css d:vbox

				<a route-to='nested'> 'Nested'
					css c:blue6

				'Home page.'

				<div route='nested'>
					'Nested page.'

imba.mount <app>
```

## Dynamic Routes

To map a url pattern to a component, you can use dynamic segments in
your routes. A dynamic segment starts with `:`. So the pattern
`/user/:id` with match `/user/1`, `/user/2` etc.

```imba
# [preview=md] [titlebar] [route=/user/1]
tag User
	<self>
		route.params.id

tag app
	<self>

		<nav[d:box g:4 c:blue6]>
			<a route-to="/user/1"> "User 1"
			<a route-to="/user/2"> "User 2"

		<[d:box h:100%]>

			<User route="/user/:id">

imba.mount <app>
```

You can also have multiple dynamic segments in a route, like
`/user/:user-id/post/:post-id`. All segments map to corresponding
fields in `route.params`. When using nested routes, even the params
from parent routes will be available in `route.params`.

## Route Precedence

Route ordering matters. In the following example, because the route
`/*` is the first route and matches all routes, the only page that
will be shown is the fallback page, no matter the route.

```imba
# [preview=md] [titlebar] [route=/home]
tag app
	<self>

		<nav[d:box g:4 c:blue6]>
			<a route-to='/home'> 'Home'
			<a route-to='/about'> 'About'

		<[d:box h:100%]>

			<div route='/*'>
				'Fallback route.'

			<div route='/home'>
				'Home page.'

			<div route='/about'>
				'About page.'

imba.mount <app>
```

Route precedence also applies to dynamic routes:

```imba
# [preview=md] [titlebar] [route=/items]
tag app
	<self>

		<nav[d:box g:4 c:blue6]>
			<a route-to='/items'> 'Items'
			<a route-to='/items/new'> 'New'
			<a route-to='/items/some-id'> 'ID'

		<[d:box h:100%]>

			<div route='/items/'>
				'Home page.'

			<div route='/items/new'>
				'New page.'

			<div route='/items/:id'>
				'ID page.'

imba.mount <app>
```

Notice how the `/items/new` route interferes with `/items/:id`.

## Loading Data

If you want to do something when the params change you can define a
`routed` method on your component. This will be called whenever the
route changes, and supply the new params, and a state object that is
unique for each matched route, but consistent over time (ie. when
navigating back to a previously matched set of params).

If you load anything asynchronously inside `routed` (using `await`),
the component will delay rendering until `routed` has finished.

A nice feature of the imba router is that the `params` of any
particular route match are constant. Matching `/genre/:id` with the
url `/genre/action` will always return the same `params` object!
This is useful for memoizing data etc.

In addition to this, `route.state` will always return an object that
is unique *per match*, but consistent over time. This is very useful
for caching data for a `component <--> matching-route` combination.

```imba app.imba
# [preview=md] [titlebar] [route=/genre/drama]
import 'util/styles'
# ---
import {genres} from 'imdb'

tag Genre

    def routed params, state
        console.log 'routed',params
        data = state.genre ||= await genres.fetch(params.id)

    <self[d:vflex o@suspended:0.4]>
        <div> "{data.title} has {data.movies.length} movies in top 250"

tag app
    <self.app>
        <nav> for item in genres.top
            <a route-to="/genre/{item.id}"> item.title
        <Genre.page route="/genre/:id">

imba.mount <app>
```

As you can see in the example above, we cache data in the `state`
object supplied to `routed`. This will make sure you don't refetch the
data when you click on a genre you've seen before.

## Additional Information

The router for your application is always available via
[imba.router](api://imba.router).
