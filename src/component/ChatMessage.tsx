import { USER_ICON } from "../utils/constant";

const ChatMessage = ({ name, message }) => {
  return (
    <div className="flex items-start gap-2 px-2 py-1 shrink-0">
      <img
        src={USER_ICON}
        alt="user-icons"
        className="w-8 h-8 rounded-full shrink-0"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-sm wrap-break-word">{message}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
