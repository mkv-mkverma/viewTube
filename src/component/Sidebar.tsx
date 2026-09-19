import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

interface AppState {
  app: { isMenuOpen: boolean };
}

const Sidebar = () => {
  const isToggle = useSelector((store: AppState) => store.app.isMenuOpen);

  if (!isToggle) return null;

  return (
    <div className="p-10 shadow-lg w-96">
      <ul>
        <Link to="/">
          <li>Home</li>
        </Link>
        <li>Sports</li>
        <li>Gaming</li>
        <li>Movies</li>
      </ul>
      <h1 className="font-bold pt-4">Subscriptions</h1>
      <ul>
        <li>Music</li>
        <li>Sports</li>
        <li>Gaming</li>
        <li>Movies</li>
      </ul>
      <h1 className="font-bold pt-4">Watch Later</h1>
      <ul>
        <li>Music</li>
        <li>Sports</li>
        <li>Gaming</li>
        <li>Movies</li>
      </ul>
    </div>
  );
};

export default Sidebar;
