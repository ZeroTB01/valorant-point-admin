<template>
  <div class="content-management">
    <!-- 搜索栏 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="queryParams" @submit.prevent="handleSearch">
        <el-form-item label="内容类型">
          <el-select
            v-model="queryParams.contentType"
            placeholder="全部"
            clearable
            style="width: 140px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="视频" value="video" />
            <el-option label="图文" value="article" />
            <el-option label="混合" value="mixed" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="queryParams.status"
            placeholder="全部"
            clearable
            style="width: 120px"
            @change="handleSearch"
          >
            <el-option label="全部" value="" />
            <el-option label="待审核" :value="0" />
            <el-option label="已发布" :value="1" />
            <el-option label="已下架" :value="2" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="搜索">
          <el-input
            v-model="queryParams.keyword"
            placeholder="请输入标题或作者"
            clearable
            @keyup.enter="handleSearch"
          />
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
        <div>
          <el-button type="primary" icon="Plus" @click="handleCreate">新增内容</el-button>
          <el-button 
            type="danger" 
            icon="Delete" 
            :disabled="!selectedIds.length"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button>
        </div>
        <div>
          <el-button icon="Download" @click="handleExport">导出数据</el-button>
        </div>
      </div>
    </el-card>
    
    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="contentList"
        @selection-change="handleSelectionChange"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="id" label="ID" width="80" align="center" />
        
        <el-table-column label="封面" width="100" align="center">
          <template #default="{ row }">
            <el-image
              v-if="row.coverImage"
              :src="row.coverImage"
              :preview-src-list="[row.coverImage]"
              fit="cover"
              class="cover-image"
            />
            <span v-else class="text-gray">暂无封面</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip>
          <template #default="{ row }">
            <el-link type="primary" @click="handleView(row)">{{ row.title }}</el-link>
          </template>
        </el-table-column>
        
        <el-table-column prop="contentType" label="类型" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getContentTypeTag(row.contentType).type">
              {{ getContentTypeTag(row.contentType).label }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="关联信息" width="150" align="center">
          <template #default="{ row }">
            <div class="related-info">
              <el-tag v-if="row.heroName" size="small">{{ row.heroName }}</el-tag>
              <el-tag v-if="row.mapName" size="small" type="success">{{ row.mapName }}</el-tag>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="viewCount" label="浏览量" width="100" align="center" sortable />
        <el-table-column prop="likeCount" label="点赞数" width="100" align="center" sortable />
        
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusTag(row.status).type">
              {{ getStatusTag(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createTime" label="创建时间" width="160" align="center">
          <template #default="{ row }">
            {{ row.createTime || row.create_time || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button 
              v-if="row.status === 0"
              size="small" 
              type="success" 
              link 
              @click="handlePublish(row)"
            >
              通过
            </el-button>
            <el-button 
              v-else-if="row.status === 1"
              size="small" 
              type="warning" 
              link 
              @click="handleOffline(row)"
            >
              下架
            </el-button>
            <el-button 
              v-else-if="row.status === 2"
              size="small" 
              type="success" 
              link 
              @click="handlePublish(row)"
            >
              重新发布
            </el-button>
            <el-button size="small" type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 空状态提示 -->
      <el-empty 
        v-if="!loading && contentList.length === 0" 
        description="暂无内容数据"
        style="padding: 100px 0"
      >
        <el-button type="primary" @click="handleCreate">创建第一个内容</el-button>
      </el-empty>
      
      <!-- 分页 -->
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
    
    <!-- 内容编辑对话框 -->
    <ContentEditDialog
      v-model:visible="editDialogVisible"
      :content="currentContent"
      @success="handleEditSuccess"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
// 导入必要的API
import { 
  getContentList, 
  updateContentStatus, 
  deleteContent,
  batchUpdateContent,
  reviewContent 
} from '@/api/content'
import ContentEditDialog from './components/ContentEditDialog.vue'

// 数据状态
const loading = ref(false)
const contentList = ref([])
const total = ref(0)
const selectedIds = ref([])
const editDialogVisible = ref(false)
const currentContent = ref(null)

// 查询参数
const queryParams = reactive({
  current: 1,
  size: 20,
  contentType: '',
  status: '',  // 空字符串表示查询所有状态
  keyword: ''
})

// 内容类型映射
const getContentTypeTag = (type) => {
  const typeMap = {
    video: { label: '视频', type: 'primary' },
    article: { label: '图文', type: 'success' },
    mixed: { label: '混合', type: 'warning' }
  }
  return typeMap[type] || { label: '未知', type: 'info' }
}

// 状态映射
const getStatusTag = (status) => {
  const statusMap = {
    0: { label: '待审核', type: 'warning' },
    1: { label: '已发布', type: 'success' },
    2: { label: '已下架', type: 'danger' }
  }
  return statusMap[status] || { label: '未知', type: 'info' }
}

// 获取内容列表
const fetchContentList = async () => {
  loading.value = true
  try {
    // 清理空参数
    const cleanParams = {}
    Object.keys(queryParams).forEach(key => {
      const value = queryParams[key]
      // 保留0值（待审核状态），但过滤空字符串
      if (value !== '' && value !== null && value !== undefined) {
        cleanParams[key] = value
      }
    })
    
    console.log('请求参数:', cleanParams)
    const res = await getContentList(cleanParams)
    console.log('内容列表响应:', res)
    
    // 适配不同的响应格式
    if (res.data) {
      // 检查是否是分页格式
      if (res.data.records !== undefined) {
        contentList.value = res.data.records || []
        total.value = res.data.total || 0
      } 
      // 检查是否是 IPage 格式
      else if (res.data.list !== undefined) {
        contentList.value = res.data.list || []
        total.value = res.data.totalCount || res.data.total || 0
      }
      // 检查是否直接是数组
      else if (Array.isArray(res.data)) {
        contentList.value = res.data
        total.value = res.data.length
      }
      // 检查是否是对象包含数组
      else if (typeof res.data === 'object') {
        // 尝试找到数组字段
        const possibleKeys = ['list', 'data', 'items', 'rows', 'content', 'contents']
        for (const key of possibleKeys) {
          if (Array.isArray(res.data[key])) {
            contentList.value = res.data[key]
            total.value = res.data.total || res.data.totalCount || res.data[key].length
            break
          }
        }
      }
    }
    
    console.log('处理后的数据:', {
      list: contentList.value,
      total: total.value
    })
    
    // 如果没有数据，显示提示
    if (contentList.value.length === 0) {
      console.log('暂无内容数据')
    }
  } catch (error) {
    console.error('获取内容列表失败:', error)
    ElMessage.error('获取内容列表失败')
    contentList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  queryParams.current = 1
  fetchContentList()
}

// 重置
const handleReset = () => {
  queryParams.current = 1
  queryParams.contentType = ''
  queryParams.status = ''
  queryParams.keyword = ''
  fetchContentList()
}

// 分页大小改变
const handleSizeChange = () => {
  queryParams.current = 1
  fetchContentList()
}

// 当前页改变
const handleCurrentChange = () => {
  fetchContentList()
}

// 选择改变
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 查看内容
const handleView = (row) => {
  // 使用新标签页查看内容详情
  // 这里可以根据实际需求跳转到内容详情页面
  // 暂时先在新窗口打开视频链接（如果是视频类型）
  if (row.contentType === 'video' && row.videoUrl) {
    window.open(row.videoUrl, '_blank')
  } else if (row.id) {
    // 如果有详情页面路由，可以跳转
    // router.push(`/content/detail/${row.id}`)
    
    // 或者调用详情接口查看
    ElMessageBox.alert(`
      <div>
        <p><strong>标题：</strong>${row.title}</p>
        <p><strong>类型：</strong>${row.contentType}</p>
        <p><strong>状态：</strong>${getStatusTag(row.status).label}</p>
        <p><strong>描述：</strong>${row.description || '暂无'}</p>
        <p><strong>浏览量：</strong>${row.viewCount || 0}</p>
        <p><strong>创建时间：</strong>${row.createTime}</p>
      </div>
    `, '内容详情', {
      dangerouslyUseHTMLString: true,
      confirmButtonText: '确定'
    })
  }
}

// 新增内容
const handleCreate = () => {
  currentContent.value = null
  editDialogVisible.value = true
}

// 编辑内容
const handleEdit = (row) => {
  currentContent.value = row
  editDialogVisible.value = true
}

// 编辑成功
const handleEditSuccess = () => {
  fetchContentList()
}

// 发布内容（审核通过）
const handlePublish = async (row) => {
  try {
    await ElMessageBox.confirm('确认要发布该内容吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await reviewContent(row.id, 1) // 只传 status
    ElMessage.success('发布成功')
    fetchContentList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('发布失败')
    }
  }
}

// 拒绝内容（审核不通过）
const handleReject = async (row) => {
  try {
    const { value: reason } = await ElMessageBox.prompt('请输入拒绝原因', '审核拒绝', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入拒绝原因...',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '拒绝原因不能为空'
        }
        return true
      }
    })
    
    await reviewContent(row.id, { status: 2, reason })
    ElMessage.success('已拒绝该内容')
    fetchContentList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

// 下架内容
const handleOffline = async (row) => {
  try {
    await ElMessageBox.confirm('确认要下架该内容吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await updateContentStatus(row.id, 2)
    ElMessage.success('下架成功')
    fetchContentList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('下架失败')
    }
  }
}

// 删除内容
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确认要删除内容"${row.title}"吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteContent(row.id)
    ElMessage.success('删除成功')
    fetchContentList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确认要删除选中的${selectedIds.value.length}条内容吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await batchUpdateContent({
      ids: selectedIds.value,
      operation: 'delete'
    })
    
    ElMessage.success('批量删除成功')
    fetchContentList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

// 组件挂载
onMounted(() => {
  fetchContentList()
})
</script>

<style lang="scss" scoped>
.content-management {
  .search-card,
  .action-card {
    margin-bottom: 20px;
  }
  
  .action-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .cover-image {
    width: 60px;
    height: 60px;
    border-radius: 4px;
  }
  
  .text-gray {
    color: #999;
    font-size: 12px;
  }
  
  .related-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    
    .el-tag {
      margin: 2px 0;
    }
  }
  
  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>