import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const MOCK_CONVERSATIONS = [
  { id: "c1", title: "Jordan", last: "Up for a gravel loop this weekend?" },
  { id: "c2", title: "Sam", last: "Morning sprint session tomorrow?" },
];

const MOCK_MESSAGES = {
  c1: [
    { id: "m1", mine: false, text: "Up for a gravel loop this weekend?", ts: "09:12" },
    { id: "m2", mine: true, text: "Yes! Any preferred route?", ts: "09:14" },
  ],
  c2: [
    { id: "m1", mine: false, text: "Morning sprint session tomorrow?", ts: "18:02" },
    { id: "m2", mine: true, text: "I’m in. What time?", ts: "18:04" },
  ],
};

function initials(s) {
  const t = (s || "?").trim();
  const parts = t.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "?";
}

// PUBLIC_INTERFACE
export function MessagesPage() {
  /** Messaging page with conversation list and chat panel. */
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [activeId, setActiveId] = useState(MOCK_CONVERSATIONS[0]?.id || null);
  const [messages, setMessages] = useState(MOCK_MESSAGES[MOCK_CONVERSATIONS[0]?.id] || []);
  const [text, setText] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const active = useMemo(
    () => conversations.find((c) => c.id === activeId) || null,
    [conversations, activeId]
  );

  useEffect(() => {
    let ignore = false;

    async function load() {
      setLoading(true);
      setToast(null);
      try {
        const data = await api.messaging.listConversations();
        const items = Array.isArray(data) ? data : data?.items || [];
        if (!ignore && items.length) {
          setConversations(items.map((c) => ({
            id: c.id || c.conversation_id || c.conversationId,
            title: c.title || c.other_user_name || c.otherUserName || "Conversation",
            last: c.last_message || c.lastMessage || "",
          })));
          setActiveId(items[0].id || items[0].conversation_id || items[0].conversationId);
        }
      } catch (e) {
        setToast({ type: "error", message: e?.message || "Messaging API not ready. Showing sample chats." });
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadMessages() {
      if (!activeId) return;
      setToast(null);
      try {
        const data = await api.messaging.getMessages(activeId);
        const items = Array.isArray(data) ? data : data?.items || [];
        if (!ignore) setMessages(items.map((m, idx) => ({
          id: m.id || m.message_id || `m-${idx}`,
          mine: Boolean(m.mine || m.is_mine || m.isMine),
          text: m.text || m.body || "",
          ts: m.ts || m.created_at || "",
        })));
      } catch (e) {
        setMessages(MOCK_MESSAGES[activeId] || []);
        setToast({ type: "error", message: e?.message || "Could not load messages (API not ready)." });
      }
    }

    loadMessages();
    return () => {
      ignore = true;
    };
  }, [activeId]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !activeId) return;
    setText("");

    // Optimistic UI
    const optimistic = { id: `tmp-${Date.now()}`, mine: true, text: trimmed, ts: "now" };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await api.messaging.sendMessage(activeId, { text: trimmed });
    } catch (e) {
      setToast({ type: "error", message: e?.message || "Send failed (API not ready)." });
    }
  };

  return (
    <div>
      <div className="pageHeader" style={{ marginTop: 0 }}>
        <div>
          <h1 className="h1">Messages</h1>
          <p className="p">Conversations with riders you’ve connected with.</p>
        </div>
        <span className="badge">{loading ? "Loading…" : `${conversations.length} chats`}</span>
      </div>

      <div className="chatShell">
        <aside className="card" aria-label="Conversation list">
          <h2 className="cardTitle">Chats</h2>
          <div className="stack" style={{ marginTop: 10 }}>
            {conversations.map((c) => (
              <div
                key={c.id}
                className={`chatListItem ${c.id === activeId ? "chatListItemActive" : ""}`}
                onClick={() => setActiveId(c.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setActiveId(c.id)}
                aria-label={`Open chat with ${c.title}`}
              >
                <div className="avatar" aria-hidden="true">
                  {initials(c.title)}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, letterSpacing: "-0.01em" }}>{c.title}</div>
                  <div className="mini" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {c.last || "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="card" aria-label="Chat panel">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div style={{ fontWeight: 800, letterSpacing: "-0.01em" }}>
                {active?.title || "Select a chat"}
              </div>
              <div className="mini">Be respectful and ride safe.</div>
            </div>
            <span className="badge badgePrimary">DM</span>
          </div>

          <div className="divider" />

          <div className="stack" style={{ maxHeight: 420, overflow: "auto", paddingRight: 4 }}>
            {(messages || []).map((m) => (
              <div key={m.id}>
                <div className={`msgBubble ${m.mine ? "msgMine" : ""}`}>{m.text}</div>
                <div className="msgMeta" style={{ textAlign: m.mine ? "right" : "left" }}>
                  {m.ts || ""}
                </div>
              </div>
            ))}
          </div>

          <div className="divider" />

          <div className="row">
            <input
              className="input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Write a message…"
              onKeyDown={(e) => e.key === "Enter" && send()}
              aria-label="Message text"
            />
            <button className="btn btnPrimary" onClick={send}>
              Send
            </button>
          </div>

          {toast && (
            <div className={`toast ${toast.type === "success" ? "toastSuccess" : "toastError"}`} role="status">
              {toast.message}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
