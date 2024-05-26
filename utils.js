// function to get current chrome tab
export const getActiveTabURL = async () => {
  let queryOptions = {active: true, currentWindow: true};
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};
