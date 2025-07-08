<template>
  <div class="map-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="地图名称">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入地图名称"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" @click="handleAdd">新增地图</el-button>
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
        <el-table-column prop="mapName" label="地图名称" />
        <el-table-column prop="mapKey" label="地图标识" />
        <el-table-column prop="mapType" label="地图类型" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">删除</el-button>
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
  </div>
  <MapEditDialog ref="mapEditDialogRef" @success="getList" />
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import MapEditDialog from './components/MapEditDialog.vue'
import { ElMessageBox } from 'element-plus'
import { deleteMap } from '@/api/gameData' // 如果有封装
import { getMapList } from '@/api/gameData'

const mapEditDialogRef = ref()

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const searchForm = reactive({
  keyword: ''
})

const pageParams = reactive({
  current: 1,
  size: 10
})

const getList = async () => {
  loading.value = true
  try {
    const params = {
      current: pageParams.current,
      size: pageParams.size,
      keyword: searchForm.keyword || ''
    }
    const res = await getMapList(params)
    if (res.code === 200 && res.data) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || '获取地图数据失败')
    }
  } catch (err) {
    console.error('地图加载失败:', err)
    ElMessage.error('地图加载失败')
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
  mapEditDialogRef.value.open()
}

const handleEdit = (row) => {
  ElMessage.info(`点击编辑地图: ${row.mapName}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除地图「${row.mapName}」吗？此操作不可恢复！`,
      '提示',
      { type: 'warning' }
    )
    // 调用后端删除接口
    const res = await deleteMap(row.id)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      getList()
    } else {
      ElMessage.error(res.message || '删除失败')
    }
  } catch (e) {
    // 用户取消或请求异常
    if (e !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  getList()
})

async function deleteFileApi(fileUrl) {
  if (!fileUrl) return
  try {
    // 可根据实际情况补全 fileUrl
    const response = await fetch('/api/file/delete?fileUrl=' + encodeURIComponent(fileUrl), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    const result = await response.json()
    if (result.code === 200) {
      ElMessage.success('图片已删除')
    } else {
      ElMessage.warning(result.message || '图片删除失败')
    }
  } catch (error) {
    ElMessage.error('图片删除失败，请检查网络或稍后重试')
  }
}

async function removeMinimap() {
  if (form.minimap && form.minimap !== 'preview') {
    try {
      await ElMessageBox.confirm('确定要删除这张小地图图片吗？', '提示', { type: 'warning' })
      await deleteFileApi(form.minimap)
    } catch {
      // 用户取消
      return
    }
  }
  minimapFile.value = null
  minimapUrl.value = ''
  form.minimap = ''
  if (minimapInput.value) minimapInput.value.value = ''
  formRef.value?.validateField('minimap')
}

async function removeOverview() {
  if (form.overview && form.overview !== 'preview') {
    try {
      await ElMessageBox.confirm('确定要删除这张全景图图片吗？', '提示', { type: 'warning' })
      await deleteFileApi(form.overview)
    } catch {
      // 用户取消
      return
    }
  }
  overviewFile.value = null
  overviewUrl.value = ''
  form.overview = ''
  if (overviewInput.value) overviewInput.value.value = ''
  formRef.value?.validateField('overview')
}
</script>

<style scoped>
.map-management {
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
</style>
