const PREFIX = 'edu_avatar_'

export function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(`${PREFIX}${key}`)
    return raw ? JSON.parse(raw) : fallback
  } catch (error) {
    console.warn(`[storage] 读取 ${key} 失败`, error)
    return fallback
  }
}

export function writeJson(key, value) {
  try {
    window.localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value))
  } catch (error) {
    console.warn(`[storage] 保存 ${key} 失败`, error)
  }
}

export function remove(key) {
  window.localStorage.removeItem(`${PREFIX}${key}`)
}
