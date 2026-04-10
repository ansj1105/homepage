import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserAuth } from "../auth/UserAuthContext";
import { apiClient } from "../api/client";
import CommunityTopBar from "../components/CommunityTopBar";
import type {
  LiveVisitorEntry,
  PowerRankingEventLog,
  PowerRankingInventoryItem,
  PowerRankingItemCode,
  PowerRankingNote,
  PowerRankingPeriod,
  PowerRankingPerson,
  PowerRankingVoteDelta
} from "../types";
import { getOrCreateDeviceId } from "../utils/deviceId";

type SortMode = "name" | "score";
type VoteQueueItem = {
  personId: string;
  delta: PowerRankingVoteDelta;
};
type PowerRankingUserNotification = {
  id: string;
  tone: "reward" | "info";
  title: string;
  body: string;
};

const collator = new Intl.Collator("ko");
const PROFILE_MAX_BYTES = 5 * 1024 * 1024;
const MEMO_PAGE_SIZE = 10;
const LIVE_VISITOR_REFRESH_MS = 30_000;

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
  if (rank === 1) return "Gold";
  if (rank === 2) return "Silver";
  return "Bronze";
};

const getHonorRankLabel = (rank: number): string => {
  if (rank === 1) return "1";
  if (rank === 2) return "2";
  return "3";
};

const getVoteQueueHeatClass = (count: number): string => {
  if (count >= 8) return "isHeat4";
  if (count >= 5) return "isHeat3";
  if (count >= 3) return "isHeat2";
  if (count >= 1) return "isHeat1";
  return "";
};

const getRecentScoreDelta = (events: PowerRankingEventLog[], personId: string, windowMinutes = 60): number => {
  const cutoff = Date.now() - windowMinutes * 60 * 1000;
  return events
    .filter((event) => event.personId === personId && new Date(event.createdAt).getTime() >= cutoff)
    .reduce((sum, event) => sum + event.delta, 0);
};

const getScoreDeltaLabel = (delta: number): string => {
  if (delta > 0) return `+${delta}`;
  if (delta < 0) return `${delta}`;
  return "+0";
};

const getScoreDeltaClassName = (delta: number): string => {
  if (delta > 0) return "isPositive";
  if (delta < 0) return "isNegative";
  return "isNeutral";
};

type ScoreChartPoint = {
  x: number;
  y: number;
  score: number;
  label: string;
};

const buildScoreChartPoints = (
  person: PowerRankingPerson,
  events: PowerRankingEventLog[]
): ScoreChartPoint[] => {
  const recentEvents = events
    .filter((event) => event.personId === person.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-10);

  if (recentEvents.length === 0) {
    return [
      {
        x: 0,
        y: 0,
        score: person.score,
        label: "현재"
      }
    ];
  }

  const startingScore = person.score - recentEvents.reduce((sum, event) => sum + event.delta, 0);
  const scoreValues = [startingScore];
  let running = startingScore;
  recentEvents.forEach((event) => {
    running += event.delta;
    scoreValues.push(running);
  });

  const minScore = Math.min(...scoreValues);
  const maxScore = Math.max(...scoreValues);
  const scoreRange = Math.max(1, maxScore - minScore);

  return scoreValues.map((score, index) => ({
    x: scoreValues.length === 1 ? 0 : (index / (scoreValues.length - 1)) * 100,
    y: 100 - ((score - minScore) / scoreRange) * 100,
    score,
    label:
      index === 0
        ? "시작"
        : formatDateTime(recentEvents[index - 1]?.createdAt ?? "") || `변화 ${index}`
  }));
};

const getEventLabel = (event: PowerRankingEventLog): string => {
  if (event.eventType === "vote_down") {
    return `${event.actorNickname}님이 ${event.personName} 인기도를 내렸습니다.`;
  }
  if (event.eventType === "item_use") {
    return `${event.actorNickname}님이 ${event.personName}에게 ${event.itemName ?? "아이템"}을 사용했습니다.`;
  }
  if (event.eventType === "item_drop") {
    return `${event.actorNickname}님이 ${event.itemName ?? "아이템"}을 획득했습니다.`;
  }
  return `${event.actorNickname}님이 ${event.personName} 인기도를 올렸습니다.`;
};

const getAnonymousDownvoteLabel = (event: PowerRankingEventLog): string =>
  `익명 유저가 ${event.personName} 인기도를 내렸습니다.`;

const getItemUseConfirmMessage = (
  personName: string,
  itemCode: PowerRankingItemCode
): string | null => {
  if (itemCode === "seoeuntaek-love") {
    return `${personName}에게 서은택의 사랑을 쓰시겠습니까?`;
  }

  if (itemCode === "byeokbangjun-blanket") {
    return `${personName}에게 벽방준의 담요를 쓰시겠습니까?`;
  }

  return null;
};

const formatCountdown = (totalSeconds: number): string => {
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const formatRelativeVisitorTime = (value: string): string => {
  const diffMs = Date.now() - new Date(value).getTime();
  if (Number.isNaN(diffMs) || diffMs < 0) {
    return "방금 전";
  }
  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) {
    return "방금 전";
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}분 전`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  return `${diffHours}시간 전`;
};

const getSecondsUntilNextHour = (): number => {
  const now = new Date();
  return (59 - now.getMinutes()) * 60 + (60 - now.getSeconds());
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
          <span className="powerRankingHonorMedal">{getHonorRankLabel(rank)}</span>
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
            <strong className={person.score < 0 ? "isNegative" : undefined}>{person.score}</strong>
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
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [people, setPeople] = useState<PowerRankingPerson[]>([]);
  const [period, setPeriod] = useState<PowerRankingPeriod>("all");
  const [sortMode, setSortMode] = useState<SortMode>("score");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [submittingForId, setSubmittingForId] = useState<string | null>(null);
  const [pendingVoteCounts, setPendingVoteCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [inventory, setInventory] = useState<PowerRankingInventoryItem[]>([]);
  const [eventLogs, setEventLogs] = useState<PowerRankingEventLog[]>([]);
  const [rewardMessage, setRewardMessage] = useState("");
  const [notifications, setNotifications] = useState<PowerRankingUserNotification[]>([]);
  const [liveVisitors, setLiveVisitors] = useState<LiveVisitorEntry[]>([]);
  const [liveVisitorCount, setLiveVisitorCount] = useState(0);
  const [memoVisibleCounts, setMemoVisibleCounts] = useState<Record<string, number>>({});
  const [countdownSeconds, setCountdownSeconds] = useState(getSecondsUntilNextHour());
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>("");
  const [actionBurstKey, setActionBurstKey] = useState<string | null>(null);
  const previousRanksRef = useRef<Map<string, number>>(new Map());
  const voteQueueRef = useRef<VoteQueueItem[]>([]);
  const isProcessingVoteQueueRef = useRef(false);
  const actionBurstTimerRef = useRef<number | null>(null);
  const notificationTimersRef = useRef<number[]>([]);

  useEffect(() => {
    document.title = "동아리연합회";
  }, []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      apiClient.getPowerRanking(period),
      apiClient.getPowerRankingEvents(),
      user ? apiClient.getPowerRankingInventory() : Promise.resolve([]),
      Promise.resolve(null)
    ])
      .then(([items, events, itemsInventory]) => {
        if (!isMounted) return;
        previousRanksRef.current = new Map(people.map((person) => [person.id, person.rank]));
        setPeople(items);
        setEventLogs(events);
        setInventory(itemsInventory);
        setLastUpdatedAt(new Date().toISOString());
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
  }, [period, user]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdownSeconds(getSecondsUntilNextHour());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(
    () => () => {
      if (actionBurstTimerRef.current) {
        window.clearTimeout(actionBurstTimerRef.current);
      }
      notificationTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    },
    []
  );

  useEffect(() => {
    const poller = window.setInterval(() => {
      void Promise.all([refreshPeople(), refreshSideData()]);
    }, 60_000);
    return () => window.clearInterval(poller);
  }, [period, user, people]);

  useEffect(() => {
    const loadLiveVisitors = async () => {
      try {
        const result = await apiClient.getLiveVisitors();
        setLiveVisitorCount(result.liveVisitors);
        setLiveVisitors(result.viewers);
      } catch {
        // Keep previous values when live visitor polling fails.
      }
    };

    void loadLiveVisitors();
    const poller = window.setInterval(() => {
      void loadLiveVisitors();
    }, LIVE_VISITOR_REFRESH_MS);

    return () => window.clearInterval(poller);
  }, []);

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
  const liveRankChanges = useMemo(
    () =>
      scoreOrderedPeople
        .map((person) => {
          const previousRank = previousRanksRef.current.get(person.id) ?? person.rank;
          const delta = previousRank - person.rank;
          return {
            id: person.id,
            name: person.name,
            rank: person.rank,
            delta
          };
        })
        .filter((item) => item.delta !== 0)
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
        .slice(0, 5),
    [scoreOrderedPeople]
  );
  const projectedRisers = useMemo(
    () =>
      scoreOrderedPeople
        .map((person, index) => {
          if (index === 0) return null;
          const above = scoreOrderedPeople[index - 1];
          return {
            id: person.id,
            name: person.name,
            currentRank: person.rank,
            targetRank: above.rank,
            gap: above.score - person.score
          };
        })
        .filter((item): item is { id: string; name: string; currentRank: number; targetRank: number; gap: number } =>
          Boolean(item && item.gap >= 0)
        )
        .sort((a, b) => a.gap - b.gap || a.currentRank - b.currentRank)
        .slice(0, 4),
    [scoreOrderedPeople]
  );
  const projectedFallers = useMemo(
    () =>
      scoreOrderedPeople
        .map((person, index) => {
          if (index === scoreOrderedPeople.length - 1) return null;
          const below = scoreOrderedPeople[index + 1];
          return {
            id: person.id,
            name: person.name,
            currentRank: person.rank,
            nextRank: below.rank,
            gap: person.score - below.score
          };
        })
        .filter((item): item is { id: string; name: string; currentRank: number; nextRank: number; gap: number } =>
          Boolean(item && item.gap >= 0)
        )
        .sort((a, b) => a.gap - b.gap || a.currentRank - b.currentRank)
        .slice(0, 4),
    [scoreOrderedPeople]
  );
  const inventoryByCode = useMemo(
    () =>
      inventory.reduce<Record<string, PowerRankingInventoryItem>>((accumulator, item) => {
        accumulator[item.code] = item;
        return accumulator;
      }, {}),
    [inventory]
  );
  const downvoteLogs = useMemo(
    () => eventLogs.filter((event) => event.eventType === "vote_down").slice(0, 10),
    [eventLogs]
  );
  const itemUsageLogs = useMemo(
    () => eventLogs.filter((event) => event.eventType === "item_use" || event.eventType === "item_drop").slice(0, 10),
    [eventLogs]
  );

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

  const pushNotification = (notification: Omit<PowerRankingUserNotification, "id">) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setNotifications((current) => [{ id, ...notification }, ...current].slice(0, 4));
    const timer = window.setTimeout(() => {
      setNotifications((current) => current.filter((item) => item.id !== id));
    }, 4200);
    notificationTimersRef.current.push(timer);
  };

  const refreshSideData = async () => {
    const eventsPromise = apiClient
      .getPowerRankingEvents()
      .then(setEventLogs)
      .catch(() => undefined);
    const inventoryPromise = user
      ? apiClient
          .getPowerRankingInventory()
          .then(setInventory)
          .catch(() => setInventory([]))
      : Promise.resolve(setInventory([]));
    await Promise.all([eventsPromise, inventoryPromise]);
  };

  const refreshPeople = async () => {
    const items = await apiClient.getPowerRanking(period);
    previousRanksRef.current = new Map(people.map((person) => [person.id, person.rank]));
    setPeople(items);
    setLastUpdatedAt(new Date().toISOString());
  };

  const adjustPendingVoteCount = (personId: string, delta: PowerRankingVoteDelta, amount: 1 | -1) => {
    const key = `${personId}:${delta}`;
    setPendingVoteCounts((current) => {
      const nextValue = Math.max(0, (current[key] ?? 0) + amount);
      if (nextValue === 0) {
        const { [key]: _removed, ...rest } = current;
        return rest;
      }
      return {
        ...current,
        [key]: nextValue
      };
    });
  };

  const processVoteQueue = async () => {
    if (isProcessingVoteQueueRef.current) {
      return;
    }

    isProcessingVoteQueueRef.current = true;
    try {
      while (voteQueueRef.current.length > 0) {
        const currentVote = voteQueueRef.current.shift();
        if (!currentVote) {
          break;
        }

        try {
          const result = await apiClient.submitPowerRankingVote(currentVote.personId, {
            deviceId: getOrCreateDeviceId(),
            delta: currentVote.delta,
            period
          });
          updatePerson(result.person);
          await refreshPeople();
          if (result.droppedItem) {
            const message = `${result.droppedItem.name} 획득! 1% 드롭에 당첨되었습니다.`;
            setRewardMessage(message);
            pushNotification({
              tone: "reward",
              title: "아이템 획득",
              body: message
            });
            window.alert(message);
            await refreshSideData();
          } else if (result.droppedEquipment) {
            const message = `${result.droppedEquipment.name} 장비 획득! 내 장비에서 바로 착용할 수 있습니다.`;
            setRewardMessage(message);
            pushNotification({
              tone: "reward",
              title: "장비 획득",
              body: message
            });
            window.alert(message);
            await refreshSideData();
          }
          setSortMode("score");
        } catch (error) {
          setErrorMessage(error instanceof Error ? error.message : "랭킹을 반영하지 못했습니다.");
        } finally {
          adjustPendingVoteCount(currentVote.personId, currentVote.delta, -1);
        }
      }
    } finally {
      isProcessingVoteQueueRef.current = false;
    }
  };

  const handleVoteAction = async (personId: string, delta: PowerRankingVoteDelta) => {
    if (!user) {
      setErrorMessage("회원가입 이후 이용가능합니다.");
      navigate("/dongyeon-login");
      return;
    }
    setErrorMessage("");
    const nextBurstKey = `${personId}:${delta}:${Date.now()}`;
    setActionBurstKey(nextBurstKey);
    if (actionBurstTimerRef.current) {
      window.clearTimeout(actionBurstTimerRef.current);
    }
    actionBurstTimerRef.current = window.setTimeout(() => {
      setActionBurstKey((current) => (current === nextBurstKey ? null : current));
    }, 520);
    voteQueueRef.current.push({ personId, delta });
    adjustPendingVoteCount(personId, delta, 1);
    void processVoteQueue();
  };

  const handleUseItem = async (personId: string, itemCode: PowerRankingItemCode) => {
    if (!user) {
      setErrorMessage("회원가입 이후 이용가능합니다.");
      navigate("/dongyeon-login");
      return;
    }

    const targetPerson = people.find((person) => person.id === personId);
    const confirmMessage = targetPerson ? getItemUseConfirmMessage(targetPerson.name, itemCode) : null;

    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    setSubmittingForId(`item-${personId}-${itemCode}`);
    setErrorMessage("");
    setRewardMessage("");
    try {
      const result = await apiClient.usePowerRankingItem({
        personId,
        itemCode,
        period
      });
      updatePerson(result.person);
      setInventory(result.inventory);
      await refreshSideData();
      const signedDelta = result.appliedDelta > 0 ? `+${result.appliedDelta}` : `${result.appliedDelta}`;
      const message = `${result.usedItem.name} 사용이 반영되었습니다. (${signedDelta})`;
      setRewardMessage(message);
      pushNotification({
        tone: "info",
        title: "아이템 사용",
        body: message
      });
      setSortMode("score");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "아이템을 사용하지 못했습니다.");
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

  const handleHiddenBlessing = () => {
    for (let index = 0; index < 3; index += 1) {
      window.alert("장현준의 축복을 받았습니다");
    }
  };

  return (
    <div className="powerRankingPage powerRankingPageMaple">
      <div className="powerRankingShell">
        <button
          type="button"
          className="powerRankingHiddenBlessing"
          aria-label="hidden blessing"
          onClick={handleHiddenBlessing}
        />
        <CommunityTopBar />

        <header className="powerRankingHero powerRankingHeroMaple">
          <div className="powerRankingHeroCopy">
            <p className="powerRankingEyebrow">World Ranking</p>
            <h1>동아리연합회</h1>
            <p className="powerRankingLead">
              동연 파워랭킹 1등을 뽑습니다. 절대적인 권력을 가질수잇습니다.
            </p>
          </div>

          <div className="powerRankingHeroSideColumn">
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

            <aside className="powerRankingLiveVisitorsPanel">
              <div className="powerRankingLiveVisitorsHead">
                <div>
                  <span className="powerRankingControlLabel">실시간 접속자</span>
                  <strong>{liveVisitorCount}명 접속 중</strong>
                </div>
                <em>최근 5분</em>
              </div>
              <div className="powerRankingLiveVisitorsList">
                {liveVisitors.length === 0 ? (
                  <div className="powerRankingLiveVisitorEmpty">아직 표시할 접속자가 없습니다.</div>
                ) : (
                  liveVisitors.map((visitor, index) => (
                    <div className="powerRankingLiveVisitorItem" key={`${visitor.label}-${visitor.lastSeenAt}-${index}`}>
                      <div className="powerRankingLiveVisitorIdentity">
                        <span className="powerRankingLiveVisitorDot" aria-hidden="true" />
                        <strong>{visitor.label}</strong>
                        <small>{visitor.isMember ? "회원" : "익명"}</small>
                      </div>
                      <span>{formatRelativeVisitorTime(visitor.lastSeenAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </aside>
          </div>
        </header>

        {errorMessage ? <div className="powerRankingAlert">{errorMessage}</div> : null}
        {rewardMessage ? <div className="powerRankingRewardBanner">{rewardMessage}</div> : null}
        {notifications.length > 0 ? (
          <div className="powerRankingNotificationStack" aria-live="polite" aria-label="유저 알림">
            {notifications.map((notification) => (
              <article
                key={notification.id}
                className={`powerRankingNotificationCard ${notification.tone === "reward" ? "isReward" : "isInfo"}`}
              >
                <strong>{notification.title}</strong>
                <p>{notification.body}</p>
              </article>
            ))}
          </div>
        ) : null}

        {isLoading ? (
          <div className="powerRankingLoading">목록을 불러오는 중입니다.</div>
        ) : (
          <>
            <section className="powerRankingDashboardSection" aria-label="실시간 랭킹 대시보드">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Live Dashboard</p>
                  <h2>실시간 등락 대시보드</h2>
                </div>
                <p className="powerRankingSectionHint">
                  다음 갱신까지 {formatCountdown(countdownSeconds)} | 마지막 확인 {lastUpdatedAt ? formatDateTime(lastUpdatedAt) : "-"}
                </p>
              </div>

              <div className="powerRankingDashboardGrid">
                <article className="powerRankingDashboardCard">
                  <span>다음 랭킹 스냅샷</span>
                  <strong>{formatCountdown(countdownSeconds)}</strong>
                  <p>1시간 기준 대시보드 타이머입니다. 목록은 1분마다 자동으로 재조회됩니다.</p>
                </article>

                <article className="powerRankingDashboardCard">
                  <span>실시간 등락</span>
                  <ul className="powerRankingDashboardList">
                    {liveRankChanges.length === 0 ? (
                      <li>최근 감지된 순위 변동이 없습니다.</li>
                    ) : (
                      liveRankChanges.map((item) => (
                        <li key={item.id}>
                          <strong>{item.name}</strong>
                          <span>{item.delta > 0 ? `▲ ${item.delta}` : `▼ ${Math.abs(item.delta)}`}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </article>

                <article className="powerRankingDashboardCard">
                  <span>예상 상승 순위</span>
                  <ul className="powerRankingDashboardList">
                    {projectedRisers.map((item) => (
                      <li key={item.id}>
                        <strong>{item.name}</strong>
                        <span>{item.currentRank}위 → {item.targetRank}위 · 격차 {item.gap}</span>
                      </li>
                    ))}
                  </ul>
                </article>

                <article className="powerRankingDashboardCard">
                  <span>예상 하락 순위</span>
                  <ul className="powerRankingDashboardList">
                    {projectedFallers.map((item) => (
                      <li key={item.id}>
                        <strong>{item.name}</strong>
                        <span>{item.currentRank}위 → {item.nextRank}위 · 격차 {item.gap}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>
            </section>

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

            <section className="powerRankingInventorySection" aria-label="보유 아이템">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Item Inventory</p>
                  <h2>인벤토리</h2>
                </div>
                <p className="powerRankingSectionHint">
                  파워랭킹에서는 소비 아이템만 확인할 수 있습니다. 장비 관리는 내 장비 화면에서만 진행됩니다.
                </p>
              </div>

              <div className="powerRankingInventoryCollection">
                <div className="powerRankingInventoryGroup">
                  <div className="powerRankingInventoryGroupHead">
                    <strong>소비 아이템</strong>
                    <span>기본 드롭 확률 1%</span>
                  </div>

                  <div className="powerRankingInventoryGrid">
                    {inventory.length === 0 ? (
                      <article className="powerRankingInventoryEmpty">
                        로그인 후 랭킹 액션을 반영하면 아이템이 드롭됩니다.
                      </article>
                    ) : (
                      inventory.map((item) => (
                        <article key={item.code} className="powerRankingInventoryCard">
                          <div className="powerRankingInventoryVisual">
                            <img src={item.imageUrl} alt={item.name} className="powerRankingInventoryImage" />
                            <span className="powerRankingInventoryBadge">x{item.quantity}</span>
                          </div>
                          <div className="powerRankingInventoryBody">
                            <div className="powerRankingInventoryHeading">
                              <strong>{item.name}</strong>
                              <span>소비 아이템</span>
                            </div>
                            <p>{item.description}</p>
                            <div className="powerRankingInventoryTags">
                              <span className="powerRankingInventoryPill">보유 수량 {item.quantity}</span>
                            </div>
                            <details className="powerRankingEquipmentDetails">
                              <summary>상세보기</summary>
                              <div className="powerRankingEquipmentDetailsBody">
                                <p>
                                  {item.name}은 {item.code === "byeokbangjun-blanket" ? "상대 인기도를 크게 내리는" : "상대 인기도를 크게 올리는"} 소비 아이템입니다.
                                </p>
                                <div className="powerRankingInventoryTags">
                                  <span className="powerRankingInventoryPill">
                                    효과량 {item.code === "byeokbangjun-blanket" ? "-100" : "+100"}
                                  </span>
                                  <span className="powerRankingInventoryPill isMuted">사용 시 확인창 표시</span>
                                </div>
                              </div>
                            </details>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="powerRankingLogSection" aria-label="랭킹 기록 조회">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Action Log</p>
                  <h2>인기도 하락 / 아이템 사용 기록</h2>
                </div>
                <p className="powerRankingSectionHint">
                  최근 인기도 내림 기록과 사용자 아이템 사용 내역을 확인할 수 있습니다.
                </p>
              </div>

              <div className="powerRankingLogGrid">
                <article className="powerRankingLogCard">
                  <strong>인기도 내림 기록</strong>
                  <ul className="powerRankingLogList">
                    {downvoteLogs.length === 0 ? (
                      <li>최근 기록이 없습니다.</li>
                    ) : (
                      downvoteLogs.map((event) => (
                        <li key={event.id}>
                          <p>{getEventLabel(event)}</p>
                          <time>{formatDateTime(event.createdAt)}</time>
                        </li>
                      ))
                    )}
                  </ul>
                </article>

                <article className="powerRankingLogCard">
                  <strong>아이템 획득 / 사용 기록</strong>
                  <ul className="powerRankingLogList">
                    {itemUsageLogs.length === 0 ? (
                      <li>최근 기록이 없습니다.</li>
                    ) : (
                      itemUsageLogs.map((event) => (
                        <li key={event.id}>
                          <p>{getEventLabel(event)}</p>
                          <time>{formatDateTime(event.createdAt)}</time>
                        </li>
                      ))
                    )}
                  </ul>
                </article>
              </div>
            </section>

            <section className="powerRankingBoardSection" aria-label="랭킹 보드">
              <div className="powerRankingSectionHead">
                <div>
                  <p className="powerRankingSectionEyebrow">Ranking Board</p>
                  <h2>{period === "all" ? "전체 순위표" : period === "weekly" ? "주간 순위표" : "일간 순위표"}</h2>
                </div>
                <p className="powerRankingSectionHint">
                  디바이스 기준 하루 최대 1000회까지 반영되며, 클릭은 큐에 쌓여 비동기로 순차 처리됩니다.
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
                    const recentScoreDelta = getRecentScoreDelta(eventLogs, person.id, 60);
                    const scoreChartPoints = buildScoreChartPoints(person, eventLogs);
                    const chartPolylinePoints = scoreChartPoints.map((point) => `${point.x},${point.y}`).join(" ");
                    const isProfileSubmitting = submittingForId === `profile-${person.id}`;
                    const upQueueCount = pendingVoteCounts[`${person.id}:1`] ?? 0;
                    const downQueueCount = pendingVoteCounts[`${person.id}:-1`] ?? 0;
                    const upHeatClass = getVoteQueueHeatClass(upQueueCount);
                    const downHeatClass = getVoteQueueHeatClass(downQueueCount);
                    const blanketItem = inventoryByCode["byeokbangjun-blanket"];
                    const loveItem = inventoryByCode["seoeuntaek-love"];
                    const isUsingBlanket = submittingForId === `item-${person.id}-byeokbangjun-blanket`;
                    const isUsingLove = submittingForId === `item-${person.id}-seoeuntaek-love`;
                    const isUpBursting = actionBurstKey?.startsWith(`${person.id}:1:`) ?? false;
                    const isDownBursting = actionBurstKey?.startsWith(`${person.id}:-1:`) ?? false;
                    const blanketDisabledReason = !blanketItem || blanketItem.quantity < 1 ? "담요 보유 수량이 없습니다." : null;
                    const loveDisabledReason = !loveItem || loveItem.quantity < 1 ? "사랑 보유 수량이 없습니다." : null;
                    const personItemUseLogs = eventLogs
                      .filter((event) => event.personId === person.id && event.eventType === "item_use")
                      .slice(0, 5);
                    const personItemDropLogs = eventLogs
                      .filter((event) => event.personId === person.id && event.eventType === "item_drop")
                      .slice(0, 5);
                    const personDownvoteLogs = eventLogs
                      .filter((event) => event.personId === person.id && event.eventType === "vote_down")
                      .slice(0, 5);

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
                            <div className="powerRankingScoreWithDelta">
                              <strong className={person.score < 0 ? "isNegative" : undefined}>{person.score}</strong>
                              <em className={`powerRankingScoreDelta ${getScoreDeltaClassName(recentScoreDelta)}`.trim()}>
                                {getScoreDeltaLabel(recentScoreDelta)}
                              </em>
                            </div>
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
                                className={`powerRankingVoteButton powerRankingVoteActionButton isUp ${upHeatClass} ${isUpBursting ? "isBursting" : ""}`.trim()}
                                onClick={() => void handleVoteAction(person.id, 1)}
                              >
                                {upQueueCount > 0 ? `▲ 올리기 (${upQueueCount})` : "▲ 올리기"}
                              </button>
                              <button
                                type="button"
                                className={`powerRankingDownvoteButton powerRankingVoteActionButton isDown ${downHeatClass} ${isDownBursting ? "isBursting" : ""}`.trim()}
                                onClick={() => void handleVoteAction(person.id, -1)}
                              >
                                {downQueueCount > 0 ? `▼ 내리기 (${downQueueCount})` : "▼ 내리기"}
                              </button>
                            </div>
                          </div>

                          <div className="powerRankingItemActions">
                            <div className="powerRankingItemActionCard">
                              <button
                                type="button"
                                className="powerRankingItemButton"
                                disabled={!blanketItem || blanketItem.quantity < 1 || isUsingBlanket}
                                onClick={() => void handleUseItem(person.id, "byeokbangjun-blanket")}
                              >
                                {isUsingBlanket
                                  ? "사용 중..."
                                  : `벽방준의 담요 ${blanketItem ? `x${blanketItem.quantity}` : "x0"}`}
                              </button>
                              <span className="powerRankingItemActionHint">
                                {isUsingBlanket ? "확인 후 사용 처리 중입니다." : blanketDisabledReason ?? "사용 시 확인창이 뜬 뒤 인기도 -100이 적용됩니다."}
                              </span>
                            </div>
                            <div className="powerRankingItemActionCard">
                              <button
                                type="button"
                                className="powerRankingItemButton isPositive"
                                disabled={!loveItem || loveItem.quantity < 1 || isUsingLove}
                                onClick={() => void handleUseItem(person.id, "seoeuntaek-love")}
                              >
                                {isUsingLove
                                  ? "사용 중..."
                                  : `서은택의 사랑 ${loveItem ? `x${loveItem.quantity}` : "x0"}`}
                              </button>
                              <span className="powerRankingItemActionHint">
                                {isUsingLove ? "확인 후 사용 처리 중입니다." : loveDisabledReason ?? "사용 시 확인창이 뜬 뒤 인기도 +100이 적용됩니다."}
                              </span>
                            </div>
                          </div>

                          <article className="powerRankingLogCard powerRankingScoreChartCard">
                            <div className="powerRankingScoreChartHead">
                              <strong>점수 변화 차트</strong>
                              <span>{`최근 ${scoreChartPoints.length > 1 ? scoreChartPoints.length - 1 : 0}회 반영`}</span>
                            </div>
                            <div className="powerRankingScoreChartWrap">
                              <svg viewBox="0 0 100 100" className="powerRankingScoreChart" preserveAspectRatio="none" aria-label="점수 변화 차트">
                                <polyline
                                  fill="none"
                                  points={chartPolylinePoints}
                                  className="powerRankingScoreChartLine"
                                />
                                {scoreChartPoints.map((point, index) => (
                                  <g key={`${person.id}-chart-${index}`}>
                                    <circle
                                      cx={point.x}
                                      cy={point.y}
                                      r="2.8"
                                      className="powerRankingScoreChartDot"
                                    />
                                  </g>
                                ))}
                              </svg>
                              <div className="powerRankingScoreChartLabels">
                                {scoreChartPoints.map((point, index) => (
                                  <div key={`${person.id}-label-${index}`} className="powerRankingScoreChartLabel">
                                    <strong>{point.score}</strong>
                                    <span>{point.label}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </article>

                          <div className="powerRankingLogGrid powerRankingRowLogGrid">
                            <article className="powerRankingLogCard">
                              <strong>적용된 아이템</strong>
                              <ul className="powerRankingLogList">
                                {personItemUseLogs.length === 0 ? (
                                  <li>
                                    <p>최근 기록이 없습니다.</p>
                                  </li>
                                ) : (
                                  personItemUseLogs.map((event) => (
                                    <li key={event.id}>
                                      <p>{getEventLabel(event)}</p>
                                      <time>{formatDateTime(event.createdAt)}</time>
                                    </li>
                                  ))
                                )}
                              </ul>
                            </article>

                            <article className="powerRankingLogCard">
                              <strong>드랍된 아이템</strong>
                              <ul className="powerRankingLogList">
                                {personItemDropLogs.length === 0 ? (
                                  <li>
                                    <p>최근 기록이 없습니다.</p>
                                  </li>
                                ) : (
                                  personItemDropLogs.map((event) => (
                                    <li key={event.id}>
                                      <p>{getEventLabel(event)}</p>
                                      <time>{formatDateTime(event.createdAt)}</time>
                                    </li>
                                  ))
                                )}
                              </ul>
                            </article>

                            <article className="powerRankingLogCard">
                              <strong>인기도 하락 로그</strong>
                              <ul className="powerRankingLogList">
                                {personDownvoteLogs.length === 0 ? (
                                  <li>
                                    <p>최근 기록이 없습니다.</p>
                                  </li>
                                ) : (
                                  personDownvoteLogs.map((event) => (
                                    <li key={event.id}>
                                      <p>{getAnonymousDownvoteLabel(event)}</p>
                                      <time>{formatDateTime(event.createdAt)}</time>
                                    </li>
                                  ))
                                )}
                              </ul>
                            </article>
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
