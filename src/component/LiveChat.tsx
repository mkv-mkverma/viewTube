import { useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
interface IChat {
  id: number;
  name: string;
  message: string;
}

const NAMES = ["Manish", "Priya", "Rahul", "Ananya", "Vikram", "Sneha"];
const MESSAGES = [
  "This is fire 🔥",
  "First!",
  "Who else is watching in 2026?​​ ✝",
  "lol 😂",
  "W video",
  "Anyone got the song name?",
  "This deserves way more views 👑🌎🌹",
];

const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

const LiveChat = () => {
  const [chats, setChats] = useState<IChat[]>([]);
  const [message, setMessage] = useState("");
  useEffect(() => {
    let id = 0;
    const t = setInterval(() => {
      const m = {
        id: id++,
        name: pick(NAMES),
        message: pick(MESSAGES),
      };
      // newest first; keep only the 10 most recent
      setChats((p) => [m, ...p].slice(0, 10));
    }, 1000);

    return () => {
      clearInterval(t);
    };
  }, []);

  return (
    <div className="w-full px-2">
      <div className="w-full h-125 flex flex-col-reverse overflow-y-auto p-2 shadow-2xl bg-slate-100 rounded-lg border border-black shadow-gray-100">
        {chats.map((chat) => (
          <ChatMessage key={chat.id} name={chat.name} message={chat.message} />
        ))}
      </div>
      <form
        className="w-full flex gap-2 py-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!message.trim()) return;
          setChats((p) => [
            { id: Date.now(), name: "Manish Kumar Verma", message },
            ...p,
          ]);
          setMessage("");
        }}
      >
        <input
          type="text"
          placeholder="Enter Message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 border border-gray-400 rounded-lg"
        />
        <button
          type="submit"
          className="px-4 py-2 shrink-0 cursor-pointer border border-gray-400 rounded-lg bg-gray-100"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default LiveChat;
