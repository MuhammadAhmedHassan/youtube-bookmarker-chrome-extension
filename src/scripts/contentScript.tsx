import { nanoid } from "nanoid";

// import { createRoot } from "react-dom/client";

// const App = () => {
//   return (
//     <div>
//       <h1>Hello from Content Script!</h1>
//     </div>
//   );
// };

// const rootElement = document.createElement("div");
// rootElement.id = "my-chrome-extension-root";
// document.body.appendChild(rootElement);

// const root = createRoot(rootElement);
// root.render(<App />);

(() => {
  let youtubeLeftControls: HTMLDivElement, youtubePlayer: HTMLVideoElement;
  let currentVideoId = "";
  let currentVideoBookmarks: Bookmark[] = [];

  chrome.runtime.onMessage.addListener((obj, _, response) => {
    const { type, value, videoId } = obj;

    switch (type) {
      case "NEW":
        currentVideoId = videoId;
        newVideoLoaded();

        break;
      case "PLAY":
        if (youtubePlayer) youtubePlayer.currentTime = value;
        break;

      case "DELETE_BOOKMARK":
        currentVideoBookmarks = currentVideoBookmarks.filter(
          (b) => b.id !== value
        );
        chrome.storage.sync.set({
          [currentVideoId]: JSON.stringify(currentVideoBookmarks),
        });
        response(currentVideoBookmarks);
        break;

      default:
        break;
    }
  });

  const fetchBookmarks = () => {
    return new Promise<Bookmark[]>((resolve) => {
      chrome.storage.sync.get([currentVideoId], (obj) => {
        resolve(obj[currentVideoId] ? JSON.parse(obj[currentVideoId]) : []);
      });
    });
  };

  const newVideoLoaded = async () => {
    try {
      const bookmarkBtnExists =
        document.getElementsByClassName("bookmark-btn")[0];
      currentVideoBookmarks = await fetchBookmarks();

      if (bookmarkBtnExists) return;

      const bookmarkBtn = document.createElement("img");
      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      youtubeLeftControls = document.getElementsByClassName(
        "ytp-left-controls"
      )[0] as HTMLDivElement;
      youtubePlayer = document.getElementsByClassName(
        "video-stream"
      )[0] as HTMLVideoElement;

      youtubeLeftControls?.appendChild(bookmarkBtn);

      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    } catch (error) {
      console.log("newVideoLoaded", error);
    }
  };

  const addNewBookmarkEventHandler = async () => {
    try {
      const currentTime = youtubePlayer.currentTime;
      const newBookmark = {
        id: nanoid(),
        time: currentTime,
        desc: "Bookmark at " + getTime(currentTime),
      };

      currentVideoBookmarks = await fetchBookmarks();

      currentVideoBookmarks = [...currentVideoBookmarks, newBookmark].sort(
        (a, b) => a.time - b.time
      );

      await chrome.storage.sync.set({
        [currentVideoId]: JSON.stringify(currentVideoBookmarks),
      });
    } catch (error) {
      console.log("addNewBookmarkEventHandler", error);
    }
  };

  const getTime = (t: number) => {
    const date = new Date(0);
    date.setSeconds(t);
    return date.toISOString().substring(11, 19);
  };
})();
