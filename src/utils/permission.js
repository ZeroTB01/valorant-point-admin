import { useUserStore } from '@/stores/user'

/**
 * 检查用户是否有指定角色
 * @param {string|string[]} roles - 角色标识或角色数组
 * @returns {boolean}
 */
export function hasRole(roles) {
  const userStore = useUserStore()
  const userRoles = userStore.roles || []
  
  if (!roles) return true
  if (typeof roles === 'string') {
    return userRoles.includes(roles)
  }
  if (Array.isArray(roles)) {
    return roles.some(role => userRoles.includes(role))
  }
  return false
}

/**
 * 检查是否为超级管理员
 * @returns {boolean}
 */
export function isSuperAdmin() {
  return hasRole('SUPER_ADMIN')
}

/**
 * 检查是否为管理员（包括超级管理员和普通管理员）
 * @returns {boolean}
 */
export function isAdmin() {
  return hasRole(['SUPER_ADMIN', 'ADMIN'])
}

/**
 * 检查是否为内容管理员
 * @returns {boolean}
 */
export function isContentAdmin() {
  return hasRole(['SUPER_ADMIN', 'CONTENT_ADMIN'])
}

/**
 * 检查是否有权限管理用户
 * @returns {boolean}
 */
export function canManageUsers() {
  return hasRole(['SUPER_ADMIN', 'ADMIN'])
}

/**
 * 检查是否有权限管理内容
 * @returns {boolean}
 */
export function canManageContent() {
  return hasRole(['SUPER_ADMIN', 'CONTENT_ADMIN'])
}

/**
 * 检查是否有权限审核内容
 * @returns {boolean}
 */
export function canReviewContent() {
  return hasRole(['SUPER_ADMIN', 'CONTENT_ADMIN'])
}

/**
 * 检查是否有权限管理系统配置
 * @returns {boolean}
 */
export function canManageSystem() {
  return hasRole('SUPER_ADMIN')
}

/**
 * 权限校验函数
 * @param {Object} options - 权限配置
 * @param {string[]} options.roles - 需要的角色
 * @param {Function} options.validator - 自定义验证函数
 * @returns {boolean}
 */
export function checkPermission(options = {}) {
  const { roles, validator } = options
  
  // 如果有自定义验证函数，优先使用
  if (validator && typeof validator === 'function') {
    return validator()
  }
  
  // 角色验证
  if (roles) {
    return hasRole(roles)
  }
  
  return true
}

/**
 * 获取用户可访问的路由
 * @param {Array} routes - 路由配置
 * @returns {Array} 过滤后的路由
 */
export function filterRoutes(routes) {
  return routes.filter(route => {
    // 如果路由没有meta或roles配置，默认可访问
    if (!route.meta || !route.meta.roles) {
      return true
    }
    
    // 检查角色权限
    if (hasRole(route.meta.roles)) {
      // 递归过滤子路由
      if (route.children && route.children.length > 0) {
        route.children = filterRoutes(route.children)
      }
      return true
    }
    
    return false
  })
}

/**
 * 权限指令配置
 * 用于 Vue 自定义指令
 */
export const permissionDirective = {
  mounted(el, binding) {
    const { value } = binding
    
    if (!value) return
    
    let hasPermission = false
    
    // 支持多种权限配置格式
    if (typeof value === 'string') {
      // v-permission="'ADMIN'"
      hasPermission = hasRole(value)
    } else if (Array.isArray(value)) {
      // v-permission="['ADMIN', 'SUPER_ADMIN']"
      hasPermission = hasRole(value)
    } else if (typeof value === 'object') {
      // v-permission="{ roles: ['ADMIN'], validator: () => true }"
      hasPermission = checkPermission(value)
    }
    
    // 如果没有权限，移除元素
    if (!hasPermission) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
}

/**
 * 按钮级权限控制
 * @param {string|string[]} roles - 需要的角色
 * @returns {boolean}
 */
export function showButton(roles) {
  // 如果不需要按钮级权限控制，直接返回true
  // 根据您的需求，这里返回true
  return true
}