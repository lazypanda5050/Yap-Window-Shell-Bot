(async function () {
  var readMessages = {};
  var readAll = true;
  var isDark = false;
  let pendingFormOptions = null;
  let isSending = false;
  const BOT_USERS = {
    AI: "[AI]",
    RNG: "[RNG]",
    EOD: "[EOD]",
    ADMIN: "[ADMIN]",
    SNAKE: "[Snake Game]",
  };
  const users = {};
  const email = auth.currentUser.email;

  if (!auth.currentUser || !auth.currentUser.emailVerified) {
    alert("Please verify your email before using chat.");
    return;
  }

  const sc = document.createElement("script");
  sc.setAttribute(
    "src",
    "https://cdn.jsdelivr.net/npm/emoji-toolkit@8.0.0/lib/js/joypixels.min.js",
  );
  document.head.appendChild(sc);
  const ss = document.createElement("stylesheet");
  sc.setAttribute(
    "href",
    "https://cdn.jsdelivr.net/npm/emoji-toolkit@8.0.0/extras/css/joypixels.min.css",
  );
  document.head.appendChild(ss);

  const gui = document.getElementById("bookmarklet-gui");
  chatScreen = document.getElementById("chat-screen");
  chatScreen.classList.remove("hidden");

  async function initializeReadMessages() {
    const readMessagesRef = ref(
      database,
      `Accounts/${email.replace(/\./g, "*")}/readMessages`,
    );
    const snapshot = await get(readMessagesRef);
    readMessages = snapshot.val() || {};
    return readMessages;
  }

  function updateReadAllStatus() {
    const allChats = document.querySelectorAll(".server");
    readAll = true;

    allChats.forEach((chat) => {
      const unreadCount = parseInt(chat.getAttribute("data-unread") || "0");
      if (unreadCount > 0) {
        readAll = false;
      }
    });
    updateFavicon();
  }

  async function scrollToFirstUnread(chatName) {
    const messagesDiv = document.getElementById("messages");

    await new Promise((resolve) => {
      const checkMessages = () => {
        if (messagesDiv.children.length > 0) {
          resolve();
        } else {
          setTimeout(checkMessages, 50);
        }
      };
      checkMessages();
    });

    if (messagesDiv.children.length === 0) {
      return;
    }

    const hasUnreadMessages =
      document.querySelector(".message.unread") !== null;

    if (!hasUnreadMessages) {
      return;
    }

    const lastReadMessageId = readMessages[chatName];

    if (!lastReadMessageId) {
      const allMessages = Array.from(messagesDiv.children);
      const lastMessage = allMessages[allMessages.length - 1];
      if (lastMessage) {
        const lastMessageId =
          lastMessage.dataset.lastMessageId || lastMessage.dataset.messageId;
        if (lastMessageId) {
          await markMessagesAsRead(chatName, lastMessageId);
        }
      }
      return;
    }

    async function findFirstUnreadMessage() {
      const allMessages = Array.from(messagesDiv.children);

      let lastReadMessageIndex = -1;
      for (let i = 0; i < allMessages.length; i++) {
        const msgElement = allMessages[i];
        const msgId = msgElement.dataset.messageId;
        const lastMsgId = msgElement.dataset.lastMessageId;

        if (msgId === lastReadMessageId || lastMsgId === lastReadMessageId) {
          lastReadMessageIndex = i;
          break;
        }
      }

      if (
        lastReadMessageIndex !== -1 &&
        lastReadMessageIndex < allMessages.length - 1
      ) {
        return allMessages[lastReadMessageIndex + 1];
      }

      if (messagesDiv.scrollTop <= 5) {
        if (allMessages.length > 0) {
          const lastMessage = allMessages[allMessages.length - 1];
          const lastMessageId =
            lastMessage.dataset.lastMessageId || lastMessage.dataset.messageId;
          if (lastMessageId) {
            await markMessagesAsRead(chatName, lastMessageId);
          }
        }

        return null;
      }

      const oldScrollHeight = messagesDiv.scrollHeight;

      await smoothScrollTo(messagesDiv, 0);

      await new Promise((resolve) => setTimeout(resolve, 600));

      if (messagesDiv.scrollHeight === oldScrollHeight) {
        if (allMessages.length > 0) {
          const lastMessage = allMessages[allMessages.length - 1];
          const lastMessageId =
            lastMessage.dataset.lastMessageId || lastMessage.dataset.messageId;
          if (lastMessageId) {
            await markMessagesAsRead(chatName, lastMessageId);
          }
        }

        return null;
      }

      return findFirstUnreadMessage();
    }

    try {
      const firstUnreadMessage = await findFirstUnreadMessage();
      if (firstUnreadMessage) {
        const targetPosition =
          firstUnreadMessage.offsetTop - messagesDiv.clientHeight / 3;

        if (messagesDiv.scrollTop <= 5 && targetPosition > 5) {
          messagesDiv.scrollTop = 0;
          await new Promise((resolve) => setTimeout(resolve, 100));

          await smoothScrollTo(messagesDiv, targetPosition);
        } else {
          await smoothScrollTo(messagesDiv, targetPosition);
        }
      }
    } catch (error) {
      console.error("Error scrolling to first unread:", error);
    }

    function smoothScrollTo(element, targetPosition) {
      return new Promise((resolve) => {
        const startPosition = element.scrollTop;
        const distance = targetPosition - startPosition;

        if (Math.abs(distance) < 5) {
          element.scrollTop = targetPosition;
          resolve();
          return;
        }

        const duration = 500;
        let start = null;

        function animation(currentTime) {
          if (!start) start = currentTime;
          const progress = (currentTime - start) / duration;

          if (progress < 1) {
            const ease = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);
            const currentPosition = startPosition + distance * ease(progress);
            element.scrollTop = currentPosition;
            window.requestAnimationFrame(animation);
          } else {
            element.scrollTop = targetPosition;
            resolve();
          }
        }

        window.requestAnimationFrame(animation);
      });
    }
  }
  async function updateFavicon() {
    const currentUrl = window.location.href;
    const hasUnreadMessages = !readAll;

    let link = document.querySelector(
      'link[rel="icon"], link[rel="shortcut icon"]',
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    if (hasUnreadMessages) {
      let notificationIconPath;

      if (currentUrl.includes("lakesideschool.instructure.com")) {
        iconUrl =
          "https://raw.githubusercontent.com/TheHumblePotato/Yap-Window/main/Favicon/CanvasNotification.png";
      } else if (currentUrl.includes("google.com")) {
        iconUrl =
          "https://raw.githubusercontent.com/TheHumblePotato/Yap-Window/main/Favicon/GoogleNotification.png";
      }

      if (iconUrl) {
        try {
          link.href = iconUrl;
        } catch (error) {
          console.error("Error loading notification favicon:", error);
        }
      }
    } else {
      if (currentUrl.includes("lakesideschool.instructure.com")) {
        link.href =
          "https://instructure-uploads-pdx.s3.us-west-2.amazonaws.com/account_211800000000000001/attachments/3701/smallershield.png";
      } else if (currentUrl.includes("google.com")) {
        link.href = "https://google.com/favicon.ico";
      }
    }
  }

  async function checkForUpdates() {
    const userRef = ref(
      database,
      `Accounts/${email.replace(/\./g, "*")}/Version`,
    );
    const updatesRef = ref(database, "Updates");

    const userVersionSnapshot = await get(userRef);
    const updatesSnapshot = await get(updatesRef);

    if (!userVersionSnapshot.exists() || !updatesSnapshot.exists()) {
      console.error("Failed to fetch user version or updates.");
      return;
    }

    const userVersionData =
      userVersionSnapshot.val().replace("*", ".") || "1.0";
    const updates = updatesSnapshot.val();

    const userVersion = userVersionData.split(".").map(Number);
    const versionKeys = Object.keys(updates)
      .map((v) => v.replace("*", ".").split(".").map(Number))
      .filter((version) => {
        for (let i = 0; i < Math.max(version.length, userVersion.length); i++) {
          const vPart = version[i] || 0;
          const cPart = userVersion[i] || 0;
          if (vPart > cPart) return true;
          if (vPart < cPart) return false;
        }
        return false;
      });

    if (versionKeys.length > 0) {
      const newUpdates = versionKeys.map((version) => version.join("*"));
      showUpdatePopup(updates, newUpdates);
    }
  }

  function showUpdatePopup(updates, newUpdates) {
    const popup = document.createElement("div");
    popup.classList.add("update-popup");
    popup.style.position = "fixed";
    popup.style.top = "10%";
    popup.style.left = "50%";
    popup.style.transform = "translateX(-50%)";
    popup.style.backgroundColor = isDark ? "#2c2c2c" : "#fff";
    popup.style.color = isDark ? "#eaeaea" : "#333";
    popup.style.padding = "20px";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = isDark
      ? "0 4px 8px rgba(0, 0, 0, 0.6)"
      : "0 4px 8px rgba(0, 0, 0, 0.1)";
    popup.style.zIndex = "100000";
    popup.style.maxWidth = "300px";
    popup.style.maxHeight = "250px";
    popup.style.overflowY = "auto";

    const title = document.createElement("h3");
    title.textContent = "New Updates!";
    popup.appendChild(title);

    newUpdates.forEach((version) => {
      const update = updates[version];

      const updateElement = document.createElement("div");

      const updateHeader = document.createElement("strong");
      updateHeader.textContent = `Update ${version.replace("*", ".")}`;

      const updateDate = document.createElement("small");
      updateDate.textContent = ` (${new Date(update.Date).toLocaleDateString()})`;

      const updateDescription = document.createElement("p");
      updateDescription.textContent = update.Description;

      updateElement.appendChild(updateHeader);
      updateElement.appendChild(updateDate);
      updateElement.appendChild(updateDescription);
      popup.appendChild(updateElement);
    });

    const closeButton = document.createElement("button");
    closeButton.style.backgroundColor = isDark ? "#bf21a7" : "#fc8dec";
    closeButton.textContent = "Close";
    closeButton.onclick = () => popup.remove();
    popup.appendChild(closeButton);

    document.getElementById("chat-screen").appendChild(popup);

    const mostRecentVersion = newUpdates[newUpdates.length - 1];
    set(
      ref(database, `Accounts/${email.replace(/\./g, "*")}/Version`),
      mostRecentVersion,
    );
  }

  async function fetchChatList() {
    const chatRef = ref(database, "Chat Info");

    onValue(chatRef, async (snapshot) => {
      const chatData = snapshot.val();
      if (chatData) {
        await populateSidebar(chatData);
        const generalServer = Array.from(
          document.querySelectorAll(".server"),
        ).find((server) => server.textContent.trim() === "General");
        if (generalServer) {
          generalServer.classList.add("selected");
        }
      }
    });
  }

  var currentChat = "General";
  let currentChatListener = null;

  async function populateSidebar(chatData) {
    if (Object.keys(readMessages).length === 0) {
      await initializeReadMessages();
    }

    const sidebar = document.getElementById("server-list");
    sidebar.innerHTML = "";

    const chatElements = new Map();

    for (const [chatName, chatInfo] of Object.entries(chatData)) {
      const { Description, Members, Type } = chatInfo;
      const memberList =
        Type === "Private"
          ? Members.split(",").map((m) => m.trim().replace(/\s+/g, ""))
          : [];

      if (
        Type === "Public" ||
        (Type === "Private" && memberList.includes(email.replace(/\./g, "*")))
      ) {
        const chatElement = document.createElement("div");
        chatElement.className = "server";
        chatElement.textContent = chatName;
        chatElement.title = Description;

        const badge = document.createElement("span");
        badge.className = "unread-badge";
        badge.style.display = "none";
        badge.style.backgroundColor = isDark ? "#ff6b6b" : "#ff4444";
        badge.style.color = "white";
        badge.style.borderRadius = "10px";
        badge.style.padding = "2px 6px";
        badge.style.fontSize = "12px";
        badge.style.marginLeft = "5px";
        chatElement.appendChild(badge);

        chatElement.onclick = function () {
          document
            .querySelectorAll(".server")
            .forEach((s) => s.classList.remove("selected"));
          this.classList.add("selected");
          loadMessages(chatName);
          updateUnreadCount(chatName);
          updateModifyButtonVisibility();
        };

        sidebar.appendChild(chatElement);
        chatElements.set(chatName, chatElement);
      }
    }

    chatElements.forEach((element, chatName) => {
      const chatRef = ref(database, `Chats/${chatName}`);
      onValue(chatRef, async (snapshot) => {
        const messages = snapshot.val() || {};
        const lastReadMessage = readMessages[chatName] || "";
        let unreadCount = 0;

        Object.entries(messages).forEach(([messageId, message]) => {
          if (
            message.User !== email &&
            (!lastReadMessage || messageId > lastReadMessage)
          ) {
            unreadCount++;
          }
        });

        const badge = element.querySelector(".unread-badge");
        element.setAttribute("data-unread", unreadCount);

        if (unreadCount > 0) {
          badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
          badge.style.display = "inline";
        } else {
          badge.style.display = "none";
        }
      });
    });

    updateReadAllStatus();
  }

  async function updateUnreadCount(chatName) {
    const chatRef = ref(database, `Chats/${chatName}`);
    const snapshot = await get(chatRef);
    const messages = snapshot.val() || {};

    const accountRef = ref(
      database,
      `Accounts/${email.replace(/\./g, "*")}/readMessages/${chatName}`,
    );
    const lastReadSnapshot = await get(accountRef);
    const lastReadMessage = lastReadSnapshot.val() || "";
    let unreadCount = 0;

    const sortedMessages = Object.entries(messages).sort(
      ([, a], [, b]) => new Date(a.Date) - new Date(b.Date),
    );

    let lastReadIndex = -1;
    sortedMessages.forEach(([messageId, message], index) => {
      if (messageId === lastReadMessage) {
        lastReadIndex = index;
      }
    });

    sortedMessages.forEach(([messageId, message], index) => {
      if (message.User !== email && index > lastReadIndex) {
        unreadCount++;
      }
    });

    const chatElement = Array.from(document.querySelectorAll(".server")).find(
      (el) => el.textContent.trim().includes(chatName.trim()),
    );

    if (chatElement) {
      const badge = chatElement.querySelector(".unread-badge");
      chatElement.setAttribute("data-unread", unreadCount);

      if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
        badge.style.display = "inline";
      } else {
        badge.style.display = "none";
      }

      if (badge) {
        badge.style.backgroundColor = isDark ? "#ff6b6b" : "#ff4444";
        badge.style.color = "white";
      }
    }

    updateReadAllStatus();
  }

  let hasInteracted = false;
  let lastUpdateTime = 0;
  const UPDATE_INTERVAL = 60000;

  function trackUserInteraction() {
    hasInteracted = true;
  }

  async function updateLastInteractTime() {
    if (!email) return;

    const formattedEmail = email.replace(/\./g, "*");

    const lastInteractRef = ref(
      database,
      `Accounts/${formattedEmail}/LastInteract`,
    );

    try {
      const timestamp = Date.now();

      await set(lastInteractRef, timestamp);

      hasInteracted = false;
      lastUpdateTime = timestamp;
    } catch (error) {
      console.error("Error updating last interaction time:", error);
    }
  }

  function setupInteractionTracking(gui) {
    const target = gui.domElement || gui;

    if (target) {
      target.addEventListener("click", () => trackUserInteraction());
      target.addEventListener("change", () => trackUserInteraction());
    }

    if (gui.controllers) {
      gui.controllers.forEach((controller) => {
        if (controller.domElement) {
          controller.domElement.addEventListener("mousedown", () =>
            trackUserInteraction(),
          );
          controller.domElement.addEventListener("touchstart", () =>
            trackUserInteraction(),
          );
          controller.domElement.addEventListener("change", () =>
            trackUserInteraction(),
          );
        }
      });
    }

    setInterval(() => {
      const currentTime = Date.now();

      if (hasInteracted && currentTime - lastUpdateTime >= UPDATE_INTERVAL) {
        updateLastInteractTime();
      }
    }, UPDATE_INTERVAL);
  }

  function initializeUserActivitySidebar() {
    const userActivityBtn = document.getElementById("user-activity");
    const rightUserSidebar = document.getElementById("right-user-sidebar");
    const closeUserSidebarBtn = document.getElementById("close-user-sidebar");

    userActivityBtn.addEventListener("click", () => {
      rightUserSidebar.classList.toggle("visible");
      rightUserSidebar.classList.toggle("hidden");

      if (rightUserSidebar.classList.contains("visible")) {
        updateUserActivityList();

        window.userActivityInterval = setInterval(
          updateUserActivityList,
          60000,
        );
      } else {
        clearInterval(window.userActivityInterval);
      }
    });

    closeUserSidebarBtn.addEventListener("click", () => {
      rightUserSidebar.classList.remove("visible");
      clearInterval(window.userActivityInterval);
    });
  }

  async function updateUserActivityList() {
    try {
      const accountsRef = ref(database, "Accounts");
      const accountsSnapshot = await get(accountsRef);

      if (!accountsSnapshot.exists()) {
        return;
      }

      const accounts = accountsSnapshot.val();
      const currentTime = Date.now();

      const activeUsers = [];
      const recentlyActiveUsers = [];
      const inactiveUsers = [];

      const currentUserEmail = email;
      const currentUserFormattedEmail = currentUserEmail.replace(/\./g, '*');

      Object.keys(accounts).forEach((formattedEmail) => {
        if (formattedEmail === currentUserFormattedEmail) {
          return;
        }
        
        const account = accounts[formattedEmail];
        const lastInteract = account.LastInteract || 0;
        const username = account.Username || "Unknown";
        const email = formattedEmail.replace(/\*/g, ".");
        const timeDiff = currentTime - lastInteract;

        const userInfo = {
          username,
          email,
          lastInteract,
        };

        if (timeDiff < 2 * 60 * 1000) {
          activeUsers.push(userInfo);
        } else if (timeDiff < 5 * 60 * 1000) {
          recentlyActiveUsers.push(userInfo);
        } else {
          inactiveUsers.push(userInfo);
        }
      });

      const sortByEmail = (a, b) => a.email.localeCompare(b.email);
      activeUsers.sort(sortByEmail);
      recentlyActiveUsers.sort(sortByEmail);
      inactiveUsers.sort(sortByEmail);

      updateUserListInDOM("active-users", activeUsers);
      updateUserListInDOM("recently-active-users", recentlyActiveUsers);
      updateUserListInDOM("inactive-users", inactiveUsers);
    } catch (error) {
      console.error("Error updating user activity list:", error);
    }
  }

  function updateUserListInDOM(elementId, users) {
    const listElement = document.getElementById(elementId);
    listElement.innerHTML = "";

    if (users.length === 0) {
      const noUsersElement = document.createElement("div");
      noUsersElement.className = "no-users";
      noUsersElement.textContent = "No users in this category";
      listElement.appendChild(noUsersElement);
      return;
    }

    users.forEach((user) => {
      const userElement = document.createElement("div");
      userElement.className = "user-item";

      const statusIndicator = document.createElement("span");
      statusIndicator.className = "status-indicator";
      if (elementId === "active-users") {
        statusIndicator.classList.add("active");
      } else if (elementId === "recently-active-users") {
        statusIndicator.classList.add("recently-active");
      } else {
        statusIndicator.classList.add("inactive");
      }

      const userInfo = document.createElement("div");
      userInfo.style.display = "flex";
      userInfo.style.flexDirection = "column";
      userInfo.style.marginLeft = "8px";
      userInfo.style.overflow = "hidden";

      const userName = document.createElement("span");
      userName.className = "user-name";
      userName.textContent = user.username;

      const userEmail = document.createElement("span");
      userEmail.className = "user-email";
      userEmail.textContent = `(${user.email})`;

      userInfo.appendChild(userName);
      userInfo.appendChild(userEmail);

      userElement.appendChild(statusIndicator);
      userElement.appendChild(userInfo);

      listElement.appendChild(userElement);
    });
  }

  async function getUsernameFromEmail(userEmail) {
    if (!userEmail) return "";
    if (
      ["[AI]", "[EOD]", "[RNG]", "[ADMIN]", "[Snake Game]"].includes(userEmail)
    )
      return userEmail;
    const formattedEmail = userEmail.replace(/\./g, "*");
    const userRef = ref(database, `Accounts/${formattedEmail}/Username`);
    try {
      const snapshot = await get(userRef);
      return snapshot.exists() ? snapshot.val() : userEmail.split("@")[0];
    } catch (error) {
      return userEmail.split("@")[0];
    }
  }

  async function loadMessages(chatName) {
    document.getElementById("bookmarklet-gui").scrollTop = 0;
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML = "";
    currentChat = chatName;

    const chatRef = ref(database, `Chats/${chatName}`);
    const snapshot = await get(chatRef);
    const messages = snapshot.val();
    if (messages) {
      const messageIds = Object.keys(messages).sort();
      if (messageIds.length > 0) {
        const latestMessageId = messageIds[messageIds.length - 1];
        await markMessagesAsRead(chatName, latestMessageId);
      }
    }

    if (currentChatListener) {
      currentChatListener();
      currentChatListener = null;
    }

    const messagesRef = ref(database, `Chats/${chatName}`);
    const appendedMessages = new Set();
    let loadedMessages = [];
    let isLoadingMore = false;
    let initialLoad = true;
    let oldestLoadedTimestamp = null;
    const MESSAGES_PER_LOAD = 100;
    function logMessageOrder(messages, label) {}
    messagesDiv.addEventListener("scroll", async () => {
      if (
        messagesDiv.scrollTop <= 100 &&
        !isLoadingMore &&
        loadedMessages.length > 0
      ) {
        isLoadingMore = true;

        const oldestDisplayedMessage = messagesDiv.firstChild;
        if (
          oldestDisplayedMessage &&
          oldestDisplayedMessage.dataset.messageId
        ) {
          const oldestDisplayedId = oldestDisplayedMessage.dataset.messageId;
          const oldestDisplayedIndex = loadedMessages.findIndex(
            (msg) => msg.id === oldestDisplayedId,
          );

          if (oldestDisplayedIndex > 0) {
            const oldScrollHeight = messagesDiv.scrollHeight;
            const oldScrollTop = messagesDiv.scrollTop;

            const olderMessages = loadedMessages.slice(
              Math.max(0, oldestDisplayedIndex - MESSAGES_PER_LOAD),
              oldestDisplayedIndex,
            );

            for (let i = olderMessages.length - 1; i >= 0; i--) {
              await appendSingleMessage(olderMessages[i], true);
            }

            requestAnimationFrame(() => {
              const newScrollHeight = messagesDiv.scrollHeight;
              const heightDifference = newScrollHeight - oldScrollHeight;
              messagesDiv.scrollTop = oldScrollTop + heightDifference;
            });
          }
        }
        isLoadingMore = false;
      }
    });
    function formatDate(dateString) {
      const messageDate = new Date(dateString);
      const now = new Date();

      const messageMidnight = new Date(
        messageDate.getFullYear(),
        messageDate.getMonth(),
        messageDate.getDate(),
      );
      const todayMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const diffTime = todayMidnight - messageMidnight;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        return `Today ${messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else if (diffDays === 1) {
        return `Yesterday ${messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      } else {
        return `${diffDays} days ago ${messageDate.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }
    }

    async function appendSingleMessage(message, prepend = false) {
      if (appendedMessages.has(message.id) || currentChat !== chatName) return;

      const messageDate = new Date(message.Date);
      const username = message.User;
      const lastReadMessage = readMessages[chatName] || "";

      const wasNearBottom =
        messagesDiv.scrollHeight -
          messagesDiv.scrollTop -
          messagesDiv.clientHeight <=
        20;

      let adjacentMessageDiv = null;
      const timeThreshold = 5 * 60 * 1000;

      if (prepend) {
        const firstMessage = messagesDiv.firstChild;
        if (
          firstMessage &&
          firstMessage.dataset.user === username &&
          Math.abs(new Date(firstMessage.dataset.date) - messageDate) <
            timeThreshold
        ) {
          adjacentMessageDiv = firstMessage;
        }
      } else {
        const lastMessage = messagesDiv.lastChild;
        if (
          lastMessage &&
          lastMessage.dataset.user === username &&
          Math.abs(new Date(lastMessage.dataset.date) - messageDate) <
            timeThreshold
        ) {
          adjacentMessageDiv = lastMessage;
        }
      }

      if (adjacentMessageDiv) {
        const messageContent = document.createElement("p");
        messageContent.innerHTML = message.Message;
        messageContent.style.marginTop = "5px";

        adjacentMessageDiv.dataset.lastMessageId = message.id;

        if (
          message.User !== email &&
          (!lastReadMessage || message.id > lastReadMessage)
        ) {
          adjacentMessageDiv.classList.add("unread");
        }
        const mentions = messageContent.querySelectorAll(".mention");
        mentions.forEach((mention) => {
          if (
            mention.dataset.email === email ||
            mention.dataset.email === "Everyone"
          ) {
            mention.classList.add("highlight");
          }
        });
        adjacentMessageDiv.appendChild(messageContent);
      } else {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message");
        if (message.User === "w.n.lazypanda5050@gmail.com") {
          messageDiv.classList.add("winston");
          if (email === "w.n.lazypanda5050@gmail.com") {
            messageDiv.classList.add("sent");
          } else {
            messageDiv.classList.add("received");
            if (!lastReadMessage || message.id > lastReadMessage) {
              messageDiv.classList.add("unread");
            }
          }
        } else if (Object.values(BOT_USERS).includes(message.User)) {
          messageDiv.classList.add("bot");
          if (!lastReadMessage || message.id > lastReadMessage) {
            messageDiv.classList.add("unread");
          }
        } else if (message.User === email) {
          messageDiv.classList.add("sent");
        } else {
          messageDiv.classList.add("received");
          if (!lastReadMessage || message.id > lastReadMessage) {
            messageDiv.classList.add("unread");
          }
        }

        messageDiv.style.marginTop = "10px";
        messageDiv.dataset.messageId = message.id;
        messageDiv.dataset.user = username;
        messageDiv.dataset.date = messageDate;
        messageDiv.dataset.lastMessageId = message.id;

        const headerInfo = document.createElement("p");
        headerInfo.className = "send-info";
        headerInfo.textContent = `${username} ${formatDate(message.Date)}`;
        messageDiv.appendChild(headerInfo);

        getUsernameFromEmail(username).then((displayName) => {
          if (displayName && displayName !== username) {
            headerInfo.textContent = `${displayName} (${username}) ${formatDate(message.Date)}`;
          }
        });

        const messageContent = document.createElement("p");
        messageContent.innerHTML = message.Message;
        messageContent.style.marginTop = "5px";

        const mentions = messageContent.querySelectorAll(".mention");
        mentions.forEach((mention) => {
          if (
            mention.dataset.email === email ||
            mention.dataset.email === "Everyone"
          ) {
            mention.classList.add("highlight");
          }
        });
        messageDiv.appendChild(messageContent);

        if (prepend) {
          messagesDiv.insertBefore(messageDiv, messagesDiv.firstChild);
        } else {
          messagesDiv.appendChild(messageDiv);
        }

        adjacentMessageDiv = messageDiv;
      }

      if (!prepend && wasNearBottom) {
        requestAnimationFrame(() => {
          messagesDiv.scrollTop = messagesDiv.scrollHeight;
        });
      }

      appendedMessages.add(message.id);
      return adjacentMessageDiv;
    }

    currentChatListener = onValue(messagesRef, async (snapshot) => {
      const messages = snapshot.val();
      if (messages && currentChat === chatName) {
        const sortedMessages = Object.keys(messages)
          .map((messageId) => ({
            id: messageId,
            ...messages[messageId],
          }))
          .sort((a, b) => new Date(a.Date) - new Date(b.Date));

        loadedMessages = sortedMessages;

        if (initialLoad) {
          messagesDiv.innerHTML = "";
          appendedMessages.clear();

          const recentMessages = sortedMessages.slice(-MESSAGES_PER_LOAD);

          for (const message of recentMessages) {
            await appendSingleMessage(message, false);
          }

          initialLoad = false;
          document.getElementById("messages").scrollTop = 2000000;
          setTimeout(async () => {
            await scrollToFirstUnread(chatName);
          }, 100);
        } else {
          const lastDisplayedMessage = Array.from(messagesDiv.children)
            .filter((el) => el.dataset.messageId)
            .pop();

          if (lastDisplayedMessage) {
            const lastMessageId = lastDisplayedMessage.dataset.lastMessageId;
            const lastMessageIndex = sortedMessages.findIndex(
              (msg) => msg.id === lastMessageId,
            );

            if (lastMessageIndex !== -1) {
              const newMessages = sortedMessages.slice(lastMessageIndex + 1);
              for (const message of newMessages) {
                await appendSingleMessage(message, false);
              }

              const wasNearBottom =
                messagesDiv.scrollHeight -
                  messagesDiv.scrollTop -
                  messagesDiv.clientHeight <=
                20;
              if (wasNearBottom) {
                requestAnimationFrame(() => {
                  messagesDiv.scrollTop = messagesDiv.scrollHeight;
                });
              }
            }
          }
        }
      }
    });
  }

  async function markMessagesAsRead(chatName, messageId) {
    const messageElement = document.querySelector(
      `[data-message-id="${messageId}"]`,
    );
    if (!messageElement) return;

    const lastMessageId = messageElement.dataset.lastMessageId;
    if (!lastMessageId) return;

    const currentLastRead = readMessages[chatName] || "";
    if (currentLastRead && lastMessageId <= currentLastRead) return;

    readMessages[chatName] = lastMessageId;

    const readMessagesRef = ref(
      database,
      `Accounts/${email.replace(/\./g, "*")}/readMessages/${chatName}`,
    );
    await set(readMessagesRef, lastMessageId);

    document.querySelectorAll(".message").forEach((msg) => {
      const msgId = msg.dataset.lastMessageId;
      const msgUser = msg.dataset.user;
      if (msgId && msgId <= lastMessageId && msgUser !== email) {
        msg.classList.remove("unread");
      }
    });
    document.getElementById("bookmarklet-gui").scrollTop = 0;
    await updateUnreadCount(chatName);
  }
  function createSnakeGame() {
    const temp_email =
      typeof email !== "undefined" ? email.replace(/\./g, "*") : "anonymous";

    const gameContainer = document.createElement("div");
    gameContainer.id = "snake-game-container";
    gameContainer.style.position = "fixed";
    gameContainer.style.top = "50%";
    gameContainer.style.left = "50%";
    gameContainer.style.transform = "translate(-50%, -50%)";
    gameContainer.style.width = "90%";
    gameContainer.style.maxWidth = "800px";
    gameContainer.style.height = "90vh";
    gameContainer.style.overflow = "hidden";
    gameContainer.style.backgroundColor = "#000";
    gameContainer.style.zIndex = "1999999";
    gameContainer.style.display = "flex";
    gameContainer.style.flexDirection = "column";
    gameContainer.style.justifyContent = "center";
    gameContainer.style.alignItems = "center";
    gameContainer.style.padding = "20px";
    gameContainer.style.borderRadius = "10px";
    gameContainer.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";

    const messagesDiv = document.getElementById("messages") || document.body;
    document.body.appendChild(gameContainer);

    const scoreContainer = document.createElement("div");
    scoreContainer.style.display = "flex";
    scoreContainer.style.justifyContent = "space-between";
    scoreContainer.style.width = "100%";
    scoreContainer.style.marginBottom = "10px";
    gameContainer.appendChild(scoreContainer);

    const scoreDisplay = document.createElement("div");
    scoreDisplay.id = "snake-score";
    scoreDisplay.style.color = "white";
    scoreDisplay.style.fontSize = "24px";
    scoreDisplay.textContent = "Score: 0";
    scoreContainer.appendChild(scoreDisplay);

    const highScoreDisplay = document.createElement("div");
    highScoreDisplay.id = "snake-high-score";
    highScoreDisplay.style.color = "gold";
    highScoreDisplay.style.fontSize = "24px";
    highScoreDisplay.textContent = "High Score: 0";
    scoreContainer.appendChild(highScoreDisplay);

    const helpButton = document.createElement("button");
    helpButton.textContent = "?";
    helpButton.style.position = "absolute";
    helpButton.style.bottom = "20px";
    helpButton.style.right = "20px";
    helpButton.style.top = "auto";
    helpButton.style.width = "30px";
    helpButton.style.height = "30px";
    helpButton.style.borderRadius = "50%";
    helpButton.style.backgroundColor = "#4CAF50";
    helpButton.style.color = "white";
    helpButton.style.border = "none";
    helpButton.style.fontSize = "20px";
    helpButton.style.cursor = "pointer";
    helpButton.style.zIndex = "2000000";
    gameContainer.appendChild(helpButton);

    const canvas = document.createElement("canvas");
    canvas.width = 360;
    canvas.height = 360;
    canvas.style.border = "2px solid white";
    gameContainer.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const gridSize = 10;
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);

    let snake = [
      { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) },
    ];
    let direction = "right";
    let nextDirection = "right";
    let food = {};
    let score = 0;
    let highScore = 0;
    let gameSpeed = 120;
    let gameInterval;
    let gameOver = false;

    const createInstructionsOverlay = () => {
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";
      overlay.style.justifyContent = "center";
      overlay.style.alignItems = "center";
      overlay.style.zIndex = "2000001";
      overlay.style.padding = "20px";
      overlay.style.boxSizing = "border-box";

      const title = document.createElement("h2");
      title.textContent = "Snake Game Instructions";
      title.style.color = "white";
      title.style.marginBottom = "20px";
      overlay.appendChild(title);

      const instructions = document.createElement("div");
      instructions.style.color = "white";
      instructions.style.fontSize = "18px";
      instructions.style.lineHeight = "1.6";
      instructions.style.maxWidth = "600px";
      instructions.style.textAlign = "left";
      instructions.innerHTML = `
      <p><strong>Objective:</strong> Eat as much food (red squares) as possible without colliding with walls or yourself.</p>
      <p><strong>Controls:</strong></p>
      <ul style="margin-left: 20px; padding-left: 20px;">
        <li>Arrow Keys: ↑ ↓ ← →</li>
        <li>WASD: W (up), A (left), S (down), D (right)</li>
        <li>IJKL: I (up), J (left), K (down), L (right)</li>
        <li>Touch Controls: Use the on-screen buttons</li>
      </ul>
      <p><strong>Scoring:</strong> Each food item eaten increases your score by 1 point.</p>
      <p><strong>Speed:</strong> The game gets faster as your score increases.</p>
      <p><strong>Game Over:</strong> Colliding with walls or your own tail ends the game.</p>
    `;
      overlay.appendChild(instructions);

      const closeButton = document.createElement("button");
      closeButton.textContent = "Close";
      closeButton.style.marginTop = "20px";
      closeButton.style.padding = "10px 20px";
      closeButton.style.background = "#4CAF50";
      closeButton.style.color = "white";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "5px";
      closeButton.style.cursor = "pointer";
      closeButton.addEventListener("click", () => {
        overlay.remove();
      });
      overlay.appendChild(closeButton);

      return overlay;
    };

    helpButton.addEventListener("click", () => {
      const instructionsOverlay = createInstructionsOverlay();
      gameContainer.appendChild(instructionsOverlay);
    });

    function tryLoadHighScore() {
      try {
        const storedHighScore = localStorage.getItem(
          `snakeHighScore_${temp_email}`,
        );
        if (storedHighScore) {
          highScore = parseInt(storedHighScore);
          highScoreDisplay.textContent = `High Score: ${highScore}`;
        }
      } catch (e) {
        console.warn("Could not access localStorage:", e);
      }

      try {
        if (
          typeof database !== "undefined" &&
          typeof ref !== "undefined" &&
          typeof get !== "undefined"
        ) {
          const scoreRef = ref(database, `SnakeScores/${temp_email}`);
          get(scoreRef)
            .then((snapshot) => {
              if (snapshot.exists()) {
                const firebaseScore = snapshot.val();
                if (firebaseScore > highScore) {
                  highScore = firebaseScore;
                  highScoreDisplay.textContent = `High Score: ${highScore}`;
                }
              }
            })
            .catch((error) => {
              console.error(
                "Error retrieving high score from Firebase:",
                error,
              );
            });
        }
      } catch (error) {
        console.warn("Firebase operations not available:", error);
      }
    }

    function generateFood() {
      food = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
      };

      for (let cell of snake) {
        if (cell.x === food.x && cell.y === food.y) {
          return generateFood();
        }
      }
    }

    function drawCell(x, y, color) {
      ctx.fillStyle = color;
      ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
    }

    function draw() {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < snake.length; i++) {
        const color = i === 0 ? "#00ff00" : "#00cc00";
        drawCell(snake[i].x, snake[i].y, color);
      }

      drawCell(food.x, food.y, "red");

      scoreDisplay.textContent = `Score: ${score}`;
      highScoreDisplay.textContent = `High Score: ${highScore}`;
    }

    function checkCollision(x, y) {
      if (x < 0 || x >= gridWidth || y < 0 || y >= gridHeight) {
        return true;
      }

      for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === x && snake[i].y === y) {
          return true;
        }
      }

      return false;
    }

    function moveSnake() {
      direction = nextDirection;

      const head = { x: snake[0].x, y: snake[0].y };

      switch (direction) {
        case "up":
          head.y--;
          break;
        case "down":
          head.y++;
          break;
        case "left":
          head.x--;
          break;
        case "right":
          head.x++;
          break;
      }

      if (checkCollision(head.x, head.y)) {
        endGame();
        return;
      }

      snake.unshift(head);

      if (head.x === food.x && head.y === food.y) {
        score++;
        generateFood();

        if (gameSpeed > 50) {
          gameSpeed -= 1;
          clearInterval(gameInterval);
          gameInterval = setInterval(moveSnake, gameSpeed);
        }
      } else {
        snake.pop();
      }

      draw();
    }

    function handleKeyDown(e) {
      e.preventDefault();

      switch (e.key) {
        case "ArrowUp":
          if (direction !== "down") nextDirection = "up";
          break;
        case "ArrowDown":
          if (direction !== "up") nextDirection = "down";
          break;
        case "ArrowLeft":
          if (direction !== "right") nextDirection = "left";
          break;
        case "ArrowRight":
          if (direction !== "left") nextDirection = "right";
          break;

        case "w":
        case "W":
          if (direction !== "down") nextDirection = "up";
          break;
        case "s":
        case "S":
          if (direction !== "up") nextDirection = "down";
          break;
        case "a":
        case "A":
          if (direction !== "right") nextDirection = "left";
          break;
        case "d":
        case "D":
          if (direction !== "left") nextDirection = "right";
          break;

        case "i":
        case "I":
          if (direction !== "down") nextDirection = "up";
          break;
        case "k":
        case "K":
          if (direction !== "up") nextDirection = "down";
          break;
        case "j":
        case "J":
          if (direction !== "right") nextDirection = "left";
          break;
        case "l":
        case "L":
          if (direction !== "left") nextDirection = "right";
          break;
      }
    }

    function saveHighScore() {
      if (score > highScore) {
        highScore = score;

        try {
          localStorage.setItem(
            `snakeHighScore_${temp_email}`,
            highScore.toString(),
          );
        } catch (e) {
          console.warn("Could not save to localStorage:", e);
        }

        try {
          if (
            typeof database !== "undefined" &&
            typeof ref !== "undefined" &&
            typeof set !== "undefined"
          ) {
            const scoreRef = ref(database, `SnakeScores/${temp_email}`);
            set(scoreRef, highScore).catch((error) => {
              console.error("Error saving high score to Firebase:", error);
            });
          }
        } catch (error) {
          console.warn("Firebase operations not available:", error);
        }
      }
    }

    function endGame() {
      clearInterval(gameInterval);
      gameOver = true;

      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "30px Arial";
      ctx.fillStyle = "white";
      ctx.textAlign = "center";
      ctx.fillText("Game Over!", canvas.width / 2, canvas.height / 2 - 40);

      ctx.font = "24px Arial";
      ctx.fillText(
        `Final Score: ${score}`,
        canvas.width / 2,
        canvas.height / 2,
      );

      if (score > highScore) {
        saveHighScore();
        ctx.fillStyle = "gold";
        ctx.fillText(
          "New High Score!",
          canvas.width / 2,
          canvas.height / 2 + 40,
        );
      } else {
        ctx.fillStyle = "white";
        ctx.fillText(
          `High Score: ${highScore}`,
          canvas.width / 2,
          canvas.height / 2 + 40,
        );
      }

      const closeButton = document.createElement("button");
      closeButton.textContent = "Close";
      closeButton.style.marginTop = "20px";
      closeButton.style.padding = "10px 20px";
      closeButton.style.background = "#f44336";
      closeButton.style.color = "white";
      closeButton.style.border = "none";
      closeButton.style.borderRadius = "5px";
      closeButton.style.cursor = "pointer";
      gameContainer.appendChild(closeButton);

      closeButton.addEventListener("click", () => {
        gameContainer.remove();
        document.removeEventListener("keydown", handleKeyDown);
      });
    }

    const restartButton = document.createElement("button");
    restartButton.textContent = "Restart";
    restartButton.style.marginTop = "10px";
    restartButton.style.padding = "8px 16px";
    restartButton.style.background = "#4CAF50";
    restartButton.style.color = "white";
    restartButton.style.border = "none";
    restartButton.style.borderRadius = "5px";
    restartButton.style.cursor = "pointer";
    gameContainer.appendChild(restartButton);

    restartButton.addEventListener("click", () => {
      if (gameOver) {
        const closeButton = gameContainer.querySelector("button:last-child");
        if (closeButton && closeButton !== restartButton) {
          closeButton.remove();
        }

        snake = [
          { x: Math.floor(gridWidth / 2), y: Math.floor(gridHeight / 2) },
        ];
        direction = "right";
        nextDirection = "right";
        score = 0;
        gameSpeed = 120;
        gameOver = false;

        clearInterval(gameInterval);
        initGame();
      }
    });

    const touchControls = document.createElement("div");
    touchControls.style.display = "grid";
    touchControls.style.gridTemplateColumns = "1fr 1fr 1fr";
    touchControls.style.gridTemplateRows = "1fr 1fr 1fr";
    touchControls.style.gap = "5px";
    touchControls.style.width = "150px";
    touchControls.style.height = "150px";
    touchControls.style.marginTop = "15px";
    gameContainer.appendChild(touchControls);

    const createTouchButton = (text, dir) => {
      const btn = document.createElement("button");
      btn.textContent = text;
      btn.style.padding = "10px";
      btn.style.backgroundColor = "#333";
      btn.style.color = "white";
      btn.style.border = "1px solid #555";
      btn.style.borderRadius = "5px";
      btn.style.cursor = "pointer";

      btn.addEventListener("click", () => {
        if (
          (dir === "up" && direction !== "down") ||
          (dir === "down" && direction !== "up") ||
          (dir === "left" && direction !== "right") ||
          (dir === "right" && direction !== "left")
        ) {
          nextDirection = dir;
        }
      });

      return btn;
    };

    touchControls.appendChild(document.createElement("div"));
    touchControls.appendChild(createTouchButton("↑", "up"));
    touchControls.appendChild(document.createElement("div"));
    touchControls.appendChild(createTouchButton("←", "left"));
    touchControls.appendChild(document.createElement("div"));
    touchControls.appendChild(createTouchButton("→", "right"));
    touchControls.appendChild(document.createElement("div"));
    touchControls.appendChild(createTouchButton("↓", "down"));
    touchControls.appendChild(document.createElement("div"));

    const controlsLegend = document.createElement("div");
    controlsLegend.style.color = "white";
    controlsLegend.style.fontSize = "14px";
    controlsLegend.style.marginTop = "10px";
    controlsLegend.style.textAlign = "center";
    controlsLegend.innerHTML = "Controls: Arrow Keys, WASD, or IJKL";
    gameContainer.appendChild(controlsLegend);

    function initGame() {
      tryLoadHighScore();
      generateFood();
      draw();
      gameInterval = setInterval(moveSnake, gameSpeed);
    }

    document.addEventListener("keydown", handleKeyDown);
    initGame();

    return function cleanup() {
      document.removeEventListener("keydown", handleKeyDown);
      clearInterval(gameInterval);
      gameContainer.remove();
    };
  }

  function setupGlobalFileViewer() {
    if (!window.openFileViewer) {
      window.openFileViewer = function (dataUrl, fileName, mimeType) {
        try {
          const base64 = dataUrl.split(",")[1];
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const blob = new Blob([bytes], {
            type: mimeType || "application/octet-stream",
          });

          const blobUrl = URL.createObjectURL(blob);

          const newWindow = window.open(blobUrl, "_blank");
          if (!newWindow) {
            alert("Please allow popups for this site to view files");
            return;
          }

          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 60000);
        } catch (err) {
          console.error("Error opening file:", err);
          alert("Could not open the file. It may be corrupted or too large.");
        }
      };
    }

    document.addEventListener("click", function (e) {
      const target = e.target.closest(".file-attachment");
      if (target) {
        e.preventDefault();
        const fileData = decodeURIComponent(target.getAttribute("data-file"));
        const fileName = decodeURIComponent(
          target.getAttribute("data-filename") || "file",
        );
        const mimeType = decodeURIComponent(
          target.getAttribute("data-mime") || "",
        );
        window.openFileViewer(fileData, fileName, mimeType);
      }
    });

    document.addEventListener("click", function (e) {
      if (
        e.target.tagName === "IMG" &&
        e.target.src.startsWith("data:image/")
      ) {
        e.preventDefault();
        window.openFileViewer(
          e.target.src,
          "image",
          e.target.src.split(",")[0].split(":")[1].split(";")[0],
        );
      }
    });
  }

  async function sendMessage() {
    if (isSending) return;
    isSending = true;
    sendButton.disabled = true;
    removeFakeHighlights();
    const messagesRef = ref(database, `Chats/${currentChat}`);
    let message = document
      .getElementById("message-input")
      .innerHTML.substring(0, 5000);

    let textContent = document
      .getElementById("message-input")
      .textContent.substring(0, 5000);

    if (!textContent.trim() && attachments.length === 0) {
      isSending = false;
      sendButton.disabled = false;
      return;
    }

    let pureMessage = document
      .getElementById("message-input")
      .textContent.substring(0, 2500);

    noFilesMessage = message;

    attachments.forEach((att, index) => {
      if (!att.file) return;
      if (att.type === "image") {
        message += `<br><img src="${att.file}" style="max-width:150px;max-height:150px;border-radius:5px;margin:5px 0;">`;
      } else if (att.type === "file") {
        const linkId = `attachment-link-${Date.now()}-${index}`;
        const safeName = att.name?.replace(/"/g, "&quot;") || "file";

        message += `<br><a href="javascript:void(0)" class="file-attachment" data-file="${encodeURIComponent(att.file)}" data-filename="${encodeURIComponent(safeName)}" data-mime="${encodeURIComponent(att.file.split(",")[0].split(":")[1].split(";")[0])}"
      style="text-decoration:underline;color:${isDark ? "#66b2ff" : "#007bff"};">📎 ${safeName}</a>`;
      }
    });
    message = joypixels.shortnameToImage(message);
    const div = document.createElement("div");
    div.innerHTML = message;

    function processNode(node) {
      if (node.nodeType === 3) {
        if (node.parentNode.tagName !== "A") {
          const fragment = document.createDocumentFragment();
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = autoDetectLinks(node.textContent);

          while (tempDiv.firstChild) {
            fragment.appendChild(tempDiv.firstChild);
          }

          node.parentNode.replaceChild(fragment, node);
        }
      } else if (node.nodeType === 1) {
        Array.from(node.childNodes).forEach((child) => {
          processNode(child);
        });
      }
    }

    Array.from(div.childNodes).forEach((node) => {
      processNode(node);
    });

    message = div.innerHTML;

    resetMessageInput();
    hideAllColorGrids();
    clearAttachments();
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    if (message) {
      if (pureMessage.trim().toLowerCase().startsWith("/ai ")) {
        let d = Date.now();
        const question = message.substring(4).trim();

        const messagesSnapshot = await get(messagesRef);
        const messages = messagesSnapshot.val() || {};
        const messageEntries = Object.entries(messages)
          .sort((a, b) => new Date(a[1].Date) - new Date(b[1].Date))
          .slice(-20);

        const userMessageRef = push(messagesRef);
        await update(userMessageRef, {
          User: email,
          Message: message,
          Date: d,
        });

        const API_KEYS = [
          "AIzaSyDJEIVUqeVkrbtMPnBvB8QWd9VuUQQQBjg",
          "AIzaSyB42CD-hXRnfq3eNpLWnF9at5kHePI5qgQ",
          "AIzaSyAzipn1IBvbNyQUiiJq6cAkE6hAlShce94",
          "AIzaSyC1fFINANR_tuOM18Lo3HF9WXosX-6BHLM",
          "AIzaSyAT94ASgr96OQuR9GjVxpS1pee5o5CZ6H0",
        ];

        const chatHistory = messageEntries
          .map(([id, msg]) => {
            return `${msg.User}: ${msg.Message.substring(0, 500)}`;
          })
          .join("\n");

        const fullPrompt = `The following is a chat log for context. Messages from "[AI]" are past responses you have given, but you do not have memory of them.

Chat Log:
${chatHistory}

Here are some instructions on how to respond.
1. User emails that end with @lakesideschool.org are in the format xxxxy##@lakesideschoool.org, where xxxx is the user’s first name, y is the first letter of the user’s last name, and ## is the last two digits of the user’s graduation year from high school. Address users by their first name.
1a. Here are some name preferences you should be aware of: carolynj30@lakesideschool.org (Carolyn J.) prefers to go by Seek. conquerert30_@lakesideschool.org (Conquerer T.) prefers to go by Hengsheng.
1b. Here are some personal emails you should be aware of. Overall, try to figure out from the personal email what the person’s name is: reva27308@gmail.com is Reva S, aaravd037@gmail.com is Aarav D, alisofudge@gmail.com is Alice F, jarnolds723@gmail.com is Isaac W, purelyillusive@gmail.com is Max L, thescratchercat@gmail.com is Yiyang L, and w.n.lazypanda5050@gmail.com is Winston N.
2. Here are some restrictions that you should be aware of.
2a. Try to stay away from sensitive topics. Tread these carefully and gently remind users about the sensitivity of these topics if a user brings them up. For example, North Korea is a sensitive topic. Be aware of stereotypes (ex. sexism, racism, ageism) and stay away from these as well.
2b. Try your best to keep your answers fresh. Even if users may end up having similar or even exactly the same questions, keep your answers fresh and do not get stuck in a never-ending loop of the same response.
2c. Ultimately, try to use your judgement and be careful when responding. Do not do anything that is morally wrong. Use your judgement.
3. Some more information you should be aware of:
3a. Everyone’s name preferences are outlined here. Try to respect these.
3b. No users are related to any other users in a familial or romantic way.
3c. When a user asks a question, respond to the question only. Do not refer to the chat log without user request. Do not include any response of the history in your message. When referring to the chat log upon request, any messages from "[AI]" are your previous responses.

Now, respond to the user's question naturally:
User: ${email} asks: ${noFilesMessage}

Make sure to follow all the instructions while answering questions.
`;

        let aiReply = null;
        let successfulRequest = false;

        for (const API_KEY of API_KEYS) {
          try {
            const response = await fetch(
              "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
                API_KEY,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                }),
              },
            ).then((res) => res.json());

            const responseText =
              response.candidates?.[0]?.content?.parts?.[0]?.text;
            if (responseText && responseText.trim() !== "") {
              aiReply = responseText;
              successfulRequest = true;
              break;
            }
          } catch (error) {
            console.error(`Error with API key ${API_KEY}:`, error);
          }
        }

        if (!successfulRequest) {
          aiReply =
            "Sorry, AI assistance is temporarily unavailable. Please try again later.";
        }

        const aiMessageRef = push(messagesRef);
        await update(aiMessageRef, {
          User: "[AI]",
          Message: aiReply,
          Date: d,
        });
      } else if (pureMessage.trim().toLowerCase().startsWith("/eod")) {
        const parts = message.split(" ");
        let yesChance = 45;
        let noChance = 45;
        let maybeChance = 10;

        if (parts.length >= 4) {
          const parsedYes = parseFloat(parts[1]);
          const parsedNo = parseFloat(parts[2]);
          const parsedMaybe = parseFloat(parts[3]);

          if (!isNaN(parsedYes) && !isNaN(parsedNo) && !isNaN(parsedMaybe)) {
            if (parsedYes + parsedNo + parsedMaybe === 100) {
              yesChance = parsedYes;
              noChance = parsedNo;
              maybeChance = parsedMaybe;
            } else {
              const total = parsedYes + parsedNo + parsedMaybe;
              if (total > 0) {
                yesChance = (parsedYes / total) * 100;
                noChance = (parsedNo / total) * 100;
                maybeChance = (parsedMaybe / total) * 100;
              }
            }
          }
        }

        const userMessageRef = push(messagesRef);
        await update(userMessageRef, {
          User: email,
          Message: message,
          Date: Date.now(),
        });

        const random = Math.random() * 100;
        let result;

        if (random < yesChance) {
          result = "Yes";
        } else if (random < yesChance + noChance) {
          result = "No";
        } else {
          result = "Maybe";
        }

        const botMessageRef = push(messagesRef);
        await update(botMessageRef, {
          User: "[EOD]",
          Message: `${result}`,
          Date: Date.now(),
        });
      } else if (pureMessage.trim().toLowerCase().startsWith("/coinflip")) {
        const parts = message.split(" ");
        let headsChance = 50;
        let tailsChance = 50;

        if (parts.length === 3) {
          headsChance = parseFloat(parts[1]);
          tailsChance = parseFloat(parts[2]);

          if (headsChance + tailsChance !== 100) {
            const total = headsChance + tailsChance;
            if (total > 0) {
              headsChance = (headsChance / total) * 100;
              tailsChance = (tailsChance / total) * 100;
            } else {
              headsChance = 50;
              tailsChance = 50;
            }
          }
        }
    
        const userMessageRef = push(messagesRef);
        await update(userMessageRef, {
          User: email,
          Message: message,
          Date: Date.now(),
        });

        const random = Math.random() * 100;
        const result = random < headsChance ? "Heads" : "Tails";
        const chances = `(${headsChance.toFixed(1)}% Heads, ${tailsChance.toFixed(1)}% Tails)`;

        const botMessageRef = push(messagesRef);
        await update(botMessageRef, {
          User: "[RNG]",
          Message: `🎲 Coin flip result: ${result}`,
          Date: Date.now(),
        });
      } else if (pureMessage.trim().toLowerCase().startsWith("/roll ")) {
        const sides = parseInt(message.split(" ")[1]);

        const userMessageRef = push(messagesRef);
        await update(userMessageRef, {
          User: email,
          Message: message,
          Date: Date.now(),
        });

        if (isNaN(sides) || sides < 1) {
          const errorMessageRef = push(messagesRef);
          await update(errorMessageRef, {
            User: BOT_USERS.RNG,
            Message: "Please specify a valid number of sides (e.g., /roll 6)",
            Date: Date.now(),
          });
          return;
        }

        const result = Math.floor(Math.random() * sides) + 1;
        const botMessageRef = push(messagesRef);
        await update(botMessageRef, {
          User: BOT_USERS.RNG,
          Message: `🎲 Rolling a ${sides}-sided die: ${result}`,
          Date: Date.now(),
        });
      } else if (pureMessage.trim().toLowerCase().startsWith("/snake")) {

        const temp_email =
          typeof email !== "undefined"
            ? email.replace(/\./g, "*")
            : "anonymous";
        if (pureMessage.trim().toLowerCase() === "/snake leaderboard") {
          const userMessageRef = push(messagesRef);
          await update(userMessageRef, {
            User: email,
            Message: message,
            Date: Date.now(),
          });

          try {
            const scoresRef = ref(database, "SnakeScores");
            const scoresSnapshot = await get(scoresRef);
            const scores = scoresSnapshot.val() || {};

            const sortedScores = Object.entries(scores)
              .map(([userEmail, score]) => ({ email: userEmail, score: score }))
              .sort((a, b) => b.score - a.score);

            let currentUserRank = sortedScores.findIndex(
              (entry) => entry.email === temp_email,
            );
            let currentUserScore =
              currentUserRank !== -1 ? sortedScores[currentUserRank].score : 0;
            currentUserRank =
              currentUserRank !== -1 ? currentUserRank + 1 : "-";

            const pushMessage = async (text) => {
              const msgRef = push(messagesRef);
              await update(msgRef, {
                User: "[Snake Game]",
                Message: text,
                Date: Date.now(),
              });
            };

            await pushMessage("🐍 SNAKE GAME LEADERBOARD 🐍");

            if (sortedScores.length === 0) {
              await pushMessage("No scores yet! Be the first to play!");
            } else {
              const topPlayers = sortedScores.slice(0, 10);
              for (let i = 0; i < topPlayers.length; i++) {
                let playerText = `${i + 1}. ${topPlayers[i].email.replace(/\*/g, ".")}: ${topPlayers[i].score}`;
                await pushMessage(playerText);
              }
            }
          } catch (error) {
            console.error("Error retrieving leaderboard:", error);
            const errorMessageRef = push(messagesRef);
            await update(errorMessageRef, {
              User: "[Snake Game]",
              Message: "Error retrieving leaderboard. Please try again later.",
              Date: Date.now(),
            });
          }
        } else {
          const now = new Date();

          const pacificNow = new Date(
            now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }),
          );
          const day = pacificNow.getDay();
          const hour = pacificNow.getHours();
          const minute = pacificNow.getMinutes();

          const schoolStart = 495;
          const schoolEnd = 920;
          const currentTime = hour * 60 + minute;

          if (
            day >= 1 &&
            day <= 5 &&
            currentTime >= schoolStart &&
            currentTime <= schoolEnd
          ) {
            const errorMessageRef = push(messagesRef);
            await update(errorMessageRef, {
              User: "[Snake Game]",
              Message: "No Gaming During School!",
              Date: Date.now(),
            });
          } else {
            createSnakeGame();
          }
        }
      } else if (pureMessage.trim().toLowerCase().startsWith("/shell ")) {
          const newMessageRef = push(messagesRef);
          const serverURL = ""; // TODO: Ask Yiyang for secrets
          const sudoPassword = ""; // TODO: Ask Yiyang for secrets
          const command = pureMessage.trim().slice(7);

          

          if (!command.trim().startsWith("sudo")){
            // non-sudo command

          }
          else{
            const lastProcessedKey = newMessageRef;
            const ref = firebase.database().ref('your/path');

            ref.orderByKey().startAt(lastProcessedKey).on('child_added', (snapshot) => {
              const newData = snapshot.val();
              const newKey = snapshot.key;

              if (newKey !== lastProcessedKey) {
                // Process the new data
                console.log('New child added:', newData);
                // Update lastProcessedKey accordingly
              }
            });
          }
        }
      } else {
        const newMessageRef = push(messagesRef);
        await update(newMessageRef, {
          User: email,
          Message: message,
          Date: Date.now(),
        });
      }

      const snapshot = await get(messagesRef);
      const messages = snapshot.val() || {};

      const allMessageIds = Object.keys(messages).sort();
      if (allMessageIds.length > 0) {
        const latestMessageId = allMessageIds[allMessageIds.length - 1];
        await markMessagesAsRead(currentChat, latestMessageId);
      }
    }
    document.getElementById("bookmarklet-gui").scrollTop = 0;
    isSending = false;
    sendButton.disabled = false;
  })

  function formatDate(timestamp) {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const diffTime = today - messageDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "One day ago";
    } else {
      return `${diffDays} days ago`;
    }
  }

  document.getElementById("messages").addEventListener("click", async (e) => {
    const messageElement = e.target.closest(".message");
    if (messageElement) {
      const messageId = messageElement.dataset.messageId;
      if (messageId) {
        await markMessagesAsRead(currentChat, messageId);
      }
    }
  });

  const sendButton = document.getElementById("send-button");
  sendButton.addEventListener("click", sendMessage);

  const messageInput = document.getElementById("message-input");

  messageInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  document
    .getElementById("message-input")
    .addEventListener("input", function (e) {
      if (
        e.inputType === "insertFromPaste" ||
        (e.inputType === "insertText" && (e.data === " " || e.data === "\n"))
      ) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);

        const messageInput = document.getElementById("message-input");
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(messageInput);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const caretPosition = preCaretRange.toString().length;

        processLinksInInput();

        let message = document
          .getElementById("message-input")
          .innerHTML.substring(0, 2500);

        message = joypixels.shortnameToImage(message);

        setTimeout(() => {
          setCursorPositionInContentEditable(messageInput, caretPosition);
        }, 0);
      }
    });

  function setCursorPositionInContentEditable(element, position) {
    const textNodeMapping = [];
    let totalLength = 0;

    function mapTextNodes(node) {
      if (node.nodeType === 3) {
        const length = node.nodeValue.length;
        textNodeMapping.push({
          node: node,
          start: totalLength,
          end: totalLength + length,
        });
        totalLength += length;
      } else if (node.nodeType === 1) {
        for (let i = 0; i < node.childNodes.length; i++) {
          mapTextNodes(node.childNodes[i]);
        }
      }
    }

    mapTextNodes(element);

    let targetNode = null;
    let targetOffset = 0;

    for (let i = 0; i < textNodeMapping.length; i++) {
      const item = textNodeMapping[i];
      if (position >= item.start && position <= item.end) {
        targetNode = item.node;
        targetOffset = position - item.start;
        break;
      }
    }

    if (!targetNode) {
      const lastMapping = textNodeMapping[textNodeMapping.length - 1];
      if (lastMapping) {
        targetNode = lastMapping.node;
        targetOffset = lastMapping.node.length;
      } else {
        targetNode = document.createTextNode("");
        element.appendChild(targetNode);
        targetOffset = 0;
      }
    }

    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(targetNode, targetOffset);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
  }

  function processLinksInInput() {
    const messageInput = document.getElementById("message-input");
    const div = document.createElement("div");
    div.innerHTML = messageInput.innerHTML;
    let changed = false;

    const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT);
    const nodesToProcess = [];
    let node;

    while ((node = walker.nextNode())) {
      if (node.parentNode.tagName !== "A") {
        nodesToProcess.push(node);
      }
    }

    for (const textNode of nodesToProcess) {
      const text = textNode.nodeValue;

      const words = text.split(/(\s+)/);
      let hasLinks = false;

      for (let i = 0; i < words.length; i += 2) {
        const word = words[i];
        if (word && isValidUrl(word)) {
          hasLinks = true;
          words[i] = createLinkMarkup(word);
        }
      }

      if (hasLinks) {
        const fragment = document.createDocumentFragment();
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = words.join("");

        while (tempDiv.firstChild) {
          fragment.appendChild(tempDiv.firstChild);
        }

        textNode.parentNode.replaceChild(fragment, textNode);
        changed = true;
      }
    }

    if (changed) {
      const oldValue = messageInput.innerHTML;
      const newValue = div.innerHTML;

      if (oldValue !== newValue) {
        messageInput.innerHTML = newValue;
      }
    }
  }

  function isValidUrl(text) {
    const urlPattern =
      /^(https?:\/\/)?(www\.)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(\/\S*)?$/i;
    return urlPattern.test(text);
  }

  function createLinkMarkup(url) {
    let href = url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      href = "https://" + url;
    }
    return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  }

  window.addEventListener("DOMContentLoaded", function () {
    processLinksInInput();
  });
  let savedSelection = null;

  function saveSelection() {
    const sel = window.getSelection();
    if (sel.rangeCount > 0) {
      savedSelection = sel.getRangeAt(0).cloneRange();
    }
  }

  function applyFakeHighlight() {
    if (!savedSelection) return;
    const highlightSpan = document.createElement("span");
    highlightSpan.className = "selection-highlight";
    savedSelection.surroundContents(highlightSpan);
  }

  function removeFakeHighlights() {
    document.querySelectorAll(".selection-highlight").forEach((span) => {
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    });
  }

  function restoreSelection() {
    if (savedSelection) {
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(savedSelection);
    }
  }

  let mentionSuggestions = document.createElement("div");
  mentionSuggestions.id = "mention-suggestions";
  mentionSuggestions.className = "mention-suggestions";
  document.body.appendChild(mentionSuggestions);
  mentionSuggestions.style.display = "none";

  let activeMention = null;
  let currentMatches = [];
  let mentionIndex = 0;
  let lastInsertedMention = null;
  let isTabbing = false;
  let isNavigating = false;

  messageInput.addEventListener("input", async function (e) {
    if (isNavigating) {
      isNavigating = false;
      return;
    }

    const text = messageInput.innerText;
    const cursorPos = getCaretCharacterOffsetWithin(messageInput);
    const beforeCursor = text.substring(0, cursorPos);
    const mentionMatch = beforeCursor.match(/@([\w\.\-]*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();

      const accountSnapshot = await get(ref(database, `Accounts`));
      const matches = [];

      accountSnapshot.forEach((child) => {
        const email = child.key.replace(/\*/g, ".");
        const username = child.val().Username;
        if (
          email.toLowerCase().includes(query) ||
          (username && username.toLowerCase().includes(query))
        ) {
          matches.push({ email, username: username || email });
        }
      });

      const items = ["[AI]", "[EOD]", "[RNG]", "[Snake Game]", "Everyone"];
      const usernames = ["AI", "EOD", "RNG", "Snake", "Everyone"];

      items.forEach((item, index) => {
        const username = usernames[index];
        if (
          item.toLowerCase().includes(query) ||
          username.toLowerCase().includes(query)
        ) {
          matches.push({ email: item, username });
        }
      });

      if (matches.length) {
        mentionIndex = 0;
        updateMentionDropdown(matches.slice(0, 5));
        positionMentionBox();
        activeMention = mentionMatch[0];
        currentMatches = matches.slice(0, 5);
      } else {
        hideSuggestions();
      }
    } else {
      hideSuggestions();
    }
  });

  function updateMentionDropdown(matches) {
    mentionSuggestions.innerHTML = "";

    matches.forEach((match, idx) => {
      const div = document.createElement("div");
      div.textContent = match.email;

      if (idx === mentionIndex) {
        div.className = "selected";
      }

      div.addEventListener("mousedown", (e) => {
        e.preventDefault();
        insertMention(match.email, match.username);
        hideSuggestions();
      });

      mentionSuggestions.appendChild(div);
    });

    mentionSuggestions.style.display = "block";
  }

  function positionMentionBox() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    mentionSuggestions.style.position = "absolute";
    mentionSuggestions.style.left = `${rect.left}px`;
    mentionSuggestions.style.top = `${rect.top - mentionSuggestions.offsetHeight - 5}px`;
    mentionSuggestions.style.display = "block";
  }

  messageInput.addEventListener("keydown", async function (e) {
    if (
      (e.key === "ArrowUp" || e.key === "ArrowDown") &&
      mentionSuggestions.style.display === "block"
    ) {
      e.preventDefault();
      isNavigating = true;

      if (e.key === "ArrowUp") {
        mentionIndex =
          (mentionIndex - 1 + currentMatches.length) % currentMatches.length;
      } else {
        mentionIndex = (mentionIndex + 1) % currentMatches.length;
      }

      updateMentionDropdown(currentMatches);

      setTimeout(() => {
        isNavigating = false;
      }, 10);

      return;
    }

    if (e.key === "Tab" && mentionSuggestions.style.display === "block") {
      e.preventDefault();

      try {
        if (currentMatches.length > 0) {
          const match = currentMatches[mentionIndex];

          insertMention(match.email, match.username);

          updateMentionDropdown(currentMatches);
          positionMentionBox();
        }
      } catch (error) {
        console.error("Error during tab cycling:", error);
        isTabbing = false;
      }

      return;
    }

    if (e.key === " " && mentionSuggestions.style.display === "block") {
      e.preventDefault();

      if (lastInsertedMention && lastInsertedMention.parentNode) {
        const space = document.createTextNode(" ");
        lastInsertedMention.parentNode.insertBefore(
          space,
          lastInsertedMention.nextSibling,
        );

        const selection = window.getSelection();
        const range = document.createRange();
        range.setStartAfter(space);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      hideSuggestions();
      return;
    }

    if (e.key === "Escape" && mentionSuggestions.style.display === "block") {
      e.preventDefault();

      if (lastInsertedMention && lastInsertedMention.parentNode) {
        lastInsertedMention.remove();
      }

      hideSuggestions();
      return;
    }
  });

  function insertMention(email, username) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);

    const tempRange = range.cloneRange();
    tempRange.setStart(messageInput, 0);
    const textBeforeCursor = tempRange.toString();

    const mentionMatch = textBeforeCursor.match(/@[\w\.\-]*$/);

    function insertMentionSpan() {
      const mentionSpan = document.createElement("span");
      mentionSpan.className = "mention";
      mentionSpan.setAttribute("data-email", email);
      mentionSpan.setAttribute("contenteditable", "false");
      mentionSpan.textContent = "@" + username;

      range.insertNode(mentionSpan);

      const spaceNode = document.createTextNode("\u00A0");
      mentionSpan.parentNode.insertBefore(spaceNode, mentionSpan.nextSibling);

      const newRange = document.createRange();
      newRange.setStartAfter(spaceNode);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);

      return mentionSpan;
    }

    if (mentionMatch) {
      const matchLength = mentionMatch[0].length;

      range.setStart(range.endContainer, range.endOffset - matchLength);
      range.deleteContents();

      return insertMentionSpan();
    } else if (lastInsertedMention && lastInsertedMention.parentNode) {
      const parent = lastInsertedMention.parentNode;
      const mentionSpan = document.createElement("span");
      mentionSpan.className = "mention";
      mentionSpan.setAttribute("data-email", email);
      mentionSpan.setAttribute("contenteditable", "false");
      mentionSpan.textContent = "@" + username;

      parent.replaceChild(mentionSpan, lastInsertedMention);

      const spaceNode = document.createTextNode("\u00A0");
      mentionSpan.parentNode.insertBefore(spaceNode, mentionSpan.nextSibling);

      const newRange = document.createRange();
      newRange.setStartAfter(spaceNode);
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);

      hideSuggestions();

      return mentionSpan;
    }

    return null;
  }

  function hideSuggestions() {
    if (isTabbing || isNavigating) return;

    mentionSuggestions.style.display = "none";
    activeMention = null;
    currentMatches = [];
    mentionIndex = 0;
    lastInsertedMention = null;
  }

  function getCaretCharacterOffsetWithin(element) {
    let caretOffset = 0;
    const selection = window.getSelection();
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      caretOffset = preCaretRange.toString().length;
    }
    return caretOffset;
  }

  document
    .getElementById("message-input")
    .addEventListener("keydown", function (e) {
      if (e.key === "Backspace") {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        const offset = range.startOffset;

        if (offset === 0) {
          let previous = node.previousSibling;
          if (
            previous &&
            previous.classList &&
            previous.classList.contains("mention")
          ) {
            e.preventDefault();
            previous.remove();
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          const textUpToCaret = node.textContent.slice(0, offset);

          if (textUpToCaret.endsWith(" ") && node.previousSibling) {
            const previous = node.previousSibling;
            if (previous.classList && previous.classList.contains("mention")) {
              e.preventDefault();

              node.textContent =
                textUpToCaret.slice(0, -1) + node.textContent.slice(offset);

              const newRange = document.createRange();
              newRange.setStart(node, offset - 1);
              newRange.setEnd(node, offset - 1);
              selection.removeAllRanges();
              selection.addRange(newRange);
            }
          }
        }
      }
    });

  messageInput.addEventListener("blur", () => {
    applyFakeHighlight();
  });

  messageInput.addEventListener("focus", () => {
    removeFakeHighlights();
    restoreSelection();
  });

  const colors = [
    "#ffffff",
    "#f5f5f5",
    "#eeeeee",
    "#cccccc",
    "#999999",
    "#666666",
    "#333333",
    "#000000",

    "#ffebee",
    "#ffcdd2",
    "#ef9a9a",
    "#e57373",
    "#ef5350",
    "#f44336",
    "#d32f2f",
    "#b71c1c",

    "#fff3e0",
    "#ffe0b2",
    "#ffcc80",
    "#ffb74d",
    "#ffa726",
    "#ff9800",
    "#fb8c00",
    "#ef6c00",

    "#fffde7",
    "#fff9c4",
    "#fff59d",
    "#fff176",
    "#ffee58",
    "#ffeb3b",
    "#fdd835",
    "#fbc02d",

    "#e8f5e9",
    "#c8e6c9",
    "#a5d6a7",
    "#81c784",
    "#66bb6a",
    "#4caf50",
    "#43a047",
    "#388e3c",

    "#e0f7fa",
    "#b2ebf2",
    "#80deea",
    "#4dd0e1",
    "#26c6da",
    "#00bcd4",
    "#00acc1",
    "#0097a7",

    "#e3f2fd",
    "#bbdefb",
    "#90caf9",
    "#64b5f6",
    "#42a5f5",
    "#2196f3",
    "#1e88e5",
    "#1976d2",

    "#f3e5f5",
    "#e1bee7",
    "#ce93d8",
    "#ba68c8",
    "#ab47bc",
    "#9c27b0",
    "#8e24aa",
    "#7b1fa2",

    "#fce4ec",
    "#f8bbd0",
    "#f48fb1",
    "#f06292",
    "#ec407a",
    "#e91e63",
    "#d81b60",
    "#c2185b",
  ];

  function createColorGrid(gridId, execCommandType) {
    const grid = document.getElementById(gridId);
    colors.forEach((color) => {
      const box = document.createElement("div");
      box.style.backgroundColor = color;
      box.onclick = (e) => {
        e.stopPropagation();
        restoreSelection();
        document.execCommand(execCommandType, false, color);
        hideAllColorGrids();
      };
      grid.appendChild(box);
    });
  }

  createColorGrid("text-color-grid", "foreColor");
  createColorGrid("highlight-color-grid", "hiliteColor");

  function hideAllColorGrids() {
    document
      .querySelectorAll(".color-grid")
      .forEach((g) => (g.style.display = "none"));
  }
  hideAllColorGrids();

  document.getElementById("text-color-picker").onclick = (e) => {
    e.stopPropagation();
    toggleColorGrid("text-color-grid");
  };
  document.getElementById("highlight-color-picker").onclick = (e) => {
    e.stopPropagation();
    toggleColorGrid("highlight-color-grid");
  };

  function toggleColorGrid(gridId) {
    const grid = document.getElementById(gridId);
    const isVisible = grid.style.display === "grid";
    hideAllColorGrids();
    grid.style.display = isVisible ? "none" : "grid";
  }

  document.addEventListener("click", () => {
    hideAllColorGrids();
  });

  document.getElementById("bold-btn").onclick = (e) => {
    e.preventDefault();
    messageInput.focus();
    document.execCommand("bold");
  };
  document.getElementById("italic-btn").onclick = (e) => {
    e.preventDefault();
    messageInput.focus();
    document.execCommand("italic");
  };
  document.getElementById("underline-btn").onclick = (e) => {
    e.preventDefault();
    messageInput.focus();
    document.execCommand("underline");
  };
  document.getElementById("strike-btn").onclick = (e) => {
    e.preventDefault();
    messageInput.focus();
    document.execCommand("strikeThrough");
  };

  function wrapSelectedText(wrapperNode) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.surroundContents(wrapperNode);
  }

  document.getElementById("message-input").addEventListener("keydown", (e) => {
    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case "b":
          e.preventDefault();
          document.execCommand("bold");
          break;
        case "i":
          e.preventDefault();
          document.execCommand("italic");
          break;
        case "u":
          e.preventDefault();
          document.execCommand("underline");
          break;
        case "s":
          e.preventDefault();
          document.execCommand("strikeThrough");
          break;
      }
    }
    if (e.shiftKey && e.key === "Enter") {
      e.preventDefault();
      document.execCommand("insertLineBreak");
      adjustInputHeight();
    }
  });

  document
    .getElementById("message-input")
    .addEventListener("input", adjustInputHeight);

  function adjustInputHeight() {
    const input = document.getElementById("message-input");
    input.style.height = "auto";
    input.style.maxHeight = "108px";
  }

  function resetMessageInput() {
    const messageInput = document.getElementById("message-input");
    messageInput.innerHTML = "";
    messageInput.textContent = "";

    messageInput.style.height = "";
    hideAllColorGrids();
  }

  document
    .getElementById("message-input")
    .addEventListener("mouseup", saveSelection);
  document
    .getElementById("message-input")
    .addEventListener("keyup", saveSelection);

  document
    .getElementById("message-input")
    .addEventListener("keyup", updateToolbar);
  document
    .getElementById("message-input")
    .addEventListener("mouseup", updateToolbar);

  function updateToolbar() {
    const isBold = document.queryCommandState("bold");
    const isItalic = document.queryCommandState("italic");
    const isUnderline = document.queryCommandState("underline");
    const isStrike = document.queryCommandState("strikeThrough");

    toggleButton("bold-btn", isBold);
    toggleButton("italic-btn", isItalic);
    toggleButton("underline-btn", isUnderline);
    toggleButton("strike-btn", isStrike);
  }

  function toggleButton(id, active) {
    const button = document.getElementById(id);
    if (active) {
      button.style.backgroundColor = "#00b894";
    } else {
      button.style.backgroundColor = "";
    }
  }
  const linkBtn = document.getElementById("link-btn");
  const linkDialog = document.getElementById("link-dialog");
  const linkText = document.getElementById("link-text");
  const linkUrl = document.getElementById("link-url");
  const applyLink = document.getElementById("apply-link");
  const removeLink = document.getElementById("remove-link");
  const cancelLink = document.getElementById("cancel-link");
  let linkRange = null;

  function positionLinkDialog() {
    const linkDialog = document.getElementById("link-dialog");
    const guiContainer = document.getElementById("bookmarklet-gui");

    const guiRect = guiContainer.getBoundingClientRect();

    const left = (guiRect.width - linkDialog.offsetWidth) / 2;
    const top = (guiRect.height - linkDialog.offsetHeight) / 2;

    linkDialog.style.position = "absolute";
    linkDialog.style.left = `${left}px`;
    linkDialog.style.top = `${top}px`;
  }

  linkBtn.addEventListener("click", function () {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      linkRange = selection.getRangeAt(0).cloneRange();

      let parentLink = null;
      let currentNode = selection.anchorNode;

      while (currentNode && !parentLink) {
        if (currentNode.tagName === "A") {
          parentLink = currentNode;
        }
        currentNode = currentNode.parentNode;
      }

      if (parentLink) {
        linkText.value = parentLink.textContent;
        linkUrl.value = parentLink.href;
        linkRange = document.createRange();
        linkRange.selectNode(parentLink);
      } else {
        linkText.value = selection.toString();
        linkUrl.value = "";

        if (/^(https?:\/\/|www\.)[^\s]+$/i.test(linkText.value)) {
          linkUrl.value = linkText.value;
          if (linkUrl.value.startsWith("www.")) {
            linkUrl.value = "https://" + linkUrl.value;
          }
        }
      }

      linkDialog.style.display = "block";
      positionLinkDialog();
    }
  });

  applyLink.addEventListener("click", function () {
    if (linkRange && linkUrl.value) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(linkRange);

      const url = linkUrl.value.trim();
      let formattedUrl = url;

      if (!url.match(/^[a-zA-Z]+:\/\//) && !url.startsWith("mailto:")) {
        formattedUrl = "https://" + url;
      }

      const link = document.createElement("a");
      link.href = formattedUrl;
      link.textContent = linkText.value.trim() || url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      linkRange.deleteContents();
      linkRange.insertNode(link);

      linkDialog.style.display = "none";

      linkRange = null;
      messageInput.focus();
    }
  });

  removeLink.addEventListener("click", function () {
    if (linkRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(linkRange);

      const text = selection.toString();
      document.execCommand("unlink", false, null);

      linkDialog.style.display = "none";

      linkRange = null;
      messageInput.focus();
    }
  });

  cancelLink.addEventListener("click", function () {
    linkDialog.style.display = "none";
    linkRange = null;
    messageInput.focus();
  });

  document.addEventListener("click", function (e) {
    if (
      e.target !== linkDialog &&
      !linkDialog.contains(e.target) &&
      e.target !== linkBtn
    ) {
      linkDialog.style.display = "none";
    }
  });

  document
    .getElementById("message-input")
    .addEventListener("input", function () {});

  function autoDetectLinks(text) {
    const urlRegex =
      /(https?:\/\/[^\s]+)|((www\.)?([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b(\/[^\s]*)?)/gi;
    return text.replace(urlRegex, function (url) {
      let href = url;
      if (url.startsWith("www.")) {
        href = "https://" + url;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
  }

  const attachmentPreview = document.getElementById("attachment-preview");
  const fileUploadInput = document.getElementById("file-upload");
  const attachmentBtn = document.getElementById("attachment-btn");

  let attachments = [];

  function updateAttachmentBar() {
    attachmentPreview.style.display = attachments.length > 0 ? "flex" : "none";
  }

  function addAttachment(fileBlobOrUrl, type, fileName = "") {
    const item = document.createElement("div");
    item.className = "attachment-item";
    item.title = fileName;

    const removeBtn = document.createElement("button");
    removeBtn.innerHTML = "&#10005;";
    removeBtn.className = "remove-attachment";
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      attachments = attachments.filter((a) => a.file !== fileBlobOrUrl);
      item.remove();
      updateAttachmentBar();
    };

    const fileNameDisplay = document.createElement("div");
    fileNameDisplay.className = "attachment-filename";
    fileNameDisplay.textContent = fileName
      ? fileName.length > 12
        ? fileName.substring(0, 10) + "..."
        : fileName
      : "";

    const mimeType = fileBlobOrUrl.split(",")[0].split(":")[1].split(";")[0];

    if (type === "image") {
      const imgContainer = document.createElement("div");
      imgContainer.style.width = "100%";
      imgContainer.style.height = "100%";
      imgContainer.style.position = "relative";

      const img = document.createElement("img");
      img.src = fileBlobOrUrl;
      img.style.width = "100%";
      img.style.height = "calc(100% - 14px)";
      img.style.objectFit = "cover";

      imgContainer.appendChild(img);
      item.appendChild(imgContainer);

      item.onclick = (e) => {
        if (
          e.target.classList.contains("remove-attachment") ||
          e.target === removeBtn
        )
          return;
        window.openFileViewer(fileBlobOrUrl, fileName, mimeType);
      };
    } else {
      const fileIcon = document.createElement("div");
      fileIcon.innerHTML = "📎";
      fileIcon.style.fontSize = "24px";
      fileIcon.style.height = "calc(100% - 14px)";
      fileIcon.style.display = "flex";
      fileIcon.style.alignItems = "center";
      fileIcon.style.justifyContent = "center";
      fileIcon.style.width = "100%";

      item.appendChild(fileIcon);

      item.onclick = (e) => {
        if (
          e.target.classList.contains("remove-attachment") ||
          e.target === removeBtn
        )
          return;
        window.openFileViewer(fileBlobOrUrl, fileName, mimeType);
      };
    }

    item.appendChild(fileNameDisplay);
    item.appendChild(removeBtn);

    attachmentPreview.appendChild(item);
    attachments.push({ file: fileBlobOrUrl, type, name: fileName });
    updateAttachmentBar();
  }
  function clearAttachments() {
    attachments = [];
    attachmentPreview.innerHTML = "";
    updateAttachmentBar();
  }

  messageInput.addEventListener("paste", (e) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file && file.type.startsWith("image/")) {
        e.preventDefault();
        if (file.size > 2 * 1024 * 1024) {
          alert("Image too large (max 2MB)");
          return;
        }
        const reader = new FileReader();
        reader.onload = function (event) {
          addAttachment(event.target.result, "image");
        };
        reader.readAsDataURL(file);
      }
    }
  });

  attachmentBtn.addEventListener("click", () => {
    fileUploadInput.click();
  });

  fileUploadInput.addEventListener("change", (e) => {
    const files = e.target.files;
    if (!files.length) return;

    [...files].forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const result = event.target.result;
        const type = file.type.startsWith("image/") ? "image" : "file";
        addAttachment(result, type, file.name);
      };
      reader.readAsDataURL(file);
    });

    fileUploadInput.value = "";
  });

  async function markAllMessagesAsRead() {
    try {
      document.querySelectorAll(".message.unread").forEach((msg) => {
        msg.classList.remove("unread");
      });

      document.querySelectorAll(".unread-badge").forEach((badge) => {
        badge.style.display = "none";
        badge.textContent = "0";
      });

      const chatInfoRef = ref(database, "Chat Info");
      const chatInfoSnapshot = await get(chatInfoRef);
      const chatInfo = chatInfoSnapshot.val();

      const readMessagesUpdates = {};

      for (const [chatName, chatDetails] of Object.entries(chatInfo)) {
        const isAccessible =
          chatDetails.Type === "Public" ||
          (chatDetails.Type === "Private" &&
            chatDetails.Members.split(",").includes(email.replace(/\./g, "*")));

        if (isAccessible) {
          const chatRef = ref(database, `Chats/${chatName}`);
          const chatSnapshot = await get(chatRef);
          const messages = chatSnapshot.val();

          if (messages) {
            const messageIds = Object.keys(messages).sort();
            const latestMessageId = messageIds[messageIds.length - 1];

            const readMessageRef = ref(
              database,
              `Accounts/${email.replace(/\./g, "*")}/readMessages/${chatName}`,
            );
            await set(readMessageRef, latestMessageId);

            readMessages[chatName] = latestMessageId;
          }
        }
      }

      updateReadAllStatus();
      updateFavicon();
    } catch (error) {
      console.error("Error marking all messages as read:", error);
      alert("Failed to mark all messages as read. Please try again.");
    }
  }

  const hideSidebarButton = document.getElementById("hide-left-sidebar");
  let isSidebarHidden = false;

  hideSidebarButton.addEventListener("click", function () {
    const leftSidebar = document.getElementById("left-sidebar");
    const rightSidebar = document.getElementById("right-sidebar");
    const chatScreen = document.getElementById("chat-screen");

    if (!isSidebarHidden) {
      leftSidebar.style.transition = "all 0.3s ease";
      leftSidebar.style.width = "0";
      leftSidebar.style.opacity = "0";
      leftSidebar.style.overflow = "hidden";
      leftSidebar.style.display = "none";

      rightSidebar.style.width = "100%";
      rightSidebar.style.left = "0";

      isSidebarHidden = true;
    } else {
      leftSidebar.style.transition = "all 0.3s ease";
      leftSidebar.style.width = "20%";
      leftSidebar.style.opacity = "1";
      leftSidebar.style.overflow = "visible";
      leftSidebar.style.display = "block";

      rightSidebar.style.width = "80%";
      rightSidebar.style.left = "20%";

      isSidebarHidden = false;
    }
  });

  document.getElementById("read-all").addEventListener("click", async () => {
    try {
      await markAllMessagesAsRead();
      updateFavicon();
    } catch (error) {
      console.error("Error marking all messages as read:", error);
    }
  });

  gui.querySelector("#bookmarklet-close").onclick = function () {
    const currentUrl = window.location.href;
    let link = document.querySelector(
      'link[rel="icon"], link[rel="shortcut icon"]',
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    if (currentUrl.includes("lakesideschool.instructure.com")) {
      link.href =
        "https://instructure-uploads-pdx.s3.us-west-2.amazonaws.com/account_211800000000000001/attachments/3701/smallershield.png";
    } else if (currentUrl.includes("google.com")) {
      link.href = "https://google.com/favicon.ico";
    }

    gui.remove();
  };

  document
    .getElementById("customize-profile")
    .addEventListener("click", async function () {
      const customizeScreen = document.getElementById(
        "customize-account-screen",
      );
      const chatScreen = document.getElementById("chat-screen");

      document.getElementById("create-username").value = "";
      document.getElementById("create-bio").value = "";

      const accountRef = ref(database, `Accounts/${email.replace(/\./g, "*")}`);
      const snapshot = await get(accountRef);
      const userData = snapshot.val();

      if (userData) {
        document.getElementById("create-username").value =
          userData.Username || "";
        document.getElementById("create-bio").value = userData.Bio || "";
      }

      chatScreen.classList.add("hidden");
      customizeScreen.classList.remove("hidden");
    });

  document.getElementById("submit-customize").onclick = async function () {
    const username = document.getElementById("create-username").value.trim();
    const bio = document.getElementById("create-bio").value.trim();
    const chatScreen = document.getElementById("chat-screen");
    const customizeScreen = document.getElementById("customize-account-screen");

    try {
      const accountsRef = ref(
        database,
        `Accounts/${email.replace(/\./g, "*")}`,
      );
      const snapshot = await get(accountsRef);
      const existingData = snapshot.val() || {};

      const updatedAccountData = {
        ...existingData,
        Username: username || "Anonymous",
        Bio: bio || "I'm a yapper",
      };

      await set(accountsRef, updatedAccountData);

      chatScreen.classList.remove("hidden");
      customizeScreen.classList.add("hidden");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };
  function resetForm() {
    const channelType = document.getElementById("channel-type");
    const channelMembers = document.getElementById("channel-members");
    const channelName = document.getElementById("channel-name");
    const channelDescription = document.getElementById("channel-description");
    const submitButton = document.getElementById("submit-channel");
    const backButton = document.getElementById("back-channel");
    const membersContainer = document.getElementById("members-container");
    const selectedMembers = document.getElementById("selected-members");
    const membersList = document.getElementById("members-list");
    const deleteButton = document.getElementById("delete-channel");
    const memberSearch = document.getElementById("member-search");
    channelType.value = "Public";
    membersContainer.style.display = "none";
    membersList.innerHTML = "";
    selectedMembers.innerHTML = "";
    if (!submitButton.clicked) {
      channelName.value = "";
      channelDescription.value = "";
    }
    deleteButton.style.display = "none";
    channelName.disabled = false;
    previousChannelType = "Public";
    originalMembers = "";
  }

  async function handleChannelForm(
    isModifying = false,
    existingChannelName = null,
  ) {
    chatScreen.style.display = "none";
    document.getElementById("channel-screen").classList.remove("hidden");
    const channelType = document.getElementById("channel-type");
    const channelMembers = document.getElementById("channel-members");
    const channelName = document.getElementById("channel-name");
    const channelDescription = document.getElementById("channel-description");
    const submitButton = document.getElementById("submit-channel");
    const backButton = document.getElementById("back-channel");
    const membersContainer = document.getElementById("members-container");
    const selectedMembers = document.getElementById("selected-members");
    const membersList = document.getElementById("members-list");
    const deleteButton = document.getElementById("delete-channel");
    const memberSearch = document.getElementById("member-search");
    const title = document.getElementById("channel-screen-title");
    title.textContent = `${isModifying ? "Customize Channel" : "Create Channel"}`;

    let originalMembers = "";
    let previousChannelType = "Public";

    resetForm();

    if (isModifying && existingChannelName) {
      const chatInfoRef = ref(database, `Chat Info/${existingChannelName}`);
      const snapshot = await get(chatInfoRef);

      if (snapshot.exists()) {
        const channelData = snapshot.val();

        const currentUserEmail = email.replace(/\./g, "*");
        if (!channelData.Creator || channelData.Creator !== currentUserEmail) {
          document.getElementById("channel-screen").classList.add("hidden");
          chatScreen.style.display = "flex";
          return;
        }

        channelName.value = existingChannelName;
        channelName.disabled = true;
        deleteButton.style.display = "block";

        channelDescription.value = channelData.Description;
        channelType.value = channelData.Type;
        previousChannelType = channelData.Type;
        originalMembers = channelData.Members;

        if (channelData.Type === "Private") {
          membersContainer.style.display = "block";
          await loadExistingMembers(channelData.Members);
        } else {
          membersContainer.style.display = "none";
        }
      } else {
        document.getElementById("channel-screen").classList.add("hidden");
        chatScreen.style.display = "flex";
        return;
      }
    }

    let availableMembers = [];
    document
      .getElementById("channel-type")
      .addEventListener("change", function () {
        if (this.value === "Public") {
          membersContainer.style.display = "none";
        } else {
          membersContainer.style.display = "block";
          loadMemberOptions();

          if (
            previousChannelType === "Public" &&
            originalMembers &&
            originalMembers !== "None"
          ) {
            loadExistingMembers(originalMembers);
          }
        }
        previousChannelType = this.value;
      });

    function loadMemberOptions() {
      async function updateAvailableMembers() {
        const accountsRef = ref(database, "Accounts");
        const snapshot = await get(accountsRef);
        const accounts = snapshot.val();

        const selectedEmails = new Set(
          Array.from(document.querySelectorAll(".selected-member"))
            .map((el) => el.textContent.trim().replace(/×$/, ""))
            .map((email) => email.replace(/\./g, "*")),
        );

        availableMembers = Object.keys(accounts)
          .filter(
            (accountEmail) =>
              accountEmail !== email.replace(/\./g, "*") &&
              !selectedEmails.has(accountEmail),
          )
          .map((accountEmail) => ({
            id: accountEmail,
            email: accountEmail.replace(/\*/g, "."),
          }));

        renderMembersList(availableMembers);
      }

      function renderMembersList(members) {
        membersList.innerHTML = "";
        members.forEach((member) => {
          const option = document.createElement("div");
          option.className = "member-option";
          option.textContent = member.email;
          option.onclick = () => addMember(member);
          membersList.appendChild(option);
        });
      }

      function addMember(member) {
        const memberElement = document.createElement("div");
        memberElement.className = "selected-member";
        memberElement.innerHTML = `
    ${member.email}
    <span class="remove-member">×</span>
`;

        memberElement.querySelector(".remove-member").onclick = () => {
          memberElement.remove();
          availableMembers.push(member);
          availableMembers.sort((a, b) => a.email.localeCompare(b.email));
          renderMembersList(availableMembers);
        };

        selectedMembers.appendChild(memberElement);

        availableMembers = availableMembers.filter(
          (availableMember) => availableMember.id !== member.id,
        );
        renderMembersList(availableMembers);

        membersList.style.display = "none";
        memberSearch.value = "";
      }

      updateAvailableMembers();

      memberSearch.onfocus = () => {
        membersList.style.display = "block";
      };

      document.addEventListener("click", (e) => {
        if (!membersContainer.contains(e.target)) {
          membersList.style.display = "none";
        }
      });

      memberSearch.oninput = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredMembers = availableMembers.filter((member) =>
          member.email.toLowerCase().includes(searchTerm),
        );
        renderMembersList(filteredMembers);
        membersList.style.display = "block";
      };
    }

    async function loadExistingMembers(membersList) {
      if (!membersList || membersList === "None") return;

      const members = membersList.split(",");
      const currentUserEmail = email.replace(/\./g, "*");

      const otherMembers = members.filter(
        (member) => member !== currentUserEmail,
      );

      selectedMembers.innerHTML = "";

      for (const memberEmail of otherMembers) {
        const memberElement = document.createElement("div");
        memberElement.className = "selected-member";
        memberElement.innerHTML = `
        ${memberEmail.replace(/\*/g, ".")}
        <span class="remove-member">×</span>
      `;

        memberElement.querySelector(".remove-member").onclick = () => {
          memberElement.remove();

          const formattedEmail = memberEmail.replace(/\*/g, ".");
          availableMembers.push({
            id: memberEmail,
            email: formattedEmail,
          });
          availableMembers.sort((a, b) => a.email.localeCompare(b.email));
          if (
            document.getElementById("members-list").style.display !== "none"
          ) {
            renderMembersList(availableMembers);
          }
        };

        selectedMembers.appendChild(memberElement);
      }

      loadMemberOptions();
    }
    pendingFormOptions = { isModifying, existingChannelName, originalMembers };

    submitButton.onclick = createChannelHandler;
    deleteButton.onclick = deleteChannelHandler;

    backButton.addEventListener("click", async function () {
      resetForm();
      document.getElementById("channel-screen").classList.add("hidden");
      chatScreen.style.display = "flex";
    });
  }
  async function createChannelHandler() {
    const { isModifying, existingChannelName, originalMembers } =
      pendingFormOptions;
    const channelType = document.getElementById("channel-type");
    const channelMembers = document.getElementById("channel-members");
    const channelName = document.getElementById("channel-name");
    const channelDescription = document.getElementById("channel-description");
    const submitButton = document.getElementById("submit-channel");
    const backButton = document.getElementById("back-channel");
    const membersContainer = document.getElementById("members-container");
    const selectedMembers = document.getElementById("selected-members");
    const membersList = document.getElementById("members-list");
    const deleteButton = document.getElementById("delete-channel");
    const memberSearch = document.getElementById("member-search");
    const name = channelName.value.trim();
    const type = channelType.value;
    const description = channelDescription.value.trim();

    if (!name) {
      alert("Please enter a channel name");
      return;
    }

    if (!isModifying) {
      const chatInfoRef = ref(database, `Chat Info/${name}`);
      const snapshot = await get(chatInfoRef);
      if (snapshot.exists()) {
        alert(
          "A channel with this name already exists. Please choose a different name.",
        );
        return;
      }
    }

    let members = [];
    members.push(email.replace(/\./g, "*"));

    if (type === "Private") {
      const selectedMemberElements =
        document.querySelectorAll(".selected-member");
      if (selectedMemberElements.length === 0) {
        alert("Please select at least one member for private channel");
        return;
      }
      members = members.concat(
        Array.from(selectedMemberElements).map((el) =>
          el.textContent
            .trim()
            .replace(/×$/, "")
            .replace(/\./g, "*")
            .trim()
            .replace(/\s+/g, ""),
        ),
      );
    }

    const channelData = {
      Description: description || "No description provided",

      Members:
        type === "Private"
          ? members.join(",")
          : isModifying && originalMembers && originalMembers !== "None"
            ? originalMembers
            : email.replace(/\./g, "*"),
      Type: type,
      Creator: email.replace(/\./g, "*"),
    };

    try {
      const newChannelRef = ref(database, `Chat Info/${name}`);
      await set(newChannelRef, channelData);

      channelName.value = "";
      channelDescription.value = "";
      channelType.value = "Public";
      await fetchChatList();
      selectServer(name);
      currentChat = name;
      document.getElementById("channel-screen").classList.add("hidden");
      chatScreen.style.display = "flex";
      updateModifyButtonVisibility();
      resetForm();
    } catch (error) {
      console.error("Error creating/modifying channel:", error);
      alert("Error creating/modifying channel. Please try again.");
    }
  }

  function deleteChannelHandler() {
    const { isModifying, existingChannelName, originalMembers } =
      pendingFormOptions;
    const channelType = document.getElementById("channel-type");
    const channelMembers = document.getElementById("channel-members");
    const channelName = document.getElementById("channel-name");
    const channelDescription = document.getElementById("channel-description");
    const submitButton = document.getElementById("submit-channel");
    const backButton = document.getElementById("back-channel");
    const membersContainer = document.getElementById("members-container");
    const selectedMembers = document.getElementById("selected-members");
    const membersList = document.getElementById("members-list");
    const deleteButton = document.getElementById("delete-channel");
    const memberSearch = document.getElementById("member-search");
    if (isModifying) {
      const channelNameToDelete = channelName.value.trim();
      if (!channelNameToDelete) {
        alert("Channel name is missing");
        return;
      }

      if (
        confirm(
          `Are you sure you want to delete channel "${channelNameToDelete}"?`,
        )
      ) {
        try {
          const channelRef = ref(database, `Chat Info/${channelNameToDelete}`);
          remove(channelRef)
            .then(() => {
              const messagesRef = ref(database, `Chats/${channelNameToDelete}`);
              return remove(messagesRef);
            })
            .then(() => {
              document.getElementById("channel-screen").classList.add("hidden");
              chatScreen.style.display = "flex";
              resetForm();
              alert(`Channel "${channelNameToDelete}" has been deleted.`);
              fetchChatList();
              loadMessages("General");
              currentChat = "General";
              updateModifyButtonVisibility();
            })
            .catch((error) => {
              console.error("Error in deletion process:", error);
              alert("Error deleting channel. Please try again.");
            });
        } catch (error) {
          console.error("Error initiating delete:", error);
          alert("Error deleting channel. Please try again.");
        }
      }
    }
  }
  document
    .getElementById("create-new-server")
    .addEventListener("click", function () {
      handleChannelForm(false);
    });

  async function updateModifyButtonVisibility() {
    const modifyButton = document.getElementById("modify-channel");

    if (!currentChat) {
      modifyButton.style.display = "none";
      return;
    }

    try {
      const chatInfoRef = ref(database, `Chat Info/${currentChat}`);
      const snapshot = await get(chatInfoRef);

      if (snapshot.exists()) {
        const channelData = snapshot.val();
        const currentUserEmail = email.replace(/\./g, "*");

        if (channelData.Creator && channelData.Creator === currentUserEmail) {
          modifyButton.style.display = "block";
        } else {
          modifyButton.style.display = "none";
        }
      } else {
        modifyButton.style.display = "none";
      }
    } catch (error) {
      console.error("Error checking channel creator:", error);
      modifyButton.style.display = "none";
    }
  }

  document
    .getElementById("modify-channel")
    .addEventListener("click", function () {
      if (!currentChat) {
        alert("Please select a channel to modify");
        return;
      }

      handleChannelForm(true, currentChat);
    });

  function setupUnreadCountUpdates() {
    const chatsRef = ref(database, "Chats");

    onValue(chatsRef, async (snapshot) => {
      const chats = snapshot.val();
      if (!chats) return;

      const servers = document.querySelectorAll(".server");
      for (const server of servers) {
        const chatName = server.textContent.trim();
        if (chats[chatName]) {
          await updateUnreadCount(chatName);
        }
      }
    });
  }

  async function selectServer(channelName) {
    const servers = document.querySelectorAll(".server");
    servers.forEach((server) => {
      if (server.textContent.trim() === channelName) {
        server.classList.add("selected");
      } else {
        server.classList.remove("selected");
      }
    });
    await loadMessages(channelName);
  }

  checkForUpdates();
  setupGlobalFileViewer();
  fetchChatList();
  setupUnreadCountUpdates();
  await initializeReadMessages();
  loadMessages("General");
  setupInteractionTracking(document.getElementById("bookmarklet-gui"));
  initializeUserActivitySidebar();
  const messagesDiv = document.getElementById("messages");
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
  updateModifyButtonVisibility();
})();
