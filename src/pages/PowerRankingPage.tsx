import { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import type { PowerRankingNote, PowerRankingPeriod, PowerRankingPerson, PowerRankingVoteDelta } from "../types";
import { getOrCreateDeviceId } from "../utils/deviceId";

type SortMode = "name" | "score";

const collator = new Intl.Collator("ko");
const PROFILE_MAX_BYTES = 5 * 1024 * 1024;
const MEMO_PAGE_SIZE = 10;

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

const getInitials = (name: string): string => name.slice(0, 2) || "DY";

const getPodiumLabel = (rank: number): string => {
  if (rank === 1) return "Champion";
  if (rank === 2) return "Runner Up";
  return "Top 3";
};

const InteractiveHonorCard = ({
  person,
  rank
}: {
  person: PowerRankingPerson;
  rank: number;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const overlay = overlayRef.current;

    if (!container || !overlay) return;

    const handleMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateY = (x - centerX) / 18;
      const rotateX = (centerY - y) / 18;

      container.style.transform = `perspective(960px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      overlay.style.backgroundPosition = `${50 + (x / rect.width) * 35}% ${50 + (y / rect.height) * 35}%`;
      overlay.style.opacity = "1";
      overlay.style.filter = "brightness(1.12) opacity(0.96)";
    };

    const handleMouseLeave = () => {
      container.style.transform = "";
      overlay.style.backgroundPosition = "50% 50%";
      overlay.style.opacity = "";
      overlay.style.filter = "";
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <article
      ref={containerRef}
      className={`powerRankingHonorCard powerRankingHonorRank${rank}`}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform"
      }}
    >
      <div ref={overlayRef} className="powerRankingHonorOverlay" />
      <div className="powerRankingHonorInner">
        <div className="powerRankingHonorHeader">
          <span className="powerRankingHonorMedal">#{rank}</span>
          <span className="powerRankingPodiumLabel">{getPodiumLabel(rank)}</span>
        </div>
        <div className="powerRankingHonorProfile">
          {person.profileImageUrl ? (
            <img
              src={person.profileImageUrl}
              alt={`${person.name} 프로필`}
              className="powerRankingProfileImage"
            />
          ) : (
            <div className="powerRankingProfileFallback">{getInitials(person.name)}</div>
          )}
        </div>
        <div className="powerRankingHonorBody">
          <strong>{person.name}</strong>
          <p>명예의 전당 {rank}위</p>
        </div>
        <div className="powerRankingHonorMeta">
          <div>
            <span>Score</span>
            <strong>{person.score}</strong>
          </div>
          <div>
            <span>Memo</span>
            <strong>{person.notes.length}</strong>
          </div>
        </div>
      </div>
    </article>
  );
};

const PowerRankingPage = () => {
  const [people, setPeople] = useState<PowerRankingPerson[]>([]);
  const [period, setPeriod] = useState<PowerRankingPeriod>("all");
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [submittingForId, setSubmittingForId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [memoVisibleCounts, setMemoVisibleCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    document.title = "동연 파워랭킹";
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    apiClient
      .getPowerRanking(period)
      .then((items) => {
        if (!isMounted) return;
        setPeople(items);
        setErrorMessage("");
      })
      .catch((error: unknown) => {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : "목록을 불러오지 못했습니다.");
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [period]);

  useEffect(() => {
    setMemoVisibleCounts((current) => {
      const next = { ...current };
      let updated = false;
      for (const person of people) {
        if (!next[person.id]) {
          next[person.id] = MEMO_PAGE_SIZE;
          updated = true;
        }
      }
      return updated ? next : current;
    });
  }, [people]);

  const scoreOrderedPeople = useMemo(() => {
    const items = [...people];
    return items.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return collator.compare(a.name, b.name);
    });
  }, [people]);

  const orderedPeople = useMemo(() => {
    if (sortMode === "score") {
      return scoreOrderedPeople;
    }
    return [...people].sort((a, b) => collator.compare(a.name, b.name));
  }, [people, scoreOrderedPeople, sortMode]);

  const podiumPeople = scoreOrderedPeople.slice(0, 3);
  const totalVotes = scoreOrderedPeople.reduce((sum, person) => sum + person.score, 0);
  const totalNotes = scoreOrderedPeople.reduce((sum, person) => sum + person.notes.length, 0);

  const updatePerson = (updated: PowerRankingPerson) => {
    setPeople((current) => current.map((person) => (person.id === updated.id ? updated : person)));
  };

  const appendNote = (personId: string, note: PowerRankingNote) => {
    setPeople((current) =>
      current.map((person) =>
        person.id === personId ? { ...person, notes: [note, ...person.notes] } : person
      )
    );
  };

  const updateNote = (note: PowerRankingNote) => {
    setPeople((current) =>
      current.map((person) => ({
        ...person,
        notes: person.notes.map((item) => (item.id === note.id ? note : item))
      }))
    );
  };

  const removeNote = (noteId: string) => {
    setPeople((current) =>
      current.map((person) => ({
        ...person,
        notes: person.notes.filter((note) => note.id !== noteId)
      }))
    );
  };

  const refreshPeople = async () => {
    const items = await apiClient.getPowerRanking(period);
    setPeople(items);
  };

  const handleVoteAction = async (personId: string, delta: PowerRankingVoteDelta) => {
    setSubmittingForId(`${personId}-${delta}`);
    setErrorMessage("");
    try {
      await apiClient.submitPowerRankingVote(personId, {
        deviceId: getOrCreateDeviceId(),
        delta,
        period
      });
      await refreshPeople();
      setSortMode("score");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "랭킹을 반영하지 못했습니다.");
    } finally {
      setSubmittingForId(null);
    }
  };

  const handleAddNote = async (personId: string) => {
    const content = (drafts[personId] ?? "").trim();
    if (!content) return;
    setSubmittingForId(personId);
    setErrorMessage("");
    try {
      const note = await apiClient.createPowerRankingNote(personId, content);
      appendNote(personId, note);
      setMemoVisibleCounts((current) => ({
        ...current,
        [personId]: Math.max(current[personId] ?? MEMO_PAGE_SIZE, MEMO_PAGE_SIZE)
      }));
      setDrafts((current) => ({ ...current, [personId]: "" }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "메모를 추가하지 못했습니다.");
    } finally {
      setSubmittingForId(null);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    const content = editingText.trim();
    if (!content) return;
    setSubmittingForId(noteId);
    setErrorMessage("");
    try {
      const updated = await apiClient.updatePowerRankingNote(noteId, content);
      updateNote(updated);
      setEditingNoteId(null);
      setEditingText("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "메모를 수정하지 못했습니다.");
    } finally {
      setSubmittingForId(null);
    }
  };

  const handleProfileUpload = async (personId: string, file: File | null) => {
    if (!file) return;
    if (file.size > PROFILE_MAX_BYTES) {
      setErrorMessage("프로필 이미지는 5MB 미만만 업로드할 수 있습니다.");
      return;
    }

    setSubmittingForId(`profile-${personId}`);
    setErrorMessage("");
    try {
      const uploaded = await apiClient.uploadPowerRankingProfileImage(file);
      await apiClient.updatePowerRankingProfileImage(personId, uploaded.url);
      await refreshPeople();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "프로필 이미지를 저장하지 못했습니다.");
    } finally {
      setSubmittingForId(null);
    }
  };

  const handleProfileDelete = async (personId: string) => {
    setSubmittingForId(`profile-${personId}`);
    setErrorMessage("");
    try {
      await apiClient.deletePowerRankingProfileImage(personId);
      await refreshPeople();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "프로필 이미지를 삭제하지 못했습니다.");
    } finally {
      setSubmittingForId(null);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    setSubmittingForId(noteId);
    setErrorMessage("");
    try {
      await apiClient.deletePowerRankingNote(noteId);
      removeNote(noteId);
      if (editingNoteId === noteId) {
        setEditingNoteId(null);
        setEditingText("");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "메모를 삭제하지 못했습니다.");
    } finally {
      setSubmittingForId(null);
    }
  };

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <CommunityTopBar />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">World Ranking</p>
            <h1>동연 월드 랭킹</h1>
            <p className="powerRankingLead">
              메이플스토리 랭킹 페이지처럼 상단 하이라이트와 순위표 중심으로 재구성했습니다.
              투표와 메모는 각 순위 행의 상세 패널에서 바로 관리할 수 있습니다.
            </p>
          </div>

          <div className="powerRankingControlPanel">
            <div className="powerRankingControlGroup">
              <span className="powerRankingControlLabel">정렬</span>
              <div className="powerRankingHeroActions">
                <button
                  type="button"
                  className={`powerRankingSortButton ${sortMode === "score" ? "isActive" : ""}`}
                  onClick={() => setSortMode("score")}
                >
                  종합 랭킹
                </button>
                <button
                  type="button"
                  className={`powerRankingSortButton ${sortMode === "name" ? "isActive" : ""}`}
                  onClick={() => setSortMode("name")}
                >
                  이름순
                </button>
              </div>
            </div>

            <div className="powerRankingControlGroup">
              <span className="powerRankingControlLabel">집계 기간</span>
              <div className="powerRankingHeroActions powerRankingPeriodActions">
                <button
                  type="button"
                  className={`powerRankingSortButton ${period === "all" ? "isActive" : ""}`}
                  onClick={() => setPeriod("all")}
                >
                  전체랭킹
                </button>
                <button
                  type="button"
                  className={`powerRankingSortButton ${period === "weekly" ? "isActive" : ""}`}
                  onClick={() => setPeriod("weekly")}
                >
                  주간랭킹
                </button>
                <button
                  type="button"
                  className={`powerRankingSortButton ${period === "daily" ? "isActive" : ""}`}
                  onClick={() => setPeriod("daily")}
                >
                  일간랭킹
                </button>
              </div>
            </div>

            <div className="powerRankingStats">
              <div className="powerRankingStatCard">
                <span>등록 인원</span>
                <strong>{people.length}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>총 득표</span>
                <strong>{totalVotes}</strong>
              </div>
              <div className="powerRankingStatCard">
                <span>총 메모</span>
                <strong>{totalNotes}</strong>
              </div>
            </div>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

        {isLoading ? (
          <div className="powerRankingLoading">목록을 불러오는 중입니다.</div>
        ) : (
          <>
            <section className="powerRankingPodiumSection" aria-label="명예의 전당">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Hall Of Fame</p>
                  <h2>명예의 전당</h2>
                </div>
                <p className="powerRankingSectionHint">
                  {period === "all" ? "전체" : period === "weekly" ? "주간" : "일간"} 기준 1위, 2위, 3위 카드입니다.
                </p>
              </div>

              <div className="powerRankingPodiumGrid">
                {podiumPeople.map((person) => {
                  const rank = person.rank;
                  return <InteractiveHonorCard key={person.id} person={person} rank={rank} />;
                })}
              </div>
            </section>

            <section className="powerRankingBoardSection" aria-label="랭킹 보드">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Ranking Board</p>
                  <h2>{period === "all" ? "전체 순위표" : period === "weekly" ? "주간 순위표" : "일간 순위표"}</h2>
                </div>
                <p className="powerRankingSectionHint">
                  디바이스 기준 하루 최대 1000회까지 반영되며, 최고와 인기도 내리기를 모두 사용할 수 있습니다.
                </p>
              </div>

              <div className="powerRankingBoard">
                <div className="powerRankingBoardHeader" aria-hidden="true">
                  <span>순위</span>
                  <span>캐릭터 정보</span>
                  <span>점수</span>
                  <span>메모</span>
                  <span>관리</span>
                </div>

                <div className="powerRankingBoardList">
                  {orderedPeople.map((person) => {
                    const officialRank = person.rank;
                    const isProfileSubmitting = submittingForId === `profile-${person.id}`;
                    const isUpVoting = submittingForId === `${person.id}-1`;
                    const isDownVoting = submittingForId === `${person.id}--1`;

                    return (
                      <details
                        key={person.id}
                        className={`powerRankingRow ${officialRank <= 3 ? `powerRankingRowTop${officialRank}` : ""}`.trim()}
                      >
                        <summary className="powerRankingRowSummary">
                          <div className="powerRankingRowRank">
                            <span className="powerRankingRowLabel">순위</span>
                            <strong>#{officialRank}</strong>
                          </div>

                          <div className="powerRankingRowIdentity">
                            <div className="powerRankingRowAvatar">
                              {person.profileImageUrl ? (
                                <img
                                  src={person.profileImageUrl}
                                  alt={`${person.name} 프로필`}
                                  className="powerRankingProfileImage"
                                />
                              ) : (
                                <div className="powerRankingProfileFallback">
                                  {getInitials(person.name)}
                                </div>
                              )}
                            </div>
                            <div className="powerRankingRowIdentityText">
                              <span className="powerRankingRank">
                                {period === "all" ? "전체 랭킹" : period === "weekly" ? "주간 랭킹" : "일간 랭킹"}
                              </span>
                              <strong>{person.name}</strong>
                              <span>{formatDateTime(person.updatedAt) || "최근 갱신 정보 없음"}</span>
                            </div>
                          </div>

                          <div className="powerRankingRowScore">
                            <span className="powerRankingRowLabel">점수</span>
                            <strong>{person.score}</strong>
                          </div>

                          <div className="powerRankingRowNotes">
                            <span className="powerRankingRowLabel">메모</span>
                            <strong>{person.notes.length}</strong>
                          </div>

                          <div className="powerRankingRowAction">
                            <span>상세 보기</span>
                          </div>
                        </summary>

                        <div className="powerRankingRowDetail">
                          <div className="powerRankingDetailActions">
                            <div className="powerRankingActions powerRankingProfileActions">
                              <label className="powerRankingProfileUpload">
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp,image/gif"
                                  onChange={(event) => {
                                    void handleProfileUpload(person.id, event.target.files?.[0] ?? null);
                                    event.currentTarget.value = "";
                                  }}
                                />
                                <span>{isProfileSubmitting ? "업로드 중..." : "프로필 업로드"}</span>
                              </label>
                              <button
                                type="button"
                                className="powerRankingBackLink"
                                disabled={isProfileSubmitting || !person.profileImageUrl}
                                onClick={() => void handleProfileDelete(person.id)}
                              >
                                프로필 삭제
                              </button>
                            </div>

                            <div className="powerRankingActions powerRankingVoteActions">
                              <button
                                type="button"
                                className="powerRankingVoteButton"
                                disabled={isUpVoting || isDownVoting}
                                onClick={() => void handleVoteAction(person.id, 1)}
                              >
                                {isUpVoting ? "반영 중..." : "▲ 최고 +1"}
                              </button>
                              <button
                                type="button"
                                className="powerRankingDownvoteButton"
                                disabled={isUpVoting || isDownVoting}
                                onClick={() => void handleVoteAction(person.id, -1)}
                              >
                                {isDownVoting ? "반영 중..." : "▼ 인기도 내리기"}
                              </button>
                            </div>
                          </div>

                          <div className="powerRankingMemoComposer">
                            <input
                              value={drafts[person.id] ?? ""}
                              onChange={(event) =>
                                setDrafts((current) => ({
                                  ...current,
                                  [person.id]: event.target.value
                                }))
                              }
                              placeholder={`${person.name} 메모 추가`}
                            />
                            <button
                              type="button"
                              disabled={submittingForId === person.id}
                              onClick={() => void handleAddNote(person.id)}
                            >
                              메모 추가
                            </button>
                          </div>

                          <ul className="powerRankingMemoList">
                            {person.notes.slice(0, memoVisibleCounts[person.id] ?? MEMO_PAGE_SIZE).map((note) => (
                              <li key={note.id} className="powerRankingMemoItem">
                                {editingNoteId === note.id ? (
                                  <div className="powerRankingMemoEdit">
                                    <input
                                      value={editingText}
                                      onChange={(event) => setEditingText(event.target.value)}
                                      autoFocus
                                    />
                                    <div className="powerRankingMemoButtons">
                                      <button
                                        type="button"
                                        disabled={submittingForId === note.id}
                                        onClick={() => void handleUpdateNote(note.id)}
                                      >
                                        저장
                                      </button>
                                      <button
                                        type="button"
                                        className="isGhost"
                                        onClick={() => {
                                          setEditingNoteId(null);
                                          setEditingText("");
                                        }}
                                      >
                                        취소
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="powerRankingMemoContent">
                                      <span className="powerRankingMemoBullet" />
                                      <div>
                                        <p>{note.content}</p>
                                        <time>{formatDateTime(note.createdAt)}</time>
                                      </div>
                                    </div>
                                    <div className="powerRankingMemoButtons">
                                      <button
                                        type="button"
                                        className="isGhost"
                                        onClick={() => {
                                          setEditingNoteId(note.id);
                                          setEditingText(note.content);
                                        }}
                                      >
                                        수정
                                      </button>
                                      <button
                                        type="button"
                                        className="isGhost"
                                        disabled={submittingForId === note.id}
                                        onClick={() => void handleDeleteNote(note.id)}
                                      >
                                        삭제
                                      </button>
                                    </div>
                                  </>
                                )}
                              </li>
                            ))}
                            {person.notes.length === 0 ? (
                              <li className="powerRankingMemoEmpty">등록된 메모가 없습니다.</li>
                            ) : null}
                          </ul>
                          {person.notes.length > (memoVisibleCounts[person.id] ?? MEMO_PAGE_SIZE) ? (
                            <div className="powerRankingMemoMore">
                              <button
                                type="button"
                                className="powerRankingBackLink"
                                onClick={() =>
                                  setMemoVisibleCounts((current) => ({
                                    ...current,
                                    [person.id]: (current[person.id] ?? MEMO_PAGE_SIZE) + MEMO_PAGE_SIZE
                                  }))
                                }
                              >
                                유저 메모 더보기
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default PowerRankingPage;
