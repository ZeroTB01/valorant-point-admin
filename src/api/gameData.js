import request from '@/utils/request'

// ========== 英雄管理 API ==========

// 获取英雄分页列表（后台管理使用）
export function getHeroList(params) {
  return request({
    url: '/hero/page',
    method: 'get',
    params
  })
}

// 获取所有英雄列表（不分页）
export function getAllHeroes() {
  return request({
    url: '/hero/list',
    method: 'get'
  })
}

export function getHeroDetail(heroId) {
  return request({
    url: `/hero/${heroId}`,
    method: 'get'
  })
}

export function createHero(data) {
  return request({
    url: '/hero',
    method: 'post',
    data
  })
}

// 更新英雄信息
export function updateHero(heroId, data) {
  return request({
    url: `/hero/${heroId}`,
    method: 'put',
    data
  })
}

export function deleteHero(heroId) {
  return request({
    url: `/hero/${heroId}`,
    method: 'delete'
  })
}

export function batchDeleteHeroes(heroIds) {
  return request({
    url: '/hero/batch-delete',
    method: 'post',
    data: { heroIds }
  })
}

export function updateHeroStatus(heroId, status) {
  return request({
    url: `/hero/${heroId}/status`,
    method: 'put',
    params: { status }
  })
}

export function batchUpdateHeroStatus(heroIds, status) {
  return request({
    url: '/hero/batch-status',
    method: 'post',
    data: { heroIds, status }
  })
}

export function getHeroSkills(heroId) {
  return request({
    url: `/hero/${heroId}/skills`,
    method: 'get'
  })
}

export function saveHeroSkills(heroId, skills) {
  return request({
    url: `/hero/${heroId}/skills`,
    method: 'post',
    data: skills // 直接传递数组
  })
}

// ========== 地图管理 API ==========

// 获取地图分页列表（后台管理使用）
export function getMapList(params) {
  return request({
    url: '/map/page',
    method: 'get',
    params
  })
}

// 获取所有地图列表（不分页）
export function getAllMaps() {
  return request({
    url: '/map/list',
    method: 'get'
  })
}

export function getMapDetail(mapId) {
  return request({
    url: `/map/${mapId}`,
    method: 'get'
  })
}

export function createMap(data) {
  return request({
    url: '/map',
    method: 'post',
    data
  })
}

// 更新地图（带id）
export function updateMap(data, token) {
  return request({
    url: `/map/${data.id}`,
    method: 'put',
    data,
    headers: {
      Authorization: 'Bearer ' + token
    }
  })
}

export function deleteMap(mapId) {
  return request({
    url: `/map/${mapId}`,
    method: 'delete'
  })
}

export function batchDeleteMaps(mapIds) {
  return request({
    url: '/map/batch-delete',
    method: 'post',
    data: { mapIds }
  })
}

export function updateMapStatus(mapId, status) {
  return request({
    url: `/map/${mapId}/status`,
    method: 'put',
    params: { status }
  })
}

// ========== 武器管理 API ==========

// 获取武器分页列表（后台管理使用）
export function getWeaponList(params) {
  return request({
    url: '/weapon/page',
    method: 'get',
    params
  })
}

// 获取所有武器列表（不分页）
export function getAllWeapons() {
  return request({
    url: '/weapon/list',
    method: 'get'
  })
}

export function getWeaponDetail(weaponId) {
  return request({
    url: `/weapon/${weaponId}`,
    method: 'get'
  })
}

export function createWeapon(data) {
  return request({
    url: '/weapon',
    method: 'post',
    data
  })
}

export function updateWeapon(weaponId, data) {
  return request({
    url: `/weapon/${weaponId}`,
    method: 'put',
    data
  })
}

export function deleteWeapon(weaponId) {
  return request({
    url: `/weapon/${weaponId}`,
    method: 'delete'
  })
}

export function batchDeleteWeapons(weaponIds) {
  return request({
    url: '/weapon/batch-delete',
    method: 'post',
    data: { weaponIds }
  })
}

// ========== 点位管理 API ==========

// 获取所有点位列表
export function getAllPositions() {
  return request({
    url: '/position/page',
    method: 'get',
    params: {
      current: 1,
      size: 9999  // 获取足够多的数据，确保能获取所有点位
    }
  })
}

// 获取点位分页列表
export function getPositionList(params) {
  return request({
    url: '/position/page',
    method: 'get',
    params
  })
}

// 三级筛选点位
export function filterPositions(params) {
  return request({
    url: '/position/filter',
    method: 'get',
    params
  })
}

export function getPositionDetail(positionId) {
  return request({
    url: `/position/${positionId}`,
    method: 'get'
  })
}

export function createPosition(data) {
  return request({
    url: '/position',
    method: 'post',
    data
  })
}

export function updatePosition(positionId, data) {
  return request({
    url: `/position/${positionId}`,
    method: 'put',
    data
  })
}

export function deletePosition(positionId) {
  return request({
    url: `/position/${positionId}`,
    method: 'delete'
  })
}

export function batchDeletePositions(positionIds) {
  return request({
    url: '/position/batch-delete',
    method: 'post',
    data: { positionIds }
  })
}

export function updatePositionStatus(positionId, status) {
  return request({
    url: `/position/${positionId}/status`,
    method: 'put',
    params: { status }
  })
}

// ========== 通用选项 API ==========

// 获取地图/英雄/攻防方等点位相关选项
export function getMapOptions() {
  return request({
    url: '/position/filter-options',
    method: 'get'
  }).then(res => {
    return { data: (res.data?.mapList || []).map(m => ({ label: m.name, value: m.id })) }
  })
}

export function getHeroOptions() {
  return request({
    url: '/position/filter-options',
    method: 'get'
  }).then(res => {
    return { data: (res.data?.heroList || []).map(h => ({ label: h.name, value: h.id })) }
  })
}

// 获取点位类型选项
export function getPositionTypeOptions() {
  return request({
    url: '/position/position-types',
    method: 'get'
  }).then(res => {
    // 假设返回 [{code, name}]
    return { data: (res.data || []).map(t => ({ label: t.name, value: t.code })) }
  })
}

// 获取难度选项
export function getDifficultyOptions() {
  return request({
    url: '/position/difficulty-levels',
    method: 'get'
  }).then(res => {
    // 假设返回 [{level, label}]
    return { data: (res.data || []).map(d => ({ label: d.label, value: d.level })) }
  })
}

// 获取武器选项
export function getWeaponOptions() {
  return request({
    url: '/weapon/options',
    method: 'get'
  }).then(res => {
    // 假设返回 [{id, name}]
    return { data: (res.data || []).map(w => ({ label: w.name, value: w.id })) }
  })
}