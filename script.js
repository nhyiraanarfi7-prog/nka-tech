console.log("NKA TECH AI loaded");

document.addEventListener("DOMContentLoaded", () => {

    const input = document.getElementById("ai-input");
    const sendButton = document.getElementById("send-ai");
    const stopButton = document.getElementById("stop-ai");
    const messages = document.getElementById("chat-messages");

    const newChatButton = document.getElementById("new-chat");
    const history = document.getElementById("chat-history");
    const clearChatsButton = document.getElementById("clear-chats");
    const mobileMenu = document.getElementById("mobile-menu");
    const sidebar = document.getElementById("chat-sidebar");

    let chats = JSON.parse(
        localStorage.getItem("nka-tech-chats") || "[]"
    );

    let currentChatId = null;
    let controller = null;

    /* =========================
       SAVE CHATS
    ========================= */

    function saveChats() {
        localStorage.setItem(
            "nka-tech-chats",
            JSON.stringify(chats)
        );
    }

    /* =========================
       CREATE CHAT
    ========================= */

    function createChat() {

        const chat = {
            id: Date.now().toString(),
            title: "New chat",
            messages: []
        };

        chats.unshift(chat);

        currentChatId = chat.id;

        saveChats();
        renderHistory();
        renderChat();

        input.focus();
    }

    /* =========================
       GET CURRENT CHAT
    ========================= */

    function getCurrentChat() {
        return chats.find(
            chat => chat.id === currentChatId
        );
    }

    /* =========================
       RENDER SIDEBAR
    ========================= */

    function renderHistory() {

        history.innerHTML = "";

        chats.forEach(chat => {

            const item = document.createElement("div");

            item.className = "history-item";

            if (chat.id === currentChatId) {
                item.classList.add("active");
            }

            const title = document.createElement("div");

            title.className = "history-title";

            title.textContent =
                chat.title || "New chat";

            const deleteButton =
                document.createElement("button");

            deleteButton.className =
                "delete-chat";

            deleteButton.textContent = "×";
            deleteButton.title = "Delete chat";

            deleteButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    deleteChat(chat.id);
                }
            );

            item.appendChild(title);
            item.appendChild(deleteButton);

            item.addEventListener(
                "click",
                () => {

                    currentChatId = chat.id;

                    renderHistory();
                    renderChat();

                    sidebar.classList.remove("open");
                }
            );

            history.appendChild(item);
        });
    }

    /* =========================
       DELETE CHAT
    ========================= */

    function deleteChat(id) {

        chats = chats.filter(
            chat => chat.id !== id
        );

        saveChats();

        if (chats.length === 0) {
            createChat();
            return;
        }

        if (currentChatId === id) {
            currentChatId = chats[0].id;
        }

        renderHistory();
        renderChat();
    }

    /* =========================
       CLEAR CHATS
    ========================= */

    clearChatsButton.addEventListener(
        "click",
        () => {

            if (!confirm("Delete all NKA TECH AI chats?")) {
                return;
            }

            chats = [];

            saveChats();

            createChat();
        }
    );

    /* =========================
       NEW CHAT
    ========================= */

    newChatButton.addEventListener(
        "click",
        createChat
    );

    /* =========================
       RENDER CHAT
    ========================= */

    function renderChat() {

        messages.innerHTML = "";

        const chat = getCurrentChat();

        if (!chat || chat.messages.length === 0) {

            messages.innerHTML = `
                <div class="welcome-screen">

                    <div class="welcome-logo">
                        NKA
                    </div>

                    <h3>
                        How can I help you?
                    </h3>

                    <p>
                        Ask NKA TECH AI anything about
                        technology, coding, websites or ideas.
                    </p>

                    <div class="suggestions">

                        <button>
                            Explain AI simply
                        </button>

                        <button>
                            Help me build a website
                        </button>

                        <button>
                            Give me a Python idea
                        </button>

                    </div>

                </div>
            `;

            addSuggestionEvents();

            return;
        }

        chat.messages.forEach(message => {

            addMessageToScreen(
                message.role,
                message.content
            );

        });

        scrollToBottom();
    }

    /* =========================
       ADD MESSAGE
    ========================= */

    function addMessageToScreen(role, text) {

        const message = document.createElement("div");

        message.className =
            "message " +
            (role === "user"
                ? "user"
                : "assistant");

        const avatar =
            document.createElement("div");

        avatar.className =
            "message-avatar";

        avatar.textContent =
            role === "user"
                ? "You"
                : "N";

        const content =
            document.createElement("div");

        content.className =
            "message-content";

        content.textContent = text;

        message.appendChild(avatar);
        message.appendChild(content);

        messages.appendChild(message);

        return content;
    }

    /* =========================
       SEND MESSAGE
    ========================= */

    async function sendMessage() {

        const text = input.value.trim();

        if (!text) {
            return;
        }

        const chat = getCurrentChat();

        if (!chat) {
            createChat();
            return;
        }

        const welcome =
            messages.querySelector(".welcome-screen");

        if (welcome) {
            welcome.remove();
        }

        chat.messages.push({
            role: "user",
            content: text
        });

        if (chat.title === "New chat") {

            chat.title =
                text.length > 35
                    ? text.substring(0, 35) + "..."
                    : text;
        }

        addMessageToScreen(
            "user",
            text
        );

        input.value = "";

        autoResize();

        const thinking =
            document.createElement("div");

        thinking.className =
            "message assistant";

        thinking.innerHTML = `
            <div class="message-avatar">N</div>

            <div class="message-content thinking">
                Thinking...
            </div>
        `;

        messages.appendChild(thinking);

        scrollToBottom();

        sendButton.disabled = true;

        stopButton.style.display = "block";

        controller = new AbortController();

        try {

            const response = await fetch(
                ,"https://anthropology-display-word-architectural.trycloudflare.com/chat"
                
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        messages: chat.messages
                    }),

                    signal: controller.signal
                }
            );

            if (!response.ok) {

                throw new Error(
                    "Backend returned HTTP " +
                    response.status
                );
            }

            const data =
                await response.json();

            thinking.remove();

            const reply =
                data.reply ||
                "I couldn't generate a response.";

            chat.messages.push({
                role: "assistant",
                content: reply
            });

            const content =
                addMessageToScreen(
                    "assistant",
                    ""
                );

            typeText(
                content,
                reply
            );

            saveChats();
            renderHistory();

            scrollToBottom();

        } catch (error) {

            thinking.remove();

            if (error.name === "AbortError") {

                addMessageToScreen(
                    "assistant",
                    "Generation stopped."
                );

            } else {

                console.error(
                    "NKA TECH AI error:",
                    error
                );

                addMessageToScreen(
                    "assistant",
                    "⚠️ I couldn't connect to NKA TECH AI. Make sure your Flask backend is running."
                );
            }

        } finally {

            sendButton.disabled = false;

            stopButton.style.display = "none";

            controller = null;

            scrollToBottom();
        }
    }

    /* =========================
       TYPE RESPONSE
    ========================= */

    function typeText(element, text) {

        if (!element) {
            return;
        }

        let index = 0;

        function next() {

            if (index >= text.length) {

                saveChats();

                return;
            }

            element.textContent +=
                text.charAt(index);

            index++;

            scrollToBottom();

            setTimeout(
                next,
                12
            );
        }

        next();
    }

    /* =========================
       STOP AI
    ========================= */

    stopButton.addEventListener(
        "click",
        () => {

            if (controller) {
                controller.abort();
            }
        }
    );

    /* =========================
       SEND BUTTON
    ========================= */

    sendButton.addEventListener(
        "click",
        sendMessage
    );

    /* =========================
       ENTER TO SEND
    ========================= */

    input.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();
            }
        }
    );

    /* =========================
       AUTO RESIZE
    ========================= */

    input.addEventListener(
        "input",
        autoResize
    );

    function autoResize() {

        input.style.height = "auto";

        input.style.height =
            Math.min(
                input.scrollHeight,
                150
            ) + "px";
    }

    /* =========================
       SCROLL
    ========================= */

    function scrollToBottom() {

        messages.scrollTop =
            messages.scrollHeight;
    }

    /* =========================
       SUGGESTIONS
    ========================= */

    function addSuggestionEvents() {

        document
            .querySelectorAll(
                ".suggestions button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        input.value =
                            button.textContent.trim();

                        input.focus();

                        sendMessage();
                    }
                );
            });
    }

    /* =========================
       MOBILE MENU
    ========================= */

    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );
        }
    );

    /* =========================
       START
    ========================= */

    if (chats.length === 0) {

        createChat();

    } else {

        currentChatId =
            chats[0].id;

        renderHistory();
        renderChat();
    }

    console.log(
        "NKA TECH AI ready"
    );
});
