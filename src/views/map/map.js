import request from '@/utils/request'

export function addMap(data) {
  return request({
    url: '/api/map/add',
    method: 'post',
    data
  })
}