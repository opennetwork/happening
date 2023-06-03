import { FunctionComponent } from "react";
import { Partners } from "./partners";
import { Settings } from "./settings";
import { Home } from "./home";
import { Organisations } from "./organisations";
import { Feedback, submit as feedbackSubmit } from "./feedback";
import { Login } from "./login";
import { Logout, handler as logoutHandler } from "./logout";
import { Errors } from "./error";

export const paths: Record<string, FunctionComponent> = {
  "/": Home,
  "/home": Home,
  "/partners": Partners,
  "/settings": Settings,
  "/organisations": Organisations,
  "/feedback": Feedback,
  "/login": Login,
  "/logout": Logout,
  "/error": Errors,
};

export const pathsAnonymous: Record<string, boolean> = {
  "/home": true,
  "/": true,
  "/feedback": true,
  "/calculator": true,
  "/login": true,
};

export const pathsSubmit: Record<
  string,
  (...args: unknown[]) => Promise<unknown | void> | unknown | void
> = {
  "/feedback": feedbackSubmit,
};

export const pathsHandler: Record<
  string,
  (...args: unknown[]) => Promise<unknown | void> | unknown | void
> = {
  "/logout": logoutHandler,
};

export const pathsCache: Record<string, boolean> = {
  "/": false,
  "/home": false,
  "/partners": true,
  "/settings": false,
  "/organisations": true,
  "/feedback": false,
  "/login": false,
  "/logout": false,
  "/error": false,
};