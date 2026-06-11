# Static Deployment

In recent years, hosting static websites has become completely
free and relatively easy. With a host such as [Cloudflare
Pages](https://pages.cloudflare.com/), not only is hosting free,
but setting up a single page application requires zero
configuration due to their [helpful
defaults](https://developers.cloudflare.com/pages/platform/serving-pages/#single-page-application-spa-rendering).
These providers do have some
[limits](https://developers.cloudflare.com/pages/platform/limits/),
such as 500 builds per month maximum with a free plan, but most
of us aren't deploying our applications 16.67 times a day.

## Vite

If you created an Imba project using Vite, you can follow the
straightforward deployment examples Vite has for many popular
static hosts [here](https://vitejs.dev/guide/static-deploy.html).

## FAQ

- `npm run dev` works, but when I deploy to a host the router doesn't work.

	Static HTTP servers like NGINX and Apache typically serve
	actual HTML files. In this situation, when a request is made to
	the server for `/home`, the server will look for a `/home.html`
	file to serve to the client. When the user navigates to
	`/about`, the server will look for an actual `/about.html`
	file.

	In a single page application with client side routing, however,
	we only have an `index.html` file that references our
	JavaScript which decides what to render based on the URL. As
	such, we want to route all requests to our `/index.html` file.

	If you're getting 404 errors when using Imba router, it is
	likely that your server is not routing all requests to your
	`/index.html` file. You can either switch to a host that
	supports this by default or look into configuring your server
	to route all requests to `/index.html`. For example, you could
	try adding the following block to your `nginx.conf`:

	```
	location / {
		try_files $uri /index.html;
	}
	```
