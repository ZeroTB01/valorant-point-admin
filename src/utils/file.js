import { ElMessage } from 'element-plus'

/**
 * 文件大小限制配置
 */
export const fileSizeLimit = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  document: 50 * 1024 * 1024, // 50MB
  default: 10 * 1024 * 1024 // 10MB
}

/**
 * 允许的文件类型
 */
export const allowedFileTypes = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  video: ['mp4', 'avi', 'mov', 'wmv', 'flv'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx']
}

/**
 * 文件类型MIME映射
 */
export const mimeTypes = {
  // 图片
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'gif': 'image/gif',
  'webp': 'image/webp',
  // 视频
  'mp4': 'video/mp4',
  'avi': 'video/x-msvideo',
  'mov': 'video/quicktime',
  'wmv': 'video/x-ms-wmv',
  'flv': 'video/x-flv',
  // 文档
  'pdf': 'application/pdf',
  'doc': 'application/msword',
  'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'xls': 'application/vnd.ms-excel',
  'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'ppt': 'application/vnd.ms-powerpoint',
  'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
}

/**
 * 验证文件大小
 * @param {File} file - 文件对象
 * @param {string} type - 文件类型分类
 * @returns {boolean}
 */
export function validateFileSize(file, type = 'default') {
  const maxSize = fileSizeLimit[type] || fileSizeLimit.default
  if (file.size > maxSize) {
    const sizeMB = (maxSize / 1024 / 1024).toFixed(0)
    ElMessage.error(`文件大小不能超过${sizeMB}MB`)
    return false
  }
  return true
}

/**
 * 验证文件类型
 * @param {File} file - 文件对象
 * @param {string} type - 文件类型分类
 * @returns {boolean}
 */
export function validateFileType(file, type) {
  const extension = getFileExtension(file.name)
  const allowed = allowedFileTypes[type] || []
  
  if (!allowed.includes(extension)) {
    ElMessage.error(`不支持的文件类型，请上传${allowed.join('、')}格式的文件`)
    return false
  }
  return true
}

/**
 * 获取文件扩展名
 * @param {string} filename - 文件名
 * @returns {string}
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return ''
  const lastDotIndex = filename.lastIndexOf('.')
  if (lastDotIndex === -1) return ''
  return filename.substring(lastDotIndex + 1).toLowerCase()
}

/**
 * 验证文件
 * @param {File} file - 文件对象
 * @param {Object} options - 验证选项
 * @returns {boolean}
 */
export function validateFile(file, options = {}) {
  const { type = 'default', maxSize, allowedTypes } = options
  
  // 验证文件大小
  const sizeLimit = maxSize || fileSizeLimit[type] || fileSizeLimit.default
  if (file.size > sizeLimit) {
    const sizeMB = (sizeLimit / 1024 / 1024).toFixed(0)
    ElMessage.error(`文件大小不能超过${sizeMB}MB`)
    return false
  }
  
  // 验证文件类型
  if (allowedTypes) {
    const extension = getFileExtension(file.name)
    const allowed = Array.isArray(allowedTypes) ? allowedTypes : allowedFileTypes[type] || []
    if (!allowed.includes(extension)) {
      ElMessage.error(`不支持的文件类型，请上传${allowed.join('、')}格式的文件`)
      return false
    }
  }
  
  return true
}

/**
 * 压缩图片
 * @param {File} file - 图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<Blob>}
 */
export function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    mimeType = 'image/jpeg'
  } = options
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height
        
        // 计算缩放比例
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('图片压缩失败'))
            }
          },
          mimeType,
          quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }
      
      img.src = e.target.result
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * 生成文件预览URL
 * @param {File|Blob} file - 文件对象
 * @returns {string}
 */
export function createFilePreviewUrl(file) {
  return URL.createObjectURL(file)
}

/**
 * 释放文件预览URL
 * @param {string} url - 预览URL
 */
export function revokeFilePreviewUrl(url) {
  URL.revokeObjectURL(url)
}

/**
 * 读取文件内容
 * @param {File} file - 文件对象
 * @param {string} type - 读取类型：text, dataURL, arrayBuffer
 * @returns {Promise}
 */
export function readFile(file, type = 'text') {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      resolve(e.target.result)
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    switch (type) {
      case 'text':
        reader.readAsText(file)
        break
      case 'dataURL':
        reader.readAsDataURL(file)
        break
      case 'arrayBuffer':
        reader.readAsArrayBuffer(file)
        break
      default:
        reader.readAsText(file)
    }
  })
}

/**
 * 批量验证文件
 * @param {FileList|File[]} files - 文件列表
 * @param {Object} options - 验证选项
 * @returns {Object} { valid: File[], invalid: File[] }
 */
export function validateFiles(files, options = {}) {
  const valid = []
  const invalid = []
  
  Array.from(files).forEach(file => {
    if (validateFile(file, options)) {
      valid.push(file)
    } else {
      invalid.push(file)
    }
  })
  
  return { valid, invalid }
}

/**
 * 格式化文件信息
 * @param {File} file - 文件对象
 * @returns {Object}
 */
export function formatFileInfo(file) {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    extension: getFileExtension(file.name),
    lastModified: new Date(file.lastModified)
  }
}