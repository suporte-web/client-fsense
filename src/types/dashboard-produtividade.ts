export type DashboardFilters = {
  userId?: string;
  userName?: string;
  teamId?: string;
  teamName?: string;
  startDate?: string;
  endDate?: string;
};

export type DashboardSummary = {
  totalUsers: number;
  totalTeams: number;
  totalActivities: number;
  totalEvents: number;
  activeUsers?: number;
  totalActiveUsers?: number;
  idleUsers?: number;
  totalIdleUsers?: number;
  idleUserPercent?: number;
  idleTimeMinutes?: number;
  totalIdleTimeMinutes?: number;
  idleTimePercent?: number;
  totalWorkTimeMinutes?: number;
  productiveTimeMinutes?: number;
  appConsumedTimeMinutes?: number;
  appConsumptionPercentage?: number;
  idleness?: {
    activeTimeMs?: number;
    idleTimeMs?: number;
    expectedTotalTimeMs?: number;
    productivityPercentage?: number;
    idlenessPercentage?: number;
  };
};

export type UserProductivity = {
  id?: string;
  userId?: string;
  name?: string;
  userName?: string;
  email?: string;
  teamName?: string;
  totalActivities?: number;
  totalEvents?: number;
  activeTimeMs?: number;
  appConsumedTimeMs?: number;
  expectedWorkTimeMs?: number;
  expectedWorkTimeMinutes?: number;
  appConsumptionPercentage?: number;
  workdayId?: string | number;
  workdayName?: string;
  idleTimeMs?: number;
  productivityPercentage?: number;
  idlenessPercentage?: number;
  idleTimeMinutes?: number;
  idleMinutes?: number;
  idleTimeSeconds?: number;
  idleTimeMilliseconds?: number;
  lastActivityAt?: string;
};

export type ActivityItem = {
  id?: string;
  title?: string;
  description?: string;
  userId?: string;
  userName?: string;
  teamId?: string;
  teamName?: string;
  createdAt?: string;
  login?: string;
  application?: string;
  processName?: string;
  host?: string;
  category?: string;
  categoryName?: string;
  evtDurationMilliseconds?: number;
  durationMilliseconds?: number;
  durationSeconds?: number;
  duration?: number;
};

export type EventItem = {
  id?: string;
  title?: string;
  description?: string;
  userId?: string;
  userName?: string;
  teamId?: string;
  teamName?: string;
  createdAt?: string;
  aplicationName?: string;
  aplicationVersion?: string;
  aplicationPath?: string;
};

export type KeystrokeItem = {
  machineName?: string;
  userName?: string;
  creationDate?: string;
  personId?: number;
  deviceId?: number;
  keystrokesCount?: number;
  mouseClicksCount?: number;
  keystrokesPerMillisecond?: number;
  mouseClicksPerMillisecond?: number;
  start?: string;
  end?: string;
  duration?: number;
};

export type KeystrokesResponse = {
  endpoint?: string;
  query?: Record<string, unknown>;
  currentPage?: number;
  totalPages?: number;
  totalRecords?: number;
  data: KeystrokeItem[];
};

export type TeamItem = {
  id?: string | number;
  name?: string;
  description?: string;
  totalUsers?: number;
};

export type ApiListResponse<T> = {
  filters?: DashboardFilters;
  result: T[];
};

export type FindJornadasFilters = {
  userId?: string;
  name?: string;
  page?: number;
  limit?: number;
};

export type FindJornadaSchedule = {
  weekday: string;
  start?: string;
  end?: string;
  maxFlexibleDuration?: string;
};

export type FsenseWorkday = {
  id: number;
  name: string;
  workNationalHolidays: boolean;
  workRegionalHolidays: boolean;
  isFlexible: boolean;
  calendarId?: number | null;
  ignoreNonFocusLongerThan?: string | null;
  workdayScheduleList?: FindJornadaSchedule[];
};

export type FsenseWorkdayResponse = {
  endpoint?: string;
  query?: Record<string, unknown>;
  currentPage?: number;
  totalPages?: number;
  totalRecords?: number;
  data: FsenseWorkday[];
};

export type JornadaSchedule = FindJornadaSchedule;

export type Jornada = FsenseWorkday;

export type JornadaFilters = FindJornadasFilters;

export type JornadasResponse = FsenseWorkdayResponse;
