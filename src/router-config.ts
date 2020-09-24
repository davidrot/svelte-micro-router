import { RouterInstance, Route} from './router/Router'
import HomeComponent from "./Components/Home.svelte";
import AboutComponent from "./Components/About.svelte";
import UserComponent from "./Components/User.svelte";

RouterInstance.registerRoutes([
    new Route ('/', HomeComponent),
    new Route ('/about/', AboutComponent),
    new Route ('/user/:userId/', UserComponent),
    new Route ('/user/:userId/:name/', UserComponent),
]);