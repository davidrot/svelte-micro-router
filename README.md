Svelte-micro-router does what it says on the tin. It is very micro, please keep this in your mind if you are missing some features. 

# Features

- Small size / Micro
- Easy configuration (no sub route objects)
- Typescript
- Support for multiple router slots

# Installation 

``` bash
npm install svelte-micro-router --save
```

# Code Sample

This router is composed out of three parts (RouterInstance, RouterSlot, RouterLink). The RouterInstance what has the main logic (route matching, reading parameters from url). RouterSlot is to show the component of the current route. 

```typescript
// router-config.ts
import {RouterInstance, Route} from "svelte-micro-router";
import HomeComponent from "./Components/Home.svelte";
import AboutComponent from "./Components/About.svelte";
import UserComponent from "./Components/User.svelte";

RouterInstance.registerRoutes([
    new Route ('/', HomeComponent),
    new Route ('/about/', AboutComponent),
    new Route ('/user/:userId/', UserComponent),
    new Route ('/user/:userId/:name/', UserComponent, { metaInformation: 'something' }),
]);
```

```html
// App.svelte
<script lang="ts">
	import {RouterLink, RouterSlot} from "svelte-micro-router";
</script>

<main>
	<nav">
		<RouterLink to="/">Home</RouterLink>
		<RouterLink to="/about/">About</RouterLink>
		<RouterLink to="/user/1/">User 1</RouterLink>
		<RouterLink to="/user/2/test/">User 2</RouterLink>
	</nav>

	<RouterSlot></RouterSlot>
</main>
```

# Usage advices

This router instantiates the route’s component on every route change. Even when routing to a route with the same component as the previous route.

# Methods 

The router is having the following public methods. 

```typescript
/**
* Register routes to the router.
* @param  {Route[]} routes
* @returns void
*/
public registerRoutes(routes: Route[]): void

/**
* Unregister routes to the router.
* @param  {Route[]} removeRoutes
* @returns void
*/
public unregisterRoutes(removeRoutes: Route[]): void

/**
* To navigate to some other page.
* @param  {string} url
* @param  {boolean=true} pushState
* @returns void
*/
public navigate(url: string, pushState: boolean = true): void

/**
* Returns an object with the params from the url cobmined with meta information.
* @param  {string} url
* @param  {Route} route
* @returns Record
*/
public getCurrentParamsObj(): Record<string, string>
  
/**
* The method addEventListener() sets up a function that will be called whenever the
* specified event is delivered to the target.
* @param  {string} name
* @param  {any} handler
* @returns void
*/
public addEventListener(name: string, handler: any): void

/**
* The EventTarget.removeEventListener() method removes from the EventTarget an event
* listener previously registered with EventTarget.addEventListener().
* @param  {string} name
* @param  {any} handler
* @returns void
*/
public removeEventListener(name: string, handler: any): void
```

# Events

```typescript
/**
* Will be called before the url is changed. Change will be cancled if the argument property cancled is set to true.
*/
RouterInstance.addEventListener('url-changing', arg => {
  if (auth.invalid) {
    arg.cancled = true;
  }
});
```

# Contribute

Please contribute with unit tests.

# Development 

Install the dependencies...

```bash
npm install
```

...then start [Rollup](https://rollupjs.org):

```bash
npm run serve
```

Navigate to [localhost:5000](http://localhost:5000). You should see your app running. Edit a component file in `src`, save it, and reload the page to see your changes.

By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

To run unit tests:

``` bash
npm run test
```

To run unit tests on every change:

``` bash
npm run test:watch
```


## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```

You can run the newly built app with `npm run start`. This uses [sirv](https://github.com/lukeed/sirv), which is included in your package.json's `dependencies` so that the app will work when you deploy to platforms like [Heroku](https://heroku.com).
