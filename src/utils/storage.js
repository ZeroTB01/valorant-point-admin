/**
 * 用户偏好设置存储
 */
export const preference = {
  // 存储键名前缀
  prefix: 'valorant_pref_',
  
  /**
   * 获取用户偏好
   * @param {string} key - 键名
   * @param {*} defaultValue - 默认值
   * @returns {*}
   */
  get(key, defaultValue) {
    return storage.get(this.prefix + key, defaultValue)
  },
  
  /**
   * 设置用户偏好
   * @param {string} key - 键名
   * @param {*} value - 值
   */
  set(key, value) {
    storage.set(this.prefix + key, value)
  },
  
  /**
   * 获取所有用户偏好
   * @returns {Object}
   */
  getAll() {
    const preferences = {}
    const keys = storage.keys()
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        const prefKey = key.substring(this.prefix.length)
        preferences[prefKey] = storage.get(key)
      }
    })
    return preferences
  },
  
  /**
   * 清空用户偏好
   */
  clear() {
    const keys = storage.keys()
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        storage.remove(key)
      }
    })
  }
}

/**
 * 缓存管理
 */
export const cache = {
  // 缓存键名前缀
  prefix: 'valorant_cache_',
  
  /**
   * 设置缓存
   * @param {string} key - 键名
   * @param {*} value - 值
   * @param {number} expire - 过期时间（秒），默认1小时
   */
  set(key, value, expire = 3600) {
    storage.set(this.prefix + key, value, expire)
  },
  
  /**
   * 获取缓存
   * @param {string} key - 键名
   * @param {*} defaultValue - 默认值
   * @returns {*}
   */
  get(key, defaultValue = null) {
    return storage.get(this.prefix + key, defaultValue)
  },
  
  /**
   * 移除缓存
   * @param {string} key - 键名
   */
  remove(key) {
    storage.remove(this.prefix + key)
  },
  
  /**
   * 清空所有缓存
   */
  clear() {
    const keys = storage.keys()
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        storage.remove(key)
      }
    })
  }
} 

// localStorage 封装
export const storage = {
  /**
   * 设置存储
   * @param {string} key - 键名
   * @param {*} value - 值
   * @param {number} expire - 过期时间（秒）
   */
  set(key, value, expire) {
    const data = {
      value,
      time: Date.now()
    }
    
    if (expire) {
      data.expire = Date.now() + expire * 1000
    }
    
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.error('localStorage存储失败:', e)
    }
  },
  
  /**
   * 获取存储
   * @param {string} key - 键名
   * @param {*} defaultValue - 默认值
   * @returns {*}
   */
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key)
      if (!item) return defaultValue
      
      const data = JSON.parse(item)
      
      // 检查是否过期
      if (data.expire && data.expire < Date.now()) {
        localStorage.removeItem(key)
        return defaultValue
      }
      
      return data.value
    } catch (e) {
      console.error('localStorage读取失败:', e)
      return defaultValue
    }
  },
  
  /**
   * 移除存储
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error('localStorage删除失败:', e)
    }
  },
  
  /**
   * 清空存储
   */
  clear() {
    try {
      localStorage.clear()
    } catch (e) {
      console.error('localStorage清空失败:', e)
    }
  },
  
  /**
   * 获取所有键名
   * @returns {string[]}
   */
  keys() {
    try {
      const keys = []
      for (let i = 0; i < localStorage.length; i++) {
        keys.push(localStorage.key(i))
      }
      return keys
    } catch (e) {
      console.error('获取localStorage键名失败:', e)
      return []
    }
  }
}

/**
 * sessionStorage 封装
 */
export const session = {
  /**
   * 设置存储
   * @param {string} key - 键名
   * @param {*} value - 值
   */
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch (e) {
      console.error('sessionStorage存储失败:', e)
    }
  },
  
  /**
   * 获取存储
   * @param {string} key - 键名
   * @param {*} defaultValue - 默认值
   * @returns {*}
   */
  get(key, defaultValue = null) {
    try {
      const item = sessionStorage.getItem(key)
      if (!item) return defaultValue
      return JSON.parse(item)
    } catch (e) {
      console.error('sessionStorage读取失败:', e)
      return defaultValue
    }
  },
  
  /**
   * 移除存储
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      sessionStorage.removeItem(key)
    } catch (e) {
      console.error('sessionStorage删除失败:', e)
    }
  },
  
  /**
   * 清空存储
   */
  clear() {
    try {
      sessionStorage.clear()
    } catch (e) {
      console.error('sessionStorage清空失败:', e)
    }
  }
}
