import request from '@/utils/request'

/**
 * 上传单个文件
 */
export function uploadFile(file, fileType = 'document') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileType', fileType)
  
  return request({
    url: '/file/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 批量上传文件
 */
export function uploadFiles(files, fileType = 'document') {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })
  formData.append('fileType', fileType)
  
  return request({
    url: '/file/upload-batch',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传图片
 */
export function uploadImage(file, generateThumbnail = true) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('generateThumbnail', generateThumbnail)
  
  return request({
    url: '/file/upload-image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 上传视频
 */
export function uploadVideo(file) {
  const formData = new FormData()
  formData.append('file', file)
  
  return request({
    url: '/file/upload-video',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 300000 // 5分钟超时
  })
}

/**
 * 删除文件
 */
export function deleteFile(fileUrl) {
  return request({
    url: '/file/delete',
    method: 'delete',
    params: { fileUrl }
  })
}

/**
 * 获取用户上传记录
 */
export function getUserUploads(params) {
  return request({
    url: '/file/user-uploads',
    method: 'get',
    params
  })
}

/**
 * 获取存储统计
 */
export function getStorageStats() {
  return request({
    url: '/file/storage-stats',
    method: 'get'
  })
}

/**
 * 获取临时访问URL
 */
export function getTempUrl(fileUrl, expireMinutes = 60) {
  return request({
    url: '/file/temp-url',
    method: 'get',
    params: { fileUrl, expireMinutes }
  })
}