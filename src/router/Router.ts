export interface IRouterSlot {
  updateSlot(route: Route): void;
}

export declare class RouterLink {
  $$prop_def: any;
}

export declare class EventListenerArgs {
  public cancled: boolean;
  public source: Route;
  public destination: Route;
}

export class Route {
  public component: any;
  public path: string;
  public metaInformation: any;
  private urlParts: string[];
  public asyncComponent: () => Promise<any>;

  /**
   * @param  {string} path
   * @param  {any} component
   * @param  {()=>Promise<any>=null} asyncComponent
   * @param  {any} metaInformation (will be resolved when getParamsObj)
   */
  constructor(path: string, component: any, asyncComponent: () => Promise<any> = null, metaInformation: any = null) {
    this.component = component;
    this.asyncComponent = asyncComponent;
    this.path = path;
    this.metaInformation = metaInformation;
    this.urlParts = this.trimSlashes(path).split('/');
  }

  trimSlashes(path: string): string {
    return path.replace(/^\/|\/$/g, '');
  }

  match(path: string): any {
    const pathSegments = this.trimSlashes(path).split('/');

    if (this.urlParts.length !== pathSegments.length) {
      return null;
    }

    const match = {};

    for (let i = 0; i < this.urlParts.length; i++) {
      const pathSegment = pathSegments[i];
      const patternSegment = this.urlParts[i];

      if (patternSegment.startsWith(':')) {
        if (!pathSegment) {
          return null;
        }

        match[patternSegment.slice(1)] = decodeURIComponent(pathSegment);
      } else if (pathSegment !== patternSegment) {
        return null;
      }
    }
    return match;
  }
}

export class Router {
  public routes: Route[] = [];
  private slots: { [key: string]: (route: Route) => void } = {};
  private events: any = {};
  public currentRoute: Route;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => this.popState());
    }
  }

  /**
   * The method addEventListener() sets up a function that will be
   * called whenever the specified event is delivered to the target.
   *
   * @param  {string} name
   * @param  {(args: EventListenerArgs) => void} handler
   * @returns void
   */
  public addEventListener(name: string, handler: (args: EventListenerArgs) => void): void {
    if (this.events.hasOwnProperty(name)) {
      this.events[name].push(handler);
    } else {
      this.events[name] = [handler];
    }
  }

  /**
   * The EventTarget.removeEventListener() method removes from the
   * EventTarget an event listener previously registered with
   * EventTarget.addEventListener().
   *
   * @param  {string} name
   * @param  {(args: EventListenerArgs) => void} handler
   * @returns void
   */
  public removeEventListener(name: string, handler: (args: EventListenerArgs) => void): void {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    const index = this.events[name].indexOf(handler);
    if (index !== -1) {
      this.events[name].splice(index, 1);
    }
  }

  /**
   * Internal: Publish the event to the handlers
   *
   * @param  {string} name
   * @param  {any=[]} args
   */
  private fireEvent(name: string, args: any = []) {
    if (!this.events.hasOwnProperty(name)) {
      return;
    }

    this.events[name].forEach(event => {
      // event.apply(args);
      // event(args)
      event.apply(this, args);
    });
  }

  /**
   * Register routes to the router.
   *
   * @param  {Route[]} routes
   * @returns void
   */
  public registerRoutes(routes: Route[]): void {
    this.routes.push(...routes);

    // not possible in constructor, because user hasnt registered any routes to it
    // this is the first possible event to do this
    if (this.currentRoute == null) {
      const url = this.getCurrentUrl();
      this.currentRoute = this.getRouteByPath(url);
      if (this.currentRoute) {
        this.navigateInternal(url, this.currentRoute, false);
      }
    }
  }

  /**
   * Unregister routes to the router.
   *
   * @param  {Route[]} removeRoutes
   * @returns void
   */
  public unregisterRoutes(removeRoutes: Route[]): void {
    removeRoutes.forEach(item => {
      const index = this.routes.indexOf(item, 0);
      if (index > -1) {
        this.routes.splice(index, 1);
      }
    });
  }

  /**
   * Internal: RouterSlot needs to inform the router that he will be informed about any route changes.
   *
   * @param  {string} id
   * @param  {(route:Route)=>void} callback
   * @returns void
   */
  public registerSlot(id: string, callback: (route: Route) => void): void {
    this.slots[id] = callback;
    const r = this.currentRoute || this.getCurrentRoute();
    if (r) {
      callback(r);
    }
  }

  /**
   * Internal: RouterSlots needs to unregister from the router that he will not informed about any route changes.
   *
   * @param  {string} id
   * @returns void
   */
  public unregisterSlot(id: string): void {
    delete this.slots[id];
    this.slots = this.slots;
  }

  /**
   * To navigate to some other page.
   *
   * @param  {string} url
   * @param  {boolean=true} pushState
   * @returns void
   */
  public async navigate(url: string, pushState: boolean = true, informSlots: boolean = true): Promise<void> {
    const destinationRoute = this.getRouteByPath(url);
    await this.navigateInternal(url, destinationRoute, pushState, informSlots);
  }

  private async navigateInternal(url: string, destinationRoute: Route, pushState: boolean = true, informSlots: boolean = true): Promise<void> {
    if (!destinationRoute) {
      destinationRoute = this.getRouteByPath(url);
    }
    const arg = { cancled: false, source: this.currentRoute, destination: destinationRoute } as EventListenerArgs;
    this.fireEvent('url-changing', [arg])

    if (!arg.cancled) {
      this.currentRoute = destinationRoute;
      if (pushState) {
        this.pushState(url);
      }
      if (informSlots) {
        if (!this.currentRoute?.component && this.currentRoute?.asyncComponent) {
          this.currentRoute.component = (await this.currentRoute.asyncComponent());
        }
        this.informSlots(this.currentRoute);
      }
    }
  }

  private popState() {
    this.navigate(this.getCurrentUrl(), false);
  }

  private pushState(url: string): void {
    history.pushState({ key: window.performance.now().toFixed(3) }, '', '/#' + url );
  }

  private informSlots(route: Route): void {
    Object.values(this.slots).forEach(cb => cb(route));
  }

  private getCurrentUrl(): string {
    return location.hash.slice(1) || '/';
  }

  private getCurrentRoute(): Route {
    return this.getRouteByPath(this.getCurrentUrl());
  }

  /**
   * Internal: Returns the route object what is matching the the path-param.
   *
   * @param  {string} path
   * @returns Route
   */
  public getRouteByPath(path: string): Route {
    if (!path.endsWith('/')) path += '/';
    const routes = this.routes.filter(r => {
      const result = r.match(path);
      return !!result;
    });

    return routes[0];
  }

  /**
   * Returns an object with the params from the current route and meta information from route.
   *
   * @returns Record
   */
  public getCurrentParamsObj(): Record<string, string> {
    return this.getCurrentParams(this.getCurrentUrl(), this.currentRoute);
  }

  /**
   * Returns an object with the params from the route and meta information.
   *
   * @param  {string} url
   * @param  {Route} route
   * @returns Record
   */
  public getCurrentParams(url: string, route: Route): Record<string, string> {
    let params = route.match(url) as Record<string, string>;
    if (params && Object.keys(params).length === 0) {
      params = null;
    }
    const baseParams = route.metaInformation as Record<string, string>;
    if (!params && !baseParams) return;
    return { ...baseParams, ...params };
  }
}

export const RouterInstance = new Router();
