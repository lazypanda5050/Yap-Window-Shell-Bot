(async function () {
  const style = document.createElement("style");
  style.id = "bookmarklet-style";

  let isDark = localStorage.getItem("bookmarklet-mode") === "dark";
  function toggleDarkMode() {
    isDark = !isDark;
    localStorage.setItem("bookmarklet-mode", isDark ? "dark" : "light");
    document.getElementById("dark-mode").textContent =
      `${isDark ? "☀️" : "🌙"}`;
    updateColor();
  }
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.altKey && e.key === "d") {
      e.preventDefault();
      toggleDarkMode();
    }
  });

  function updateColor() {
    style.innerHTML = `
		#bookmarklet-gui {
			position: fixed;
			top: 10%;
			left: 50%;
			transform: translateX(-50%);
			width: 40%;
			height: 50%;
			z-index: 10000;
			background-color: ${isDark ? "#333" : "#fff"};
			color: ${isDark ? "#ddd" : "#333"};
			font-family: 'Aptos',
				Calibri,
				sans-serif;
			border-radius: 10px;
			box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: center;
			resize: both;
			overflow: hidden;
		}

		#bookmarklet-gui-header {
			position: absolute;
			top: 0;
			right: 0;
			left: 0;
			height: 40px;
			background-color: ${isDark ? "#444" : "#ccc"};
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 0 10px;
			border-top-left-radius: 10px;
			border-top-right-radius: 10px;
		}

		#bookmarklet-gui-header .button-group {
			display: flex;
			gap: 5px;
		}

		#bookmarklet-gui-header button {
			width: 30px;
			height: 30px;
			border-radius: 15px;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: 18px;
			margin: 0 2px;
			background-color: ${isDark ? "#444" : "#ccc"};
			color: ${isDark ? "#ddd" : "#333"};
			border: 1px solid ${isDark ? "#444" : "#ccc"};
			cursor: pointer;
			transition: all 0.2s ease-in-out;
		}

		#bookmarklet-gui-header button:hover {
			background-color: ${isDark ? "#555" : "#ddd"};
			color: ${isDark ? "#eee" : "#333"};
		}

		#bookmarklet-close:hover {
			background-color: ${isDark ? "#ff4d4d" : "#ff4d4d"};
			color: white;
		}

		#bookmarklet-minimize:hover {
			background-color: ${isDark ? "#90ee90" : "#90ee90"};
			color: ${isDark ? "#333" : "#333"};
		}

		#bookmarklet-maximize:hover {
			background-color: ${isDark ? "#ffd700" : "#ffd700"};
			color: ${isDark ? "#333" : "#333"};
		}

		.screen {
			width: 100%;
			height: calc(100% - 40px);
			display: flex;
			flex-direction: column;
			justify-content: flex-start;
			align-items: center;
			padding: 20px;
			box-sizing: border-box;
			overflow-y: auto;
			margin-top: 20px;
			background-color: ${isDark ? "#333" : "#fff"};
			color: ${isDark ? "#ddd" : "#333"};
		}

		.screen.hidden {
			display: none;
		}

		.screen input,
		.screen textarea,
		.screen button {
			width: 100%;
			height: auto;
			margin: 10px 0;
			padding: 10px;
			border-radius: 5px;
			box-sizing: border-box;
			font-size: 12px;
			text-align: center;
			display: block;
			margin-left: auto;
			margin-right: auto;
			color: ${isDark ? "#ddd" : "#333"};
			background-color: ${isDark ? "#444" : "#ddd"};
			border: 1px solid ${isDark ? "#555" : "#ccc"};
		}

		.screen button:hover {
			background-color: ${isDark ? "#555" : "#ccc"};
			color: ${isDark ? "#eee" : "#333"};
		}

		.screen h2,
		.screen h3 {
			color: ${isDark ? "#ddd" : "#333"};
			text-align: center;
		}

		.screen label {
			color: ${isDark ? "#ddd" : "#333"};
		}

		.screen textarea {
			min-height: 50px;
			color: ${isDark ? "#ddd" : "#333"};
			background-color: ${isDark ? "#444" : "#fff"};
			border: 1px solid ${isDark ? "#555" : "#ccc"};
		}

		.screen div {
			width: 90%;
			border: 1px solid ${isDark ? "#555" : "#ccc"};
			justify-items: center;
		}

		.chat {
			width: 100%;
			display: flex;
			justify-content: flex-start;
			align-items: flex-start;
			padding: 0;
			box-sizing: border-box;
			background-color: ${isDark ? "#222" : "#fff"};
			color: ${isDark ? "#ddd" : "#333"};
			height: 100%;
		}

		.chat.hidden {
			display: none !important;
		}

		#chat-screen {
			flex-direction: column;
			margin-top: 40px;
			padding-top: 0;
			height: calc(100% - 40px);
		}

		#lower-chat {
			display: flex;
			flex-direction: row;
			height: calc(100% - 40px);
			width: 100%;
			margin: 0;
		}

		#settings-bar {
			width: 100%;
			height: 40px;
			display: flex;
			flex-direction: row;
			align-items: center;
			border-bottom: 1px solid ${isDark ? "#444" : "#e0e0e0"};
			background: ${isDark ? "#2a2a2a" : "#f8f9fa"};
			padding: 0 16px;
			gap: 12px;
			position: sticky;
			top: 0;
			z-index: 10;
		}

		.setting-button {
			height: 32px;
			font-size: 13px;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			background: ${isDark ? "#404040" : "#e9ecef"};
			color: ${isDark ? "#ffffff" : "#495057"};
			border: none;
			padding: 6px 16px;
			border-radius: 4px;
			font-weight: 500;
			transition: all 0.2s ease;
		}

		.setting-button:hover {
			background: ${isDark ? "#505050" : "#dee2e6"};
		}

		#left-sidebar {
			width: 20%;
			min-width: 180px;
			display: flex;
			flex-direction: column;
			height: 100%;
			border-right: 2px solid ${isDark ? "#555" : "#ccc"};
			background: ${isDark ? "linear-gradient(to bottom, #444, #333)" : "linear-gradient(to bottom, #f7f7f7, #e0e0e0)"};
			padding: 8px;
			box-sizing: border-box;
			flex-shrink: 0;
			margin-bottom: 0;
		}

		#top-left-sidebar {
			height: 60%;
			min-height: 60%;
			max-height: 60%;
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-bottom: 10px;
			overflow-y: auto;
			overflow-x: hidden;
		}

		#bottom-left-sidebar {
			height: 40%;
			min-height: 40%;
			width: 100%;
			padding: 8px 0 0 0;
			background-color: ${isDark ? "#333" : "#f1f1f1"};
			display: flex;
			flex-direction: column;
			align-items: center;
			border-top: 1px solid ${isDark ? "#555" : "#ddd"};
			overflow-y: auto;
			overflow-x: hidden;
			margin-bottom: 0;
		}

		#server-list {
			width: 100%;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		#create-new-server {
			padding: 8px 5px;
			background-color: ${isDark ? "#a65653" : "#5865F2"};
			color: white;
			border: none;
			border-radius: 4px;
			width: 90%;
			font-size: 13px;
			font-weight: 500;
			transition: background-color 0.3s ease;
			margin-bottom: 8px;
		}

		#create-new-server:hover {
			background-color: ${isDark ? "#c79d9b" : "#4752C4"};
		}

		.server {
			background-color: ${isDark ? "#555" : "#e0e0e0"};
			width: 90%;
			padding: 5px 4px;
			margin-bottom: 1px;
			font-size: 13px;
			font-weight: 500;
			text-align: center;
			border-radius: 4px;
			cursor: pointer;
			transition: background-color 0.2s ease;
		}

		.server:hover {
			background-color: ${isDark ? "#666" : "#d0d0d0"};
		}

		.server.selected {
			background-color: ${isDark ? "#777" : "#ccc"};
			box-shadow: 0 0 0 1px ${isDark ? "#888" : "#999"};
		}

		.dm {
			width: 90%;
			padding: 8px 12px;
			margin: 0;
			font-size: 13px;
			font-weight: 500;
			text-align: center;
			border-radius: 6px;
			background-color: ${isDark ? "#444" : "#e8e8e8"};
			color: ${isDark ? "#fff" : "#333"};
			transition: all 0.2s ease;
			cursor: pointer;
			border: 1px solid transparent;
			box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		}

		.dm:hover {
			background-color: ${isDark ? "#555" : "#d0d0d0"};
			transform: translateY(-1px);
			box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
		}

		#right-sidebar {
			width: 80%;
			display: flex;
			flex-direction: column;
			justify-content: space-between;
			height: 100%;
			padding-left: 10px;
			padding: 0 10px 0 10px;
			background-color: ${isDark ? "#333" : "#fff"};
			color: ${isDark ? "#ddd" : "#333"};
			min-width: 0;
		}

		#messages {
			flex: 1;
			overflow-y: auto;
			background-color: ${isDark ? "#222" : "#f9f9f9"};
			padding: 10px;
			margin-bottom: 10px;
		}

		.message {
			padding: 3px 8px;
			margin-bottom: 3px;
			border-radius: 5px;
			font-size: 12px;
			width: 95%;
			max-width: 95%;
			word-wrap: break-word;
			background-color: ${isDark ? "#444" : "#e0e0e0"};
			color: ${isDark ? "#ccc" : "#333"};
			white-space: pre-wrap;
		}

		.message.sent {
			text-align: right;
			background-color: ${isDark ? "#4a4a4a" : "#e0f7fa"};
			color: ${isDark ? "#cccccc" : "#006064"};
		}

		.message.received {
			text-align: left;
			background-color: ${isDark ? "#3a3a3a" : "#f1f8e9"};
			color: ${isDark ? "#cccccc" : "#33691e"};
		}

		.message.received.unread {
			background-color: ${isDark ? "#4a3a3a" : "#e8f5e9"};
			border-left: 3px solid ${isDark ? "#ff6b6b" : "#4caf50"};
			box-shadow: 0 1px 3px ${isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"};
		}

		.message.bot {
			text-align: left;
			background-color: ${isDark ? "#2a323c" : "#f0f7ff"};
			color: ${isDark ? "#e2e8f0" : "#1a365d"};
		}

		.message.bot.unread {
			background-color: ${isDark ? "#2d3748" : "#ebf8ff"};
			border-left: 3px solid ${isDark ? "#90cdf4" : "#4299e1"};
			box-shadow: 0 1px 3px ${isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"};
		}

		.message.Eliana {
			text-align: left;
			background-color: ${isDark ? "#a83a32" : "#fc7d74"};
			color: ${isDark ? "#cccccc" : "#33691e"};
		}

		.message.Eliana.unread {
			background-color: ${isDark ? "#732822" : "#c26059"};
			border-left: 3px solid ${isDark ? "#ff6b6b" : "#4caf50"};
			box-shadow: 0 1px 3px ${isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"};
		}

		.message.winston.sent {
		text-align: right;
		background-color: ${isDark ? "#4a4a4a" : "#e0f7fa"};
		color: ${isDark ? "#cccccc" : "#006064"};
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60' style='transform: rotate(-20deg);'%3E%3Ctext x='-5' y='30' font-size='30' opacity='0.08'%3E🐼🐼%3C/text%3E%3C/svg%3E");
		background-repeat: repeat;
		background-size: 60px 40px;
		}

		.message.winston.received {
		text-align: left;
		background-color: ${isDark ? "#3a3a3a" : "#f1f8e9"};
		color: ${isDark ? "#cccccc" : "#33691e"};
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60' style='transform: rotate(-20deg);'%3E%3Ctext x='-5' y='30' font-size='30' opacity='0.08'%3E🐼🐼%3C/text%3E%3C/svg%3E");
		background-repeat: repeat;
		background-size: 60px 40px;
		}

		.message.winston.received.unread {
		background-color: ${isDark ? "#4a3a3a" : "#e8f5e9"};
		border-left: 3px solid ${isDark ? "#ff6b6b" : "#4caf50"};
		box-shadow: 0 1px 3px ${isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"};
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60' style='transform: rotate(-20deg);'%3E%3Ctext x='-5' y='30' font-size='30' opacity='0.08'%3E🐼🐼%3C/text%3E%3C/svg%3E");
		background-repeat: repeat;
		background-size: 60px 40px;
		}

		.send-info {
			font-size: 8px;
			color: ${isDark ? "#888" : "#666"};
		}

		#message-send {
			display: flex;
			flex-direction: column;
			width: 100%;
			padding: 5px;
			border-top: 1px solid #ccc;
		}

		#formatting-bar {
			display: flex;
			gap: 4px;
			margin-bottom: 5px;
			align-items: center;
			justify-content: center;
			flex-wrap: wrap;
		}

		#formatting-bar button {
			width: 24px;
			height: 24px;
			font-size: 12px;
			border: 1px solid ${isDark ? "#555" : "#ccc"};
			background: ${isDark ? "#444" : "#eee"};
			color: ${isDark ? "#fff" : "#333"};
			border-radius: 3px;
			cursor: pointer;
			padding: 0;
		}

		.color-picker-container {
			width: 23px;
			height: 23px;
			font-size: 12px;
			border: 1px solid ${isDark ? "#555" : "#ccc"};
			background: ${isDark ? "#444" : "#eee"};
			color: ${isDark ? "#fff" : "#333"};
			border-radius: 3px;
			cursor: pointer;
			text-align: center;
		}

		#formatting-bar select {
			height: 28px;
			font-size: 10px;
		}

		#message-send-row {
			display: flex;
			align-items: center;
			gap: 8px;
		}

		#message-input {
			flex-grow: 1;
			min-height: 28px;
			max-height: 200px;
			border: 1px solid ${isDark ? "#555" : "#ccc"};
			border-radius: 5px;
			padding: 5px;
			overflow-y: auto;
			background: ${isDark ? "#333" : "#fff"};
			color: ${isDark ? "#ddd" : "#333"};
			resize: none;
		}

		#send-button {
			height: 40px;
			padding: 0 16px;
			border-radius: 5px;
			border: none;
			background: ${isDark ? "#4a4a4a" : "#00796b"};
			color: white;
			cursor: pointer;
		}

		.color-picker-container {
			position: relative;
			cursor: pointer;
		}

		.color-grid {
			display: none;
			position: absolute;
			bottom: 30px;
			background: ${isDark ? "#333" : "#fff"};
			border: 1px solid ${isDark ? "#555" : "#ccc"};
			border-radius: 4px;
			padding: 6px;
			display: grid;
			grid-template-columns: repeat(6, 20px);
			gap: 4px;
			z-index: 1000;
		}

		.color-grid div {
			width: 20px;
			height: 20px;
			border-radius: 3px;
			cursor: pointer;
			border: 1px solid #ccc;
			position: relative;
		}

		.color-grid div.selected::after {
			content: "✓";
			color: white;
			font-size: 14px;
			position: absolute;
			top: 2px;
			left: 5px;
		}

		.selection-highlight {
			background: lightgray;
		}

		#send-button:hover {
			background-color: ${isDark ? "#3a3a3a" : "#004d40"};
		}

		.selected-members-container {
			display: flex;
			flex-wrap: wrap;
			gap: 4px;
			margin: 8px 0;
			min-height: 24px;
			padding: 4px;
			border: 1px solid ${isDark ? "#555" : "#ccc"};
			border-radius: 4px;
			overflow: hidden;
		}

		.selected-member {
			background: ${isDark ? "#444" : "#e0e0e0"};
			padding: 2px 6px;
			border-radius: 12px;
			display: flex;
			align-items: center;
			gap: 4px;
			font-size: 0.85em;
			white-space: nowrap;
		}

		.remove-member {
			cursor: pointer;
			color: ${isDark ? "#fff" : "#666"};
			font-weight: bold;
			font-size: 0.9em;
		}

		.members-dropdown {
			position: relative;
		}

		.members-list {
			border: 1px solid ${isDark ? "#555" : "#ccc"};
			border-radius: 4px;
			max-height: 200px;
			overflow-y: auto;
			position: absolute;
			width: 100%;
			background: ${isDark ? "#333" : "#fff"};
			display: none;
		}

		.member-option {
			padding: 8px;
			cursor: pointer;
		}

		.member-option:hover {
			background: ${isDark ? "#444" : "#f0f0f0"};
		}

		#member-search {
			width: 100%;
			padding: 8px;
			margin: 8px 0;
			border: 1px solid ${isDark ? "#555" : "#ccc"};
			border-radius: 4px;
		}

		#link-dialog {
			position: fixed;
			width: 280px;
			z-index: 1001;
			border-radius: 8px;
			box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
			animation: fade-in 0.2s ease-out;
		}

		@keyframes fade-in {
			from {
				opacity: 0;
				transform: translateY(10px);
			}

			to {
				opacity: 1;
				transform: translateY(0);
			}
		}

		.link-dialog-content {
			background-color: ${isDark ? "#383838" : "#ffffff"};
			color: ${isDark ? "#e0e0e0" : "#333333"};
			border: 1px solid ${isDark ? "#555555" : "#e0e0e0"};
			border-radius: 8px;
			padding: 16px;
			z-index: 30000;
		}

		.link-input-group {
			margin-bottom: 12px;
		}

		.link-input-group label {
			display: block;
			margin-bottom: 6px;
			font-size: 13px;
			font-weight: 500;
			color: ${isDark ? "#cccccc" : "#555555"};
		}

		.link-input-group input {
			width: 100%;
			padding: 10px;
			border: 1px solid ${isDark ? "#555555" : "#dddddd"};
			border-radius: 6px;
			background-color: ${isDark ? "#2a2a2a" : "#f7f7f7"};
			color: ${isDark ? "#e0e0e0" : "#333333"};
			box-sizing: border-box;
			transition: border-color 0.2s ease, box-shadow 0.2s ease;
			font-size: 13px;
		}

		.link-input-group input:focus {
			outline: none;
			border-color: ${isDark ? "#6b8afd" : "#4285f4"};
			box-shadow: 0 0 0 2px ${isDark ? "rgba(107, 138, 253, 0.25)" : "rgba(66, 133, 244, 0.25)"};
		}

		.link-button-group {
			display: flex;
			justify-content: space-between;
			margin-top: 16px;
		}

		.link-button-group button {
			padding: 8px 14px;
			border: none;
			border-radius: 6px;
			cursor: pointer;
			font-size: 13px;
			font-weight: 500;
			transition: background-color 0.15s ease, transform 0.15s ease;
		}

		.link-button-group button:hover {
			transform: translateY(-1px);
		}

		.link-button-group button:active {
			transform: translateY(0);
		}

		#apply-link {
			background-color: ${isDark ? "#4a5d7e" : "#4285f4"};
			color: white;
			flex-grow: 1;
			margin-right: 8px;
			height: 25px;
		}

		#apply-link:hover {
			background-color: ${isDark ? "#5a6d8e" : "#3b78e7"};
		}

		#remove-link {
			background-color: ${isDark ? "#7e4a4a" : "#f44242"};
			color: white;
			width: 80px;
			height: 25px;
		}

		#remove-link:hover {
			background-color: ${isDark ? "#8e5a5a" : "#e63535"};
		}

		#cancel-link {
			background-color: ${isDark ? "#333333" : "#e0e0e0"};
			color: ${isDark ? "#e0e0e0" : "#333333"};
			width: 80px;
			margin-left: 8px;
			height: 25px;
		}

		#cancel-link:hover {
			background-color: ${isDark ? "#444444" : "#d0d0d0"};
		}

		a {
			color: ${isDark ? "#8ab4f8" : "#1a73e8"};
			text-decoration: underline;
			cursor: pointer;
		}

		a:hover {
			text-decoration: underline;
		}

		#attachment-preview {
			display: none;
			width: 97.5%;
			flex-wrap: wrap;
			gap: 8px;
			margin-top: 8px;
			background-color: ${isDark ? "#333333" : "#e0e0e0"};
			border: 1px solid ${isDark ? "#555555" : "#cccccc"};
			border-radius: 4px;
			padding: 6px;
		}

		.attachment-item {
			width: 60px;
			height: 60px;
			object-fit: cover;
			border: 1px solid ${isDark ? "#666666" : "#cccccc"};
			border-radius: 4px;
			cursor: pointer;
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			overflow: hidden;
			background-color: rgba(0,0,0,0.05);
		}

		.remove-attachment {
			position: absolute;
			top: 2px;
			right: 2px;
			background: rgba(0,0,0,0.5);
			border: none;
			color: white;
			width: 14px;
			height: 14px;
			font-size: 8px;
			display: flex;
			align-items: center;
			justify-content: center;
			cursor: pointer;
			padding: 0;
			line-height: 1;
			border-radius: 2px;
			z-index: 10;
		}

		.attachment-filename {
			background-color: rgba(0,0,0,0.1);
			width: 100%;
			font-size: 10px;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 100%;
			padding: 1px 2px;
			text-align: center;
			position: absolute;
			bottom: 0;
			left: 0;
		}

		.preview-image {
			max-width: 120px;
			max-height: 120px;
			display: inline-block;
			margin: 4px;
			border: 1px solid ${isDark ? "#555" : "#ccc"};
			border-radius: 6px;
			cursor: pointer;
			transition: transform 0.2s, background-color 0.2s;
		}

		.preview-image:hover {
			transform: scale(1.05);
			background-color: ${isDark ? "#444" : "#f0f0f0"};
		}

		.preview-link {
			color: ${isDark ? "#66b2ff" : "#007bff"};
			text-decoration: underline;
			font-size: 0.95em;
			margin: 4px;
			display: inline-flex;
			align-items: center;
			gap: 4px;
			cursor: pointer;
		}

		.preview-link:hover {
			text-decoration: none;
		}

		.file-attachment {
			display: inline-flex;
			align-items: center;
			padding: 2px 6px;
			background-color: rgba(0,0,0,0.05);
			border-radius: 4px;
			margin: 2px 0;
		}
		.mention-suggestions {
		position: absolute;
		background: var(--mention-bg, #fff);
		border: 1px solid var(--mention-border, #ccc);
		border-radius: 5px;
		padding: 5px;
		display: none;
		z-index: 30000;
		max-height: 150px;
		overflow-y: auto;
		font-size: 12px;
		}

		.mention-suggestions div {
		padding: 4px 8px;
		cursor: pointer;
		}

		.mention-suggestions div.selected {
		background-color: #b3d9ff;  
		color: #005b8c;  
		}

		.mention-suggestions div:hover {
		background-color: var(--mention-hover, #eef);
		}

		.mention {
		background-color: ${isDark ? "#444" : "#d0f0ff"};
		color: ${isDark ? "#fff" : "#006699"};
		padding: 2px 5px;
		border-radius: 4px;
		font-weight: bold;
		}

		.mention.highlight {
		background-color: ${isDark ? "#666" : "#c0e8ff"};
		color: ${isDark ? "#ffffff" : "#004466"};
		border: 1px solid ${isDark ? "#888" : "#0077aa"};
		padding: 2px 5px;
		border-radius: 4px;
		font-weight: bold;
		}
		#right-user-sidebar {
		position: absolute;
		top: 40px;
		right: 0;
		width: 250px;
		height: calc(100% - 40px);
		background-color: ${isDark ? "#222" : "#f7f7f7"};
		border-left: 1px solid ${isDark ? "#444" : "#e0e0e0"};
		z-index: 100;
		display: flex;
		flex-direction: column;
		transition: transform 0.3s ease-in-out;
		transform: translateX(100%);
		overflow: hidden;
		}

		#right-user-sidebar.visible {
		transform: translateX(0);
		}

		#user-sidebar-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 10px 15px;
		background-color: ${isDark ? "#333" : "#eee"};
		border-bottom: 1px solid ${isDark ? "#555" : "#ddd"};
		}

		#user-sidebar-header h3 {
		margin: 0;
		color: ${isDark ? "#ddd" : "#333"};
		font-size: 16px;
		}

		#close-user-sidebar {
		font-size: 18px;
		cursor: pointer;
		color: ${isDark ? "#aaa" : "#666"};
		transition: color 0.2s ease;
		}

		#close-user-sidebar:hover {
		color: ${isDark ? "#fff" : "#333"};
		}

		#user-lists-container {
		flex: 1;
		overflow-y: auto;
		padding: 10px;
		}

		.user-category {
		margin-bottom: 15px;
		}

		.category-header {
		display: flex;
		align-items: center;
		margin-bottom: 5px;
		padding: 3px 5px;
		border-radius: 4px;
		}

		.category-header h4 {
		margin: 0;
		font-size: 14px;
		font-weight: 500;
		color: ${isDark ? "#ccc" : "#444"};
		}

		.status-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		margin-right: 8px;
		}

		.status-indicator.active {
		background-color: #4CAF50;
		box-shadow: 0 0 4px #4CAF50;
		}

		.status-indicator.recently-active {
		background-color: #FFC107;
		box-shadow: 0 0 4px #FFC107;
		}

		.status-indicator.inactive {
		background-color: #F44336;
		box-shadow: 0 0 4px #F44336;
		}

		.user-list {
		margin-left: 16px;
		}

		.user-item {
		display: flex;
		align-items: center;
		padding: 5px 8px;
		border-radius: 4px;
		margin: 2px 0;
		font-size: 13px;
		color: ${isDark ? "#bbb" : "#555"};
		transition: background-color 0.2s ease;
		}

		.user-item:hover {
		background-color: ${isDark ? "#333" : "#e9e9e9"};
		}

		.user-item .status-indicator {
		width: 6px;
		height: 6px;
		}

		.user-item .user-name {
		font-weight: 500;
		margin-right: 5px;
		}

		.user-item .user-email {
		font-size: 11px;
		color: ${isDark ? "#888" : "#888"};
		overflow: hidden;
		text-overflow: ellipsis;
		}

		.no-users {
		font-size: 12px;
		color: ${isDark ? "#888" : "#999"};
		font-style: italic;
		margin-left: 16px;
		padding: 4px 0;
		}
		`;
  }

  document.head.appendChild(style);
  updateColor();

  const gui = document.createElement("div");
  gui.id = "bookmarklet-gui";
  let originalState = {
    width: "50%",
    height: "60%",
    top: "10%",
    left: "50%",
    transform: "translateX(-50%)",
  };

  gui.innerHTML = `
<div id="bookmarklet-gui-header">
   <span>Yap Window</span>   
   <div class="button-group">
      <button id="bookmarklet-minimize">−</button>
      <button id="bookmarklet-fullscreen">⛶</button>
      <button id="bookmarklet-close">×</button>
   </div>
</div>
<div id="login-screen" class="screen hidden">
   <h2>Log In</h2>
   <div id="google-login-section" style="border:1px solid black">
      <h3>Sign In with Google</h3>
      <button id="google-login-button">Login with Google</button>
   </div>
   <div id="email-login-section" style="border:1px solid black">
      <h3>Login with Email</h3>
      <label for="login-email">Email</label>
      <input id="login-email" type="email" placeholder="Enter your email" required="">
      <label for="login-password">Password</label>
      <input id="login-password" type="password" placeholder="Enter your password" required="">
      <button id="submit-login-email">Log In</button>
      <label id="login-email-error" style="color: #f2545b"></label>
   </div>
   <div>
      <button id="back-login-button">Back</button>
   </div>
   <hr style="margin: 20px 0">
</div>
<div id="create-account-screen" class="screen hidden">
   <h2>Create Account</h2>
   <div id="google-create-section" style="border:1px solid black">
      <h3>Create Account with Google</h3>
      <button id="google-create-button">Sign Up with Google</button>
   </div>
   <div id="email-create-section" style="border:1px solid black">
      <h3>Create Account with Email</h3>
      <label for="create-email">Email</label>
      <input id="create-email" type="email" placeholder="Enter your email" required="">
      <label for="create-email">Password</label>
      <input id="create-password" type="password" placeholder="Enter your password" required="">
      <button id="submit-create-email">Create Account</button>
      <label id="create-email-error" style="color: #f2545b"></label>
   </div>
   <div>
      <button id="back-create-button">Back</button>
   </div>
   <hr style="margin: 20px 0">
</div>
<div id="verification-screen" class="screen hidden">
   <h2>Email Verification</h2>
   <p>Please check your email for a verification link.</p>
   <p>Once you verify your email, you will automatically be taken to the next page</p>
   <button id="resend-verification">Resend Verification Email</button>
   <p id="verification-error" class="error-text"></p>
</div>
<div id="customize-account-screen" class="screen hidden">
   <h2>Final Steps</h2>
   <label for="create-username">Username</label>
   <input id="create-username" type="text" placeholder="Pick a username" required="">
   <label for="create-bio">Bio (optional)</label>   
   <textarea id="create-bio" rows="8" columns="50" height="100px">I'm a yapper</textarea>
   <button id="submit-customize">Save</button>
</div>
<div id="stay-login-screen" class="screen hidden">
   <h2>Would you like to stay logged in?</h2>
   <h3>Any future logins on this site will automatically sign you into your account</h3>
   <div id="stay-login-buttons" style="justify-content: space-between; align-items: center;">
      <button id="stay-yes" style="width: 20%">Yes</button>
      <button id="stay-no" style="width: 20%">No</button>
      <button id="stay-forget" style="width: 20%">Don't Bother Me</button>
   </div>
</div>
<div id="main-screen" class="screen">
   <h2>Welcome to Yap Window</h2>
   <p>Press CTRL-ALT-D to switch between light and dark mode</p>
   <button id="login-button">Log In</button>
   <button id="create-account-button">Create Account</button>
   <p style="width:80%; text-align: center;">
      By using Yap Window, you agree to the 
      <a href="https://docs.google.com/document/d/1nsVWJ94ijnRRsyV_mCkdVdXvuOvg6c4bk9PBP-L2NaI" target="_blank">
      Terms and Conditions
      </a>.
   </p>
</div>
<div id="saved-account" class="screen hidden">
   <h2>You have an account saved on this computer</h2>
   <p id="saved-email">Email: _______</p>
   <p id="saved-username">Username: _______</p>
   <button id="saved-login-button">Okay</button>
   <button id="saved-signout-button">Sign Out</button>
</div>
<div id="chat-screen" class="chat hidden">
   <div id="settings-bar">
      <button id="customize-profile" class="setting-button">👤</button>
      <button id="dark-mode" class="setting-button">${isDark ? "☀️" : "🌙"}</button>
      <button id="read-all" class="setting-button">📖</button>
      <button id="hide-left-sidebar" class="setting-button">☰</button>
      <button id="user-activity" class="setting-button">👥</button>
      <button id="modify-channel" class="setting-button" style="display: none">✏️</button>
   </div>
   <div id="lower-chat" class="chat">
      <div id="left-sidebar">
         <div id="top-left-sidebar">
            <button id="create-new-server">Create New Channel</button>
            <div id="server-list">
               <div class="server" id="general-server">General</div>
            </div>
         </div>
         <div id="bottom-left-sidebar">
            <div id="dm-list">
            </div>
         </div>
      </div>
      <div id="right-sidebar">
         <div id="messages">
         </div>
         <div id="message-send">
	    <input type="file" id="file-upload" style="display: none;" accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar,.7z">
            <div id="formatting-bar">
               <button id="bold-btn"><b>B</b></button>
               <button id="italic-btn"><i>I</i></button>
               <button id="underline-btn"><u>U</u></button>
               <button id="strike-btn"><s>S</s></button>
               <div class="color-picker-container" id="text-color-picker">
                  🖍️
                  <div class="color-grid" id="text-color-grid"></div>
               </div>
               <div class="color-picker-container" id="highlight-color-picker">
                  🖌️
                  <div class="color-grid" id="highlight-color-grid"></div>
               </div>
               <button id="link-btn">🔗</button>
	       <button id="attachment-btn">📎</button>
            </div>
            <div id="message-send-row">
               <div id="message-input" contenteditable="true" placeholder="Type a message..."></div>
               <button id="send-button">Send</button>
            </div>
	    <div id="attachment-preview"></div>
         </div>
      </div>
      <div id="right-user-sidebar" class="hidden">
	  <div id="user-sidebar-header">
	    <h3>Users</h3>
	    <span id="close-user-sidebar">×</span>
	  </div>
	  <div id="user-lists-container">
	    <div class="user-category">
	      <div class="category-header active">
	        <span class="status-indicator active"></span>
	        <h4>Active</h4>
	      </div>
	      <div id="active-users" class="user-list"></div>
	    </div>
	    
	    <div class="user-category">
	      <div class="category-header recently-active">
	        <span class="status-indicator recently-active"></span>
	        <h4>Recently Active</h4>
	      </div>
	      <div id="recently-active-users" class="user-list"></div>
	    </div>
	    
	    <div class="user-category">
	      <div class="category-header inactive">
	        <span class="status-indicator inactive"></span>
	        <h4>Inactive</h4>
	      </div>
	      <div id="inactive-users" class="user-list"></div>
    	</div>
  </div>
</div>
   </div>
</div>
<div id="channel-screen" class="screen hidden">
   <h2 id="channel-screen-title">Create/Customize Channel</h2>
   <label for="channel-name">Channel Name</label>
   <input id="channel-name" type="text" placeholder="Name your channel..." required>
   <label for="channel-type">Channel Type</label>
   <select id="channel-type">
      <option value="Public">Public</option>
      <option value="Private">Private</option>
   </select>
   <div id="members-container" style="display: none;">
      <label>Select Members</label>
      <div id="selected-members" class="selected-members-container"></div>
      <div class="members-dropdown">
         <input type="text" id="member-search" placeholder="Type Emails Here...">
         <div id="members-list" class="members-list"></div>
      </div>
   </div>
   <label for="channel-description">Description/Rules (optional)</label>   
   <textarea id="channel-description" rows="8" columns="50"></textarea>
   <button id="submit-channel">Save</button>
   <button id="delete-channel" style="display: none">Delete</button>
   <button id="back-channel">Back</button>
</div>
<div id="link-dialog" style="display: none; position: absolute; padding: 10px; background-color: #fff; border: 1px solid #ccc; box-shadow: 0 4px 8px rgba(0,0,0,0.2); border-radius: 4px; z-index: 1000">
   <div>
      <label for="link-text">Text to display:</label>
      <input type="text" id="link-text" placeholder="Link text">
   </div>
   <div style="margin-top: 8px;">
      <label for="link-url">URL:</label>
      <input type="text" id="link-url" placeholder="https://">
   </div>
   <div style="margin-top: 10px; display: flex; justify-content: space-between;">
      <button id="apply-link">Apply</button>
      <button id="remove-link">Remove</button>
      <button id="cancel-link">Cancel</button>
   </div>
</div>
      `;
  document.body.appendChild(gui);

  const header = gui.querySelector("#bookmarklet-gui-header");
  const enableDragging = () => {
    header.onmousedown = function (e) {
      const offsetX = e.clientX - gui.offsetLeft;
      const offsetY = e.clientY - gui.offsetTop;
      document.onmousemove = function (e) {
        gui.style.left = `${e.clientX - offsetX}px`;
        gui.style.top = `${e.clientY - offsetY}px`;
      };
      document.onmouseup = function () {
        document.onmousemove = null;
      };
    };
  };
  enableDragging();

  gui.querySelector("#bookmarklet-close").onclick = function () {
    gui.remove();
  };
  gui.querySelector("#bookmarklet-minimize").onclick = function () {
    gui.style.transition = "all 0.3s ease";
    gui.style.opacity = "0";

    setTimeout(() => {
      gui.style.display = "none";
    }, 300);
  };

  gui.querySelector("#bookmarklet-fullscreen").onclick = function (e) {
    const isFullscreen = e.target.innerHTML === "⿻";
    if (!isFullscreen) {
      originalState = {
        width: gui.style.width,
        height: gui.style.height,
        top: gui.style.top,
        left: gui.style.left,
        transform: gui.style.transform,
      };
      gui.style.position = "fixed";
      gui.style.width = "100%";
      gui.style.height = "100%";
      gui.style.top = "0";
      gui.style.left = "0";
      gui.style.transform = "none";
      gui.style.resize = "none";
      header.onmousedown = null;
      e.target.innerHTML = "⿻";
    } else {
      gui.style.width = originalState.width;
      gui.style.height = originalState.height;
      gui.style.top = originalState.top;
      gui.style.left = originalState.left;
      gui.style.transform = originalState.transform;
      gui.style.resize = "both";
      enableDragging();
      e.target.innerHTML = "⛶";
    }
  };

  document
    .getElementById("dark-mode")
    ?.addEventListener("click", toggleDarkMode);
})();
