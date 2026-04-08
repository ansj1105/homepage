import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import { useUserAuth } from "../auth/UserAuthContext";
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

const isImageAttachment = (fileUrl: string, fileMimeType?: string): boolean => {
  if (fileMimeType?.startsWith("image/")) {
    return true;
  }
  return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(fileUrl);
};

type PostDraft = {
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
  title: string;
  content: string;
};

type EditingReplyDraft = {
  password: string;
  content: string;
};

const createPostDraft = (): PostDraft => ({
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
  const { user } = useUserAuth();
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
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [replyVisibleCounts, setReplyVisibleCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    document.title = "동아리연합회 게시판";
  }, []);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .getBoardPosts(searchKeyword)
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
  }, [searchKeyword, user]);

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
  const bestPosts = useMemo(() => posts.filter((post) => post.isBest).slice(0, 5), [posts]);
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
  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) ?? pagedPosts[0] ?? null,
    [pagedPosts, posts, selectedPostId]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!selectedPostId || !posts.some((post) => post.id === selectedPostId)) {
      setSelectedPostId(pagedPosts[0]?.id ?? null);
    }
  }, [pagedPosts, posts, selectedPostId]);

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
    if (!user) {
      setErrorMessage("회원가입한 사람만 게시글을 작성할 수 있습니다.");
      return;
    }
    if (!postDraft.title.trim() || !postDraft.content.trim()) {
      setErrorMessage("제목과 내용을 입력해 주세요.");
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
      title: post.title,
      content: post.content
    });
  };

  const handleUpdatePost = async (postId: string) => {
    if (!editingPostDraft) return;
    if (!user) {
      setErrorMessage("로그인 이후 수정할 수 있습니다.");
      return;
    }

    setSubmittingId(postId);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const updated = await apiClient.updateBoardPost(postId, {
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
    if (!user) {
      setErrorMessage("로그인 이후 삭제할 수 있습니다.");
      return;
    }

    setSubmittingId(postId);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await apiClient.deleteBoardPost(postId);
      setPosts((current) => current.filter((post) => post.id !== postId));
      setSuccessMessage("게시글이 삭제되었습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "게시글을 삭제하지 못했습니다.");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleRecommendPost = async (postId: string) => {
    if (!user) {
      setErrorMessage("로그인한 사람만 개추할 수 있습니다.");
      return;
    }

    setSubmittingId(`recommend-${postId}`);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const updated = await apiClient.recommendBoardPost(postId);
      patchPost(updated);
      setSuccessMessage("개추가 반영되었습니다.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "개추를 반영하지 못했습니다.");
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
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <header className="powerRankingHero powerRankingHeroMaple boardHero">
          <div>
            <p className="powerRankingEyebrow">Board</p>
            <h1>동아리연합회 게시판</h1>
            <p className="powerRankingLead">
              게시글은 회원만 작성할 수 있고, 댓글은 익명으로 자유롭게 남길 수 있습니다.
            </p>
          </div>
          <div className="boardMetaPanel">
            <strong>{postCountLabel}</strong>
            <span>개추 5개 이상 게시물은 2주 동안 베스트에 노출됩니다.</span>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
        {successMessage ? <div className="boardSuccess">{successMessage}</div> : null}

        <section className="boardSearchBar">
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="제목 또는 작성자명 검색"
          />
          <button
            type="button"
            className="powerRankingVoteButton"
            onClick={() => {
              setCurrentPage(1);
              setSearchKeyword(searchInput.trim());
            }}
          >
            검색
          </button>
        </section>

        {bestPosts.length > 0 ? (
          <section className="boardBestSection">
            <div className="powerRankingSectionHead">
              <div>
                <p className="powerRankingEyebrow">Best Posts</p>
                <h2>베스트 게시물</h2>
              </div>
              <p className="powerRankingSectionHint">개추 5개 이상, 게시 후 2주 이내</p>
            </div>
            <div className="boardBestGrid">
              {bestPosts.map((post) => (
                <article key={post.id} className="boardBestCard">
                  <span className="boardCardBadge isBest">BEST</span>
                  <strong>{post.title}</strong>
                  <p>{post.authorName}</p>
                  <span>개추 {post.recommendationCount}</span>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {isLoading ? (
          <div className="powerRankingLoading">게시글을 불러오는 중입니다.</div>
        ) : (
          <>
            <section className="powerRankingBoardSection">
              <section className="boardListShell">
                <div className="boardTableHeader" aria-hidden="true">
                  <span>번호</span>
                  <span>제목</span>
                  <span>작성자</span>
                  <span>작성일</span>
                  <span>조회</span>
                  <span>추천</span>
                </div>
                <div className="boardTableList">
                  {pagedPosts.map((post, index) => {
                    const postNumber = posts.length - ((currentPage - 1) * BOARD_PAGE_SIZE + index);
                    return (
                      <button
                        key={post.id}
                        type="button"
                        className={`boardTableRow ${selectedPost?.id === post.id ? "isSelected" : ""}`.trim()}
                        onClick={() => setSelectedPostId(post.id)}
                      >
                        <span>{postNumber}</span>
                        <span className="boardTableTitle">
                          {post.isBest ? <em>BEST</em> : null}
                          <strong>{post.title}</strong>
                          {post.replies.length > 0 ? <b>[{post.replies.length}]</b> : null}
                        </span>
                        <span>{post.authorName}</span>
                        <span>{formatDateTime(post.createdAt)}</span>
                        <span>{post.content.length}</span>
                        <span>{post.recommendationCount}</span>
                      </button>
                    );
                  })}
                  {posts.length === 0 ? <div className="powerRankingLoading">아직 등록된 게시글이 없습니다.</div> : null}
                </div>
              </section>

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

              {selectedPost ? (
                <article className="boardCard boardDetailCard">
                {editingPostId === selectedPost.id && editingPostDraft ? (
                  <div className="boardEditBlock">
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
                        disabled={submittingId === selectedPost.id}
                        onClick={() => void handleUpdatePost(selectedPost.id)}
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
                          {selectedPost.isBest ? <span className="boardCardBadge isBest">BEST</span> : null}
                          <span className="boardCardMetaText">개추 {selectedPost.recommendationCount}</span>
                          <span className="boardCardMetaText">답글 {selectedPost.replies.length}</span>
                          {selectedPost.fileUrl ? <span className="boardCardMetaText">첨부 있음</span> : null}
                        </div>
                        <div className="boardAuthorLine">
                          <strong>{selectedPost.authorName}</strong>
                          <time>{formatDateTime(selectedPost.createdAt)}</time>
                        </div>
                        <h2>{selectedPost.title}</h2>
                      </div>
                      <div className="powerRankingMemoButtons">
                        <button
                          type="button"
                          disabled={selectedPost.isRecommendedByCurrentUser || submittingId === `recommend-${selectedPost.id}`}
                          onClick={() => void handleRecommendPost(selectedPost.id)}
                        >
                          {submittingId === `recommend-${selectedPost.id}` ? "반영 중..." : selectedPost.isRecommendedByCurrentUser ? "개추 완료" : "개추"}
                        </button>
                        {user && selectedPost.userId === user.id ? (
                          <>
                            <button type="button" className="isGhost" onClick={() => startPostEdit(selectedPost)}>
                              수정
                            </button>
                            <button
                              type="button"
                              className="isGhost"
                              disabled={submittingId === selectedPost.id}
                              onClick={() => void handleDeletePost(selectedPost.id)}
                            >
                              삭제
                            </button>
                          </>
                        ) : null}
                      </div>
                    </header>
                    <p className="boardCardBody">{selectedPost.content}</p>
                    {selectedPost.fileUrl ? (
                      <>
                        {isImageAttachment(selectedPost.fileUrl, selectedPost.fileMimeType) ? (
                          <div className="boardAttachmentPreview">
                            <img
                              src={selectedPost.fileUrl}
                              alt={selectedPost.fileName || `${selectedPost.title} 첨부 이미지`}
                              className="boardAttachmentImage"
                              loading="lazy"
                            />
                          </div>
                        ) : null}
                        <a href={selectedPost.fileUrl} target="_blank" rel="noreferrer" className="boardAttachment">
                          첨부파일: {selectedPost.fileName || "다운로드"}
                        </a>
                      </>
                    ) : null}
                  </>
                )}

                <section className="boardReplies">
                  <div className="boardReplyHead">
                    <strong>답글 {selectedPost.replies.length}</strong>
                  </div>
                  <ul className="boardReplyList">
                    {selectedPost.replies
                      .slice(0, replyVisibleCounts[selectedPost.id] ?? REPLY_PAGE_SIZE)
                      .map((reply) => (
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
                                <button type="button" className="isGhost" onClick={() => startReplyEdit(reply)}>
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
                    {selectedPost.replies.length === 0 ? <li className="powerRankingMemoEmpty">첫 답글을 남겨보세요.</li> : null}
                  </ul>
                  {selectedPost.replies.length > (replyVisibleCounts[selectedPost.id] ?? REPLY_PAGE_SIZE) ? (
                    <div className="boardReplyMore">
                      <button
                        type="button"
                        className="powerRankingBackLink"
                        onClick={() =>
                          setReplyVisibleCounts((current) => ({
                            ...current,
                            [selectedPost.id]: (current[selectedPost.id] ?? REPLY_PAGE_SIZE) + REPLY_PAGE_SIZE
                          }))
                        }
                      >
                        답글 더보기
                      </button>
                    </div>
                  ) : null}
                  <div className="boardReplyComposer">
                    {(() => {
                      const replyDraft = replyDrafts[selectedPost.id] ?? emptyReplyDraft();
                      return (
                        <>
                          <div className="boardComposerGrid">
                            <input
                              value={replyDraft.authorName}
                              onChange={(event) =>
                                setReplyDrafts((current) => ({
                                  ...current,
                                  [selectedPost.id]: {
                                    ...(current[selectedPost.id] ?? createReplyDraft()),
                                    authorName: event.target.value
                                  }
                                }))
                              }
                              placeholder="익명 이름"
                            />
                            <input
                              type="password"
                              value={replyDraft.password}
                              onChange={(event) =>
                                setReplyDrafts((current) => ({
                                  ...current,
                                  [selectedPost.id]: {
                                    ...(current[selectedPost.id] ?? createReplyDraft()),
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
                                [selectedPost.id]: {
                                  ...(current[selectedPost.id] ?? createReplyDraft()),
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
                              disabled={submittingId === `reply-${selectedPost.id}`}
                              onClick={() => void handleCreateReply(selectedPost.id)}
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
              ) : null}
            </section>

            <section className="boardSearchFooter">
              <section className="boardComposer">
                {!user ? <div className="powerRankingAlert">회원가입한 사람만 게시글을 작성할 수 있습니다.</div> : null}
                <div className="boardComposerGrid">
                  <input value={user?.nickname ?? "회원 전용"} placeholder="작성자" disabled />
                  <input value={searchKeyword ? `검색어: ${searchKeyword}` : "전체 게시글"} placeholder="검색 상태" disabled />
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
                      disabled={submittingId === "post-create" || !user}
                      onClick={() => void handleCreatePost()}
                    >
                      글쓰기
                    </button>
                  </div>
                </div>
              </section>

              <div className="boardSearchBar boardSearchBarBottom">
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="제목 또는 작성자명 검색"
                />
                <button
                  type="button"
                  className="powerRankingVoteButton"
                  onClick={() => {
                    setCurrentPage(1);
                    setSearchKeyword(searchInput.trim());
                  }}
                >
                  검색
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default BoardPage;
