import { USER_ICON } from "../utils/constant";

const Comments = ({ info }) => {
  const { name, text, reply } = info;
  return (
    <div className="flex bg-gray-200 m-2 rounded-1xl">
      <img src={USER_ICON} alt="user-icons" className=" w-15 h-15" />
      <div className="px-2 my-2 ">
        <p className="px-2 font-bold">{name}</p>
        <p className="px-2">{text}</p>
      </div>
    </div>
  );
};

export default Comments;
