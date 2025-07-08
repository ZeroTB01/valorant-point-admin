import request from '@/utils/request'

/**
 * 获取仪表盘统计数据
 */
export function getDashboardStats() {
  return request({
    url: '/statistics/dashboard',
    method: 'get'
  })
}

/**
 * 获取用户统计数据
 */
export function getUserStats(params) {
  return request({
    url: '/statistics/user',
    method: 'get',
    params
  })
}

/**
 * 获取内容统计数据
 */
export function getContentStats(params) {
  return request({
    url: '/statistics/content',
    method: 'get',
    params
  })
}

/**
 * 获取点位统计数据
 */
export function getPositionStats(params) {
  return request({
    url: '/statistics/position',
    method: 'get',
    params
  })
}

/**
 * 获取英雄使用统计
 */
export function getHeroStats() {
  return request({
    url: '/statistics/hero',
    method: 'get'
  })
}

/**
 * 获取地图热度统计
 */
export function getMapStats() {
  return request({
    url: '/statistics/map',
    method: 'get'
  })
}

/**
 * 获取武器使用统计
 */
export function getWeaponStats() {
  return request({
    url: '/statistics/weapon',
    method: 'get'
  })
}

/**
 * 获取用户增长趋势
 */
export function getUserGrowthTrend(params) {
  return request({
    url: '/statistics/user-growth',
    method: 'get',
    params
  })
}

/**
 * 获取内容发布趋势
 */
export function getContentTrend(params) {
  return request({
    url: '/statistics/content-trend',
    method: 'get',
    params
  })
}

/**
 * 获取热门搜索关键词
 */
export function getHotSearchKeywords(limit = 10) {
  return request({
    url: '/statistics/hot-keywords',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取系统运行状态
 */
export function getSystemStatus() {
  return request({
    url: '/statistics/system-status',
    method: 'get'
  })
}

/**
 * 获取实时在线用户数
 */
export function getOnlineUsers() {
  return request({
    url: '/statistics/online-users',
    method: 'get'
  })
}

/**
 * 获取今日数据概览
 */
export function getTodayOverview() {
  return request({
    url: '/statistics/today-overview',
    method: 'get'
  })
}

/**
 * 导出统计报表
 */
export function exportStatisticsReport(params) {
  return request({
    url: '/statistics/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}