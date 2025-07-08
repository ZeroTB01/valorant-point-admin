/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @param {boolean} immediate - 是否立即执行
 * @returns {Function}
 */
export function debounce(func, wait = 300, immediate = false) {
  let timeout
  return function (...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    const callNow = immediate && !timeout
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    if (callNow) func.apply(this, args)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function}
 */
export function throttle(func, wait = 300) {
  let previous = 0
  return function (...args) {
    const now = Date.now()
    if (now - previous > wait) {
      func.apply(this, args)
      previous = now
    }
  }
}

/**
 * 深拷贝
 * @param {*} obj - 要拷贝的对象
 * @returns {*}
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 生成唯一ID
 * @returns {string}
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

/**
 * 获取URL参数
 * @param {string} name - 参数名
 * @param {string} url - URL，默认当前页面URL
 * @returns {string|null}
 */
export function getQueryParam(name, url = window.location.href) {
  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)')
  const results = regex.exec(url)
  if (!results) return null
  if (!results[2]) return ''
  return decodeURIComponent(results[2].replace(/\+/g, ' '))
}

/**
 * 对象转URL参数
 * @param {Object} obj - 参数对象
 * @returns {string}
 */
export function objectToQuery(obj) {
  if (!obj) return ''
  return Object.keys(obj)
    .filter(key => obj[key] !== undefined && obj[key] !== null && obj[key] !== '')
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise}
 */
export function copyToClipboard(text) {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  }
  
  // 降级方案
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  
  try {
    document.execCommand('copy')
    document.body.removeChild(textarea)
    return Promise.resolve()
  } catch (err) {
    document.body.removeChild(textarea)
    return Promise.reject(err)
  }
}

/**
 * 下载文件
 * @param {string} url - 文件URL
 * @param {string} filename - 文件名
 */
export function downloadFile(url, filename) {
  const link = document.createElement('a')
  link.href = url
  link.download = filename || 'download'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * 延迟函数
 * @param {number} ms - 延迟时间（毫秒）
 * @returns {Promise}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 数组分组
 * @param {Array} array - 要分组的数组
 * @param {string|Function} key - 分组依据
 * @returns {Object}
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = typeof key === 'function' ? key(item) : item[key]
    if (!result[group]) result[group] = []
    result[group].push(item)
    return result
  }, {})
}

/**
 * 数组去重
 * @param {Array} array - 要去重的数组
 * @param {string} key - 去重依据的属性名
 * @returns {Array}
 */
export function uniqueArray(array, key) {
  if (!key) {
    return [...new Set(array)]
  }
  
  const seen = new Map()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.set(value, true)
    return true
  })
}

/**
 * 树形数据扁平化
 * @param {Array} tree - 树形数据
 * @param {string} childrenKey - 子节点属性名
 * @returns {Array}
 */
export function flattenTree(tree, childrenKey = 'children') {
  const result = []
  
  function flatten(nodes) {
    nodes.forEach(node => {
      result.push(node)
      if (node[childrenKey] && node[childrenKey].length > 0) {
        flatten(node[childrenKey])
      }
    })
  }
  
  flatten(tree)
  return result
}

/**
 * 数组转树形结构
 * @param {Array} array - 平铺数组
 * @param {string} idKey - ID属性名
 * @param {string} parentKey - 父ID属性名
 * @param {string} childrenKey - 子节点属性名
 * @returns {Array}
 */
export function arrayToTree(array, idKey = 'id', parentKey = 'parentId', childrenKey = 'children') {
  const map = {}
  const result = []
  
  // 创建映射
  array.forEach(item => {
    map[item[idKey]] = { ...item, [childrenKey]: [] }
  })
  
  // 构建树
  array.forEach(item => {
    const parent = map[item[parentKey]]
    if (parent) {
      parent[childrenKey].push(map[item[idKey]])
    } else {
      result.push(map[item[idKey]])
    }
  })
  
  return result
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string}
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return ''
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return filename.substring(lastDotIndex + 1).toLowerCase()
}

/**
 * 判断是否为图片文件
 * @param {string} filename - 文件名
 * @returns {boolean}
 */
export function isImageFile(filename) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
  const extension = getFileExtension(filename)
  return imageExtensions.includes(extension)
}

/**
 * 判断是否为视频文件
 * @param {string} filename - 文件名
 * @returns {boolean}
 */
export function isVideoFile(filename) {
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm']
  const extension = getFileExtension(filename)
  return videoExtensions.includes(extension)
}