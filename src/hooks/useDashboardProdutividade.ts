'use client';

import { useCallback, useEffect, useState } from 'react';
import { DashboardProdutividadeService } from '@/services/dashboard-produtividade.service';
import {
  ActivityItem,
  DashboardFilters,
  DashboardSummary,
  FsenseWorkday,
  TeamItem,
  UserProductivity,
} from '@/types/dashboard-produtividade';

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

const weekdayByIndex = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

const inactiveCategoryCodes = new Set(['C', 'G', 'L']);
const fixedLunchBreakMs = 72 * 60000;

function getNumber(value?: number | string | null) {
  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : 0;
}

function uniqueStrings(values: Array<string | number | undefined | null>) {
  return Array.from(
    new Set(
      values
        .filter((value): value is string | number => value !== undefined && value !== null && value !== '')
        .map((value) => String(value)),
    ),
  );
}

function getUserIdentifiers(user: UserProductivity) {
  return uniqueStrings([user.userId, user.id, user.userName, user.name, user.email]);
}

function getUserKey(user: UserProductivity) {
  return getUserIdentifiers(user)[0];
}

function getActivityUserKey(activity: ActivityItem) {
  return activity.userId ?? activity.login ?? activity.userName;
}

function getMappedNumber(map: Map<string, number>, keys: string[]) {
  for (const key of keys) {
    const value = map.get(key);

    if (value !== undefined) {
      return value;
    }
  }

  return 0;
}

function getMappedWorkday(
  map: Map<string, FsenseWorkday | undefined>,
  keys: string[],
) {
  for (const key of keys) {
    const value = map.get(key);

    if (value) {
      return value;
    }
  }

  return undefined;
}

function isInactiveActivity(activity: ActivityItem) {
  const category = activity.category?.trim().toUpperCase();
  const categoryName = activity.categoryName?.trim().toLowerCase() ?? '';

  return (
    Boolean(category && inactiveCategoryCodes.has(category)) ||
    categoryName.includes('idle') ||
    categoryName.includes('lock') ||
    categoryName.includes('suspended')
  );
}

function getActivityDurationMs(activity: ActivityItem) {
  const durationMilliseconds =
    getNumber(activity.evtDurationMilliseconds) ||
    getNumber(activity.durationMilliseconds);

  if (durationMilliseconds > 0) {
    return durationMilliseconds;
  }

  const durationSeconds =
    getNumber(activity.durationSeconds) || getNumber(activity.duration);

  return durationSeconds > 0 ? durationSeconds * 1000 : 0;
}

function parseLocalDate(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseTimeToMs(value?: string) {
  if (!value) {
    return undefined;
  }

  const [hours = '0', minutes = '0', seconds = '0'] = value.split(':');

  return (
    getNumber(hours) * 3600000 +
    getNumber(minutes) * 60000 +
    getNumber(seconds) * 1000
  );
}

function getScheduleDurationMs(start?: string, end?: string) {
  const startMs = parseTimeToMs(start);
  const endMs = parseTimeToMs(end);

  if (startMs === undefined || endMs === undefined) {
    return 0;
  }

  if (endMs >= startMs) {
    return endMs - startMs;
  }

  return 86400000 - startMs + endMs;
}

function getExpectedWorkMs(workday: FsenseWorkday | undefined, filters: DashboardFilters) {
  const startDate = parseLocalDate(filters.startDate) ?? parseLocalDate(getTodayDate());
  const endDate = parseLocalDate(filters.endDate) ?? startDate;

  if (!workday || !startDate || !endDate) {
    return 0;
  }

  let total = 0;
  const cursor = new Date(startDate);

  while (cursor <= endDate) {
    const weekday = weekdayByIndex[cursor.getDay()];

    let workdayDurationMs = 0;

    for (const schedule of workday.workdayScheduleList ?? []) {
      if (schedule.weekday === weekday) {
        workdayDurationMs += getScheduleDurationMs(schedule.start, schedule.end);
      }
    }

    if (workdayDurationMs > 0) {
      total += Math.max(workdayDurationMs - fixedLunchBreakMs, 0);
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return total;
}

async function getWorkdaysByUser(users: UserProductivity[]) {
  const pairs = await Promise.all(
    users.map(async (user) => {
      const userId = getUserKey(user);
      const identifiers = getUserIdentifiers(user);

      if (!userId) {
        return [] as Array<readonly [string, FsenseWorkday | undefined]>;
      }

      try {
        const response = await DashboardProdutividadeService.findJornadas({
          userId,
          limit: 1,
        });
        const workday = response.data?.[0];

        return identifiers.map((identifier) => [identifier, workday] as const);
      } catch {
        return identifiers.map((identifier) => [identifier, undefined] as const);
      }
    }),
  );

  return new Map(pairs.flat());
}

function buildIdlenessFromWorkday(
  summary: DashboardSummary,
  users: UserProductivity[],
  activities: ActivityItem[],
  filters: DashboardFilters,
  workdaysByUser: Map<string, FsenseWorkday | undefined>,
) {
  const activeMsByUser = new Map<string, number>();

  for (const activity of activities) {
    const userId = getActivityUserKey(activity);

    if (!userId || isInactiveActivity(activity)) {
      continue;
    }

    activeMsByUser.set(
      userId,
      (activeMsByUser.get(userId) ?? 0) + getActivityDurationMs(activity),
    );
  }

  let activeTimeMs = 0;
  let idleTimeMs = 0;
  let expectedTotalTimeMs = 0;
  let appConsumedTimeMs = 0;

  const enrichedUsers = users.map((user) => {
    const identifiers = getUserIdentifiers(user);
    const workday = getMappedWorkday(workdaysByUser, identifiers);
    const expectedMs = getExpectedWorkMs(workday, filters);
    const consumedMs = getMappedNumber(activeMsByUser, identifiers);
    const clampedActiveMs = expectedMs > 0 ? Math.min(consumedMs, expectedMs) : 0;
    const userIdleMs = expectedMs > 0 ? Math.max(expectedMs - clampedActiveMs, 0) : 0;
    const productivityPercentage =
      expectedMs > 0 ? Math.round((clampedActiveMs / expectedMs) * 100) : 0;
    const appConsumptionPercentage =
      expectedMs > 0 ? Math.round((consumedMs / expectedMs) * 100) : 0;
    const idlenessPercentage = expectedMs > 0 ? 100 - productivityPercentage : 0;

    activeTimeMs += clampedActiveMs;
    appConsumedTimeMs += consumedMs;
    idleTimeMs += userIdleMs;
    expectedTotalTimeMs += expectedMs;

    return {
      ...user,
      activeTimeMs: clampedActiveMs,
      appConsumedTimeMs: consumedMs,
      expectedWorkTimeMs: expectedMs,
      expectedWorkTimeMinutes: expectedMs / 60000,
      workdayId: workday?.id,
      workdayName: workday?.name,
      idleTimeMs: userIdleMs,
      idleTimeMilliseconds: userIdleMs,
      idleTimeMinutes: userIdleMs / 60000,
      productivityPercentage,
      appConsumptionPercentage,
      idlenessPercentage,
    };
  });

  const productivityPercentage =
    expectedTotalTimeMs > 0 ? Math.round((activeTimeMs / expectedTotalTimeMs) * 100) : 0;
  const idlenessPercentage = expectedTotalTimeMs > 0 ? 100 - productivityPercentage : 0;

  return {
    users: enrichedUsers,
    summary: {
      ...summary,
      idleTimeMinutes: idleTimeMs / 60000,
      totalIdleTimeMinutes: idleTimeMs / 60000,
      idleTimePercent: idlenessPercentage,
      totalWorkTimeMinutes: expectedTotalTimeMs / 60000,
      productiveTimeMinutes: activeTimeMs / 60000,
      appConsumedTimeMinutes: appConsumedTimeMs / 60000,
      appConsumptionPercentage:
        expectedTotalTimeMs > 0 ? Math.round((appConsumedTimeMs / expectedTotalTimeMs) * 100) : 0,
      idleness: {
        ...(summary.idleness ?? {}),
        activeTimeMs,
        idleTimeMs,
        expectedTotalTimeMs,
        productivityPercentage,
        idlenessPercentage,
      },
    },
  };
}

export function useDashboardProdutividade() {
  const today = getTodayDate();

  const [filters, setFilters] = useState<DashboardFilters>({
    startDate: today,
    endDate: today,
  });

  const [summary, setSummary] = useState<DashboardSummary>({
    totalUsers: 0,
    totalTeams: 0,
    totalActivities: 0,
    totalEvents: 0,
  });

  const [users, setUsers] = useState<UserProductivity[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [teams, setTeams] = useState<TeamItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const loadDashboard = useCallback(
    async (currentFilters = filters) => {
      try {
        setLoading(true);
        setError(undefined);

        const [
          summaryResponse,
          usersResponse,
          activitiesResponse,
          teamsResponse,
        ] = await Promise.all([
          DashboardProdutividadeService.findSummary(currentFilters),
          DashboardProdutividadeService.findUsers(currentFilters),
          DashboardProdutividadeService.findActivities(currentFilters),
          DashboardProdutividadeService.findTeams(),
        ]);

        const loadedUsers = usersResponse.result ?? [];
        const loadedActivities = activitiesResponse.result ?? [];

        const workdaysByUser = await getWorkdaysByUser(loadedUsers);

        const idleness = buildIdlenessFromWorkday(
          summaryResponse,
          loadedUsers,
          loadedActivities,
          currentFilters,
          workdaysByUser,
        );

        setSummary(idleness.summary);
        setUsers(idleness.users);
        setActivities(loadedActivities);
        setTeams(teamsResponse.result ?? []);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : 'Nao foi possivel carregar o dashboard.',
        );
      } finally {
        setLoading(false);
      }
    },
    [filters],
  );

  function updateFilters(nextFilters: DashboardFilters) {
    setFilters(nextFilters);
    loadDashboard(nextFilters);
  }

  function reload() {
    loadDashboard(filters);
  }

  useEffect(() => {
    loadDashboard(filters);
  }, []);

  return {
    summary,
    users,
    activities,
    teams,
    filters,
    loading,
    error,
    updateFilters,
    reload,
  };
}
