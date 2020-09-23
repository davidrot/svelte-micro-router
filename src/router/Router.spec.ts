import { test, equal} from 'zora';
import { Route, Router } from './Router';

function getRoute(url: string, component: any = null): Route {
    const returnValue = new Route(url, component);
    return returnValue;
}

test('Route', g => {
    g.test('Route as string', t => {
        const route = new Route('/user/:id/', 1);

        t.equal(route.component, 1);
        t.equal(route.paramNames, ["id"]);
    });

    g.test('Route as regex', t => {
        const regex = new RegExp('\/user\/.+?\/');
        const route = new Route(regex, 1);

        t.equal(route.pathRegex, regex);
    })

    g.test('Route unkown type throws exception', t => {
        t.throws(() => new Route(1, {}), "path type '${ typeof path }' is not supported");
    })
});

test('getParams', g => {

    g.test('getParamsFromRouteSection', gg => {
        const sut = new Router();

        gg.test('getParams no params returns null', t => {
            var result = sut.getParams('/user', getRoute('/user/'));

            t.equal(result, undefined);
        });

        gg.test('getParams one param returns one', t => {
            var result = sut.getParams('/user/1/something/', getRoute('/user/:id/'));

            t.equal(result, { id: "1" });
        });

        gg.test('getParams multiple params followed returns multiple', t => {
            var result = sut.getParams('/user/1/unkown/test@tescom/', getRoute('/user/:id/:name/:email/'));

            t.equal(result, { id: "1", name: "unkown", email: "test@tescom" });
        });
    });

    g.test('getParamsFromUrlEncoding one url params ', gg => {
        const sut = new Router().getParamsFromUrlEncoding;

        gg.test('getParamsFromUrlEncoding one url params ', t => {
            var result = sut('/asset?id=1', null);
            t.equal(result, { id: "1" });
        });

        gg.test('getParamsFromUrlEncoding multiple url params ', t => {
            var result = sut('/asset?id=1&image=awesome.jpg', null);
            t.equal(result, { id: "1", image: "awesome.jpg" });
        });

        gg.test('getParamsFromUrlEncoding empty value in url params', t => {
            var result = sut('/asset?id=&image=awesome.jpg', null);
            t.equal(result, { id: "", image: "awesome.jpg" });
        });

        gg.test('getParamsFromUrlEncoding empty key in url params', t => {
            var result = sut('/asset?=1&image=awesome.jpg', null);
            t.equal(result, { "" : "1", image: "awesome.jpg" });
        });

        gg.test('getParamsFromUrlEncoding empty key and value in url params', t => {
            var result = sut('/asset?=&image=awesome.jpg', null);
            t.equal(result, { "" : "", image: "awesome.jpg" });
        });

        gg.test('getParamsFromUrlEncoding complete empty in url params', t => {
            var result = sut('/asset?&image=awesome.jpg', null);
            t.equal(result, { image: "awesome.jpg" });
        });
    });
});

test('getRouteByPath', g => {
    function getRouterSut(): Router {
        const router = new Router();
        router.registerRoutes([
            new Route('/user/', 1),
            new Route('/user/:id/', 1),
            new Route('/invoice/:id/', 2),
            new Route('/order/:id/something/', 3),
            new Route('/client/:id/:name/:email/', 4)
        ]);
        return router;
    }

    g.test('getRouteByPath no props return route', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/user/')?.component, 1);
    });

    g.test('getRouteByPath one prop return route', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/invoice/1/')?.component, 2);
    });

    g.test('getRouteByPath one prop follow by no prop return route', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/order/1/something/')?.component, 3);
    });

    g.test('getRouteByPath multiple prop followed return route', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/client/1/unkown/test@tescom/')?.component, 4);
    });
});

test('registerRoutes', g => {
    g.test('registerRoutes add routes', t => {
        const router = new Router();

        router.registerRoutes([new Route('/user/', 101)]);

        t.equal(router.routes.length, 1);
        t.equal(router.routes[0]?.component, 101);
    });

    g.test('registerRoutes add routes to existing list', t => {
        const router = new Router();

        router.registerRoutes([new Route('/user/', 101)]);
        router.registerRoutes([new Route('/invoices/', 102)]);

        t.equal(router.routes.length, 2);
        t.equal(router.routes[0]?.component, 101);
        t.equal(router.routes[1]?.component, 102);
    });

    g.test('registerRoutes is setting currentRoute', t => {
        const router = new Router();
        location.hash = "/user/1/";

        router.registerRoutes([new Route('/user/:id/', 102)]);

        t.equal(router.currentRoute?.component, 102);
    });

    g.test('unregisterRoutes remove from list', t => {
        const router = new Router();
        const route = new Route('/', 101);
        router.registerRoutes([route]);
        t.equal(router.routes.length, 1);

        router.unregisterRoutes([route]);

        t.equal(router.routes.length, 0);
    });

    g.test('unregisterRoutes not existing in list', t => {
        const router = new Router();
        router.registerRoutes([new Route('/', 101)]);
        t.equal(router.routes.length, 1);

        router.unregisterRoutes([new Route('/test', 102)]);

        t.equal(router.routes.length, 1);
    });
});