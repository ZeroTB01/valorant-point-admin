import request from '@/utils/request'

/**
 * 获取内容列表（分页）
 */
export function getContentList(params) {
  return request({
    url: '/content/page',  // 修正为正确的路径
    method: 'get',
    params
  })
}

/**
 * 获取内容详情
 */
export function getContentDetail(contentId) {
  return request({
    url: `/content/${contentId}`,
    method: 'get'
  })
}

/**
 * 根据类型获取内容
 */
export function getContentByType(contentType) {
  return request({
    url: `/content/type/${contentType}`,
    method: 'get'
  })
}

/**
 * 创建内容
 */
export function createContent(data) {
  return request({
    url: '/content',
    method: 'post',
    data
  })
}

/**
 * 更新内容
 */
export function updateContent(contentId, data) {
  return request({
    url: `/content/${contentId}`,
    method: 'put',
    data
  })
}

/**
 * 删除内容
 */
export function deleteContent(contentId) {
  return request({
    url: `/content/${contentId}`,
    method: 'delete'
  })
}

/**
 * 更新内容状态
 */
export function updateContentStatus(contentId, status) {
  return request({
    url: `/content/${contentId}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 获取热门内容
 */
export function getHotContents(limit = 10) {
  return request({
    url: '/content/hot',
    method: 'get',
    params: { limit }
  })
}

/**
 * 获取精选内容
 */
export function getFeaturedContents(limit = 10) {
  return request({
    url: '/content/featured',
    method: 'get',
    params: { limit }
  })
}

/**
 * 搜索内容
 */
export function searchContent(params) {
  return request({
    url: '/content/search',
    method: 'get',
    params
  })
}

/**
 * 获取标签列表
 */
export function getTagList() {
  return request({
    url: '/tag/list',
    method: 'get'
  })
}

/**
 * 批量操作内容
 */
export function batchUpdateContent(data) {
  return request({
    url: '/content/batch',
    method: 'put',
    data
  })
}

/**
 * 审核内容
 */
export function reviewContent(id, status) {
  return request({
    url: `/content/${id}/status`,
    method: 'put',
    params: { status }
  })
}