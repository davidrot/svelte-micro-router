import { test } from 'zora';
import { Router, Route } from './Router';

const getRoute = (url: string, component: any = null) => {
    const returnValue = new Route(url, component);
    return returnValue;
}

test('Route', g => {
    g.test('should handle path as string', t => {
        const route = new Route('/user/:id/', 1, { a: 1 });

        t.equal(route.component, 1);
        t.equal(route.path, '/user/:id/');
        t.equal(route.metaInformation, { a:1 });
    });
});

test('getParams', g => {

    g.test('getCurrentParams', gg => {
        const sut = new Router();

        gg.test('should return nothing if no params exists', t => {
            const result = sut.getCurrentParams('/user', getRoute('/user/'));

            t.equal(result, undefined);
        });

        gg.test('should return default param if no params exists', t => {
            const result = sut.getCurrentParams('/user', new Route('/user/', 1, {edit:true}));

            t.equal(result as any, {edit: true});
        });

        gg.test('should return object if route params exists', t => {
            const result = sut.getCurrentParams('/user/1/', getRoute('/user/:id/'));

            t.equal(result, { id: '1' });
        });

        gg.test('should return default object combined with route params', t => {
            const result = sut.getCurrentParams('/user/1/', new Route('/user/:id/', 1, { edit: true }));

            t.equal(result as any, { id: '1', edit: true });
        });
    });
});

test('getRouteByPath', g => {
    const getRouterSut = () => {
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


    g.test('should match route without trailing slash', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/user')?.component, 1);
    });

    g.test('should match route without parmas', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/user/')?.component, 1);
    });

    g.test('should match route with one param', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/invoice/1/')?.component, 2);
    });

    g.test('should match route with one param without trailing slash', t => {
        const router = getRouterSut();

        t.equal(router.getRouteByPath('/invoice/1')?.component, 2);
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