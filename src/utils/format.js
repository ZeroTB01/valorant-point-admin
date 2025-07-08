import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

// 使用中文语言包
dayjs.locale('zh-cn')
dayjs.extend(relativeTime)

/**
 * 日期格式化
 * @param {string|Date} date - 日期
 * @param {string} format - 格式，默认 YYYY-MM-DD HH:mm:ss
 * @returns {string}
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!date) return '-'
  return dayjs(date).format(format)
}

/**
 * 相对时间格式化
 * @param {string|Date} date - 日期
 * @returns {string} 例如：3小时前
 */
export function formatRelativeTime(date) {
  if (!date) return '-'
  return dayjs(date).fromNow()
}

/**
 * 文件大小格式化
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string}
 */
export function formatFileSize(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 数字格式化（千分位）
 * @param {number} num - 数字
 * @returns {string}
 */
export function formatNumber(num) {
  if (!num && num !== 0) return '-'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 百分比格式化
 * @param {number} value - 数值
 * @param {number} total - 总数
 * @param {number} decimals - 小数位数
 * @returns {string}
 */
export function formatPercent(value, total, decimals = 2) {
  if (!total || total === 0) return '0%'
  const percent = (value / total) * 100
  return percent.toFixed(decimals) + '%'
}

/**
 * 金额格式化
 * @param {number} amount - 金额（分）
 * @param {string} prefix - 前缀
 * @returns {string}
 */
export function formatMoney(amount, prefix = '¥') {
  if (!amount && amount !== 0) return prefix + '0.00'
  const yuan = (amount / 100).toFixed(2)
  return prefix + formatNumber(yuan)
}

/**
 * 手机号格式化（隐藏中间四位）
 * @param {string} phone - 手机号
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone || phone.length !== 11) return phone || '-'
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 邮箱格式化（部分隐藏）
 * @param {string} email - 邮箱
 * @returns {string}
 */
export function formatEmail(email) {
  if (!email || !email.includes('@')) return email || '-'
  const [name, domain] = email.split('@')
  if (name.length <= 3) {
    return name + '***@' + domain
  }
  return name.substr(0, 3) + '***@' + domain
}

/**
 * 时长格式化
 * @param {number} seconds - 秒数
 * @returns {string} 例如：02:30:45
 */
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '00:00'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * 状态文本映射
 * @param {number} status - 状态值
 * @param {object} map - 映射对象
 * @returns {string}
 */
export function formatStatus(status, map) {
  return map[status] || '未知'
}

// 预定义的状态映射
export const statusMaps = {
  user: {
    0: '禁用',
    1: '正常'
  },
  content: {
    0: '待审核',
    1: '已发布',
    2: '已下架'
  },
  position: {
    0: '禁用',
    1: '启用'
  }
}

/**
 * 英雄类型格式化
 * @param {string} type - 英雄类型
 * @returns {string}
 */
export function formatHeroType(type) {
  const typeMap = {
    'duelist': '决斗者',
    'initiator': '先锋',
    'controller': '控场者',
    'sentinel': '哨卫'
  }
  return typeMap[type] || type
}

/**
 * 武器类型格式化
 * @param {string} type - 武器类型
 * @returns {string}
 */
export function formatWeaponType(type) {
  const typeMap = {
    'sidearm': '手枪',
    'smg': '冲锋枪',
    'rifle': '步枪',
    'sniper': '狙击枪',
    'heavy': '重武器',
    'melee': '近战'
  }
  return typeMap[type] || type
}

/**
 * 点位类型格式化
 * @param {string} type - 点位类型
 * @returns {string}
 */
export function formatPositionType(type) {
  const typeMap = {
    'smoke': '烟雾弹',
    'flash': '闪光弹',
    'molly': '燃烧弹',
    'wall': '墙/屏障',
    'orb': '球体',
    'trap': '陷阱',
    'general': '通用'
  }
  return typeMap[type] || type
}

/**
 * 攻防方格式化
 * @param {string} side - 攻防方
 * @returns {string}
 */
export function formatSide(side) {
  const sideMap = {
    'attack': '进攻方',
    'defense': '防守方',
    'both': '双方'
  }
  return sideMap[side] || side
} 