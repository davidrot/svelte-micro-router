export interface IRouterSlot {
  updateSlot(route: Route): void;
}

export class Route {
  public component: any;
  public paramNames: RegExpMatchArray;
  public paramValuesRegex: RegExp;
  public pathRegex: RegExp;

  /**
   * @param  {string|RegExp} path
   * @param  {any} component
   */
  constructor(path: string | RegExp, component: any) {
    if (typeof path === 'string' || path instanceof String) {
      this.paramNames = path.match(/:([^\s/]+)/g)?.map(x => x.substring(1));
      const regex = path.replace(/:([^\s/]+)/g, '(.+?)');
      this.paramValuesRegex = new RegExp(`${regex}`, 'i'); // i => ignore case
      this.pathRegex = new RegExp(`^${regex}$`, 'i'); // i => ignore case
    } else if (path instanceof RegExp) {
      this.pathRegex = path;
    } else {
      throw new Error(`path type '${typeof path}' is not supported`);
    }

    this.component = component;
  }
}

export class Router {
  public routes: Route[] = [];
  private slots: IRouterSlot[] = [];
  public currentRoute: Route;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', () => this.popState());
    }
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
      this.currentRoute = this.getRouteByPath(this.getCurrentUrl());
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
   * @param  {any} slotObj
   * @returns void
   */
  public registerSlot(slotObj: any): void {
    this.slots.push(slotObj as IRouterSlot);
    const route = this.currentRoute || this.getCurrentRoute();
    slotObj.updateSlot(route);
  }

  /**
   * Internal: RouterSlots needs to unregister from the router that he will not informed about any route changes.
   *
   * @param  {any} slotObj
   * @returns void
   */
  public unregisterSlot(slotObj: any): void {
    this.slots = this.slots.filter(x => x !== slotObj);
  }

  /**
   * To navigate to some other page.
   *
   * @param  {string} url
   * @param  {boolean=true} pushState
   * @returns void
   */
  public navigate(url: string, pushState: boolean = true): void {
    this.currentRoute = this.getRouteByPath(url);
    this.informSlots(this.currentRoute);
    if (pushState) {
      this.pushState(url);
    }
  }

  private popState() {
    this.navigate(this.getCurrentUrl(), false);
  }

  private pushState(url: string): void {
    history.pushState({ key: window.performance.now().toFixed(3) }, '', '/#' + url );
  }

  private informSlots(route: Route): void {
    this.slots.forEach(s => s.updateSlot(route));
  }

  private getCurrentUrl(): string {
    return location.hash.slice(1).toLowerCase() || '/';
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
      const result = r.pathRegex.test(path);
      return result;
    });

    return routes[0];
  }

  /**
   * Returns an object with the params from the current route and current url.
   *
   * @returns Record
   */
  public getCurrentParamsObj(): Record<string, string> {
    return this.getCurrentParams(location.hash, this.currentRoute);
  }

  /**
   * Returns an object with the params from the route and url.
   *
   * @param  {string} url
   * @param  {Route} route
   * @returns Record
   */
  public getCurrentParams(url: string, route: Route): Record<string, string> {
    const routeParams = this.getParamsFromRouteSection(url, route);
    const urlParams = this.getParamsFromUrlEncoding(url);
    if (!routeParams && !urlParams) return;
    return {...routeParams, ...urlParams};
  }

  /**
   * Returns an object with the params from the route.
   *
   * @param  {string} url
   * @param  {Route} route
   * @returns Record
   */
  public getParamsFromRouteSection(url: string, route: Route): Record<string, string> {
    if (!route?.paramNames) return;

    const valueMatches = url.match(route.paramValuesRegex);
    if (valueMatches && valueMatches.length > 1) {
      const returnValue: Record<string, string> = {};
      for (let i = 1; i < valueMatches.length; i++) {
        const name = route.paramNames[i - 1];
        const value = valueMatches[i];
        returnValue[name] = value;
      }
      return returnValue;
    }

    return null;
  }

  /**
   * Returns an object with the params from the url.
   *
   * @param  {string} url
   * @param  {Route} route
   * @returns Record
   */
  public getParamsFromUrlEncoding(url: string): Record<string, string> {
    const parts = url.split('?').slice(1);
    let obj: Record<string, string>;
    if (parts.length > 0) {
      obj = {};
      parts.map(x => x.split('&').filter(y => !!y)).forEach(part => {
        part.map(y => y.split('=')).forEach(item => {
          obj[item[0]] = item[1];
        });
      });
    }
    return obj;
  }
}

export const RouterInstance = new Router();
