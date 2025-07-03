import request from '@/utils/request'

/**
 * 上传文件
 */
export function uploadFile(file, type = 'image', module = 'content') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('type', type)
  formData.append('module', module)
  
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
 * 上传图片
 */
export function uploadImage(file, module = 'content') {
  return uploadFile(file, 'image', module)
}

/**
 * 上传视频
 */
export function uploadVideo(file) {
  return uploadFile(file, 'video', 'content')
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