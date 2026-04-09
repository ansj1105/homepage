import { huntingZones, getHuntingMonster, getHuntingZone } from "../../src/data/huntingZones";
import type {
  HuntingCombatClickResponse,
  HuntingCombatConsumableRequest,
  HuntingCombatReward,
  HuntingCombatState,
  HuntingMonsterView,
  HuntingProfile,
  HuntingZoneDetail,
  HuntingZoneDropEntry,
  HuntingZoneSummary
} from "../../src/types";

const DAILY_CLICK_LIMIT = 300;

type CombatSession = {
  zoneId: string;
  monsterId: string;
  currentHp: number;
  totalClicks: number;
  bossEntryUsageDate: string;
  bossEntryUsage: Record<string, number>;
  attackBuffCharges: number;
  dropBuffKills: number;
  protectionCharges: number;
  logs: string[];
  recentDrops: HuntingCombatReward[];
};

const combatSessions = new Map<string, CombatSession>();

const getTodayKey = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const toZoneSummary = (zoneId: string): HuntingZoneSummary => {
  const zone = getHuntingZone(zoneId);
  if (!zone) {
    throw new Error("존재하지 않는 사냥터입니다.");
  }

  return {
    id: zone.id,
    badge: zone.badge,
    chapterLabel: zone.chapterLabel,
    zoneType: zone.zoneType,
    roleSummary: zone.roleSummary,
    name: zone.name,
    description: zone.description,
    unlockLevel: zone.unlockLevel,
    recommendedPower: zone.recommendedPower,
    clickCost: zone.clickCost,
    dailyEntryLimit: zone.dailyEntryLimit,
    seasonLabel: zone.seasonLabel,
    isSeasonOpen: zone.isSeasonOpen,
    monsterNames: zone.monsters.map((monster) => monster.name),
    previewDrops: Array.from(new Set(zone.monsters.flatMap((monster) => monster.dropTable.map((drop) => drop.label)))).slice(0, 6),
    hasBoss: zone.monsters.some((monster) => monster.isBoss)
  };
};

const toMonsterView = (
  zoneId: string,
  monsterId: string,
  currentHp?: number
): HuntingMonsterView => {
  const monster = getHuntingMonster(zoneId, monsterId);
  if (!monster) {
    throw new Error("존재하지 않는 몬스터입니다.");
  }

  return {
    id: monster.id,
    name: monster.name,
    imageUrl: monster.imageUrl,
    typeLabel: monster.typeLabel,
    rarityLabel: monster.rarityLabel,
    patternLabel: monster.patternLabel,
    flavor: monster.flavor,
    maxHp: monster.maxHp,
    currentHp: currentHp ?? monster.maxHp,
    defense: monster.defense,
    expReward: monster.expReward,
    isBoss: monster.isBoss,
    rewardSummary: monster.rewardSummary
  };
};

const appendLog = (session: CombatSession, message: string) => {
  session.logs = [message, ...session.logs].slice(0, 12);
};

const createDefaultSession = (): CombatSession => {
  const zone = huntingZones[0];
  const monster = zone.monsters[0];
  return {
    zoneId: zone.id,
    monsterId: monster.id,
    currentHp: monster.maxHp,
    totalClicks: 0,
    bossEntryUsageDate: getTodayKey(),
    bossEntryUsage: {},
    attackBuffCharges: 0,
    dropBuffKills: 0,
    protectionCharges: 0,
    logs: [],
    recentDrops: []
  };
};

const getSession = (userId: string): CombatSession => {
  const existing = combatSessions.get(userId);
  if (existing) {
    if (existing.bossEntryUsageDate !== getTodayKey()) {
      existing.bossEntryUsageDate = getTodayKey();
      existing.bossEntryUsage = {};
    }
    return existing;
  }
  const next = createDefaultSession();
  combatSessions.set(userId, next);
  return next;
};

const syncSessionTarget = (session: CombatSession, zoneId?: string, monsterId?: string) => {
  const targetZone = zoneId ? getHuntingZone(zoneId) : getHuntingZone(session.zoneId);
  if (!targetZone) {
    throw new Error("존재하지 않는 사냥터입니다.");
  }

  const targetMonsterId = monsterId ?? session.monsterId;
  const targetMonster =
    targetZone.monsters.find((monster) => monster.id === targetMonsterId) ?? targetZone.monsters[0];

  const zoneChanged = session.zoneId !== targetZone.id;
  const monsterChanged = session.monsterId !== targetMonster.id;

  if (zoneChanged || monsterChanged) {
    if (targetZone.zoneType === "event" && targetZone.isSeasonOpen === false) {
      throw new Error("이벤트 사냥터는 현재 오픈 기간이 아닙니다.");
    }
    session.zoneId = targetZone.id;
    session.monsterId = targetMonster.id;
    session.currentHp = targetMonster.maxHp;
    appendLog(session, `${targetZone.name} · ${targetMonster.name} 전투 준비 완료`);
  }
};

const getEstimatedDamage = (profile: HuntingProfile, session: CombatSession, monsterId: string): number => {
  const monster = getHuntingMonster(session.zoneId, monsterId);
  if (!monster) {
    return 0;
  }
  const attackBuffMultiplier = session.attackBuffCharges > 0 ? 1.28 : 1;
  return Math.max(1, Math.floor(profile.battlePower * attackBuffMultiplier * 0.98 - monster.defense));
};

const rollRewards = (
  profile: HuntingProfile,
  monster: NonNullable<ReturnType<typeof getHuntingMonster>>,
  session: CombatSession
): HuntingCombatReward[] => {
  const rewards: HuntingCombatReward[] = [];
  const dropMultiplier = profile.dropRateMultiplier * (session.dropBuffKills > 0 ? 1.35 : 1);

  const rollTable = (penalty: number) => {
    monster.dropTable.forEach((drop) => {
      const appliedRate = Math.min(0.92, drop.rate * dropMultiplier * penalty);
      if (Math.random() <= appliedRate) {
        rewards.push({
          kind: drop.kind,
          code: drop.code,
          label: drop.label,
          quantity: Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min
        });
      }
    });
  };

  rollTable(monster.isBoss ? 0.82 : 1);
  if (monster.isBoss && Math.random() < profile.bossBonusRollRate) {
    rollTable(0.46);
  }

  return rewards;
};

const buildState = (profile: HuntingProfile, session: CombatSession): HuntingCombatState => {
  const zone = getHuntingZone(session.zoneId);
  if (!zone) {
    throw new Error("존재하지 않는 사냥터입니다.");
  }

  return {
    zoneId: zone.id,
    zoneName: zone.name,
    zoneType: zone.zoneType,
    monster: toMonsterView(zone.id, session.monsterId, session.currentHp),
    estimatedDamage: getEstimatedDamage(profile, session, session.monsterId),
    remainingClicks: Math.max(0, DAILY_CLICK_LIMIT - session.totalClicks),
    totalClicks: session.totalClicks,
    clickCost: zone.clickCost,
    remainingBossEntries:
      zone.zoneType === "boss" && zone.dailyEntryLimit
        ? Math.max(0, zone.dailyEntryLimit - (session.bossEntryUsage[zone.id] ?? 0))
        : undefined,
    critRate: Math.min(0.38, 0.08 + Math.min(0.18, profile.recommendationCoefficient * 0.002)),
    attackBuffCharges: session.attackBuffCharges,
    dropBuffKills: session.dropBuffKills,
    protectionCharges: session.protectionCharges,
    logs: session.logs,
    recentDrops: session.recentDrops
  };
};

export const listHuntingZones = (): HuntingZoneSummary[] =>
  huntingZones.map((zone) => toZoneSummary(zone.id));

export const getHuntingZoneDetail = (zoneId: string): HuntingZoneDetail => {
  const zone = getHuntingZone(zoneId);
  if (!zone) {
    throw new Error("존재하지 않는 사냥터입니다.");
  }

  return {
    ...toZoneSummary(zone.id),
    monsters: zone.monsters.map((monster) => ({
      ...toMonsterView(zone.id, monster.id),
      dropTable: monster.dropTable
    }))
  };
};

export const getHuntingZoneDrops = (zoneId: string): HuntingZoneDropEntry[] => {
  const zone = getHuntingZone(zoneId);
  if (!zone) {
    throw new Error("존재하지 않는 사냥터입니다.");
  }

  return zone.monsters.flatMap((monster) => monster.dropTable);
};

export const getCombatState = (
  userId: string,
  profile: HuntingProfile,
  zoneId?: string,
  monsterId?: string
): HuntingCombatState => {
  const session = getSession(userId);
  syncSessionTarget(session, zoneId, monsterId);
  return buildState(profile, session);
};

export const clickCombat = (
  userId: string,
  profile: HuntingProfile,
  zoneId: string,
  monsterId: string
): HuntingCombatClickResponse => {
  const session = getSession(userId);
  syncSessionTarget(session, zoneId, monsterId);

  if (session.totalClicks >= DAILY_CLICK_LIMIT) {
    throw new Error("오늘 클릭 횟수를 모두 사용했습니다.");
  }

  const monster = getHuntingMonster(session.zoneId, session.monsterId);
  if (!monster) {
    throw new Error("존재하지 않는 몬스터입니다.");
  }

  const zone = getHuntingZone(session.zoneId);
  if (!zone) {
    throw new Error("존재하지 않는 사냥터입니다.");
  }
  if (session.totalClicks + zone.clickCost > DAILY_CLICK_LIMIT) {
    throw new Error("남은 클릭 수가 부족합니다.");
  }
  if (zone.zoneType === "boss" && zone.dailyEntryLimit) {
    const used = session.bossEntryUsage[zone.id] ?? 0;
    if (used >= zone.dailyEntryLimit) {
      throw new Error("오늘 보스 사냥터 입장 제한을 모두 사용했습니다.");
    }
  }

  const critRate = Math.min(0.38, 0.08 + Math.min(0.18, profile.recommendationCoefficient * 0.002));
  const wasCritical = Math.random() < critRate;
  const attackBuffMultiplier = session.attackBuffCharges > 0 ? 1.28 : 1;
  const skillMultiplier = 0.92 + Math.random() * 0.22;
  const damage = Math.max(
    1,
    Math.floor(profile.battlePower * attackBuffMultiplier * skillMultiplier * (wasCritical ? 1.75 : 1) - monster.defense)
  );

  session.totalClicks += zone.clickCost;
  if (zone.zoneType === "boss" && zone.dailyEntryLimit) {
    session.bossEntryUsage[zone.id] = (session.bossEntryUsage[zone.id] ?? 0) + 1;
  }
  session.attackBuffCharges = Math.max(0, session.attackBuffCharges - 1);
  session.currentHp -= damage;

  let defeated = false;
  let rewards: HuntingCombatReward[] = [];
  let expGained = 0;

  if (session.currentHp <= 0) {
    defeated = true;
    rewards = rollRewards(profile, monster, session);
    expGained = monster.expReward;
    session.currentHp = monster.maxHp;
    session.recentDrops = rewards;
    appendLog(
      session,
      `${monster.name} 처치 · ${rewards.length > 0 ? rewards.map((reward) => `${reward.label} x${reward.quantity}`).join(", ") : "드랍 없음"}`
    );
    session.dropBuffKills = Math.max(0, session.dropBuffKills - 1);
  } else {
    appendLog(session, `${monster.name}에게 ${damage}${wasCritical ? " 치명타" : ""} 데미지`);
  }

  return {
    state: buildState(profile, session),
    damage,
    wasCritical,
    defeated,
    expGained,
    rewards
  };
};

export const useCombatConsumable = (
  userId: string,
  profile: HuntingProfile,
  payload: HuntingCombatConsumableRequest
): HuntingCombatState => {
  const session = getSession(userId);
  const labelMap: Record<HuntingCombatConsumableRequest["consumableCode"], string> = {
    "healing-potion": "회복 포션",
    "berserk-tonic": "광폭 토닉",
    "lucky-scroll": "행운 스크롤",
    "protection-scroll": "보호 주문서"
  };

  switch (payload.consumableCode) {
    case "healing-potion":
      session.totalClicks = Math.max(0, session.totalClicks - 15);
      appendLog(session, "회복 포션 사용 · 남은 클릭 여유 +15");
      break;
    case "berserk-tonic":
      session.attackBuffCharges = 8;
      appendLog(session, "광폭 토닉 사용 · 다음 8회 공격 강화");
      break;
    case "lucky-scroll":
      session.dropBuffKills = 5;
      appendLog(session, "행운 스크롤 사용 · 다음 5회 처치 드랍 상승");
      break;
    case "protection-scroll":
      session.protectionCharges += 1;
      appendLog(session, "보호 주문서 사용 · 강화 보호권 보유");
      break;
    default:
      appendLog(session, `${labelMap[payload.consumableCode]} 사용`);
      break;
  }

  return buildState(profile, session);
};
