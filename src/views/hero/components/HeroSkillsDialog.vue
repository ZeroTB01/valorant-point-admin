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
      
      <el-form
        ref="formRef"
        :model="formData"
        label-width="80px"
      >
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
          
          <el-form-item
            label="技能图标"
            :prop="`skills.${index}.skillIcon`"
          >
            <div class="skill-icon-container">
              <el-input 
                v-model="skill.skillIcon" 
                placeholder="请输入技能图标URL" 
                :disabled="!canEdit"
                style="margin-bottom: 10px"
              />
              <el-image
                v-if="skill.skillIcon"
                :src="skill.skillIcon"
                style="width: 60px; height: 60px"
                fit="cover"
                :preview-src-list="[skill.skillIcon]"
              >
                <template #error>
                  <div class="icon-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
          </el-form-item>
          
          <el-form-item label="技能描述">
            <template v-if="canEdit">
              <el-input
                v-model="skill.description"
                type="textarea"
                :rows="2"
                placeholder="请输入技能描述"
                :disabled="!canEdit"
              />
            </template>
            <template v-else>
              <div style="white-space: pre-line;">{{ skill.description || '—' }}</div>
            </template>
          </el-form-item>
          
          <el-form-item label="使用技巧">
            <template v-if="canEdit">
              <el-input
                v-model="skill.tips"
                type="textarea"
                :rows="2"
                placeholder="请输入使用技巧"
                :disabled="!canEdit"
              />
            </template>
            <template v-else>
              <div style="white-space: pre-line;">{{ skill.tips || '—' }}</div>
            </template>
          </el-form-item>
          
          <el-row>
            <el-col :span="12">
              <el-form-item
                label="冷却时间"
                :prop="`skills.${index}.cooldown`"
              >
                <template v-if="canEdit">
                  <el-input v-model="skill.cooldown" placeholder="如：45秒" :disabled="!canEdit" />
                </template>
                <template v-else>
                  <span>{{ skill.cooldown || '—' }}</span>
                </template>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item
                label="技能花费"
                :prop="`skills.${index}.cost`"
              >
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
        
        <!-- 如果没有技能数据 -->
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
import { ref, watch, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { getHeroSkills, saveHeroSkills } from '@/api/gameData'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  hero: {
    type: Object,
    default: null
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'success'])

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref()

const formData = reactive({
  skills: []
})

// 默认技能配置
const defaultSkills = [
  { skillKey: 'C', skillName: '', skillIcon: '', description: '', tips: '', cooldown: '', cost: '' },
  { skillKey: 'Q', skillName: '', skillIcon: '', description: '', tips: '', cooldown: '', cost: '' },
  { skillKey: 'E', skillName: '', skillIcon: '', description: '', tips: '', cooldown: '', cost: '' },
  { skillKey: 'X', skillName: '', skillIcon: '', description: '', tips: '', cooldown: '', cost: '' }
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

// 加载技能数据
const loadSkills = async () => {
  loading.value = true
  try {
    const res = await getHeroSkills(props.hero.id)
    if (res.code === 200) {
      if (res.data && res.data.length > 0) {
        formData.skills = res.data
      } else {
        // 如果没有技能数据，使用默认模板
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

// 提交保存
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    loading.value = true
    const res = await saveHeroSkills(props.hero.id, formData.skills)
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

// 关闭对话框
const handleClose = () => {
  formRef.value?.resetFields()
}

// 获取技能键位类型
const getSkillKeyType = (key) => {
  const typeMap = {
    'C': 'primary',
    'Q': 'success',
    'E': 'warning',
    'X': 'danger'
  }
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
