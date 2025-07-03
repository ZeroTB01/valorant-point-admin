import { createRouter, createWebHistory } from 'vue-router'
import NProgress from 'nprogress'
import { useUserStore } from '@/stores/user'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'HomeFilled' }
      },
      {
        path: 'content',
        name: 'Content',
        component: () => import('@/views/content/index.vue'),
        meta: { title: '内容管理', icon: 'Document' }
      },
      {
        path: 'hero',
        name: 'Hero',
        component: () => import('@/views/hero/index.vue'),
        meta: { title: '英雄管理', icon: 'UserFilled' }
      },
      {
        path: 'map',
        name: 'Map',
        component: () => import('@/views/map/index.vue'),
        meta: { title: '地图管理', icon: 'MapLocation' }
      },
      {
        path: 'weapon',
        name: 'Weapon',
        component: () => import('@/views/weapon/index.vue'),
        meta: { title: '武器管理', icon: 'Aim' }
      },
      {
        path: 'position',
        name: 'Position',
        component: () => import('@/views/position/index.vue'),
        meta: { title: '点位管理', icon: 'LocationFilled' }
      },
      {
        path: 'user',
        name: 'User',
        component: () => import('@/views/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404' }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  NProgress.start()
  
  // 设置页面标题
  document.title = `${to.meta.title || ''} - ${import.meta.env.VITE_APP_TITLE}`
  
  const userStore = useUserStore()
  
  // 不需要认证的页面
  if (to.meta.requiresAuth === false) {
    next()
    return
  }
  
  // 检查 token
  if (!userStore.token) {
    next('/login')
    return
  }
  
  // 如果没有用户信息，尝试获取
  if (!userStore.userInfo) {
    try {
      await userStore.getUserInfo()
    } catch (error) {
      console.error('获取用户信息失败:', error)
      next('/login')
      return
    }
  }
  
  next()
})

router.afterEach(() => {
  NProgress.done()
})

export default router