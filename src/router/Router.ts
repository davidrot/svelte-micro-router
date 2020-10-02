export class Route {
  component: any
  paramNames: RegExpMatchArray;
  paramValuesRegex: RegExp;
  pathRegex: RegExp;

  constructor(path: any, component: any)
  {
    if (typeof path === 'string' || path instanceof String) {
      this.paramNames = path.match(/:([^\s/]+)/g)?.map(x => x.substring(1));
      const regex = path.replace(/:([^\s/]+)/g, '(.+?)');
      this.paramValuesRegex = new RegExp(`${regex}`, "i"); //i => ignore case
      this.pathRegex = new RegExp(`^${regex}$`, "i"); //i => ignore case
    } else if (path instanceof RegExp) {
      this.pathRegex = path;
    } else {
      throw `path type '${typeof path}' is not supported`;
    }

    this.component = component;
  }
}

interface IRouterSlot {
  updateSlot(route: Route): void;
}

export class Router {
  routes: Route[] = [];
  slots: IRouterSlot[] = [];
  currentRoute: Route;

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener('popstate', event => this.popState(event));
    }
  }

  registerRoutes(routes: Route[]): void {
    this.routes.push(...routes);
    
    // no possible in constructor, because user hasnt registered any routes to it
    // this is the first possible event to do this
    if (this.currentRoute == null) {
      this.currentRoute = this.getRouteByPath(this.getCurrentUrl());
    }
  }
  
  unregisterRoutes(removeRoutes: Route[]): void {
    removeRoutes.forEach(item => {
      const index = this.routes.indexOf(item, 0);
      if (index > -1) {
        this.routes.splice(index, 1);
      }
    });
  }

  registerSlot(slotObj: any): void {
    this.slots.push(slotObj as IRouterSlot);
    let route = this.currentRoute || this.getCurrentRoute();
    slotObj.updateSlot(route);
  }

  unregisterSlot(slotObj: any): void {
    this.slots = this.slots.filter(x => x != slotObj);
  }

  navigate(url: string, pushState: boolean = true): void {
    this.currentRoute = this.getRouteByPath(url);
    this.informSlots(this.currentRoute);
    if (pushState) {
      this.pushState(url);
    }
  }

  popState(event: any) {
    this.navigate(this.getCurrentUrl(), false);
  }

  pushState(url: string): void {
    history.pushState({ key: window.performance.now().toFixed(3) }, '', "/#" + url );
  }

  informSlots(route: Route): void {
    this.slots.forEach(s => s.updateSlot(route));
  }

  getCurrentUrl(): string {
    return location.hash.slice(1).toLowerCase() || "/";
  }

  getCurrentRoute(): Route {
    return this.getRouteByPath(this.getCurrentUrl());
  }

  getRouteByPath(path: string): Route {
    if (!path.endsWith('/')) path += '/';
    var routes = this.routes.filter(r => {
      let result = r.pathRegex.test(path)
      return result;
    });

    if (routes.length > 1) {
      console.warn('multiple routes have been found', routes);
    }

    return routes[0];
  }

  getParamsObj(): any {
    return this.getParams(location.hash, this.currentRoute);
  }

  getParams(url: string, route: Route): any {
    var obj1 = this.getParamsFromRouteSection(url, route);
    var obj2 = this.getParamsFromUrlEncoding(url, route);
    if (!obj1 && !obj2) return;
    return {...obj1, ...obj2};
  }

  getParamsFromRouteSection(url: string, route: Route): any {
    if (!route.paramNames) return;

    var valueMatches = url.match(route.paramValuesRegex);
    if (valueMatches && valueMatches.length > 1) {
      var returnValue = {};
      for (let i = 1; i < valueMatches.length; i++) {
        const name = route.paramNames[i - 1];
        const value = valueMatches[i];
        returnValue[name] = value
      }
      return returnValue;
    }

    return null;
  }

  getParamsFromUrlEncoding(url: string, route: Route): any {
    var parts = url.split("?").slice(1);
    var obj;
    if (parts.length > 0) {
      obj = {};
      parts.map(x => x.split("&").filter(x => !!x)).forEach(part => {
        part.map(x => x.split("=")).forEach(item => {
          obj[item[0]] = item[1];
        });
      });
    }
    return obj;
  }
}

export const RouterInstance = new Router();