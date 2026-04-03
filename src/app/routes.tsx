import { createBrowserRouter } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { PropertyDetail } from "./pages/PropertyDetail";
import { Favorites } from "./pages/Favorites";
import { Profile } from "./pages/Profile";
import { Messages } from "./pages/Messages";
import { History } from "./pages/History";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: Home },
      { path: "favorites", Component: Favorites },
      { path: "messages", Component: Messages },
      { path: "history", Component: History },
      { path: "profile", Component: Profile },
    ],
  },
  {
    path: "/property/:id",
    Component: PropertyDetail,
  },
]);
