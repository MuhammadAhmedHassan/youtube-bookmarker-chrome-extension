chrome.runtime.onInstalled.addListener(() => {
  console.log("My YT Bookmarks Extension installed!");
});

// Add other background logic here
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // const activeTab = await chrome.tabs.get(tabId);
  console.log({ tabId, tab, changeInfo });

  if (
    changeInfo.status !== "complete" ||
    !tab.url?.includes("youtube.com/watch")
  )
    return;

  // // Ensure content script is injected (needs scripting permission)
  // await chrome.scripting.executeScript({
  //   target: { tabId: tabId },
  //   files: ["contentScript.js"],
  // });

  const queryParameters = tab.url.split("?")[1];

  const urlParameters = new URLSearchParams(queryParameters);

  chrome.tabs.sendMessage(tabId, {
    type: "NEW",
    videoId: urlParameters.get("v"),
  });
});
