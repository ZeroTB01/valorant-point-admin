<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑英雄' : '新增英雄'"
    width="600px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="英雄标识" prop="heroKey">
        <el-input
          v-model="formData.heroKey"
          placeholder="请输入英雄标识（英文）"
          :disabled="isEdit"
        />
        <div class="form-tip">英雄的唯一标识，只能包含小写字母，创建后不可修改</div>
      </el-form-item>
      
      <el-form-item label="英雄名称" prop="heroName">
        <el-input
          v-model="formData.heroName"
          placeholder="请输入英雄名称（中文）"
        />
      </el-form-item>
      
      <el-form-item label="英雄类型" prop="heroType">
        <el-select
          v-model="formData.heroType"
          placeholder="请选择英雄类型"
          style="width: 100%"
        >
          <el-option label="决斗者" value="duelist" />
          <el-option label="先锋" value="initiator" />
          <el-option label="控场者" value="controller" />
          <el-option label="哨卫" value="sentinel" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="头像" prop="avatar">
        <div class="avatar-uploader">
          <el-upload
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
            accept="image/*"
          >
            <img v-if="formData.avatar" :src="formData.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：200x200px，支持 JPG/PNG/GIF/WebP 格式</div>
        </div>
      </el-form-item>
      
      <el-form-item label="英雄描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="请输入英雄描述"
        />
      </el-form-item>
      
      <el-form-item label="难度等级" prop="difficulty">
        <el-rate
          v-model="formData.difficulty"
          :max="5"
          :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
          :texts="['非常简单', '简单', '一般', '困难', '非常困难']"
          show-text
        />
      </el-form-item>
      
      <el-form-item label="排序" prop="sortOrder">
        <el-input-number
          v-model="formData.sortOrder"
          :min="0"
          :max="999"
          controls-position="right"
        />
        <span class="form-tip">数字越小越靠前</span>
      </el-form-item>
      
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio :label="1">启用</el-radio>
          <el-radio :label="0">禁用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? '保存' : '创建' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { createHero, updateHero } from '@/api/gameData'
import { uploadImage } from '@/api/file'
import { useUserStore } from '@/stores/user'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  hero: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:visible', 'success'])

const userStore = useUserStore()
const formRef = ref()
const loading = ref(false)

// 计算属性
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val)
})

const isEdit = computed(() => !!props.hero?.id)

// 上传配置
const uploadUrl = computed(() => `${import.meta.env.VITE_API_BASE_URL}/file/upload-image`)
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${userStore.token}`
}))

// 表单数据
const formData = reactive({
  heroKey: '',
  heroName: '',
  heroType: '',
  avatar: '',
  description: '',
  difficulty: 3,
  sortOrder: 0,
  status: 1
})

// 表单验证规则
const formRules = {
  heroKey: [
    { required: true, message: '请输入英雄标识', trigger: 'blur' },
    { pattern: /^[a-z]+$/, message: '只能包含小写字母', trigger: 'blur' }
  ],
  heroName: [
    { required: true, message: '请输入英雄名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  heroType: [
    { required: true, message: '请选择英雄类型', trigger: 'change' }
  ],
  avatar: [
    { required: true, message: '请上传英雄头像', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入英雄描述', trigger: 'blur' },
    { min: 10, max: 200, message: '长度在 10 到 200 个字符', trigger: 'blur' }
  ],
  difficulty: [
    { required: true, message: '请选择难度等级', trigger: 'change' }
  ]
}

// 监听属性变化
watch(() => props.hero, (val) => {
  if (val) {
    Object.assign(formData, {
      heroKey: val.heroKey || '',
      heroName: val.heroName || '',
      heroType: val.heroType || '',
      avatar: val.avatar || '',
      description: val.description || '',
      difficulty: val.difficulty || 3,
      sortOrder: val.sortOrder || 0,
      status: val.status ?? 1
    })
  }
}, { immediate: true })

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isImage = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 头像上传成功
const handleAvatarSuccess = (response) => {
  if (response.code === 200 && response.data) {
    formData.avatar = response.data.originalUrl || response.data
    ElMessage.success('头像上传成功')
  } else {
    ElMessage.error(response.message || '头像上传失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  const valid = await formRef.value.validate()
  if (!valid) return
  
  loading.value = true
  
  try {
    if (isEdit.value) {
      await updateHero(props.hero.id, formData)
      ElMessage.success('更新成功')
    } else {
      await createHero(formData)
      ElMessage.success('创建成功')
    }
    
    emit('success')
    dialogVisible.value = false
  } catch (error) {
    console.error('保存英雄失败:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 取消
const handleCancel = () => {
  dialogVisible.value = false
}

// 对话框关闭后重置
const handleClosed = () => {
  formRef.value?.resetFields()
  Object.assign(formData, {
    heroKey: '',
    heroName: '',
    heroType: '',
    avatar: '',
    description: '',
    difficulty: 3,
    sortOrder: 0,
    status: 1
  })
}
</script>

<style lang="scss" scoped>
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: all 0.3s;
    
    &:hover {
      border-color: #409eff;
    }
  }
  
  .avatar {
    width: 120px;
    height: 120px;
    display: block;
    object-fit: cover;
  }
  
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 120px;
    height: 120px;
    text-align: center;
    line-height: 120px;
  }
  
  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 10px;
  }
}
</style>