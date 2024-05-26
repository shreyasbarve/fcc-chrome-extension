// get the currentTab url
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParams = tab.url.split("?")[1];
    const urlParams = new URLSearchParams(queryParams);
    console.log("OUTPUT : ", urlParams);

    // send message to the contentScript.js
    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoId: urlParams.get("v"),
    });
  }
});
