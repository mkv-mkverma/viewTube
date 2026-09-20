import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { closeMenu } from "../utils/appSlice";
import { useSearchParams } from "react-router-dom";
import CommentsContainer from "./CommentsContainer";
import ChatContainer from "./LiveChat";

const WatchPage = () => {
  const [searchParams] = useSearchParams();

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(closeMenu());
  }, []);

  return (
    <div className="flex flex-1 min-w-0">
      <div className="min-w-0">
        <div className="px-2">
          <iframe
            width="996"
            height="560"
            src={"https://www.youtube.com/embed/" + searchParams.get("v")}
            title="YouTube vide player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          ></iframe>
        </div>
        <CommentsContainer />
      </div>
      <div className="flex-1 min-w-75">
        <ChatContainer />
      </div>
    </div>
  );
};

export default WatchPage;
