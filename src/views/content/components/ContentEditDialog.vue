<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑内容' : '新增内容'"
    width="800px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="formData.title"
          placeholder="请输入内容标题"
          maxlength="200"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="内容类型" prop="contentType">
        <el-radio-group v-model="formData.contentType">
          <el-radio value="video">视频</el-radio>
          <el-radio value="article">图文</el-radio>
          <el-radio value="mixed">混合</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入内容描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>
      
      <el-form-item label="封面图片" prop="coverImage">
        <div class="image-uploader">
          <!-- 显示已选择的图片 -->
          <div v-if="imageUrl" class="image-preview">
            <img :src="imageUrl" alt="封面预览">
            <div class="image-actions">
              <el-icon class="action-icon" @click="selectImage"><Refresh /></el-icon>
              <el-icon class="action-icon" @click="removeImage"><Delete /></el-icon>
            </div>
          </div>
          
          <!-- 选择图片按钮 -->
          <div v-else class="upload-trigger" @click="selectImage">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <div class="upload-text">选择图片</div>
          </div>
          
          <!-- 隐藏的文件输入 -->
          <input
            ref="fileInput"
            type="file"
            style="display: none"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            @change="handleFileChange"
          >
        </div>
        <div class="el-upload__tip">支持 jpg/png/gif/webp 文件，不超过 10MB</div>
      </el-form-item>
      
      <el-form-item label="关联英雄" prop="heroId">
        <el-select
          v-model="formData.heroId"
          placeholder="请选择关联英雄"
          clearable
          filterable
        >
          <el-option
            v-for="hero in heroOptions"
            :key="hero.value"
            :label="hero.label"
            :value="hero.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="关联地图" prop="mapId">
        <el-select
          v-model="formData.mapId"
          placeholder="请选择关联地图"
          clearable
          filterable
        >
          <el-option
            v-for="map in mapOptions"
            :key="map.value"
            :label="map.label"
            :value="map.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="关联武器" prop="weaponId">
        <el-select
          v-model="formData.weaponId"
          placeholder="请选择关联武器"
          clearable
          filterable
        >
          <el-option
            v-for="weapon in weaponOptions"
            :key="weapon.value"
            :label="weapon.label"
            :value="weapon.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="关联点位" prop="positionId">
        <el-select
          v-model="formData.positionId"
          placeholder="请选择关联点位"
          clearable
          filterable
        >
          <el-option
            v-for="position in positionOptions"
            :key="position.value"
            :label="position.label"
            :value="position.value"
          />
        </el-select>
      </el-form-item>
      
      <!-- 视频类型的额外字段 -->
      <template v-if="formData.contentType === 'video' || formData.contentType === 'mixed'">
        <el-form-item label="视频" prop="videoUrl">
          <div class="video-uploader">
            <!-- 已选择视频时的预览和操作 -->
            <div v-if="videoUrl" class="video-preview">
              <video :src="videoUrl" controls style="width: 200px; height: 120px;" />
              <div class="video-actions">
                <el-icon class="action-icon" @click="selectVideo"><Refresh /></el-icon>
                <el-icon class="action-icon" @click="removeVideo"><Delete /></el-icon>
              </div>
            </div>
            <!-- 选择视频按钮 -->
            <div v-else class="upload-trigger" @click="selectVideo">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">选择视频</div>
            </div>
            <!-- 隐藏的文件输入 -->
            <input
              ref="videoInput"
              type="file"
              style="display: none"
              accept="video/*"
              @change="handleVideoChange"
            >
          </div>
          <div class="el-upload__tip">支持 mp4/webm/ogg 文件，建议不超过 200MB</div>
        </el-form-item>
        
        <el-form-item label="视频时长" prop="videoDuration">
          <el-input-number
            v-model="formData.videoDuration"
            :min="1"
            placeholder="秒"
          />
          <span style="margin-left: 10px">秒</span>
        </el-form-item>
      </template>
      
      <!-- 图文类型的额外字段：步骤编辑器 -->
      <template v-if="formData.contentType === 'article' || formData.contentType === 'mixed'">
        <el-form-item label="内容步骤" prop="contentBody">
          <div class="step-editor">
            <div class="step-list">
              <div v-for="(step, idx) in articleSteps" :key="step.id || idx" class="step-card">
                <div class="step-header">
                  <div class="step-index">步骤 {{ idx + 1 }}</div>
                  <div class="step-actions">
                    <el-button size="mini" type="primary" @click="moveStepUp(idx)" :disabled="idx===0">上移</el-button>
                    <el-button size="mini" type="primary" @click="moveStepDown(idx)" :disabled="idx===articleSteps.length-1">下移</el-button>
                    <el-button size="mini" type="danger" @click="removeStep(idx)">删除</el-button>
                  </div>
                </div>

                <el-form-item label="标题" class="step-field">
                  <el-input v-model="step.title" placeholder="此步骤标题（可选）" />
                </el-form-item>

                <el-form-item label="文字" class="step-field">
                  <el-input type="textarea" :rows="4" v-model="step.description" placeholder="步骤文字说明（支持 Markdown）" />
                </el-form-item>

                <el-form-item label="图片" class="step-field">
                  <div class="image-uploader">
                    <!-- 已选择的图片 -->
                    <div v-if="step.imagePreview || step.image" class="image-preview">
                      <img :src="step.imagePreview || step.image" alt="封面预览">
                      <div class="image-actions">
                        <el-icon class="action-icon" @click="selectStepImage(idx)"><Refresh /></el-icon>
                        <el-icon class="action-icon" @click="removeStepImage(idx)"><Delete /></el-icon>
                      </div>
                    </div>

                    <!-- 选择图片按钮 -->
                    <div v-else class="upload-trigger" @click="selectStepImage(idx)">
                      <el-icon class="upload-icon"><Plus /></el-icon>
                      <div class="upload-text">选择图片</div>
                    </div>
                  </div>
                </el-form-item>
              </div>
            </div>

            <div class="step-controls">
              <el-button type="primary" icon="Plus" @click="addStep">添加步骤</el-button>
              <el-button type="info" @click="importMarkdown">从 Markdown 导入（将每段作为一步）</el-button>
            </div>

            <!-- 隐藏的文件输入，用于步骤图片选择 -->
            <input ref="stepFileInput" type="file" style="display:none" accept=".jpg,.jpeg,.png,.gif,.webp" @change="handleStepFileChange" />

            <div class="el-upload__tip" style="margin-top:8px">每步支持一张图片 + 标题 + 文字，保存时会把步骤序列化为 JSON 存入正文。</div>
          </div>
        </el-form-item>
      </template>
      
      <el-form-item label="标签" prop="tags">
        <el-select
          v-model="formData.tags"
          multiple
          filterable
          allow-create
          placeholder="请选择或输入标签"
          style="width: 100%"
        >
          <el-option
            v-for="tag in tagOptions"
            :key="tag.value"
            :label="tag.label"
            :value="tag.value"
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="是否精选">
        <el-switch v-model="formData.isFeatured" />
      </el-form-item>
      
      <el-form-item label="是否官方">
        <el-switch v-model="formData.isOfficial" />
      </el-form-item>
      
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number
          v-model="formData.sortOrder"
          :min="0"
          :max="9999"
        />
        <span style="margin-left: 10px; color: #999">数字越小越靠前</span>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { createContent, updateContent } from '@/api/content'
import { getHeroOptions, getMapOptions, getWeaponOptions, getHeroList, getMapList, getWeaponList } from '@/api/gameData'
import { useUserStore } from '@/stores/user'
import { Plus, Refresh, Delete } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  content: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const userStore = useUserStore()
const formRef = ref()
const fileInput = ref()
const loading = ref(false)

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isEdit = computed(() => !!props.content?.id)

// 上传配置
const uploadUrl = computed(() => `${import.meta.env.VITE_API_BASE_URL}/file/upload`)

// 选项数据
const heroOptions = ref([])
const mapOptions = ref([])
const weaponOptions = ref([])
const positionOptions = ref([])
const tagOptions = ref([])

// 图片相关
const selectedFile = ref(null)
const imageUrl = ref('')

// 视频相关
const videoInput = ref(null)
const selectedVideoFile = ref(null)
const videoUrl = ref('') // 本地预览用

// 步骤编辑相关
const stepFileInput = ref(null)
const currentStepImageIndex = ref(-1)
const articleSteps = ref([])

// 表单数据
const formData = reactive({
  title: '',
  contentType: 'video',
  description: '',
  coverImage: '',
  heroId: null,
  mapId: null,
  weaponId: null,
  positionId: null,
  videoUrl: '',
  videoDuration: null,
  videoSize: null,
  contentBody: '',
  tags: [],
  isFeatured: false,
  isOfficial: false,
  sortOrder: 0,
  status: 0
})

// 表单验证规则
const formRules = {
  title: [
    { required: true, message: '请输入内容标题', trigger: 'blur' },
    { min: 2, max: 200, message: '标题长度在 2 到 200 个字符', trigger: 'blur' }
  ],
  contentType: [
    { required: true, message: '请选择内容类型', trigger: 'change' }
  ],
  description: [
    { max: 500, message: '描述不能超过 500 个字符', trigger: 'blur' }
  ],
  videoUrl: [
    { required: true, message: '请输入视频地址', trigger: 'blur' }
  ],
  contentBody: [
    { required: true, message: '请输入内容正文', trigger: 'blur' }
  ]
}

// 重置表单
const resetForm = () => {
  Object.assign(formData, {
    title: '',
    contentType: 'video',
    description: '',
    coverImage: '',
    heroId: null,
    mapId: null,
    weaponId: null,
    positionId: null,
    videoUrl: '',
    videoDuration: null,
    videoSize: null,
    contentBody: '',
    tags: [],
    isFeatured: false,
    isOfficial: false,
    sortOrder: 0,
    status: 0
  })
  
  // 重置图片
  selectedFile.value = null
  imageUrl.value = ''
  
  // 重置视频
  selectedVideoFile.value = null
  videoUrl.value = ''

  // 重置步骤
  articleSteps.value = []
  
  formRef.value?.clearValidate()
}

// 获取选项数据
const loadOptions = async () => {
  try {
    // 直接使用列表接口
    const { getAllHeroes, getAllMaps, getAllWeapons, getAllPositions } = await import('@/api/gameData')
    
    // 获取英雄列表
    try {
      const heroRes = await getAllHeroes()
      console.log('英雄数据:', heroRes)
      if (heroRes.code === 200 && heroRes.data) {
        heroOptions.value = heroRes.data.map(hero => ({
          value: hero.id,
          label: hero.heroName || hero.hero_name
        }))
      }
    } catch (error) {
      console.error('获取英雄列表失败:', error)
    }
    
    // 获取地图列表
    try {
      const mapRes = await getAllMaps()
      console.log('地图数据:', mapRes)
      if (mapRes.code === 200 && mapRes.data) {
        mapOptions.value = mapRes.data.map(map => ({
          value: map.id,
          label: map.mapName || map.map_name
        }))
      }
    } catch (error) {
      console.error('获取地图列表失败:', error)
    }
    
    // 获取武器列表
    try {
      const weaponRes = await getAllWeapons()
      console.log('武器数据:', weaponRes)
      if (weaponRes.code === 200 && weaponRes.data) {
        weaponOptions.value = weaponRes.data.map(weapon => ({
          value: weapon.id,
          label: weapon.weaponName || weapon.weapon_name
        }))
      }
    } catch (error) {
      console.error('获取武器列表失败:', error)
    }
    
    // 获取点位列表
    try {
      const positionRes = await getAllPositions()
      console.log('点位数据:', positionRes)
      if (positionRes.code === 200 && positionRes.data) {
        // 处理分页返回的数据（从 records 中提取）
        const positionList = positionRes.data.records || positionRes.data
        positionOptions.value = positionList.map(position => ({
          value: position.id,
          label: position.positionName || position.position_name
        }))
      }
    } catch (error) {
      console.error('获取点位列表失败:', error)
    }
    
    // 暂时使用静态标签数据
    tagOptions.value = [
      { value: '常用', label: '常用' },
      { value: '进攻', label: '进攻' },
      { value: '防守', label: '防守' },
      { value: '烟雾', label: '烟雾' },
      { value: '闪光', label: '闪光' },
      { value: '教学', label: '教学' },
      { value: '新手向', label: '新手向' },
      { value: '进阶', label: '进阶' },
      { value: '职业', label: '职业' }
    ]
    
    console.log('选项加载完成:', {
      heroes: heroOptions.value.length,
      maps: mapOptions.value.length,
      weapons: weaponOptions.value.length,
      positions: positionOptions.value.length
    })
  } catch (error) {
    console.error('获取选项数据失败', error)
    ElMessage.error('获取选项数据失败，请刷新重试')
  }
}

// 监听内容变化
watch(() => props.content, (newVal) => {
  if (newVal) {
    Object.assign(formData, {
      ...newVal,
      tags: newVal.tags || []
    })
    // 如果有封面图片，显示预览
    if (newVal.coverImage) {
      imageUrl.value = newVal.coverImage
    }
    if (newVal.videoUrl) {
      videoUrl.value = newVal.videoUrl // 远程视频地址
      selectedVideoFile.value = null
    } else {
      videoUrl.value = ''
      selectedVideoFile.value = null
    }
    // 解析图文步骤，如果 contentBody 是 JSON，则试着解析为步骤数组
      if (newVal.contentType === 'article' || newVal.contentType === 'mixed') {
        const body = newVal.contentBody || ''
        if (body) {
          try {
            const parsed = JSON.parse(body)
            // 支持两种形式：直接数组 或 { steps: [...] }
            let steps = []
            if (Array.isArray(parsed)) {
              steps = parsed
            } else if (parsed && Array.isArray(parsed.steps)) {
              steps = parsed.steps
            }

            if (steps.length) {
              // 规范化字段：兼容旧的 content 字段，统一为 description
              articleSteps.value = steps.map(s => ({
                title: s.title || s.name || '',
                description: s.description || s.content || s.desc || '',
                image: s.image || s.img || ''
              }))
            } else {
              // 如果解析后没有 steps 数组，则把原文本作为单一步骤的 description
              articleSteps.value = [{ title: '', description: body, image: '' }]
            }
          } catch (e) {
            // 不是 JSON，作为单一步骤的文字内容
            articleSteps.value = [{ title: '', description: body, image: '' }]
          }
        } else {
          articleSteps.value = []
        }
      } else {
        articleSteps.value = []
      }
  } else {
    resetForm()
  }
}, { immediate: true })

// 选择图片
const selectImage = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  // 验证文件
  const isLt10M = file.size / 1024 / 1024 < 10
  const fileName = file.name.toLowerCase()
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))

  if (!hasValidExtension) {
    ElMessage.error('只能上传 JPG/PNG/GIF/WebP 格式的图片！')
    return
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！')
    return
  }
  
  // 保存文件
  selectedFile.value = file
  
  // 生成预览
  const reader = new FileReader()
  reader.onload = (e) => {
    imageUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// 移除图片
const removeImage = () => {
  selectedFile.value = null
  imageUrl.value = ''
  formData.coverImage = ''
  // 清空文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 上传图片到服务器
const uploadImage = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileType', 'image')
  
  try {
    const response = await fetch(uploadUrl.value, {
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
    console.error('上传错误:', error)
    throw error
  }
}

// 上传视频到服务器
const uploadVideo = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('fileType', 'video')
  try {
    const response = await fetch(uploadUrl.value, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      },
      body: formData
    })
    const result = await response.json()
    if (result.code === 200 && result.data) {
      return result.data // 返回视频URL
    } else {
      throw new Error(result.message || '视频上传失败')
    }
  } catch (error) {
    console.error('上传视频错误:', error)
    throw error
  }
}

// 提交表单
const handleSubmit = async () => {
  loading.value = true
  try {
    // 1. 如果有新选择的视频，先上传
    if (selectedVideoFile.value) {
      ElMessage.info('正在上传视频...')
      const remotePath = await uploadVideo(selectedVideoFile.value)
      formData.videoUrl = remotePath // 赋值为相对路径
    }

    // 2. 如果有新选择的图片，先上传
    let coverImageUrl = formData.coverImage
    if (selectedFile.value) {
      ElMessage.info('正在上传封面图片...')
      coverImageUrl = await uploadImage(selectedFile.value)
      formData.coverImage = coverImageUrl
    }

    // 2.5 处理图文步骤：上传步骤图片并把步骤序列化为 contentBody
    if (formData.contentType === 'article' || formData.contentType === 'mixed') {
      // 遍历步骤，如有本地文件（_file），先上传替换为远程路径
          for (let i = 0; i < articleSteps.value.length; i++) {
            const step = articleSteps.value[i]
            if (step && step._file) {
              try {
                ElMessage.info(`正在上传步骤 ${i + 1} 的图片...`)
                const remote = await uploadImage(step._file)
                step.image = remote
                // 清理临时字段
                delete step._file
                delete step.imagePreview
              } catch (err) {
                console.error('步骤图片上传失败', err)
                throw err
              }
            }
            // 确保字段名规范：description 而非 content
            if (step && step.content) {
              step.description = step.content
              delete step.content
            }
          }

          // 将步骤数组包装为 { steps: [...] } 并序列化为 JSON 存入 contentBody
          try {
            const normalized = articleSteps.value.map(s => ({
              title: s.title || '',
              description: s.description || '',
              image: s.image || ''
            }))
            formData.contentBody = JSON.stringify({ steps: normalized })
          } catch (err) {
            console.error('序列化步骤失败', err)
            throw new Error('步骤内容序列化失败')
          }
    }

    // 3. 校验表单
    const valid = await formRef.value.validate()
    if (!valid) return

    // 4. 准备提交数据
    const contentData = {
      title: formData.title,
      contentType: formData.contentType,
      description: formData.description,
      coverImage: coverImageUrl,
      heroId: formData.heroId,
      mapId: formData.mapId,
      weaponId: formData.weaponId,
      positionId: formData.positionId,
      videoUrl: formData.videoUrl,
      videoDuration: formData.videoDuration,
      videoSize: formData.videoSize,
      contentBody: formData.contentBody,
      isFeatured: formData.isFeatured ? 1 : 0,
      isOfficial: formData.isOfficial ? 1 : 0,
      sortOrder: formData.sortOrder,
      status: formData.status
    }
    
    // 根据后端期望的格式包装数据
    const submitData = {
      content: contentData,
      tagIds: []
    }
    
    if (isEdit.value) {
      await updateContent(props.content.id, submitData)
      ElMessage.success('更新成功')
    } else {
      await createContent(submitData)
      ElMessage.success('创建成功')
    }
    
    emit('success')
    handleClose()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error(error.message || '操作失败')
  } finally {
    loading.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  if (!isEdit.value) {
    resetForm()
  }
  dialogVisible.value = false
}

// 组件挂载
onMounted(() => {
  loadOptions()
})

// 选择视频
const selectVideo = () => {
  videoInput.value.click()
}

// 处理视频选择
const handleVideoChange = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // 校验
  const isVideo = file.type.startsWith('video/')
  const isLt200M = file.size / 1024 / 1024 < 200
  if (!isVideo) {
    ElMessage.error('只能上传视频文件！')
    return
  }
  if (!isLt200M) {
    ElMessage.error('视频大小不能超过200MB！')
    return
  }

  selectedVideoFile.value = file

  // 本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    videoUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

// 移除视频
const removeVideo = () => {
  selectedVideoFile.value = null
  videoUrl.value = ''
  formData.videoUrl = ''
  if (videoInput.value) {
    videoInput.value.value = ''
  }
}

// 步骤编辑方法
const addStep = () => {
  articleSteps.value.push({ title: '', description: '', image: '' })
}

const removeStep = (index) => {
  if (index >= 0 && index < articleSteps.value.length) {
    articleSteps.value.splice(index, 1)
  }
}

const moveStepUp = (index) => {
  if (index > 0) {
    const arr = articleSteps.value
    const temp = arr[index - 1]
    arr[index - 1] = arr[index]
    arr[index] = temp
  }
}

const moveStepDown = (index) => {
  if (index < articleSteps.value.length - 1) {
    const arr = articleSteps.value
    const temp = arr[index + 1]
    arr[index + 1] = arr[index]
    arr[index] = temp
  }
}

const selectStepImage = (index) => {
  currentStepImageIndex.value = index
  if (stepFileInput.value) stepFileInput.value.click()
}

const handleStepFileChange = (event) => {
  const file = event.target.files && event.target.files[0]
  if (!file) return

  // 验证文件大小和类型（与封面一致）
  const isLt10M = file.size / 1024 / 1024 < 10
  const fileName = file.name.toLowerCase()
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))

  if (!hasValidExtension) {
    ElMessage.error('只能上传 JPG/PNG/GIF/WebP 格式的图片！')
    return
  }
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB！')
    return
  }

  const idx = currentStepImageIndex.value
  if (idx == null || idx < 0 || idx >= articleSteps.value.length) return

  const reader = new FileReader()
  reader.onload = (e) => {
    // 将本地预览和文件保存到步骤临时字段
    articleSteps.value[idx].imagePreview = e.target.result
    articleSteps.value[idx]._file = file
  }
  reader.readAsDataURL(file)

  // 清空输入，方便再次选择同一文件
  if (stepFileInput.value) stepFileInput.value.value = ''
}

const removeStepImage = (index) => {
  const step = articleSteps.value[index]
  if (!step) return
  delete step._file
  delete step.imagePreview
  step.image = ''
}

// 简单的从 Markdown 导入（按空行拆分为多步）
const importMarkdown = () => {
  if (!formData.contentBody) {
    ElMessage.info('请先粘贴或输入 Markdown 内容到正文后再导入（此操作不会覆盖已有步骤，会追加）')
    return
  }
  const blocks = formData.contentBody.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean)
  blocks.forEach(b => {
    articleSteps.value.push({ title: '', description: b, image: '' })
  })
  ElMessage.success(`已导入 ${blocks.length} 个步骤`)
}
</script>

<style lang="scss" scoped>
.image-uploader {
  .image-preview {
    position: relative;
    width: 150px;
    height: 150px;
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
    width: 150px;
    height: 150px;
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

.video-uploader {
  .video-preview {
    position: relative;
    width: 200px;
    height: 120px;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .video-actions {
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

    &:hover .video-actions {
      opacity: 1;
    }
  }
}

.el-upload__tip {
  color: #999;
  font-size: 12px;
  margin-top: 5px;
}
</style>