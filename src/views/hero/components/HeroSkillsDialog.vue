<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`${hero?.heroName || ''} - 技能信息`"
    width="800px"
    @close="handleClose"
  >
    <div v-loading="loading" class="skills-container">
      <el-alert
        v-if="!canEdit"
        title="提示"
        type="info"
        :closable="false"
        style="margin-bottom: 20px"
      >
        当前为查看模式，如需修改技能信息，请联系管理员开放相关接口
      </el-alert>
      <el-form ref="formRef" :model="formData" label-width="80px">
        <div v-for="(skill, index) in formData.skills" :key="skill.skillKey" class="skill-item">
          <el-divider content-position="left">
            <el-tag :type="getSkillKeyType(skill.skillKey)" size="large">
              {{ skill.skillKey }} 技能
            </el-tag>
          </el-divider>
          <el-form-item label="技能名称">
            <template v-if="canEdit">
              <el-input v-model="skill.skillName" placeholder="请输入技能名称" />
            </template>
            <template v-else>
              <span>{{ skill.skillName || '—' }}</span>
            </template>
          </el-form-item>
          <!-- 图标上传与预览 -->
          <el-form-item label="技能图标">
  <div>
    <input type="file" accept="image/*" style="display:none" :ref="'iconInput' + index" @change="e => handleIconSelect(e, skill)" />
    <el-button v-if="canEdit" size="small" type="primary" @click="$refs['iconInput' + index][0].click()">选择图片</el-button>
    <el-button v-if="canEdit && (skill.skillIconPreview || skill.skillIcon)" size="small" @click="() => removeIcon(skill)">移除</el-button>
    <el-image v-if="skill.skillIconPreview" :src="skill.skillIconPreview" style="width:60px;height:60px" />
    <el-image v-else-if="skill.skillIcon" :src="skill.skillIcon" style="width:60px;height:60px" />
  </div>
</el-form-item>
          <!-- 视频上传与预览 -->
          <el-form-item label="技能视频">
            <div>
              <input type="file" accept="video/*" style="display:none" :ref="'videoInput' + index" @change="e => handleVideoSelect(e, skill)" />
              <el-button v-if="canEdit" size="small" type="primary" @click="$refs['videoInput' + index][0].click()">选择视频</el-button>
              <el-button v-if="canEdit && skill.videoFile" size="small" @click="() => uploadVideo(skill)">上传视频</el-button>
              <el-button v-if="canEdit && (skill.videoPreview || skill.videoUrl)" size="small" @click="() => removeVideo(skill)">移除</el-button>
              <video v-if="skill.videoPreview" :src="skill.videoPreview" controls style="width:120px;height:80px" />
              <video v-else-if="skill.videoUrl" :src="skill.videoUrl" controls style="width:120px;height:80px" />
            </div>
          </el-form-item>
          <el-form-item label="技能描述">
            <template v-if="canEdit">
              <el-input v-model="skill.description" type="textarea" :rows="2" placeholder="请输入技能描述" :disabled="!canEdit" />
            </template>
            <template v-else>
              <div style="white-space: pre-line;">{{ skill.description || '—' }}</div>
            </template>
          </el-form-item>
          <el-form-item label="使用技巧">
            <template v-if="canEdit">
              <el-input v-model="skill.tips" type="textarea" :rows="2" placeholder="请输入使用技巧" :disabled="!canEdit" />
            </template>
            <template v-else>
              <div style="white-space: pre-line;">{{ skill.tips || '—' }}</div>
            </template>
          </el-form-item>
          <el-row>
            <el-col :span="12">
              <el-form-item label="冷却时间" :prop="`skills.${index}.cooldown`">
                <template v-if="canEdit">
                  <el-input v-model="skill.cooldown" placeholder="如：45秒" :disabled="!canEdit" />
                </template>
                <template v-else>
                  <span>{{ skill.cooldown || '—' }}</span>
                </template>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="技能花费" :prop="`skills.${index}.cost`">
                <template v-if="canEdit">
                  <el-input v-model="skill.cost" placeholder="如：200" :disabled="!canEdit" />
                </template>
                <template v-else>
                  <span>{{ skill.cost || '—' }}</span>
                </template>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
        <el-empty v-if="formData.skills.length === 0" description="暂无技能信息" />
      </el-form>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button v-if="canEdit" type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getHeroSkills, saveHeroSkills } from '@/api/gameData'
import { useUserStore } from '@/stores/user'
import { uploadImage, uploadVideo } from '@/api/file'

const userStore = useUserStore()
const uploadUrl = '/api/upload' // 按实际后端接口地址填写

const props = defineProps({
  visible: { type: Boolean, default: false },
  hero: { type: Object, default: null },
  canEdit: { type: Boolean, default: false }
})
const emit = defineEmits(['update:visible', 'success'])
const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()
const formData = reactive({ skills: [] })

// 默认技能配置，增加本地预览和文件对象字段
const defaultSkills = [
  { skillKey: 'C', skillName: '', skillIcon: '', skillIconFile: null, skillIconPreview: '', videoUrl: '', videoFile: null, videoPreview: '', description: '', tips: '', cooldown: '', cost: '' },
  { skillKey: 'Q', skillName: '', skillIcon: '', skillIconFile: null, skillIconPreview: '', videoUrl: '', videoFile: null, videoPreview: '', description: '', tips: '', cooldown: '', cost: '' },
  { skillKey: 'E', skillName: '', skillIcon: '', skillIconFile: null, skillIconPreview: '', videoUrl: '', videoFile: null, videoPreview: '', description: '', tips: '', cooldown: '', cost: '' },
  { skillKey: 'X', skillName: '', skillIcon: '', skillIconFile: null, skillIconPreview: '', videoUrl: '', videoFile: null, videoPreview: '', description: '', tips: '', cooldown: '', cost: '' }
]

watch(() => props.visible, (val) => {
  dialogVisible.value = val
  if (val && props.hero) {
    loadSkills()
  }
})
watch(dialogVisible, (val) => {
  emit('update:visible', val)
})

const loadSkills = async () => {
  loading.value = true
  try {
    const res = await getHeroSkills(props.hero.id)
    if (res.code === 200) {
      if (res.data && res.data.length > 0) {
        // 补充本地预览字段
        formData.skills = res.data.map(skill => ({
          ...skill,
          skillIconFile: null,
          skillIconPreview: '',
          videoFile: null,
          videoPreview: ''
        }))
      } else {
        formData.skills = JSON.parse(JSON.stringify(defaultSkills))
      }
    } else {
      ElMessage.error('加载技能数据失败')
      formData.skills = []
    }
  } catch (error) {
    console.error('加载技能数据失败:', error)
    ElMessage.error('加载技能数据失败')
    formData.skills = []
  } finally {
    loading.value = false
  }
}

// 图片
const handleIconSelect = async (event, skill) => {
  const file = event.target.files[0]
  if (!file) return
  // 本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    skill.skillIconPreview = e.target.result
  }
  reader.readAsDataURL(file)
  // 立即上传
  try {
    const res = await uploadImage(file)
    if (res.code === 200 && res.data) {
      skill.skillIcon = res.data
      ElMessage.success('图片上传成功')
    } else {
      ElMessage.error(res.message || '图片上传失败')
    }
  } catch (e) {
    ElMessage.error('图片上传失败')
  }
}
const uploadIcon = async (skill) => {
  if (!skill.skillIconFile) return
  const formDataObj = new FormData()
  formDataObj.append('file', skill.skillIconFile)
  formDataObj.append('fileType', 'image')
  const response = await fetch(uploadUrl, {
    method: 'POST',
    headers: { Authorization: `Bearer ${userStore.token}` },
    body: formDataObj
  })
  const result = await response.json()
  if (result.code === 200 && result.data?.url) {
    skill.skillIcon = result.data.url
    ElMessage.success('图片上传成功')
  } else {
    ElMessage.error(result.message || '图片上传失败')
  }
}
const removeIcon = (skill) => {
  skill.skillIconFile = null
  skill.skillIconPreview = ''
  skill.skillIcon = ''
}
  // 视频
const handleVideoSelect = async (event, skill) => {
  const file = event.target.files[0]
  if (!file) return
  // 本地预览
  const reader = new FileReader()
  reader.onload = (e) => {
    skill.videoPreview = e.target.result
  }
  reader.readAsDataURL(file)
  // 立即上传
  try {
    const res = await uploadVideo(file)
    if (res.code === 200 && res.data) {
      skill.videoUrl = res.data
      ElMessage.success('视频上传成功')
    } else {
      ElMessage.error(res.message || '视频上传失败')
    }
  } catch (e) {
    ElMessage.error('视频上传失败')
  }
}
const removeVideo = (skill) => {
  skill.videoFile = null
  skill.videoPreview = ''
  skill.videoUrl = ''
}

const handleClose = () => {
  formRef.value?.resetFields()
}
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true
    // 只保留后端需要的字段
    const submitSkills = formData.skills.map(skill => ({
      skillKey: skill.skillKey,
      skillName: skill.skillName,
      skillIcon: skill.skillIcon,
      videoUrl: skill.videoUrl,
      description: skill.description,
      tips: skill.tips,
      cooldown: skill.cooldown,
      cost: skill.cost,
      sortOrder: skill.sortOrder
    }))
    const res = await saveHeroSkills(props.hero.id, submitSkills)
    if (res.code === 200) {
      ElMessage.success('技能信息保存成功')
      dialogVisible.value = false
      emit('success')
    } else {
      ElMessage.error(res.message || '保存失败')
    }
  } catch (error) {
    if (error !== false) {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    }
  } finally {
    loading.value = false
  }
}
const getSkillKeyType = (key) => {
  const typeMap = { 'C': 'primary', 'Q': 'success', 'E': 'warning', 'X': 'danger' }
  return typeMap[key] || 'info'
}
</script>
<style lang="scss" scoped>
.skills-container {
  max-height: 60vh;
  overflow-y: auto;
  
  .skill-item {
    margin-bottom: 30px;
    padding: 20px;
    background-color: #f5f7fa;
    border-radius: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .el-divider {
      margin-top: 0;
    }
  }
  
  .skill-icon-container {
    .icon-error {
      width: 60px;
      height: 60px;
      background-color: #e4e7ed;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c0c4cc;
      font-size: 20px;
      border-radius: 4px;
    }
  }
}
</style>
