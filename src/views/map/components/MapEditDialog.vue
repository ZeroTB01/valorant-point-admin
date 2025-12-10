<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑地图' : '新增地图'"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="地图名称" prop="mapName">
        <el-input v-model="formData.mapName" placeholder="请输入地图名称" />
      </el-form-item>
      <el-form-item label="地图标识" prop="mapKey">
        <el-input v-model="formData.mapKey" placeholder="请输入地图标识（英文）" />
      </el-form-item>
      <el-form-item label="地图类型" prop="mapType">
        <el-input v-model="formData.mapType" placeholder="请输入地图类型" />
      </el-form-item>
      <el-form-item label="小地图图片" prop="minimapUrl">
        <div class="image-uploader">
          <div v-if="formData.minimapUrl" class="image-preview">
            <img :src="formData.minimapUrl" alt="小地图预览">
            <div class="image-actions">
              <el-icon class="action-icon" @click="selectMinimap"><Refresh /></el-icon>
              <el-icon class="action-icon" @click="removeMinimap"><Delete /></el-icon>
            </div>
          </div>
          <div v-else class="upload-trigger" @click="selectMinimap">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <div class="upload-text">选择图片</div>
          </div>
          <input
            ref="minimapInput"
            type="file"
            style="display: none"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            @change="handleMinimapChange"
          >
        </div>
        <div class="el-upload__tip">支持 jpg/png/gif/webp 文件，不超过 10MB</div>
      </el-form-item>

      <el-form-item label="全景图图片" prop="overviewUrl">
        <div class="image-uploader">
          <div v-if="formData.overviewUrl" class="image-preview">
            <img :src="formData.overviewUrl" alt="全景图预览">
            <div class="image-actions">
              <el-icon class="action-icon" @click="selectOverview"><Refresh /></el-icon>
              <el-icon class="action-icon" @click="removeOverview"><Delete /></el-icon>
            </div>
          </div>
          <div v-else class="upload-trigger" @click="selectOverview">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <div class="upload-text">选择图片</div>
          </div>
          <input
            ref="overviewInput"
            type="file"
            style="display: none"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            @change="handleOverviewChange"
          >
        </div>
        <div class="el-upload__tip">支持 jpg/png/gif/webp 文件，不超过 10MB</div>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="formData.description" type="textarea" placeholder="请输入地图描述" />
      </el-form-item>
      <el-form-item label="炸弹点位" prop="sitesArr">
        <el-select v-model="formData.sitesArr" multiple placeholder="请选择点位">
          <el-option label="A" value="A" />
          <el-option label="B" value="B" />
          <el-option label="C" value="C" />
        </el-select>
      </el-form-item>
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number v-model="formData.sortOrder" :min="1" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status">
          <el-option label="启用" :value="1" />
          <el-option label="禁用" :value="0" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSave">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { updateMap, createMap } from '@/api/gameData'
import { Plus, Refresh, Delete } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const minimapInput = ref()
const overviewInput = ref()
const loading = ref(false)
const userStore = useUserStore()

const uploadUrl = computed(() => `${import.meta.env.VITE_API_BASE_URL}/file/upload-image`)
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}))

const formData = reactive({
  id: null,
  mapKey: '',
  mapName: '',
  mapType: '',
  minimapUrl: '',
  overviewUrl: '',
  description: '',
  sitesArr: [],
  sites: '',
  sortOrder: 1,
  status: 1
})

const rules = {
  mapName: [{ required: true, message: '请输入地图名称', trigger: 'blur' }],
  mapKey: [{ required: true, message: '请输入地图标识', trigger: 'blur' }],
  mapType: [{ required: true, message: '请输入地图类型', trigger: 'blur' }],
  minimap: [{ required: true, message: '请上传小地图图片', trigger: 'change' }],
  overview: [{ required: true, message: '请上传全景图图片', trigger: 'change' }],
  sitesArr: [{ required: true, message: '请选择炸弹点位', trigger: 'change' }],
  sortOrder: [{ required: true, message: '请输入排序', trigger: 'blur' }]
}

const minimapFile = ref(null)
const minimapUrl = ref('')
const overviewFile = ref(null)
const overviewUrl = ref('')


// 图片上传前校验
const beforeImageUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！')
    return false
  }
  return true
}

const handleMinimapSuccess = (response) => {
  if (response.code === 200 && response.data) {
    formData.minimapUrl = response.data.originalUrl || response.data
    ElMessage.success('小地图上传成功')
  } else {
    ElMessage.error(response.message || '小地图上传失败')
  }
}

const handleOverviewSuccess = (response) => {
  if (response.code === 200 && response.data) {
    formData.overviewUrl = response.data.originalUrl || response.data
    ElMessage.success('全景图上传成功')
  } else {
    ElMessage.error(response.message || '全景图上传失败')
  }
}
function selectMinimap() {
  minimapInput.value && minimapInput.value.click()
}
function handleMinimapChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!validateImage(file)) return
  minimapFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => {
    minimapUrl.value = ev.target.result
  }
  reader.readAsDataURL(file)
  // 关键：立刻赋值，保证校验通过
  formData.minimap = 'preview'
}
function removeMinimap() {
  minimapFile.value = null
  minimapUrl.value = ''
  formData.minimap = ''
  if (minimapInput.value) minimapInput.value.value = ''
  // 关键：清空后，表单校验也要重新触发
  formRef.value?.validateField('minimap')
}

function selectOverview() {
  overviewInput.value && overviewInput.value.click()
}
function handleOverviewChange(e) {
  const file = e.target.files[0]
  if (!file) return
  if (!validateImage(file)) return
  overviewFile.value = file
  const reader = new FileReader()
  reader.onload = (ev) => {
    overviewUrl.value = ev.target.result
  }
  reader.readAsDataURL(file)
  // 关键：立刻赋值，保证校验通过
  formData.overview = 'preview'
}
function removeOverview() {
  overviewFile.value = null
  overviewUrl.value = ''
  formData.overview = ''
  if (overviewInput.value) overviewInput.value.value = ''
  // 关键：清空后，表单校验也要重新触发
  formRef.value?.validateField('overview')
}

function validateImage(file) {
  const isLt10M = file.size / 1024 / 1024 < 10
  const fileName = file.name.toLowerCase()
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
  if (!hasValidExtension) {
    ElMessage.error('只能上传 JPG/PNG/GIF/WebP 格式的图片！')
    return false
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！')
    return false
  }
  return true
}

const emit = defineEmits(['success'])

function handleClose() {
  resetForm()
  dialogVisible.value = false
}

function resetForm() {
  Object.assign(formData, {
    id: null,
    mapKey: '',
    mapName: '',
    mapType: '',
    minimap: '',
    overview: '',
    description: '',
    sitesArr: [],
    sites: '',
    sortOrder: 1,
    status: 1
  })
  minimapFile.value = null
  minimapUrl.value = ''
  overviewFile.value = null
  overviewUrl.value = ''
  formRef.value?.clearValidate()
  if (minimapInput.value) minimapInput.value.value = ''
  if (overviewInput.value) overviewInput.value.value = ''
}

async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileType', 'image')
  try {
    const response = await fetch('/api/file/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      },
      body: formData
    })
    const result = await response.json()
    if (result.code === 200 && result.data) {
      return result.data
    } else {
      throw new Error(result.message || '图片上传失败')
    }
  } catch (error) {
    // 这里 error.message 就是后端 message
    ElMessage.error(error.message || '图片上传失败')
    throw error
  }
}

async function handleSave() {
  try {
    await formRef.value.validate()
    // 只有选择了新图片才上传，否则用原地址
    if (minimapFile.value) {
      formData.minimap = await uploadImage(minimapFile.value)
    }
    // 如果没选新图片，且是编辑，保持原有地址
    // 如果是新增，formData.minimap 必须有值（校验已保证）
    if (!formData.minimap || formData.minimap === 'preview') {
      formData.minimap = minimapUrl.value
    }

    if (overviewFile.value) {
      formData.overview = await uploadImage(overviewFile.value)
    }
    if (!formData.overview || formData.overview === 'preview') {
      formData.overview = overviewUrl.value
    }

    formData.siteCount = formData.sitesArr.length
    let res
    if (isEdit.value) {
      res = await updateMap(formData, userStore.token)
    } else {
      res = await createMap(formData)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      dialogVisible.value = false
      emit('success')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (e) {
    if (e && e.message) {
      ElMessage.error(e.message)
    } else {
      ElMessage.error('请求失败，请重试')
    }
  }
}

function open(map) {
  if (map) {
    isEdit.value = true
    Object.assign(formData, map)
    minimapUrl.value = map.minimap || ''
    overviewUrl.value = map.overview || ''
    minimapFile.value = null
    overviewFile.value = null
  } else {
    isEdit.value = false
    Object.assign(formData, { id: null, mapName: '', mapKey: '', mapType: '' })
    minimapUrl.value = ''
    overviewUrl.value = ''
    minimapFile.value = null
    overviewFile.value = null
  }
  dialogVisible.value = true
}
defineExpose({ open })
</script>

<style lang="scss" scoped>
.image-uploader {
  .image-preview {
    position: relative;
    width: 120px;
    height: 120px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .image-actions {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 20px;
      opacity: 0;
      transition: opacity 0.3s;
      .action-icon {
        font-size: 24px;
        color: #fff;
        cursor: pointer;
        &:hover {
          color: #409eff;
        }
      }
    }
    &:hover .image-actions {
      opacity: 1;
    }
  }
  .upload-trigger {
    width: 120px;
    height: 120px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      border-color: #409eff;
      color: #409eff;
    }
    .upload-icon {
      font-size: 32px;
      color: #8c939d;
      margin-bottom: 8px;
    }
    .upload-text {
      font-size: 14px;
      color: #666;
    }
  }
}
.el-upload__tip {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}
</style>