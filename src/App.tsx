import { useCallback, useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { getActiveTabURL } from "./helpers/utils";

function App() {
  const [count, setCount] = useState(0);

  const [isYoutubeVideoPage, setIsYoutubeVideoPage] = useState(false);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const getActiveTabAndCurrentVideoId = useCallback(async () => {
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url?.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideoId =
      urlParameters.get("v") ??
      queryParameters?.split("&")?.[0]?.split("=").pop();
    return { activeTab, currentVideoId };
  }, []);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        // const activeTab = await getActiveTabURL();
        // const queryParameters = activeTab.url?.split("?")[1];
        // const urlParameters = new URLSearchParams(queryParameters);

        // const currentVideo =
        //   urlParameters.get("v") ??
        //   queryParameters?.split("&")?.[0]?.split("=").pop();
        const { activeTab, currentVideoId } =
          await getActiveTabAndCurrentVideoId();

        if (activeTab.url?.includes("youtube.com/watch") && currentVideoId) {
          const data = await chrome.storage.sync.get([currentVideoId]);
          const currentVideoBookmarks = data[currentVideoId]
            ? JSON.parse(data[currentVideoId])
            : [];

          // send bookmarks to our extension Popup
          setBookmarks(currentVideoBookmarks);
          setIsYoutubeVideoPage(true);
        } else {
          setIsYoutubeVideoPage(false);
          return;
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchBookmarks();
  }, [getActiveTabAndCurrentVideoId]);

  const playBookmark = async (bookmark: Bookmark) => {
    const activeTab = await getActiveTabURL();
    if (!activeTab) return;

    // works but need scripting permission
    // chrome.scripting.executeScript<number[], void>({
    //   target: { tabId: activeTab.id! },
    //   args: [bookmark.time],
    //   func: (bookmarkTime) => {
    //     const youtubePlayer = document.getElementsByClassName(
    //       "video-stream"
    //     )[0] as HTMLVideoElement;
    //     youtubePlayer.currentTime = bookmarkTime;
    //   },
    // });

    chrome.tabs.sendMessage(activeTab.id!, {
      type: "PLAY",
      value: bookmark.time,
    });
  };

  const removeBookmark = async (bookmark: Bookmark) => {
    const { currentVideoId } = await getActiveTabAndCurrentVideoId();
    if (!currentVideoId) return;

    const updatedBookmarks = bookmarks
      .filter((b) => b.id !== bookmark.id)
      .sort((a, b) => a.time - b.time);

    await chrome.storage.sync.set({
      [currentVideoId]: JSON.stringify(updatedBookmarks),
    });
    setBookmarks(updatedBookmarks);
  };

  return (
    <>
      <div>
        <a href='https://vitejs.dev' target='_blank' rel='noopener'>
          <img src={viteLogo} className='logo' alt='Vite logo' />
        </a>
        <a href='https://react.dev' target='_blank' rel='noopener'>
          <img src={reactLogo} className='logo react' alt='React logo' />
        </a>
      </div>
      <h1>Vite + React + World</h1>
      <div className='card'>
        <button type='button' onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>

        {isYoutubeVideoPage ? (
          bookmarks.length < 1 ? (
            <p>
              <em>No bookmark found</em>
            </p>
          ) : (
            <ul className='bookmark-list'>
              {bookmarks.map((bookmark) => (
                <li key={bookmark.desc} className='bookmark-item'>
                  <p>{bookmark.desc}</p>

                  <div>
                    <img
                      src='assets/play.png'
                      alt='play'
                      role='button'
                      onClick={() => playBookmark(bookmark)}
                    />
                    <img
                      src='assets/delete.png'
                      alt='delete'
                      role='button'
                      onClick={() => removeBookmark(bookmark)}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p>Not a youtube video page</p>
        )}
      </div>
      <p className='read-the-docs'>
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
