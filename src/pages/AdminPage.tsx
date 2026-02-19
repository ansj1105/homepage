import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../api/client";
import { initialSiteContent, notices as initialNotices, resources as initialResources } from "../data/siteData";
import { useI18n } from "../i18n/I18nContext";
import type { InquiryItem, NoticeItem, ResourceItem, SiteContent } from "../types";

const tokenStorageKey = "sh_admin_token";

const AdminPage = () => {
  const { t } = useI18n();
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
      const text = error instanceof Error ? error.message : t("admin.msgLoadFail");
      setMessage(text);
    });
  }, [t, token]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const result = await apiClient.adminLogin(username, password);
      localStorage.setItem(tokenStorageKey, result.token);
      setToken(result.token);
      setMessage(t("admin.msgLoginOk"));
      setPassword("");
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgLoginFail");
      setMessage(text);
    } finally {
      setBusy(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(tokenStorageKey);
    setToken(null);
    setMessage(t("admin.msgLoggedOut"));
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
      setMessage(t("admin.msgSaveOk"));
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgSaveFail");
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
      setMessage(t("admin.msgResourceAddOk"));
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgResourceAddFail");
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
      setMessage(t("admin.msgResourceDelOk"));
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgResourceDelFail");
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
      setMessage(t("admin.msgNoticeAddOk"));
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgNoticeAddFail");
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
      setMessage(t("admin.msgNoticeDelOk"));
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgNoticeDelFail");
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
      setMessage(t("admin.msgInquiryStatusOk"));
    } catch (error) {
      const text = error instanceof Error ? error.message : t("admin.msgInquiryStatusFail");
      setMessage(text);
    }
  };

  if (!token) {
    return (
      <main className="admin-shell">
        <section className="admin-login">
          <h1>{t("admin.loginTitle")}</h1>
          <form onSubmit={login}>
            <label>
              {t("admin.username")}
              <input value={username} onChange={(event) => setUsername(event.target.value)} />
            </label>
            <label>
              {t("admin.password")}
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <button type="submit" disabled={busy}>
              {busy ? t("admin.signingIn") : t("admin.signIn")}
            </button>
          </form>
          <p className="admin-hint">{t("admin.defaultCred")}</p>
          {message ? <p className="admin-message">{message}</p> : null}
          <Link to="/company/ceo">{t("admin.backToSite")}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-top">
        <h1>{t("admin.title")}</h1>
        <div>
          <button type="button" onClick={logout}>
            {t("admin.logout")}
          </button>
          <Link to="/company/ceo">{t("admin.publicSite")}</Link>
        </div>
      </header>

      {message ? <p className="admin-message">{message}</p> : null}

      <section className="admin-panel">
        <h2>{t("admin.contentEditor")}</h2>
        <p>{t("admin.contentDesc")}</p>
        <textarea
          value={contentJson}
          onChange={(event) => setContentJson(event.target.value)}
          rows={20}
          aria-label={t("admin.contentAria")}
        />
        <div className="admin-actions">
          <button type="button" onClick={saveContent} disabled={busy}>
            {t("admin.saveContent")}
          </button>
          <button
            type="button"
            onClick={() => setContentJson(JSON.stringify(content, null, 2))}
            disabled={busy}
          >
            {t("admin.resetEditor")}
          </button>
        </div>
      </section>

      <section className="admin-grid">
        <article className="admin-panel">
          <h2>{t("admin.resources")}</h2>
          <form onSubmit={createResource} className="admin-inline-form">
            <input
              value={resourceTitle}
              onChange={(event) => setResourceTitle(event.target.value)}
              placeholder={t("admin.resourcePlaceholder")}
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
              {t("admin.add")}
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
                  {t("admin.delete")}
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="admin-panel">
          <h2>{t("admin.notices")}</h2>
          <form onSubmit={createNotice} className="admin-inline-form">
            <input
              value={noticeTitle}
              onChange={(event) => setNoticeTitle(event.target.value)}
              placeholder={t("admin.noticePlaceholder")}
              required
            />
            <input
              type="date"
              value={noticeDate}
              onChange={(event) => setNoticeDate(event.target.value)}
              required
            />
            <button type="submit" disabled={busy}>
              {t("admin.add")}
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
                  {t("admin.delete")}
                </button>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="admin-panel">
        <h2>{t("admin.inquiries")}</h2>
        <p>{t("admin.inquiryTotal", { count: sortedInquiries.length })}</p>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.tableCreatedAt")}</th>
                <th>{t("admin.tableCompany")}</th>
                <th>{t("admin.tableName")}</th>
                <th>{t("admin.tableEmail")}</th>
                <th>{t("admin.tableStatus")}</th>
                <th>{t("admin.tableRequirements")}</th>
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
                      <option value="received">{t("admin.status.received")}</option>
                      <option value="in-review">{t("admin.status.in-review")}</option>
                      <option value="done">{t("admin.status.done")}</option>
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
