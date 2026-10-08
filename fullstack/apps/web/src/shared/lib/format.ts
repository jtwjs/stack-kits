// 화면 시각은 서비스 시간대로 고정한다. 런타임(브라우저·CI) TZ 에 기대면 사람마다·러너마다 다르게 찍힌다.
export const APP_TIME_ZONE = "Asia/Seoul";

/** ISO 시각을 `YYYY-MM-DD HH:mm`(24시간) 으로. timeZone 을 항상 명시한다. */
export function formatDateTime(
  iso: string,
  timeZone: string = APP_TIME_ZONE,
): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
}
