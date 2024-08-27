export async function getActiveTabURL() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}
