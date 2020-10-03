import { test, equal} from 'zora';
import { Router, Route } from './Router';

function getRoute(url: string, component: any = null): Route {
    const returnValue = new Route(url, component);
    return returnValue;
}

test('Route', g => {
    g.test('should handle path as string', t => {
        const route = new Route('/user/:id/', 1);

        t.equal(route.component, 1);
        t.equal(route.paramNames, ['id']);
    });

    g.test('should handle path as regex', t => {
        const regex = new RegExp('\/user\/.+?\/');
        const route = new Route(regex, 1);

        t.equal(route.pathRegex, regex);
    })

    g.test('should throw an exception if type cant handled', t => {
        t.throws(() => new Route(1 as any, {}), 'path type \'${ typeof path }\' is not supported');
    })
});

test('getParams', g => {

    g.test('getParamsFromRouteSection', gg => {
        const sut = new Router();

        gg.test('should return nothing if no params exists', t => {
            const result = sut.getCurrentParams('/user', getRoute('/user/'));

            t.equal(result, undefined);
        });

        gg.test('should return one param if one param exists', t => {
            const result = sut.getCurrentParams('/user/1/something/', getRoute('/user/:id/'));

            t.equal(result, { id: '1' });
        });

        gg.test('should return multiple params if multiple params exists', t => {
            const result = sut.getCurrentParams('/user/1/unkown/test@tescom/', getRoute('/user/:id/:name/:email/'));

            t.equal(result, { id: '1', name: 'unkown', email: 'test@tescom' });
        });
    });

    g.test('getParamsFromUrlEncoding', gg => {
        const sut = new Router().getParamsFromUrlEncoding;

        gg.test('should return one url param', t => {
            const result = sut('/asset?id=1', null);
            t.equal(result, { id: '1' });
        });

        gg.test('should return multiple url params', t => {
            const result = sut('/asset?id=1&image=awesome.jpg', null);
            t.equal(result, { id: '1', image: 'awesome.jpg' });
        });

        gg.test('should handle empty value in url params', t => {
            const result = sut('/asset?id=&image=awesome.jpg', null);
            t.equal(result, { id: '', image: 'awesome.jpg' });
        });

        gg.test('should handle empty key in url params', t => {
            const result = sut('/asset?=1&image=awesome.jpg', null);
            t.equal(result, { '' : '1', image: 'awesome.jpg' });
        });

        gg.test('should handle empty key and value in url params', t => {
            const result = sut('/asset?=&image=awesome.jpg', null);
            t.equal(result, { '' : '', image: 'awesome.jpg' });
        });

        gg.test('should handle complete empty in url params', t => {
            const result = sut('/asset?&image=awesome.jpg', null);
            t.equal(result, { image: 'awesome.jpg' });
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

    g.test('should match route without parmas', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/user/')?.component, 1);
    });

    g.test('should match route with one param', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/invoice/1/')?.component, 2);
    });

    g.test('should match route with one param follow by no param', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/order/1/something/')?.component, 3);
    });

    g.test('should match route with multiple params followed', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/client/1/unkown/test@tescom/')?.component, 4);
    });
});

test('registerRoutes', g => {
    g.test('should add routes to list', t => {
        const router = new Router();

        router.registerRoutes([new Route('/user/', 101)]);

        t.equal(router.routes.length, 1);
        t.equal(router.routes[0]?.component, 101);
    });

    g.test('should append routes to list', t => {
        const router = new Router();

        router.registerRoutes([new Route('/user/', 101)]);
        router.registerRoutes([new Route('/invoices/', 102)]);

        t.equal(router.routes.length, 2);
        t.equal(router.routes[0]?.component, 101);
        t.equal(router.routes[1]?.component, 102);
    });

    g.test('should set currentRoute property', t => {
        const router = new Router();
        location.hash = '/user/1/';

        router.registerRoutes([new Route('/user/:id/', 102)]);

        t.equal(router.currentRoute?.component, 102);
    });
});

test('unregisterRoutes', g => {
    g.test('should remove routes from list', t => {
        const router = new Router();
        const route = new Route('/', 101);
        router.registerRoutes([route]);
        t.equal(router.routes.length, 1);

        router.unregisterRoutes([route]);

        t.equal(router.routes.length, 0);
    });

    g.test('should not crash if route is not found in list', t => {
        const router = new Router();
        router.registerRoutes([new Route('/', 101)]);
        t.equal(router.routes.length, 1);

        router.unregisterRoutes([new Route('/test', 102)]);

        t.equal(router.routes.length, 1);
    });
});