<template>
  <div class="weapon-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="武器名称">
          <el-input v-model="searchForm.keyword" placeholder="请输入武器名称" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增武器</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格数据 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="图片" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.imageUrl"
              class="weapon-img"
              fit="cover"
              :preview-src-list="[row.imageUrl]"
              preview-teleported
            >
              <template #error>
                <div class="image-error"><el-icon><Picture /></el-icon></div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="weaponName" label="名称" />
        <el-table-column prop="weaponType" label="类型">
          <template #default="{ row }">
            {{ formatWeaponType(row.weaponType) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="80" />
        <el-table-column label="伤害">
          <template #default="{ row }">
            头: {{ row.damageHead }} / 身: {{ row.damageBody }} / 腿: {{ row.damageLeg }}
          </template>
        </el-table-column>
        <el-table-column prop="fireRate" label="射速(/秒)" width="100" />
        <el-table-column prop="magazineSize" label="弹夹" width="80" />
        <el-table-column prop="wallPenetration" label="穿透力" width="100">
          <template #default="{ row }">
            <el-tag :type="wallColor(row.wallPenetration)">
              {{ formatPenetration(row.wallPenetration) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="160">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
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

    <WeaponEditDialog
      :visible="addDialogVisible"
      :isEdit="false"
      @update:visible="val => addDialogVisible = val"
      @submit="handleAddSubmit"
    />
    <WeaponEditDialog
      :visible="editDialogVisible"
      :isEdit="true"
      :initData="editFormData"
      @update:visible="val => editDialogVisible = val"
      @submit="handleEditSubmit"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import WeaponEditDialog from './components/WeaponEditDialog.vue'
import { getWeaponList, createWeapon, updateWeapon, deleteWeapon } from '@/api/gameData'
import { ElMessageBox } from 'element-plus'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const addDialogVisible = ref(false)
const editDialogVisible = ref(false)
const editFormData = ref(null)

const searchForm = reactive({
  keyword: ''
})

const pageParams = reactive({
  current: 1,
  size: 10
})


// 中文映射
const formatWeaponType = (type) => {
  const map = {
    rifle: '步枪',
    shotgun: '霰弹枪',
    machine_gun: '机枪',
    sniper: '狙击枪',
    sidearm: '手枪',
    melee: '近战武器'
  }
  return map[type] || type
}

const formatPenetration = (level) => {
  return {
    low: '低',
    medium: '中',
    high: '高'
  }[level] || level
}

const wallColor = (level) => {
  return {
    low: 'info',
    medium: 'warning',
    high: 'success'
  }[level] || 'default'
}

const getList = async () => {
  loading.value = true
  try {
    const params = {
      current: pageParams.current,
      size: pageParams.size,
      keyword: searchForm.keyword || ''
    }
    const data = await getWeaponList(params)
    if (data.code === 200 && data.data) {
      tableData.value = data.data.records
      total.value = data.data.total
    } else {
      ElMessage.error(data.message || '获取武器数据失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('请求失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pageParams.current = 1
  getList()
}

const handleReset = () => {
  searchForm.keyword = ''
  handleSearch()
}

const handleAdd = () => {
  addDialogVisible.value = true
}

const handleEdit = (row) => {
  editFormData.value = { ...row }
  editDialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除武器「${row.weaponName}」吗？此操作不可恢复！`,
      '提示',
      { type: 'warning' }
    )
    const data = await deleteWeapon(row.id)
    if (data.code === 200) {
      ElMessage.success('删除成功')
      getList()
    } else {
      ElMessage.error(data.message || '删除失败')
    }
  } catch (e) {
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleAddSubmit = async (formData) => {
  try {
    const data = await createWeapon(formData)
    if (data.code === 200) {
      ElMessage.success('新增成功')
      addDialogVisible.value = false
      getList()
    } else {
      ElMessage.error(data.message || '新增失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('请求失败')
  }
}

const handleEditSubmit = async (formData) => {
  try {
    const data = await updateWeapon(formData.id, formData)
    if (data.code === 200) {
      ElMessage.success('编辑成功')
      editDialogVisible.value = false
      getList()
    } else {
      ElMessage.error(data.message || '编辑失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('请求失败')
  }
}


onMounted(() => {
  getList()
})
</script>

<style scoped>
.weapon-management {
  .search-card {
    margin-bottom: 20px;
  }

  .table-card {
    .el-pagination {
      margin-top: 20px;
      justify-content: flex-end;
    }
  }
}

.weapon-img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  object-position: top;
  border-radius: 6px;
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
</style>
