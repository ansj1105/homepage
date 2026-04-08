import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import type { BoardPost, BoardReply } from "../types";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const BOARD_PAGE_SIZE = 10;
const REPLY_PAGE_SIZE = 10;

const alphaPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const generateAnonymousName = (): string => {
  const pool = [...alphaPool];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return `익명-${pool.slice(0, 4).join("")}`;
};

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
};

type PostDraft = {
  authorName: string;
  password: string;
  title: string;
  content: string;
  file: File | null;
};

type ReplyDraft = {
  authorName: string;
  password: string;
  content: string;
};

type EditingPostDraft = {
  authorName: string;
  password: string;
  title: string;
  content: string;
};

type EditingReplyDraft = {
  password: string;
  content: string;
};

const createPostDraft = (): PostDraft => ({
  authorName: generateAnonymousName(),
  password: "",
  title: "",
  content: "",
  file: null
});

const createReplyDraft = (): ReplyDraft => ({
  authorName: generateAnonymousName(),
  password: "",
  content: ""
});

const emptyReplyDraft = (): ReplyDraft => ({
  authorName: "",
  password: "",
  content: ""
});

const BoardPage = () => {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [postDraft, setPostDraft] = useState<PostDraft>(() => createPostDraft());
  const [replyDrafts, setReplyDrafts] = useState<Record<string, ReplyDraft>>({});
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingPostDraft, setEditingPostDraft] = useState<EditingPostDraft | null>(null);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [editingReplyDraft, setEditingReplyDraft] = useState<EditingReplyDraft | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [replyVisibleCounts, setReplyVisibleCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    document.title = "동연 자유게시판";
  }, []);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .getBoardPosts()
      .then((items) => {
        if (!isMounted) return;
        setPosts(items);
        setErrorMessage("");
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : "게시글을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    setReplyDrafts((current) => {
      const next = { ...current };
      let updated = false;
      for (const post of posts) {
        if (!next[post.id]) {
          next[post.id] = createReplyDraft();
          updated = true;
        }
      }
      return updated ? next : current;
    });
  }, [posts]);

  useEffect(() => {
    setReplyVisibleCounts((current) => {
      const next = { ...current };
      let updated = false;
      for (const post of posts) {
        if (!next[post.id]) {
          next[post.id] = REPLY_PAGE_SIZE;
          updated = true;
        }
      }
      return updated ? next : current;
    });
  }, [posts]);

  const postCountLabel = useMemo(() => `${posts.length}개의 게시글`, [posts.length]);
  const totalPages = Math.max(1, Math.ceil(posts.length / BOARD_PAGE_SIZE));
  const pagedPosts = useMemo(
    () => posts.slice((currentPage - 1) * BOARD_PAGE_SIZE, currentPage * BOARD_PAGE_SIZE),
    [currentPage, posts]
  );
  const visiblePageNumbers = useMemo(() => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    const start = Math.max(1, Math.min(currentPage - half, totalPages - windowSize + 1));
    const end = Math.min(totalPages, start + windowSize - 1);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);
  const visiblePostStart = posts.length === 0 ? 0 : (currentPage - 1) * BOARD_PAGE_SIZE + 1;
  const visiblePostEnd = Math.min(currentPage * BOARD_PAGE_SIZE, posts.length);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const patchPost = (updated: BoardPost) => {
    setPosts((current) => current.map((post) => (post.id === updated.id ? updated : post)));
  };

  const addReplyToPost = (postId: string, reply: BoardReply) => {
    setPosts((current) =>
      current.map((post) =>
        post.id === postId ? { ...post, replies: [...post.replies, reply] } : post
      )
    );
  };

  const patchReply = (reply: BoardReply) => {
    setPosts((current) =>
      current.map((post) => ({
        ...post,
        replies: post.replies.map((item) => (item.id === reply.id ? reply : item))
      }))
    );
  };

  const removeReply = (replyId: string) => {
    setPosts((current) =>
      current.map((post) => ({
        ...post,
        replies: post.replies.filter((reply) => reply.id !== replyId)
      }))
    );
  };

  const handleFileChange = (file: File | null) => {
    if (file && file.size > MAX_FILE_BYTES) {
      setErrorMessage("첨부파일은 5MB 미만만 업로드할 수 있습니다.");
      return;
    }
    setErrorMessage("");
    setPostDraft((current) => ({ ...current, file }));
  };

  const handleCreatePost = async () => {
    if (!postDraft.password.trim() || !postDraft.title.trim() || !postDraft.content.trim()) {
      setErrorMessage("제목, 내용, 비밀번호를 입력해 주세요.");
      return;
    }

    setSubmittingId("post-create");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      let filePayload: {
        fileUrl?: string;
        fileName?: string;
        fileSize?: number;
        fileMimeType?: string;
      } = {};

      if (postDraft.file) {
        const uploaded = await apiClient.uploadBoardAttachment(postDraft.file);
        filePayload = {
          fileUrl: uploaded.url,
          fileName: uploaded.originalName,
          fileSize: uploaded.size,
          fileMimeType: uploaded.mimeType
        };
      }

      const created = await apiClient.createBoardPost({
        authorName: postDraft.authorName.trim() || generateAnonymousName(),
        password: postDraft.password.trim(),
        title: postDraft.title.trim(),
        content: postDraft.content.trim(),
        ...filePayload
      });

      setPosts((current) => [created, ...current]);
      setCurrentPage(1);
      setPostDraft(createPostDraft());
      setSuccessMessage("게시글이 등록되었습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "게시글을 등록하지 못했습니다.");
    } finally {
      setSubmittingId(null);
    }
  };

  const startPostEdit = (post: BoardPost) => {
    setEditingPostId(post.id);
    setEditingPostDraft({
      authorName: post.authorName,
      password: "",
      title: post.title,
      content: post.content
    });
  };

  const handleUpdatePost = async (postId: string) => {
    if (!editingPostDraft) return;
    if (!editingPostDraft.password.trim()) {
      setErrorMessage("게시글 비밀번호를 입력해 주세요.");
      return;
    }

    setSubmittingId(postId);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const updated = await apiClient.updateBoardPost(postId, {
        authorName: editingPostDraft.authorName.trim() || generateAnonymousName(),
        password: editingPostDraft.password.trim(),
        title: editingPostDraft.title.trim(),
        content: editingPostDraft.content.trim()
      });
      patchPost(updated);
      setEditingPostId(null);
      setEditingPostDraft(null);
      setSuccessMessage("게시글이 수정되었습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "게시글을 수정하지 못했습니다.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    const password = window.prompt("게시글 비밀번호를 입력해 주세요.")?.trim() ?? "";
    if (!password) return;

    setSubmittingId(postId);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await apiClient.deleteBoardPost(postId, password);
      setPosts((current) => current.filter((post) => post.id !== postId));
      setSuccessMessage("게시글이 삭제되었습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "게시글을 삭제하지 못했습니다.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCreateReply = async (postId: string) => {
    const draft = replyDrafts[postId] ?? createReplyDraft();
    if (!draft.password.trim() || !draft.content.trim()) {
      setErrorMessage("답글 내용과 비밀번호를 입력해 주세요.");
      return;
    }

    setSubmittingId(`reply-${postId}`);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const created = await apiClient.createBoardReply(postId, {
        authorName: draft.authorName.trim() || generateAnonymousName(),
        password: draft.password.trim(),
        content: draft.content.trim()
      });
      addReplyToPost(postId, created);
      setReplyDrafts((current) => ({ ...current, [postId]: createReplyDraft() }));
      setSuccessMessage("답글이 등록되었습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "답글을 등록하지 못했습니다.");
    } finally {
      setSubmittingId(null);
    }
  };

  const startReplyEdit = (reply: BoardReply) => {
    setEditingReplyId(reply.id);
    setEditingReplyDraft({ password: "", content: reply.content });
  };

  const handleUpdateReply = async (replyId: string) => {
    if (!editingReplyDraft) return;
    if (!editingReplyDraft.password.trim()) {
      setErrorMessage("답글 비밀번호를 입력해 주세요.");
      return;
    }

    setSubmittingId(replyId);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const updated = await apiClient.updateBoardReply(replyId, {
        password: editingReplyDraft.password.trim(),
        content: editingReplyDraft.content.trim()
      });
      patchReply(updated);
      setEditingReplyId(null);
      setEditingReplyDraft(null);
      setSuccessMessage("답글이 수정되었습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "답글을 수정하지 못했습니다.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    const password = window.prompt("답글 비밀번호를 입력해 주세요.")?.trim() ?? "";
    if (!password) return;

    setSubmittingId(replyId);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await apiClient.deleteBoardReply(replyId, password);
      removeReply(replyId);
      setSuccessMessage("답글이 삭제되었습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "답글을 삭제하지 못했습니다.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="powerRankingPage">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <header className="powerRankingHero boardHero">
          <div>
            <p className="powerRankingEyebrow">Board</p>
            <h1>동연 자유게시판</h1>
            <p className="powerRankingLead">
              익명 기본 이름과 비밀번호로 게시글과 답글을 자유롭게 남길 수 있습니다.
            </p>
          </div>
          <div className="boardMetaPanel">
            <strong>{postCountLabel}</strong>
            <span>첨부파일은 5MB 미만만 허용됩니다.</span>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
        {successMessage ? <div className="boardSuccess">{successMessage}</div> : null}

        <section className="boardComposer">
          <div className="boardComposerGrid">
            <input
              value={postDraft.authorName}
              onChange={(event) => setPostDraft((current) => ({ ...current, authorName: event.target.value }))}
              placeholder="이름"
            />
            <input
              type="password"
              value={postDraft.password}
              onChange={(event) => setPostDraft((current) => ({ ...current, password: event.target.value }))}
              placeholder="비밀번호"
            />
          </div>
          <input
            value={postDraft.title}
            onChange={(event) => setPostDraft((current) => ({ ...current, title: event.target.value }))}
            placeholder="제목"
          />
          <textarea
            value={postDraft.content}
            onChange={(event) => setPostDraft((current) => ({ ...current, content: event.target.value }))}
            placeholder="내용을 입력해 주세요"
          />
          <div className="boardComposerFooter">
            <label className="boardFileField">
              <span>파일 첨부</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp,.zip,.hwp,.txt"
                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              />
            </label>
            <div className="boardComposerActions">
              <span className="boardFileName">{postDraft.file?.name ?? "선택된 파일 없음"}</span>
              <button
                type="button"
                className="powerRankingVoteButton"
                disabled={submittingId === "post-create"}
                onClick={() => void handleCreatePost()}
              >
                글쓰기
              </button>
            </div>
          </div>
        </section>

        {isLoading ? (
          <div className="powerRankingLoading">게시글을 불러오는 중입니다.</div>
        ) : (
          <>
            {posts.length > 0 ? (
              <section className="boardListToolbar">
                <div className="boardListSummary">
                  <strong>{postCountLabel}</strong>
                  <span>
                    {visiblePostStart}-{visiblePostEnd} / page {currentPage} of {totalPages}
                  </span>
                </div>
                <nav className="boardPagination boardPaginationCompact" aria-label="게시판 상단 페이지">
                  <button
                    type="button"
                    className="powerRankingBackLink"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(1)}
                  >
                    처음
                  </button>
                  <button
                    type="button"
                    className="powerRankingBackLink"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  >
                    이전
                  </button>
                  <div className="boardPaginationNumbers">
                    {visiblePageNumbers.map((page) => (
                      <button
                        key={page}
                        type="button"
                        className={`powerRankingSortButton ${currentPage === page ? "isActive" : ""}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="powerRankingBackLink"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                  >
                    다음
                  </button>
                  <button
                    type="button"
                    className="powerRankingBackLink"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                  >
                    끝
                  </button>
                </nav>
              </section>
            ) : null}
            <div className="boardList">
              {pagedPosts.map((post, index) => {
                const postNumber = posts.length - ((currentPage - 1) * BOARD_PAGE_SIZE + index);
                return (
                <article key={post.id} className="boardCard">
                {editingPostId === post.id && editingPostDraft ? (
                  <div className="boardEditBlock">
                    <div className="boardComposerGrid">
                      <input
                        value={editingPostDraft.authorName}
                        onChange={(event) =>
                          setEditingPostDraft((current) =>
                            current ? { ...current, authorName: event.target.value } : current
                          )
                        }
                        placeholder="이름"
                      />
                      <input
                        type="password"
                        value={editingPostDraft.password}
                        onChange={(event) =>
                          setEditingPostDraft((current) =>
                            current ? { ...current, password: event.target.value } : current
                          )
                        }
                        placeholder="비밀번호"
                      />
                    </div>
                    <input
                      value={editingPostDraft.title}
                      onChange={(event) =>
                        setEditingPostDraft((current) =>
                          current ? { ...current, title: event.target.value } : current
                        )
                      }
                    />
                    <textarea
                      value={editingPostDraft.content}
                      onChange={(event) =>
                        setEditingPostDraft((current) =>
                          current ? { ...current, content: event.target.value } : current
                        )
                      }
                    />
                    <div className="powerRankingMemoButtons">
                      <button
                        type="button"
                        disabled={submittingId === post.id}
                        onClick={() => void handleUpdatePost(post.id)}
                      >
                        저장
                      </button>
                      <button
                        type="button"
                        className="isGhost"
                        onClick={() => {
                          setEditingPostId(null);
                          setEditingPostDraft(null);
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <header className="boardCardHead">
                      <div>
                        <div className="boardCardMeta">
                          <span className="boardCardBadge">No. {postNumber}</span>
                          <span className="boardCardMetaText">답글 {post.replies.length}</span>
                          {post.fileUrl ? <span className="boardCardMetaText">첨부 있음</span> : null}
                        </div>
                        <div className="boardAuthorLine">
                          <strong>{post.authorName}</strong>
                          <time>{formatDateTime(post.createdAt)}</time>
                        </div>
                        <h2>{post.title}</h2>
                      </div>
                      <div className="powerRankingMemoButtons">
                        <button type="button" className="isGhost" onClick={() => startPostEdit(post)}>
                          수정
                        </button>
                        <button
                          type="button"
                          className="isGhost"
                          disabled={submittingId === post.id}
                          onClick={() => void handleDeletePost(post.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </header>
                    <p className="boardCardBody">{post.content}</p>
                    {post.fileUrl ? (
                      <a href={post.fileUrl} target="_blank" rel="noreferrer" className="boardAttachment">
                        첨부파일: {post.fileName || "다운로드"}
                      </a>
                    ) : null}
                  </>
                )}

                <section className="boardReplies">
                  <div className="boardReplyHead">
                    <strong>답글 {post.replies.length}</strong>
                  </div>
                  <ul className="boardReplyList">
                    {post.replies.slice(0, replyVisibleCounts[post.id] ?? REPLY_PAGE_SIZE).map((reply) => (
                      <li key={reply.id} className="boardReplyItem">
                        {editingReplyId === reply.id && editingReplyDraft ? (
                          <div className="boardEditBlock boardReplyEditBlock">
                            <input
                              type="password"
                              value={editingReplyDraft.password}
                              onChange={(event) =>
                                setEditingReplyDraft((current) =>
                                  current ? { ...current, password: event.target.value } : current
                                )
                              }
                              placeholder="비밀번호"
                            />
                            <textarea
                              value={editingReplyDraft.content}
                              onChange={(event) =>
                                setEditingReplyDraft((current) =>
                                  current ? { ...current, content: event.target.value } : current
                                )
                              }
                            />
                            <div className="powerRankingMemoButtons">
                              <button
                                type="button"
                                disabled={submittingId === reply.id}
                                onClick={() => void handleUpdateReply(reply.id)}
                              >
                                저장
                              </button>
                              <button
                                type="button"
                                className="isGhost"
                                onClick={() => {
                                  setEditingReplyId(null);
                                  setEditingReplyDraft(null);
                                }}
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="boardAuthorLine">
                              <strong>{reply.authorName}</strong>
                              <time>{formatDateTime(reply.createdAt)}</time>
                            </div>
                            <p>{reply.content}</p>
                            <div className="powerRankingMemoButtons">
                              <button
                                type="button"
                                className="isGhost"
                                onClick={() => startReplyEdit(reply)}
                              >
                                수정
                              </button>
                              <button
                                type="button"
                                className="isGhost"
                                disabled={submittingId === reply.id}
                                onClick={() => void handleDeleteReply(reply.id)}
                              >
                                삭제
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                    {post.replies.length === 0 ? <li className="powerRankingMemoEmpty">첫 답글을 남겨보세요.</li> : null}
                  </ul>
                  {post.replies.length > (replyVisibleCounts[post.id] ?? REPLY_PAGE_SIZE) ? (
                    <div className="boardReplyMore">
                      <button
                        type="button"
                        className="powerRankingBackLink"
                        onClick={() =>
                          setReplyVisibleCounts((current) => ({
                            ...current,
                            [post.id]: (current[post.id] ?? REPLY_PAGE_SIZE) + REPLY_PAGE_SIZE
                          }))
                        }
                      >
                        답글 더보기
                      </button>
                    </div>
                  ) : null}

                  <div className="boardReplyComposer">
                    {(() => {
                      const replyDraft = replyDrafts[post.id] ?? emptyReplyDraft();
                      return (
                        <>
                          <div className="boardComposerGrid">
                            <input
                              value={replyDraft.authorName}
                              onChange={(event) =>
                                setReplyDrafts((current) => ({
                                  ...current,
                                  [post.id]: {
                                    ...(current[post.id] ?? createReplyDraft()),
                                    authorName: event.target.value
                                  }
                                }))
                              }
                              placeholder="이름"
                            />
                            <input
                              type="password"
                              value={replyDraft.password}
                              onChange={(event) =>
                                setReplyDrafts((current) => ({
                                  ...current,
                                  [post.id]: {
                                    ...(current[post.id] ?? createReplyDraft()),
                                    password: event.target.value
                                  }
                                }))
                              }
                              placeholder="비밀번호"
                            />
                          </div>
                          <textarea
                            value={replyDraft.content}
                            onChange={(event) =>
                              setReplyDrafts((current) => ({
                                ...current,
                                [post.id]: {
                                  ...(current[post.id] ?? createReplyDraft()),
                                  content: event.target.value
                                }
                              }))
                            }
                            placeholder="답글을 입력해 주세요"
                          />
                          <div className="boardReplyComposerActions">
                            <button
                              type="button"
                              className="powerRankingVoteButton"
                              disabled={submittingId === `reply-${post.id}`}
                              onClick={() => void handleCreateReply(post.id)}
                            >
                              답글 등록
                            </button>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </section>
                </article>
              );
              })}
              {posts.length === 0 ? <div className="powerRankingLoading">아직 등록된 게시글이 없습니다.</div> : null}
            </div>
            {posts.length > 0 ? (
              <nav className="boardPagination" aria-label="게시판 페이지">
                <button
                  type="button"
                  className="powerRankingBackLink"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                >
                  처음
                </button>
                <button
                  type="button"
                  className="powerRankingBackLink"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  이전
                </button>
                <div className="boardPaginationNumbers">
                  {visiblePageNumbers.map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`powerRankingSortButton ${currentPage === page ? "isActive" : ""}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="powerRankingBackLink"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  다음
                </button>
                <button
                  type="button"
                  className="powerRankingBackLink"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                >
                  끝
                </button>
              </nav>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default BoardPage;
