export class Route {
  path: string;
  component: any;
}

export interface IRouterSlot {
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

  refreshCurrentRoute(): void {
    this.currentRoute = this.getRouteByPath(location.hash);
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
    var routes = this.routes.filter(r => {
      var valueRegex = r.path.replace(/:([^\s/]+)/g, '(.+)');
      let result = path.match(new RegExp(valueRegex, "gm"));
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
    var paramNames = route.path.match(/:([^\s/]+)/g);
    var valueRegex = route.path.replace(/:([^\s/]+)/g, '(.+)');
    var valueMatches = url.match(valueRegex);
    
    if (valueMatches && valueMatches.length > 1) {
      var returnValue = {};
      for (let i = 1; i < valueMatches.length; i++) {
        const name = paramNames[i - 1].substr(1);
        const value = valueMatches[i];
        returnValue[name] = value
      }
      return returnValue;
    }

    return null;
  }
}

export const RouterInstance = new Router();