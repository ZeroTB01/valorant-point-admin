<template>
  <div class="position-management">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryParams" @submit.prevent="handleSearch">
        <el-form-item label="地图">
          <el-select v-model="queryParams.mapId" placeholder="全部" clearable style="width: 140px" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option v-for="map in mapOptions" :key="map.value" :label="map.label" :value="map.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="英雄">
          <el-select v-model="queryParams.heroId" placeholder="全部" clearable style="width: 140px" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option v-for="hero in heroOptions" :key="hero.value" :label="hero.label" :value="hero.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryParams.positionType" placeholder="全部" clearable style="width: 120px" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option v-for="type in typeOptions" :key="type.value" :label="type.label" :value="type.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度">
          <el-select v-model="queryParams.difficulty" placeholder="全部" clearable style="width: 120px" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option v-for="level in difficultyOptions" :key="level.value" :label="level.label" :value="level.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px" @change="handleSearch">
            <el-option label="全部" value="" />
            <el-option label="待审核" :value="0" />
            <el-option label="已发布" :value="1" />
            <el-option label="已下架" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键字">
          <el-input v-model="queryParams.keyword" placeholder="请输入点位名称/描述" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleSearch">搜索</el-button>
          <el-button icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <!-- 操作栏 -->
    <el-card shadow="never" class="action-card">
      <div class="action-buttons">
        <el-button type="primary" icon="Plus" @click="handleCreate">新增点位</el-button>
      </div>
    </el-card>
    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="positionList" border stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="positionName" label="点位名称" min-width="120" show-overflow-tooltip />
        <el-table-column prop="mapName" label="地图" width="100" align="center" />
        <el-table-column prop="heroName" label="英雄" width="100" align="center" />
        <el-table-column prop="side" label="攻防方" width="80" align="center" />
        <el-table-column prop="site" label="站点" width="80" align="center" />
        <el-table-column prop="positionType" label="类型" width="100" align="center" />
        <el-table-column prop="difficulty" label="难度" width="80" align="center">
          <template #default="{ row }">
            <span v-if="row.difficulty === 1">入门</span>
            <span v-else-if="row.difficulty === 2">简单</span>
            <span v-else-if="row.difficulty === 3">中等</span>
            <span v-else-if="row.difficulty === 4">困难</span>
            <span v-else-if="row.difficulty === 5">大师</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="布置图" width="100" align="center">
          <template #default="{ row }">
            <el-image v-if="row.setupImage" :src="row.setupImage" :preview-src-list="[row.setupImage]" fit="cover" class="cover-image" />
            <span v-else class="text-gray">暂无</span>
          </template>
        </el-table-column>
        <el-table-column label="投掷图" width="100" align="center">
          <template #default="{ row }">
            <el-image v-if="row.throwImage" :src="row.throwImage" :preview-src-list="[row.throwImage]" fit="cover" class="cover-image" />
            <span v-else class="text-gray">暂无</span>
          </template>
        </el-table-column>
        <el-table-column label="落点图" width="100" align="center">
          <template #default="{ row }">
            <el-image v-if="row.landingImage" :src="row.landingImage" :preview-src-list="[row.landingImage]" fit="cover" class="cover-image" />
            <span v-else class="text-gray">暂无</span>
          </template>
        </el-table-column>
        <el-table-column prop="viewCount" label="浏览量" width="100" align="center" sortable />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'warning' : row.status === 0 ? 'info' : 'default'">
              {{ row.status === 1 ? '已发布' : row.status === 2 ? '已下架' : row.status === 0 ? '待审核' : '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.createTime || row.create_time || '-' }}
          </template>
        </el-table-column>
        <!-- <el-table-column label="操作" width="220" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
            <el-button v-if="row.status !== 1" size="small" type="success" link @click="handleChangeStatus(row, 1)">发布</el-button>
            <el-button v-if="row.status !== 2" size="small" type="warning" link @click="handleChangeStatus(row, 2)">下架</el-button>
            <el-button v-if="row.status !== 0" size="small" type="info" link @click="handleChangeStatus(row, 0)">待审核</el-button>
          </template>
        </el-table-column> -->
        <el-table-column label="操作" width="260" align="center" fixed="right">
  <template #default="{ row }">
    <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
    <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
    <el-button v-if="row.status === 0" size="small" type="success" link @click="handleApprove(row)">通过</el-button>
    <el-button v-if="row.status === 2" size="small" type="primary" link @click="handleOnline(row)">重新上架</el-button>
    <el-button v-if="row.status === 1" size="small" type="warning" link @click="handleOffline(row)">下架</el-button>
  </template>
</el-table-column>
      </el-table>
      <el-empty v-if="!loading && positionList.length === 0" description="暂无点位数据" style="padding: 100px 0">
        <el-button type="primary" @click="handleCreate">创建第一个点位</el-button>
      </el-empty>
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.current"
          v-model:page-size="queryParams.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- 编辑弹窗 -->
    <PositionEditDialog
      v-model:visible="editDialogVisible"
      :position="currentPosition"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPositionList, deletePosition, updatePositionStatus } from '@/api/position'
import { getMapOptions, getHeroOptions, getPositionTypeOptions, getDifficultyOptions } from '@/api/gameData'
import PositionEditDialog from './components/PositionEditDialog.vue'


const queryParams = reactive({
  current: 1,
  size: 20,
  mapId: '',
  heroId: '',
  positionType: '',
  difficulty: '',
  status: '',
  keyword: ''
})
const loading = ref(false)
const total = ref(0)
const positionList = ref([])
const mapOptions = ref([])
const heroOptions = ref([])
const typeOptions = ref([
  { value: 'smoke', label: '烟雾' },
  { value: 'flash', label: '闪光' },
  { value: 'molly', label: '燃烧' },
  { value: 'wall', label: '墙' },
  { value: 'orb', label: '球' },
  { value: 'trap', label: '陷阱' },
  { value: 'general', label: '通用' }
])
const difficultyOptions = ref([
  { value: 1, label: '入门' },
  { value: 2, label: '简单' },
  { value: 3, label: '中等' },
  { value: 4, label: '困难' },
  { value: 5, label: '大师' }
])
const editDialogVisible = ref(false)
const currentPosition = ref(null)

function fetchOptions() {
  getMapOptions().then(res => { mapOptions.value = res.data || [] })
  getHeroOptions().then(res => { heroOptions.value = res.data || [] })
  // 类型、难度已写死
}
function handleApprove(row) {
  updatePosition(row.id, { ...row, status: 1 }).then(() => {
    ElMessage.success('已通过并发布')
    fetchList()
  })
}
function handleOnline(row) {
  updatePosition(row.id, { ...row, status: 1 }).then(() => {
    ElMessage.success('已重新上架')
    fetchList()
  })
}
function handleOffline(row) {
  updatePosition(row.id, { ...row, status: 2 }).then(() => {
    ElMessage.success('已下架')
    fetchList()
  })
}
function fetchList() {
  loading.value = true
  getPositionList(queryParams).then(res => {
    positionList.value = res.data?.records || []
    total.value = res.data?.total || 0
  }).finally(() => {
    loading.value = false
  })
}

function handleSearch() {
  queryParams.current = 1
  fetchList()
}
function handleReset() {
  queryParams.mapId = ''
  queryParams.heroId = ''
  queryParams.positionType = ''
  queryParams.difficulty = ''
  queryParams.status = ''
  queryParams.keyword = ''
  handleSearch()
}
function handleSizeChange(size) {
  queryParams.size = size
  fetchList()
}
function handleCurrentChange(page) {
  queryParams.current = page
  fetchList()
}
function handleCreate() {
  currentPosition.value = null
  editDialogVisible.value = true
}
function handleEdit(row) {
  currentPosition.value = { ...row }
  editDialogVisible.value = true
}
function handleDelete(row) {
  ElMessageBox.confirm('确定要删除该点位吗？', '提示', { type: 'warning' })
    .then(() => {
      return deletePosition(row.id)
    })
    .then(() => {
      ElMessage.success('删除成功')
      fetchList()
    })
    .catch(() => {})
}
function handleEditSuccess() {
  editDialogVisible.value = false
  fetchList()
}
function handleChangeStatus(row, status) {
  updatePositionStatus(row.id, status).then(() => {
    ElMessage.success('状态已更新')
    fetchList()
  })
}
onMounted(() => {
  fetchOptions()
  fetchList()
})
</script>

<style scoped>
.position-management { padding: 20px; }
.action-buttons { margin-bottom: 10px; }
.cover-image { width: 60px; height: 40px; border-radius: 4px; }
.text-gray { color: #aaa; }
.pagination-container { margin-top: 20px; text-align: right; }
</style>