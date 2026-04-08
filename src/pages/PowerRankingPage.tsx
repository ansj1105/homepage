import { useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import type { PowerRankingNote, PowerRankingPerson } from "../types";

type SortMode = "name" | "score";

const collator = new Intl.Collator("ko");

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

const PROFILE_MAX_BYTES = 5 * 1024 * 1024;

const getInitials = (name: string): string => name.slice(0, 2) || "DY";

const PowerRankingPage = () => {
  const [people, setPeople] = useState<PowerRankingPerson[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>("name");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [submittingForId, setSubmittingForId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    document.title = "동연 파워랭킹";
  }, []);

  useEffect(() => {
    let isMounted = true;

    apiClient
      .getPowerRanking()
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
  }, []);

  const orderedPeople = useMemo(() => {
    const items = [...people];
    if (sortMode === "score") {
      return items.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return collator.compare(a.name, b.name);
      });
    }
    return items.sort((a, b) => collator.compare(a.name, b.name));
  }, [people, sortMode]);

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

  const handleVote = async (personId: string) => {
    setSubmittingForId(personId);
    setErrorMessage("");
    try {
      const updated = await apiClient.incrementPowerRanking(personId);
      updatePerson(updated);
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
      const updated = await apiClient.updatePowerRankingProfileImage(personId, uploaded.url);
      updatePerson(updated);
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
      const updated = await apiClient.deletePowerRankingProfileImage(personId);
      updatePerson(updated);
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
    <div className="powerRankingPage">
      <div className="powerRankingShell">
        <CommunityTopBar />
        <header className="powerRankingHero">
          <div>
            <p className="powerRankingEyebrow">Ranking Board</p>
            <h1>동연 파워랭킹</h1>
            <p className="powerRankingLead">
              이름은 기본 오름차순으로 정렬되고, 최고 버튼을 누르면 랭킹 순으로도 볼 수 있습니다.
            </p>
          </div>
          <div className="powerRankingHeroActions">
            <button
              type="button"
              className={`powerRankingSortButton ${sortMode === "name" ? "isActive" : ""}`}
              onClick={() => setSortMode("name")}
            >
              이름순
            </button>
            <button
              type="button"
              className={`powerRankingSortButton ${sortMode === "score" ? "isActive" : ""}`}
              onClick={() => setSortMode("score")}
            >
              랭킹순
            </button>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}

        {isLoading ? (
          <div className="powerRankingLoading">목록을 불러오는 중입니다.</div>
        ) : (
          <div className="powerRankingGrid">
            {orderedPeople.map((person, index) => (
              <section key={person.id} className="powerRankingCard">
                <div className="powerRankingCardHead">
                  <div className="powerRankingProfileBlock">
                    {person.profileImageUrl ? (
                      <img
                        src={person.profileImageUrl}
                        alt={`${person.name} 프로필`}
                        className="powerRankingProfileImage"
                      />
                    ) : (
                      <div className="powerRankingProfileFallback">{getInitials(person.name)}</div>
                    )}
                    <div>
                      <div className="powerRankingRank">
                        {sortMode === "score" ? `#${index + 1}` : "A-Z"}
                      </div>
                      <h2>{person.name}</h2>
                    </div>
                  </div>
                  <div className="powerRankingScoreBlock">
                    <strong>{person.score}</strong>
                    <span>score</span>
                  </div>
                </div>

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
                    <span>프로필 업로드</span>
                  </label>
                  <button
                    type="button"
                    className="powerRankingBackLink"
                    disabled={submittingForId === `profile-${person.id}` || !person.profileImageUrl}
                    onClick={() => void handleProfileDelete(person.id)}
                  >
                    프로필 삭제
                  </button>
                </div>

                <div className="powerRankingActions">
                  <button
                    type="button"
                    className="powerRankingVoteButton"
                    disabled={submittingForId === person.id}
                    onClick={() => void handleVote(person.id)}
                  >
                    최고 +1
                  </button>
                </div>

                <div className="powerRankingMemoComposer">
                  <input
                    value={drafts[person.id] ?? ""}
                    onChange={(event) =>
                      setDrafts((current) => ({ ...current, [person.id]: event.target.value }))
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
                  {person.notes.map((note) => (
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
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PowerRankingPage;
