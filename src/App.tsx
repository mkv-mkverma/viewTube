import { Provider } from "react-redux";
import "./App.css";
import Body from "./component/Body";
import Head from "./component/Head";
import store from "./utils/store";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainContainer from "./component/MainContainer";
import WatchPage from "./component/WatchPage";

const appRouter = createBrowserRouter(
  [
    {
      path: "/",
      element: <Body />,
      children: [
        {
          path: "/",
          element: <MainContainer />,
        },
        {
          path: "watch",
          element: <WatchPage />,
        },
      ],
    },
  ],
  // "/" in dev, "/viewTube/" on GitHub Pages, so routes stay relative to the
  // repo subpath the site is served from.
  { basename: import.meta.env.BASE_URL }
);

function App() {
  return (
    <>
      {/**
       * Header
       * Body
       * sidebar
       *  - menu item
       * Main container
       *  - button list
       *  - video container
       *   - video card
       */}
      <Provider store={store}>
        <Head />
        <RouterProvider router={appRouter} />
      </Provider>
    </>
  );
}

export default App;
