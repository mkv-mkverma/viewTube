import { useEffect, useState } from "react";

import { YOUTUBE_VIDEOS_API } from "../utils/constant";
import VideoCard from "./videoCard";
import { Link } from "react-router-dom";

const VideoContainer = () => {
  const [videos, setVideos] = useState([]);

  const getVideo = async () => {
    const res = await fetch(YOUTUBE_VIDEOS_API);
    const data = await res.json();
    console.log(data.items);
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      const data = await getVideo();
      setVideos(data.items);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-wrap">
      {videos &&
        videos.map((video) => {
          return (
            <Link key={video["id"]} to={"/watch?v=" + video["id"]}>
              <VideoCard info={video} />
            </Link>
          );
        })}
    </div>
  );
};

export default VideoContainer;
