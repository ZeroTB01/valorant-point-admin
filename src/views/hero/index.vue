<template>
  <div class="hero-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="英雄名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入英雄名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增英雄</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="头像" width="100">
          <template #default="{ row }">
            <el-image
              v-if="row.avatar"
              :src="row.avatar"
              style="width: 60px; height: 60px"
              fit="cover"
            >
              <template #error>
                <div class="image-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="image-error">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="heroName" label="英雄名称" />
        <el-table-column prop="heroKey" label="英雄标识" />
        <el-table-column prop="heroType" label="英雄类型">
          <template #default="{ row }">
            {{ formatHeroType(row.heroType) }}
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" width="120">
          <template #default="{ row }">
            <el-rate
              v-model="row.difficulty"
              disabled
              :max="5"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="handleStatusChange(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>

            <el-button type="warning" size="small" @click="openSkillsDialog(row, true)">
              编辑技能
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pageParams.current"
        v-model:page-size="pageParams.size"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next"
        @size-change="getList"
        @current-change="getList"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑英雄' : '新增英雄'"
      width="600px"
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
            :disabled="false"
          />
        </el-form-item>
        <el-form-item label="英雄名称" prop="heroName">
          <el-input v-model="formData.heroName" placeholder="请输入英雄名称" :disabled="false" />
        </el-form-item>
        <el-form-item label="英雄类型" prop="heroType">
          <el-select v-model="formData.heroType" placeholder="请选择英雄类型" :disabled="false">
            <el-option label="决斗者" value="duelist" />
            <el-option label="先锋" value="initiator" />
            <el-option label="控场者" value="controller" />
            <el-option label="哨卫" value="sentinel" />
          </el-select>
        </el-form-item>
        <el-form-item label="头像URL" prop="avatar">
          <el-input v-model="formData.avatar" placeholder="请输入头像图片URL" :disabled="false" />
        </el-form-item>
        <el-form-item label="英雄描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入英雄描述"
            :disabled="false"
          />
        </el-form-item>
        <el-form-item label="难度等级" prop="difficulty">
          <el-rate v-model="formData.difficulty" :max="5" :disabled="false" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="formData.sortOrder" :min="0" :disabled="false" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status" :disabled="false">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>

    <!-- 技能弹窗组件 -->
    <HeroSkillsDialog
      v-model:visible="skillsDialogVisible"
      :hero="skillsDialogHero"
      :canEdit="skillsDialogCanEdit"
      @success="handleSkillsSaved"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import HeroSkillsDialog from './components/HeroSkillsDialog.vue'
import {
  getHeroList,
  createHero,
  updateHero,
  updateHeroStatus
} from '@/api/gameData'

// 数据状态
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

// 搜索表单
const searchForm = reactive({
  keyword: ''
})

// 分页参数
const pageParams = reactive({
  current: 1,
  size: 20
})

// 对话框状态
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()

// 表单数据
const formData = reactive({
  heroKey: '',
  heroName: '',
  heroType: 'duelist',
  avatar: '',
  description: '',
  difficulty: 3,
  sortOrder: 0,
  status: 1
})

// 表单验证规则
const formRules = {
  heroKey: [
    { required: true, message: '请输入英雄标识', trigger: 'blur' }
  ],
  heroName: [
    { required: true, message: '请输入英雄名称', trigger: 'blur' }
  ],
  heroType: [
    { required: true, message: '请选择英雄类型', trigger: 'change' }
  ],
  avatar: [
    { required: true, message: '请输入头像URL', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入英雄描述', trigger: 'blur' }
  ]
}

// 技能弹窗相关
const skillsDialogVisible = ref(false)
const skillsDialogHero = ref(null)
const skillsDialogCanEdit = ref(false)

// 打开技能弹窗
function openSkillsDialog(hero, canEdit = false) {
  skillsDialogHero.value = hero
  skillsDialogCanEdit.value = canEdit
  skillsDialogVisible.value = true
}

// 技能保存成功后刷新列表
function handleSkillsSaved() {
  getList()
}

// 获取列表
const getList = async () => {
  loading.value = true
  try {
    const res = await getHeroList({
      ...searchForm,
      ...pageParams
    })
    
    if (res.code === 200 && res.data) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      tableData.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取英雄列表失败:', error)
    ElMessage.error('获取英雄列表失败')
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageParams.current = 1
  getList()
}

// 重置
const handleReset = () => {
  searchForm.keyword = ''
  handleSearch()
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  // 重置表单数据
  Object.assign(formData, {
    heroKey: '',
    heroName: '',
    heroType: 'duelist',
    avatar: '',
    description: '',
    difficulty: 3,
    sortOrder: 0,
    status: 1
  })
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  isEdit.value = true
  Object.assign(formData, row)
  dialogVisible.value = true
}

// 仅查看
const handleViewOnly = (row) => {
  ElMessage.info('查看功能开发中')
}

// 状态改变
const handleStatusChange = async (row) => {
  try {
    const res = await updateHeroStatus(row.id, row.status)
    if (res.code === 200) {
      ElMessage.success('状态更新成功')
    } else {
      // 恢复原状态
      row.status = row.status === 1 ? 0 : 1
      ElMessage.error(res.message || '状态更新失败')
    }
  } catch (error) {
    console.error('状态更新失败:', error)
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('状态更新失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    let res
    if (isEdit.value) {
      // 编辑模式，调用更新接口
      res = await updateHero(formData.id, formData)
    } else {
      // 新增模式
      res = await createHero(formData)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
      getList()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    if (error !== false) {
      ElMessage.error('提交失败')
    }
  }
}

// 格式化英雄类型
const formatHeroType = (type) => {
  const typeMap = {
    'duelist': '决斗者',
    'initiator': '先锋',
    'controller': '控场者',
    'sentinel': '哨卫'
  }
  return typeMap[type] || type
}

// 初始化
onMounted(() => {
  getList()
})
</script>

<style lang="scss" scoped>
.hero-management {
  .search-card {
    margin-bottom: 20px;
  }
  
  .table-card {
    .el-pagination {
      margin-top: 20px;
      justify-content: flex-end;
    }
  }
  
  .image-error {
    width: 60px;
    height: 60px;
    background-color: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c0c4cc;
    font-size: 20px;
  }
}
</style>