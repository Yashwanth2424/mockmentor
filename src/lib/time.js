export const APP_TIME_ZONE = "Europe/Berlin";

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: APP_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      weekday: "short",
});

export function getZonedParts(date) {
      const parts = Object.fromEntries(
            formatter.formatToParts(date).map((p) => [p.type, p.value])
      );

      return {
            year: Number(parts.year),
            month: Number(parts.month),
            day: Number(parts.day),
            hour: Number(parts.hour),
            minute: Number(parts.minute),
            weekday: WEEKDAYS[parts.weekday],
            dateString: `${parts.year}-${parts.month}-${parts.day}`,
            time: `${parts.hour}:${parts.minute}`,
      };
}

function getOffsetMs(date) {
      const p = getZonedParts(date);
      const zonedAsUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
      const exactMinute = Math.floor(date.getTime() / 60000) * 60000;
      return zonedAsUtc - exactMinute;
}

export function zonedTimeToUtc(dateString, time) {
      const [year, month, day] = dateString.split("-").map(Number);
      const [hour, minute] = time.split(":").map(Number);

      const asUtc = Date.UTC(year, month - 1, day, hour, minute);
      const firstGuess = asUtc - getOffsetMs(new Date(asUtc));

      return new Date(asUtc - getOffsetMs(new Date(firstGuess)));
}

export function addDays(dateString, days) {
      const [year, month, day] = dateString.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

export function formatDate(date) {
      const p = getZonedParts(new Date(date));
      return `${p.day} ${MONTHS[p.month - 1]} ${p.year}`;
}

export function formatDateTime(date) {
      return `${formatDate(date)}, ${getZonedParts(new Date(date)).time}`;
}
