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

const router = createBrowserRouter([
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
]);

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <Provider store={store}>
    <ContextMenuManager />
    <AlertManager />
    <RouterProvider router={router} />
  </Provider>
);
