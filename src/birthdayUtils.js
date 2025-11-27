// birthday: "YYYY-MM-DD" or "MM-DD"
export function parseBirthday(birthday) {
  if (!birthday) return null;
  const parts = birthday.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts.map(Number);
    if (!year || !month || !day) return null;
    return { year, month, day };
  }
  if (parts.length === 2) {
    const [month, day] = parts.map(Number);
    if (!month || !day) return null;
    return { year: null, month, day };
  }
  return null;
}

export function formatBirthdayDisplay(parsed) {
  if (!parsed) return "-";
  const { year, month, day } = parsed;
  const date = new Date(year || 2000, month - 1, day);
  const options = { month: "short", day: "numeric" };
  if (year) options.year = "numeric";
  return date.toLocaleDateString(undefined, options);
}

export function getZodiacSign(month, day) {
  if (!month || !day) return null;
  const zodiac = [
    ["Capricorn", 1, 19],
    ["Aquarius", 2, 18],
    ["Pisces", 3, 20],
    ["Aries", 4, 19],
    ["Taurus", 5, 20],
    ["Gemini", 6, 20],
    ["Cancer", 7, 22],
    ["Leo", 8, 22],
    ["Virgo", 9, 22],
    ["Libra", 10, 22],
    ["Scorpio", 11, 21],
    ["Sagittarius", 12, 21],
    ["Capricorn", 12, 31]
  ];
  for (const [sign, m, d] of zodiac) {
    if (month === m && day <= d) return sign;
    if (month < m) return sign;
  }
  return null;
}

export function getDaysAlive(parsed) {
  if (!parsed || !parsed.year) return null;
  const { year, month, day } = parsed;
  const birth = new Date(year, month - 1, day);
  const now = new Date();
  const diffMs = now.getTime() - birth.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days >= 0 ? days : null;
}

export function getDayOfWeek(parsed) {
  if (!parsed || !parsed.year) return null;
  const { year, month, day } = parsed;
  const date = new Date(year, month - 1, day);
  const weekday = date.toLocaleDateString(undefined, { weekday: "long" });
  return weekday;
}
