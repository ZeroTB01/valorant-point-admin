import request from '@/utils/request'

// ========== 英雄相关 API ==========
export function getHeroList() {
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

export function updateHeroStatus(heroId, status) {
  return request({
    url: `/hero/${heroId}/status`,
    method: 'put',
    params: { status }
  })
}

// ========== 地图相关 API ==========
export function getMapList() {
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

export function updateMap(mapId, data) {
  return request({
    url: `/map/${mapId}`,
    method: 'put',
    data
  })
}

export function deleteMap(mapId) {
  return request({
    url: `/map/${mapId}`,
    method: 'delete'
  })
}

// ========== 武器相关 API ==========
export function getWeaponList() {
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

// ========== 点位相关 API ==========
export function getPositionList(params) {
  return request({
    url: '/position/list',
    method: 'get',
    params
  })
}

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

export function getFilterOptions() {
  return request({
    url: '/position/filter-options',
    method: 'get'
  })
}

// ========== 通用选项 API ==========
export function getHeroOptions() {
  return request({
    url: '/hero/options',
    method: 'get'
  })
}

export function getMapOptions() {
  return request({
    url: '/map/options',
    method: 'get'
  })
}

export function getWeaponOptions() {
  return request({
    url: '/weapon/options',
    method: 'get'
  })
}