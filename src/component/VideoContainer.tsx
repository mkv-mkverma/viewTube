import { useEffect, useState } from "react";

import { YOUTUBE_VIDEOS_API } from "../utils/constant";
import VideoCard, { type VideoInfo } from "./VideoCard";
import { Link } from "react-router-dom";

const VideoContainer = () => {
  const [videos, setVideos] = useState<VideoInfo[]>([]);

  const getVideo = async () => {
    const res = await fetch(YOUTUBE_VIDEOS_API);
    const data = await res.json();
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
        videos.map((video,i) => {
          return (
            <Link key={video["id"]} to={"/watch?v=" + video["id"]}>
              {i===0? <AdVideoCard info={video}/> : <VideoCard info={video} />}
            </Link>
          );
        })}
    </div>
  );
};

// HOC

const AdVideoCard = ({ info }: { info: VideoInfo }) => {
  return (
    <div className="m-0 p-0 border border-b-black">
      <VideoCard info={info} />
      <p className="mx-2">Ad: Sponsored</p>
    </div>
  );
};

export default VideoContainer;
