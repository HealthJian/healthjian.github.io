// 亦心的沟通宝典beta - Chat UI (ChatGPT风格)

const API_ENDPOINT = "https://api.coze.cn/v1/chat/completions";
const API_KEY = "pat_kTdfDlBzwQZyluri2b578iG2VPhR3AQcFoq5G0AtVhOPqdwNKYoml7wFPJPogHHx";
const DEFAULT_MODEL = "DouBao1.5Pro";

const chatMessages = document.getElementById("chatMessages");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const suggestionsContainer = document.getElementById("suggestionsContainer");
const suggestionChips = document.querySelectorAll(".suggestion-chip");

// 侧边栏相关
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
const newChatBtn = document.getElementById("newChatBtn");
const chatHistoryList = document.getElementById("chatHistoryList");
const settingsBtn = document.getElementById("settingsBtn");
const themeToggleBtn = document.getElementById("themeToggleBtn");

// 设置面板相关
const settingsPanel = document.getElementById("settingsPanel");
const settingsCloseBtn = document.getElementById("settingsCloseBtn");
const temperatureSlider = document.getElementById("temperatureSlider");
const temperatureValue = document.getElementById("temperatureValue");
const modelSelect = document.getElementById("modelSelect");

let messageHistory = [];
let chatSessions = [];
let currentSessionId = null;
let temperature = 0.6;

// 创建用户头像SVG
function createUserAvatar() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("fill", "none");
    
    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path1.setAttribute("d", "M10 10C12.7614 10 15 7.76142 15 5C15 2.23858 12.7614 0 10 0C7.23858 0 5 2.23858 5 5C5 7.76142 7.23858 10 10 10Z");
    path1.setAttribute("fill", "currentColor");
    
    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path2.setAttribute("d", "M10 12C5.58172 12 2 14.2386 2 17V20H18V17C18 14.2386 14.4183 12 10 12Z");
    path2.setAttribute("fill", "currentColor");
    
    svg.appendChild(path1);
    svg.appendChild(path2);
    return svg;
}

// 创建助手头像SVG
function createAssistantAvatar() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 20 20");
    svg.setAttribute("fill", "none");
    
    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path1.setAttribute("d", "M10 2C5.58 2 2 5.58 2 10C2 14.42 5.58 18 10 18C14.42 18 18 14.42 18 10C18 5.58 14.42 2 10 2ZM10 16C6.69 16 4 13.31 4 10C4 6.69 6.69 4 10 4C13.31 4 16 6.69 16 10C16 13.31 13.31 16 10 16Z");
    path1.setAttribute("fill", "currentColor");
    
    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path2.setAttribute("d", "M10 6C9.45 6 9 6.45 9 7V9C9 9.55 9.45 10 10 10C10.55 10 11 9.55 11 9V7C11 6.45 10.55 6 10 6ZM10 12C9.45 12 9 12.45 9 13C9 13.55 9.45 14 10 14C10.55 14 11 13.55 11 13C11 12.45 10.55 12 10 12Z");
    path2.setAttribute("fill", "currentColor");
    
    svg.appendChild(path1);
    svg.appendChild(path2);
    return svg;
}

function appendMessage(role, content, animate = true) {
    // 隐藏快捷提示
    if (suggestionsContainer) {
        suggestionsContainer.style.display = "none";
    }

    const messageGroup = document.createElement("div");
    messageGroup.className = `message-group ${role}`;
    if (animate) {
        messageGroup.style.opacity = "0";
        messageGroup.style.transform = "translateY(10px)";
    }

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    if (role === "user") {
        avatar.appendChild(createUserAvatar());
    } else {
        avatar.appendChild(createAssistantAvatar());
    }

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";

    const messageText = document.createElement("div");
    messageText.className = "message-text";
    
    // 格式化内容，支持换行和基本markdown
    const formattedContent = formatMessage(content);
    messageText.innerHTML = formattedContent;

    messageContent.appendChild(messageText);
    messageGroup.appendChild(avatar);
    messageGroup.appendChild(messageContent);
    
    chatMessages.appendChild(messageGroup);

    // 滚动到底部
    scrollToBottom();

    // 动画效果
    if (animate) {
        requestAnimationFrame(() => {
            messageGroup.style.transition = "opacity 0.3s ease, transform 0.3s ease";
            messageGroup.style.opacity = "1";
            messageGroup.style.transform = "translateY(0)";
        });
    }

    // 保存到历史记录
    messageHistory.push({ role, content });
}

function formatMessage(text) {
    // 转义HTML
    let html = sanitize(text);
    
    // 处理换行
    html = html.replace(/\n\n/g, "</p><p>");
    html = html.replace(/\n/g, "<br>");
    
    // 如果没有p标签，添加
    if (!html.includes("<p>")) {
        html = `<p>${html}</p>`;
    }
    
    // 处理代码块（简单处理）
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    return html;
}

function sanitize(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    sendBtn.classList.toggle("loading", isLoading);
    
    if (isLoading) {
        sendBtn.querySelector(".send-icon").style.display = "none";
        sendBtn.querySelector(".loading-icon").style.display = "block";
    } else {
        sendBtn.querySelector(".send-icon").style.display = "block";
        sendBtn.querySelector(".loading-icon").style.display = "none";
    }
}

async function sendMessage() {
    const content = userInput.value.trim();
    if (!content || sendBtn.disabled) return;

    // 如果是新对话，创建会话ID
    if (!currentSessionId) {
        currentSessionId = Date.now().toString();
    }

    // 先添加到历史记录
    messageHistory.push({ role: "user", content });
    
    appendMessage("user", content);
    userInput.value = "";
    autoResize();
    setLoading(true);

    // 构建消息历史（包含系统消息）
    const messages = [
        {
            role: "system",
            content: "你是亦心的沟通宝典，擅长对话技巧、礼貌表达、雷区规避与场景应对。保持简洁、分条、可执行。"
        },
        ...messageHistory.map(msg => ({
            role: msg.role === "user" ? "user" : "assistant",
            content: msg.content
        }))
    ];

    try {
        const payload = {
            model: modelSelect ? modelSelect.value : DEFAULT_MODEL,
            messages: messages,
            temperature: temperature,
            stream: false
        };

        const response = await fetch(API_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${API_KEY}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`请求失败：${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const reply =
            data?.choices?.[0]?.message?.content ||
            data?.message ||
            "抱歉，暂时未获取到回复，请稍后再试。";

        // 添加到历史记录
        messageHistory.push({ role: "assistant", content: reply });
        appendMessage("assistant", reply);
        
        // 保存会话
        saveCurrentSession();
        updateChatHistoryList();
    } catch (error) {
        console.error("API Error:", error);
        appendMessage(
            "assistant",
            `抱歉，出现了错误：${error.message}。请检查网络连接或稍后再试。`,
            true
        );
    } finally {
        setLoading(false);
        userInput.focus();
    }
}

function autoResize() {
    userInput.style.height = "auto";
    const newHeight = Math.min(userInput.scrollHeight, 200);
    userInput.style.height = `${newHeight}px`;
    
    // 调整输入容器高度
    const inputWrapper = userInput.closest(".input-wrapper");
    if (inputWrapper) {
        inputWrapper.style.height = "auto";
        inputWrapper.style.minHeight = "52px";
    }
}

function clearChat() {
    // 确认对话框（如果有消息历史）
    const hasHistory = messageHistory.length > 0 || 
        chatMessages.querySelectorAll(".message-group").length > 1;
    
    if (hasHistory && !confirm("确定要清空所有对话吗？")) {
        return;
    }

    // 保存当前会话
    if (messageHistory.length > 0) {
        saveCurrentSession();
    }

    // 清空消息
    chatMessages.innerHTML = "";
    messageHistory = [];
    currentSessionId = null;

    // 重新添加欢迎消息（不添加到历史记录，因为这是初始消息）
    const welcomeMessage = "嗨，我是亦心的沟通宝典beta。告诉我你的场景，我来帮你把话说得更巧、更稳、更有分寸。";
    appendMessage("assistant", welcomeMessage, false);

    // 显示快捷提示
    if (suggestionsContainer) {
        suggestionsContainer.style.display = "block";
    }
    
    // 更新历史列表
    updateChatHistoryList();

    userInput.focus();
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: "smooth"
        });
    });
}

// 事件监听
sendBtn.addEventListener("click", sendMessage);
clearBtn.addEventListener("click", clearChat);

userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

userInput.addEventListener("input", () => {
    autoResize();
    // 实时更新发送按钮状态
    sendBtn.disabled = !userInput.value.trim();
});

userInput.addEventListener("focus", () => {
    const inputWrapper = userInput.closest(".input-wrapper");
    if (inputWrapper) {
        inputWrapper.classList.add("focused");
    }
});

userInput.addEventListener("blur", () => {
    const inputWrapper = userInput.closest(".input-wrapper");
    if (inputWrapper) {
        inputWrapper.classList.remove("focused");
    }
});

// 快捷提示点击
suggestionChips.forEach((chip) => {
    chip.addEventListener("click", () => {
        const prompt = chip.dataset.prompt;
        if (prompt) {
            userInput.value = prompt;
            autoResize();
            userInput.focus();
            // 触发输入事件以更新按钮状态
            userInput.dispatchEvent(new Event("input"));
        }
    });
});

// ========== 侧边栏功能 ==========
function openSidebar() {
    sidebar.classList.add("active");
    sidebarOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeSidebar() {
    sidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");
    document.body.style.overflow = "";
}

sidebarToggle.addEventListener("click", openSidebar);
sidebarCloseBtn.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar);

// ESC键关闭侧边栏
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("active")) {
        closeSidebar();
    }
});

// ========== 新建对话功能 ==========
function createNewChat() {
    // 保存当前对话
    if (messageHistory.length > 0) {
        saveCurrentSession();
    }
    
    // 清空当前对话
    chatMessages.innerHTML = "";
    messageHistory = [];
    currentSessionId = null;
    
    // 重新添加欢迎消息
    const welcomeMessage = "嗨，我是亦心的沟通宝典beta。告诉我你的场景，我来帮你把话说得更巧、更稳、更有分寸。";
    appendMessage("assistant", welcomeMessage, false);
    
    // 显示快捷提示
    if (suggestionsContainer) {
        suggestionsContainer.style.display = "block";
    }
    
    // 更新历史列表
    updateChatHistoryList();
    
    // 关闭侧边栏
    closeSidebar();
    
    userInput.focus();
}

newChatBtn.addEventListener("click", createNewChat);

// ========== 对话历史管理 ==========
function saveCurrentSession() {
    if (messageHistory.length === 0) return;
    
    const session = {
        id: currentSessionId || Date.now().toString(),
        title: getSessionTitle(),
        messages: [...messageHistory],
        timestamp: Date.now()
    };
    
    // 如果已存在，更新；否则添加
    const existingIndex = chatSessions.findIndex(s => s.id === session.id);
    if (existingIndex >= 0) {
        chatSessions[existingIndex] = session;
    } else {
        chatSessions.unshift(session);
    }
    
    // 限制最多保存20个对话
    if (chatSessions.length > 20) {
        chatSessions = chatSessions.slice(0, 20);
    }
    
    // 保存到本地存储
    try {
        localStorage.setItem("yixinChatSessions", JSON.stringify(chatSessions));
    } catch (e) {
        console.warn("无法保存对话历史到本地存储", e);
    }
    
    currentSessionId = session.id;
}

function getSessionTitle() {
    // 使用第一条用户消息作为标题
    const firstUserMessage = messageHistory.find(msg => msg.role === "user");
    if (firstUserMessage) {
        const title = firstUserMessage.content.substring(0, 30);
        return title.length < firstUserMessage.content.length ? title + "..." : title;
    }
    return "新对话";
}

function loadSession(sessionId) {
    const session = chatSessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // 保存当前对话
    if (messageHistory.length > 0 && currentSessionId !== sessionId) {
        saveCurrentSession();
    }
    
    // 加载会话
    chatMessages.innerHTML = "";
    messageHistory = [...session.messages];
    currentSessionId = session.id;
    
    // 渲染消息
    session.messages.forEach((msg, index) => {
        appendMessage(msg.role, msg.content, index > 0);
    });
    
    // 隐藏快捷提示
    if (suggestionsContainer) {
        suggestionsContainer.style.display = "none";
    }
    
    // 更新历史列表
    updateChatHistoryList();
    
    // 关闭侧边栏
    closeSidebar();
    
    userInput.focus();
}

function deleteSession(sessionId, e) {
    if (e) {
        e.stopPropagation();
    }
    
    if (!confirm("确定要删除这个对话吗？")) return;
    
    chatSessions = chatSessions.filter(s => s.id !== sessionId);
    
    // 如果删除的是当前会话，创建新对话
    if (currentSessionId === sessionId) {
        createNewChat();
    } else {
        updateChatHistoryList();
    }
    
    // 保存到本地存储
    try {
        localStorage.setItem("yixinChatSessions", JSON.stringify(chatSessions));
    } catch (err) {
        console.warn("无法保存对话历史到本地存储", err);
    }
}

// 将deleteSession暴露到全局作用域，以便在HTML中使用
window.deleteSession = deleteSession;

function updateChatHistoryList() {
    if (!chatHistoryList) return;
    
    chatHistoryList.innerHTML = "";
    
    if (chatSessions.length === 0) {
        chatHistoryList.innerHTML = '<div class="chat-history-empty">暂无对话历史</div>';
        return;
    }
    
    chatSessions.forEach(session => {
        const item = document.createElement("div");
        item.className = `chat-history-item ${session.id === currentSessionId ? "active" : ""}`;
        
        const textSpan = document.createElement("span");
        textSpan.className = "chat-history-item-text";
        textSpan.textContent = session.title;
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "chat-history-item-delete";
        deleteBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3.5 3.5L10.5 10.5M10.5 3.5L3.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        `;
        deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            deleteSession(session.id, e);
        });
        
        item.appendChild(textSpan);
        item.appendChild(deleteBtn);
        item.addEventListener("click", () => loadSession(session.id));
        
        chatHistoryList.appendChild(item);
    });
}

// 从本地存储加载对话历史
function loadChatSessions() {
    try {
        const saved = localStorage.getItem("yixinChatSessions");
        if (saved) {
            chatSessions = JSON.parse(saved);
            updateChatHistoryList();
        }
    } catch (e) {
        console.warn("无法从本地存储加载对话历史", e);
    }
}

// ========== 设置面板功能 ==========
function openSettings() {
    settingsPanel.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeSettings() {
    settingsPanel.classList.remove("active");
    document.body.style.overflow = "";
}

settingsBtn.addEventListener("click", openSettings);
settingsCloseBtn.addEventListener("click", closeSettings);
settingsPanel.addEventListener("click", (e) => {
    if (e.target === settingsPanel) {
        closeSettings();
    }
});

// 温度滑块
temperatureSlider.addEventListener("input", (e) => {
    temperature = parseFloat(e.target.value);
    temperatureValue.textContent = temperature.toFixed(1);
});

// ========== 主题切换功能 ==========
function initTheme() {
    const savedTheme = localStorage.getItem("yixinTheme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("yixinTheme", newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const lightIcon = themeToggleBtn.querySelector(".theme-icon-light");
    const darkIcon = themeToggleBtn.querySelector(".theme-icon-dark");
    
    if (theme === "light") {
        lightIcon.style.display = "block";
        darkIcon.style.display = "none";
    } else {
        lightIcon.style.display = "none";
        darkIcon.style.display = "block";
    }
}

themeToggleBtn.addEventListener("click", toggleTheme);


// 初始化
initTheme();
loadChatSessions();
autoResize();
userInput.focus();

// 监听窗口大小变化
window.addEventListener("resize", () => {
    autoResize();
});

// 页面卸载前保存当前会话
window.addEventListener("beforeunload", () => {
    if (messageHistory.length > 0) {
        saveCurrentSession();
    }
});
