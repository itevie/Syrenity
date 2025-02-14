import ReactDOM from "react-dom/client";
import App from "./App";
import "./dawn-ui/index";
import "./style/main.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import AlertManager from "./dawn-ui/components/AlertManager";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { Provider } from "react-redux";
import store from "./stores/store";
import ContextMenuManager from "./dawn-ui/components/ContextMenuManager";
import { FlyoutManager } from "./dawn-ui/components/Flyout";
import Showcase from "./dawn-ui/Showcase";

const router = createBrowserRouter(
  [
    {
      path: "/channels/:sid?/:cid?",
      element: <App />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/",
      element: <Home />,
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
      v7_fetcherPersist: true,
      v7_normalizeFormMethod: true,
      v7_partialHydration: true,
      v7_skipActionErrorRevalidation: true,
      // @ts-ignore
      v7_startTransition: true,
    },
  }
);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <ContextMenuManager />
    <AlertManager />
    <FlyoutManager />
    <RouterProvider router={router} />
  </Provider>
);
