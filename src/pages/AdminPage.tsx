import { type FormEvent, useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import { initialSiteContent, notices as initialNotices, resources as initialResources } from "../data/siteData";
import type { InquiryItem, NoticeItem, ResourceItem, SiteContent } from "../types";

const tokenStorageKey = "sh_admin_token";

const AdminPage = () => {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(tokenStorageKey));
  const [content, setContent] = useState<SiteContent>(initialSiteContent);
  const [contentJson, setContentJson] = useState(JSON.stringify(initialSiteContent, null, 2));
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [notices, setNotices] = useState<NoticeItem[]>(initialNotices);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [resourceTitle, setResourceTitle] = useState("");
  const [resourceType, setResourceType] = useState<ResourceItem["type"]>("Catalog");
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().slice(0, 10));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const sortedInquiries = useMemo(
    () =>
      [...inquiries].sort((a, b) => {
        if (a.createdAt > b.createdAt) return -1;
        if (a.createdAt < b.createdAt) return 1;
        return 0;
      }),
    [inquiries]
  );

  const loadAdminData = async (adminToken: string) => {
    const [latestContent, latestResources, latestNotices, latestInquiries] = await Promise.all([
      apiClient.getContent(),
      apiClient.getResources(),
      apiClient.getNotices(),
      apiClient.adminGetInquiries(adminToken)
    ]);
    setContent(latestContent);
    setContentJson(JSON.stringify(latestContent, null, 2));
    setResources(latestResources);
    setNotices(latestNotices);
    setInquiries(latestInquiries);
  };

  useEffect(() => {
    if (!token) {
      return;
    }
    loadAdminData(token).catch((error) => {
      const text = error instanceof Error ? error.message : "Admin data load failed";
      setMessage(text);
    });
  }, [token]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result = await apiClient.adminLogin(username, password);
      localStorage.setItem(tokenStorageKey, result.token);
      setToken(result.token);
      setMessage("Login successful.");
      setPassword("");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Login failed";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(tokenStorageKey);
    setToken(null);
    setMessage("Logged out.");
  };

  const saveContent = async () => {
    if (!token) return;
    setBusy(true);
    setMessage("");
    try {
      const parsed = JSON.parse(contentJson) as SiteContent;
      const saved = await apiClient.adminSaveContent(parsed, token);
      setContent(saved);
      setContentJson(JSON.stringify(saved, null, 2));
      setMessage("Content saved.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Content save failed";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const createResource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    setMessage("");
    try {
      await apiClient.adminCreateResource({ title: resourceTitle, type: resourceType }, token);
      setResourceTitle("");
      await loadAdminData(token);
      setMessage("Resource added.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Resource add failed";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const deleteResource = async (id: string) => {
    if (!token) return;
    setBusy(true);
    try {
      await apiClient.adminDeleteResource(id, token);
      setResources((prev) => prev.filter((item) => item.id !== id));
      setMessage("Resource deleted.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Resource delete failed";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const createNotice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    try {
      await apiClient.adminCreateNotice({ title: noticeTitle, publishedAt: noticeDate }, token);
      setNoticeTitle("");
      await loadAdminData(token);
      setMessage("Notice added.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Notice add failed";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const deleteNotice = async (id: string) => {
    if (!token) return;
    setBusy(true);
    try {
      await apiClient.adminDeleteNotice(id, token);
      setNotices((prev) => prev.filter((item) => item.id !== id));
      setMessage("Notice deleted.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Notice delete failed";
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const updateInquiryStatus = async (id: string, status: InquiryItem["status"]) => {
    if (!token) return;
    try {
      const updated = await apiClient.adminUpdateInquiryStatus(id, status, token);
      setInquiries((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setMessage("Inquiry status updated.");
    } catch (error) {
      const text = error instanceof Error ? error.message : "Status update failed";
      setMessage(text);
    }
  };

  if (!token) {
    return (
      <main className="admin-shell">
        <section className="admin-login">
          <h1>SH Admin Login</h1>
          <form onSubmit={login}>
            <label>
              Username
              <input value={username} onChange={(event) => setUsername(event.target.value)} />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button type="submit" disabled={busy}>
              {busy ? "Signing in..." : "Sign in"}
            </button>
          </form>
          <p className="admin-hint">Default: admin / change-me</p>
          {message ? <p className="admin-message">{message}</p> : null}
          <a href="/">Back to site</a>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <h1>SH Homepage Admin</h1>
        <div>
          <button type="button" onClick={logout}>
            Logout
          </button>
          <a href="/">Public Site</a>
        </div>
      </header>

      {message ? <p className="admin-message">{message}</p> : null}

      <section className="admin-panel">
        <h2>Content JSON Editor</h2>
        <p>Update hero, company, applications, products, solutions, links in one payload.</p>
        <textarea
          value={contentJson}
          onChange={(event) => setContentJson(event.target.value)}
          rows={20}
          aria-label="Content JSON editor"
        />
        <div className="admin-actions">
          <button type="button" onClick={saveContent} disabled={busy}>
            Save Content
          </button>
          <button
            type="button"
            onClick={() => setContentJson(JSON.stringify(content, null, 2))}
            disabled={busy}
          >
            Reset Editor
          </button>
        </div>
      </section>

      <section className="admin-grid">
        <article className="admin-panel">
          <h2>Resources</h2>
          <form onSubmit={createResource} className="admin-inline-form">
            <input
              value={resourceTitle}
              onChange={(event) => setResourceTitle(event.target.value)}
              placeholder="Resource title"
              required
            />
            <select
              value={resourceType}
              onChange={(event) => setResourceType(event.target.value as ResourceItem["type"])}
            >
              <option value="Catalog">Catalog</option>
              <option value="White Paper">White Paper</option>
              <option value="Certificate">Certificate</option>
              <option value="Case Study">Case Study</option>
            </select>
            <button type="submit" disabled={busy}>
              Add
            </button>
          </form>
          <ul className="admin-list">
            {resources.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.type}</span>
                </div>
                <button type="button" onClick={() => deleteResource(item.id)} disabled={busy}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-panel">
          <h2>Notices</h2>
          <form onSubmit={createNotice} className="admin-inline-form">
            <input
              value={noticeTitle}
              onChange={(event) => setNoticeTitle(event.target.value)}
              placeholder="Notice title"
              required
            />
            <input
              type="date"
              value={noticeDate}
              onChange={(event) => setNoticeDate(event.target.value)}
              required
            />
            <button type="submit" disabled={busy}>
              Add
            </button>
          </form>
          <ul className="admin-list">
            {notices.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.publishedAt}</span>
                </div>
                <button type="button" onClick={() => deleteNotice(item.id)} disabled={busy}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="admin-panel">
        <h2>Inquiries</h2>
        <p>Total: {sortedInquiries.length}</p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Created At</th>
                <th>Company</th>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Requirements</th>
              </tr>
            </thead>
            <tbody>
              {sortedInquiries.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>{item.company}</td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>
                    <select
                      value={item.status}
                      onChange={(event) =>
                        updateInquiryStatus(item.id, event.target.value as InquiryItem["status"])
                      }
                    >
                      <option value="received">received</option>
                      <option value="in-review">in-review</option>
                      <option value="done">done</option>
                    </select>
                  </td>
                  <td>{item.requirements || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default AdminPage;
