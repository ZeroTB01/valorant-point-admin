import request from '@/utils/request'

/**
 * 获取用户列表
 */
export function getUserList(params) {
  return request({
    url: '/user/page',
    method: 'get',
    params
  })
}

/**
 * 获取用户详情
 */
export function getUserDetail(userId) {
  return request({
    url: `/user/${userId}`,
    method: 'get'
  })
}

/**
 * 创建用户
 */
export function createUser(data) {
  return request({
    url: '/user',
    method: 'post',
    data
  })
}

/**
 * 更新用户
 */
export function updateUser(userId, data) {
  return request({
    url: `/user/${userId}`,
    method: 'put',
    data
  })
}

/**
 * 删除用户
 */
export function deleteUser(userId) {
  return request({
    url: `/user/${userId}`,
    method: 'delete'
  })
}

/**
 * 批量删除用户
 */
export function batchDeleteUsers(userIds) {
  return request({
    url: '/user/batch-delete',
    method: 'post',
    data: { userIds }
  })
}

/**
 * 更新用户状态
 */
export function updateUserStatus(userId, status) {
  return request({
    url: `/user/${userId}/status`,
    method: 'put',
    params: { status }
  })
}

/**
 * 批量更新用户状态
 */
export function batchUpdateUserStatus(userIds, status) {
  return request({
    url: '/user/batch-status',
    method: 'post',
    data: { userIds, status }
  })
}

/**
 * 重置用户密码
 */
export function resetUserPassword(userId, newPassword) {
  return request({
    url: `/user/${userId}/reset-password`,
    method: 'post',
    data: { newPassword }
  })
}

/**
 * 分配用户角色
 */
export function assignUserRole(userId, roleKey) {
  return request({
    url: `/user/${userId}/roles`,
    method: 'post',
    params: { roleKey }
  })
}

/**
 * 获取用户统计信息
 */
export function getUserStatistics() {
  return request({
    url: '/user/statistics',
    method: 'get'
  })
}

/**
 * 获取角色列表
 */
export function getRoleList() {
  return request({
    url: '/role/list',
    method: 'get'
  })
}

/**
 * 导出用户数据
 */
export function exportUsers(params) {
  return request({
    url: '/user/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}