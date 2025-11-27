export function calculateAgeFromBirthday(birthdayString) {
  if (!birthdayString) return null
  const birthday = new Date(birthdayString)
  if (Number.isNaN(birthday.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birthday.getFullYear()
  const m = today.getMonth() - birthday.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
    age--
  }
  return age
}

export function formatBirthday(birthdayString) {
  if (!birthdayString) return ''
  const birthday = new Date(birthdayString)
  if (Number.isNaN(birthday.getTime())) return birthdayString
  return birthday.toLocaleDateString()
}
