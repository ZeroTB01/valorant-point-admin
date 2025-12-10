import request from '@/utils/request'

export function uploadFile(file, fileType = 'image') {
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

export function uploadImage(file) {
  return uploadFile(file, 'image')
}

export function uploadVideo(file) {
  return uploadFile(file, 'video')
}

export function deleteFile(fileUrl) {
  return request({
    url: '/file/delete',
    method: 'delete',
    params: { fileUrl }
  })
}