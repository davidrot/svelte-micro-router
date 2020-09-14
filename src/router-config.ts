import { RouterInstance } from './router/Router'
import HomeComponent from "./Components/Home.svelte";
import AboutComponent from "./Components/About.svelte";
import UserComponent from "./Components/User.svelte";

RouterInstance.registerRoutes([
    { path: '/user/:userId/:name', component: UserComponent },
    { path: '/user/:userId', component: UserComponent },
    { path: '/about', component: AboutComponent },
    { path: '/', component: HomeComponent },
]);