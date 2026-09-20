import { useDispatch, useSelector } from "react-redux";
import { toggleMenu } from "../utils/appSlice";
import { useEffect, useState } from "react";
import { HEMBERGER_ICON, USER_ICON, YOUTUBE_LOGO } from "../utils/constant";
import { getSearchSuggestions } from "../utils/suggestions";
import { cacheResult } from "../utils/cacheSlice";
import type { RootState } from "../utils/store";

const Head = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const dispatch = useDispatch();
  const searchCache = useSelector((state: RootState) => state.search);

  const getSearchSuggestion = async () => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }

    if (searchCache[searchQuery]) {
      setSuggestions(searchCache[searchQuery]);
    } else {
      try {
        const suggestions = await getSearchSuggestions(searchQuery.trim());

        setSuggestions(suggestions);
        dispatch(cacheResult({ [searchQuery]: suggestions }));
      } catch (error) {
        console.error("Suggestion error:", error);
        setSuggestions([]);
      }
    }
  };

  /**
   *  key - i
   * - destroy the component (useEffect return method)
   * - render the component
   * - userEffect()
   * - start timer => make api call after 200 ms
   */

  useEffect(() => {
    const timer = setTimeout(() => {
      getSearchSuggestion();
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleClick = () => {
    dispatch(toggleMenu());
  };

  return (
    <div className="sticky top-0 z-50 grid grid-flow-col items-center p-2 m-0 bg-white shadow-lg">
      <div className="flex col-span-2">
        <img
          onClick={handleClick}
          className="h-8 cursor-pointer"
          src={HEMBERGER_ICON}
          alt="hemberger"
        />
        <img className="h-8 mx-2" src={YOUTUBE_LOGO} alt="logo" />
      </div>
      <div className="col-span-8 flex justify-center">
        <div className="relative w-full max-w-xl">
          <div className="flex">
            <input
              type="text"
              placeholder="search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setShowSuggestions(false)}
              className="px-6 w-full border border-gray-400 p-2 rounded-l-full"
            />
            <button
              type="button"
              className="border border-gray-400 px-5 py-2 rounded-r-full bg-gray-100"
            >
              🔍
            </button>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 mt-1 z-50 w-full max-h-96 overflow-y-auto bg-white p-2 rounded-lg shadow-lg text-left border border-gray-200">
              <ul>
                {suggestions.map((suggestion, i) => (
                  <li key={i} className="px-3 py-2 rounded hover:bg-gray-100">
                    🔍 {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <div className="col-span-1 flex justify-end">
        <img className="h-8" src={USER_ICON} alt="user-icon" />
      </div>
    </div>
  );
};

export default Head;
