import "./i18n";
import ReactDOM from "react-dom/client";
import App, { baseUrl } from "./App";
import "./dawn-ui/index";
import "./style/main.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import { Provider } from "react-redux";
import store from "./stores/store";
import Invite from "./pages/Invite";
import Showcase from "./dawn-ui/Showcase";
import PageManager from "./components/PageManager";
import AllUtilities from "./dawn-ui/AllUtilities";
import UserViewerManager from "./components/UserViewerManager";
import ForgotPassword from "./pages/ForgotPassword";
import { AxiosWrapper } from "./dawn-ui/util";

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
      path: "/login/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/register",
      element: <Register />,
    },
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/invites/:invite",
      element: <Invite />,
    },
    {
      path: "/s",
      element: <Showcase />,
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
  },
);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <Provider store={store}>
    <PageManager />
    <AllUtilities />
    <UserViewerManager />
    <RouterProvider router={router} />
  </Provider>,
);
