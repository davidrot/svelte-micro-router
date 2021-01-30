import AboutComponent from './Components/About.svelte';
import HomeComponent from './Components/Home.svelte';
import UserComponent from './Components/User.svelte';
import { RouterInstance, Route } from './router/Router';

RouterInstance.registerRoutes([
    new Route ('/', HomeComponent),
    new Route ('/about/', AboutComponent),
    new Route ('/user/:userId/', UserComponent),
    new Route('/user/:userId/:name/', UserComponent),
    new Route('/about-async/', null, () => new Promise(resolve => {
        setTimeout(() => {
            resolve(AboutComponent);
        }, 2000);
    }))
]);
