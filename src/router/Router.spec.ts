import { test, equal} from 'zora';
import { Route, Router } from './Router';

function getRoute(url: string, component: any = null): Route {
    const returnValue = new Route();
    returnValue.path = url;
    returnValue.component = component;
    return returnValue;
}

test('getParams no used returns null', () => {
    const router = new Router();

    var result = router.getParams('/user', getRoute('/user/'));

    equal(result, null);
});

test('getParams multiple props returns param', () => {
    const router = new Router();

    var result = router.getParams('/user/1/unkown/test@tescom', getRoute('/user/:id/:name/:email'));

    equal(result, { id: "1", name: "unkown", email: "test@tescom" });
});

test('getParams prop normal returns param', () => {
    const router = new Router();

    var result = router.getParams('/user/1/something', getRoute('/user/:id/'));

    equal(result, { id: "1" });
});

function getRouterSut(): Router {
    const router = new Router();
    router.routes = [
        { path: '/user/:id/:name/:email', component: 4 },
        { path: '/user/1/something', component: 3 },
        { path: '/user/1', component: 2 },
        { path: '/user', component: 1 }
    ];
    return router;
}

test('getRouteByPath no props return route ', () => {
    const router = getRouterSut();

    equal(router.getRouteByPath('/user')?.component, 1);
})

test('getRouteByPath one prop return route ', () => {
    const router = getRouterSut();

    equal(router.getRouteByPath('/user/1')?.component, 2);
})

test('getRouteByPath one prop follow by no prop return route ', () => {
    const router = getRouterSut();

    equal(router.getRouteByPath('/user/1/something')?.component, 3);
})

test('4 getRouteByPath multiple prop followed return route ', () => {
    const router = getRouterSut();

    equal(router.getRouteByPath('/user/1/unkown/test@tescom')?.component, 4);
})
