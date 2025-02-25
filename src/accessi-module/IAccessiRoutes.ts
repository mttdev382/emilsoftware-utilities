import { Router } from "express";

export interface IAccessiRoutes {
  router: Router;
  initializeRoutes(): void;
}
