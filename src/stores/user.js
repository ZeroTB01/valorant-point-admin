import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Cookies from 'js-cookie'
import { login, getUserInfo } from '@/api/auth'

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY
const REFRESH_TOKEN_KEY = import.meta.env.VITE_REFRESH_TOKEN_KEY

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref(Cookies.get(TOKEN_KEY) || '')
  const refreshToken = ref(Cookies.get(REFRESH_TOKEN_KEY) || '')
  const userInfo = ref(JSON.parse(localStorage.getItem('userInfo') || 'null'))
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const userId = computed(() => userInfo.value?.userId || null)
  const username = computed(() => userInfo.value?.username || '')
  const nickname = computed(() => userInfo.value?.nickname || '')
  const roles = computed(() => userInfo.value?.roles || [])
  
  // 判断是否是管理员
  const isAdmin = computed(() => {
    return roles.value.includes('SUPER_ADMIN') || roles.value.includes('CONTENT_ADMIN')
  })
  
  // 登录
  async function loginAction(loginForm) {
    try {
      const res = await login(loginForm)
      const data = res.data
      
      // 保存 token
      token.value = data.accessToken
      refreshToken.value = data.refreshToken
      
      // 保存到 Cookie
      Cookies.set(TOKEN_KEY, data.accessToken, { expires: 1 }) // 1天
      Cookies.set(REFRESH_TOKEN_KEY, data.refreshToken, { expires: 7 }) // 7天
      
      // 保存用户信息
      userInfo.value = {
        userId: data.userId,
        username: data.username,
        email: data.email,
        nickname: data.nickname,
        avatar: data.avatar,
        roles: data.roles
      }
      
      // 保存到 localStorage
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      
      return res
    } catch (error) {
      throw error
    }
  }
  
  // 获取用户信息
  async function getUserInfoAction() {
    try {
      const res = await getUserInfo()
      const data = res.data
      
      // 适配用户信息格式
      userInfo.value = {
        userId: data.id,
        username: data.username,
        email: data.email,
        nickname: data.nickname,
        avatar: data.avatar,
        phone: data.phone,
        roles: data.roles,
        status: data.status,
        emailVerified: data.emailVerified,
        lastLoginTime: data.lastLoginTime,
        createTime: data.createTime,
        preferences: data.preferences,
        statistics: data.statistics
      }
      
      // 保存到 localStorage
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      
      return res
    } catch (error) {
      throw error
    }
  }
  
  // 退出登录
  function logout() {
    token.value = ''
    refreshToken.value = ''
    userInfo.value = null
    
    Cookies.remove(TOKEN_KEY)
    Cookies.remove(REFRESH_TOKEN_KEY)
    localStorage.removeItem('userInfo')
  }
  
  // 更新 token
  function updateToken(newToken) {
    token.value = newToken
    Cookies.set(TOKEN_KEY, newToken, { expires: 1 })
  }
  
  return {
    // 状态
    token,
    refreshToken,
    userInfo,
    
    // 计算属性
    isLoggedIn,
    userId,
    username,
    nickname,
    roles,
    isAdmin,
    
    // 方法
    login: loginAction,
    getUserInfo: getUserInfoAction,
    logout,
    updateToken
  }
})