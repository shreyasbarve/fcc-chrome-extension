(() => {
  let youtubeLeftControls, youtubePlayer;
  let currentVideo = "";
  let currentVideoBookmarks = [];

  //   listen for the message from background.js file
  chrome.runtime.onMessage.addListener((obj, sender, response) => {
    const {type, value, videoId} = obj;

    if (type === "NEW") {
      currentVideo = videoId;
      newVideoLoaded();
    } else if (type === "PLAY") {
      youtubePlayer.currentTime = value;
    } else if (type === "DELETE") {
      currentVideoBookmarks = currentVideoBookmarks.filter(
        (b) => b.time != value
      );
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify(currentVideoBookmarks),
      });

      response(currentVideoBookmarks);
    }
  });

  //   fetch the bookmarks related to currently playing video
  const fetchBookmarks = () => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([currentVideo], (obj) => {
        resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
      });
    });
  };

  //   run when a new video is loaded
  const newVideoLoaded = async () => {
    // check if our bookmark button exists in the youtube player
    const bookmarkBtnExists =
      document.getElementsByClassName("bookmark-btn")[0];

    currentVideoBookmarks = await fetchBookmarks();

    // if our bookmark button is not present then create it
    if (!bookmarkBtnExists) {
      const bookmarkBtn = document.createElement("img");

      bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
      bookmarkBtn.className = "ytp-button " + "bookmark-btn";
      bookmarkBtn.title = "Click to bookmark current timestamp";

      //   get the youtube controle (cc, settings, cast, maximize etc..)
      youtubeLeftControls =
        document.getElementsByClassName("ytp-left-controls")[0];
      //   get the whole youtube player which has the details of timestamp of video
      youtubePlayer = document.getElementsByClassName("video-stream")[0];

      //   add our bookmark image to the controls section of youtube
      youtubeLeftControls.appendChild(bookmarkBtn);

      //   add a click event listener on our bookmark
      bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
    }
  };

  //   function which will run when we click on our bookmark
  const addNewBookmarkEventHandler = async () => {
    // get the current time on playing video
    const currentTime = youtubePlayer.currentTime;
    console.log(currentTime);
    // create the new bookmark object
    const newBookmark = {
      time: currentTime,
      desc: "Bookmark at " + getTime(currentTime),
    };

    currentVideoBookmarks = await fetchBookmarks();

    // set our created bookmark data in chrome storage
    chrome.storage.sync.set({
      [currentVideo]: JSON.stringify(
        [...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time)
      ),
    });
  };

  //   we are loading the script when the page updates but when we reload the page, the bookmark does not load, this solves that issue
  let trail = "&ytExt=ON";
  if (
    !window.location.href.includes(trail) &&
    !window.location.href.includes("ab_channel") &&
    window.location.href.includes("youtube.com/watch")
  ) {
    window.location.href += trail;
  }
})();

// function to return time as we get the time from yt player in seconds
const getTime = (t) => {
  var date = new Date(0);
  date.setSeconds(t);

  return date.toISOString().substring(11, 19);
};
