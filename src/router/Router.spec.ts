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
    router.registerRoutes([
        { path: '/user/:id/:name/:email', component: 4 },
        { path: '/user/1/something', component: 3 },
        { path: '/invoice/1', component: 2 },
        { path: '/user', component: 1 }
    ]);
    return router;
}

test('getRouteByPath no props return route ', () => {
    const router = getRouterSut();

    equal(router.getRouteByPath('/user')?.component, 1);
})

test('getRouteByPath one prop return route ', () => {
    const router = getRouterSut();

    equal(router.getRouteByPath('/invoice/1')?.component, 2);
})

test('getRouteByPath one prop follow by no prop return route ', () => {
    const router = getRouterSut();

    equal(router.getRouteByPath('/user/1/something')?.component, 3);
})

test('getRouteByPath multiple prop followed return route ', () => {
    const router = getRouterSut();

    equal(router.getRouteByPath('/user/1/unkown/test@tescom')?.component, 4);
})


test('registerRoutes add routes', () => {
    const router = new Router();

    router.registerRoutes([
        { path: '/user/', component: 101 }
    ]);

    equal(router.routes.length, 1);
    equal(router.routes[0]?.component, 101);
});

test('registerRoutes add routes to existing list', () => {
    const router = new Router();

    router.registerRoutes([{ path: '/user/', component: 101 }]);
    router.registerRoutes([{ path: '/invoices/', component: 102 }]);

    equal(router.routes.length, 2);
    equal(router.routes[0]?.component, 101);
    equal(router.routes[1]?.component, 102);
});

test('registerRoutes is setting currentRoute', () => {
    const router = new Router();
    location.hash = "/user/1";

    router.registerRoutes([{ path: '/user/:id', component: 102 }]);

    equal(router.currentRoute?.component, 102);
});

test('registerRoutes add routes to existing list', () => {
    const router = new Router();
    const route = { path: '', component: 101 } as Route;
    router.registerRoutes([route]);
    equal(router.routes.length, 1);

    router.unregisterRoutes([route]);

    equal(router.routes.length, 0);
});
