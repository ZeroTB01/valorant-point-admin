<template>
  <div class="user-management">
    <!-- 搜索栏 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="关键词">
          <el-input v-model="searchForm.keyword" placeholder="用户名/昵称/邮箱" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格列表 -->
    <el-card class="table-card">
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="60" />
        <el-table-column label="头像" width="80">
          <template #default="{ row }">
            <el-avatar :src="row.avatar" />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="nickname" label="昵称" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="电话" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="roles" label="角色">
          <template #default="{ row }">
            {{ row.roles && row.roles.length ? row.roles.join(', ') : '无角色' }}
          </template>
        </el-table-column>

        <el-table-column prop="lastLoginTime" label="最后登录" width="160" />
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pageParams.current"
        v-model:page-size="pageParams.size"
        :total="total"
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50]"
        @size-change="getList"
        @current-change="getList"
        style="margin-top: 20px; text-align: right"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

// 引入用户 store 以自动带 token
const userStore = useUserStore()
const { token } = storeToRefs(userStore)

const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const searchForm = reactive({
  keyword: '',
  status: null
})

const pageParams = reactive({
  current: 1,
  size: 10
})

// 获取用户列表
const getList = async () => {
  loading.value = true
  try {
    const query = {
      current: pageParams.current,
      size: pageParams.size
    }

    if (searchForm.keyword) query.keyword = searchForm.keyword
    if (searchForm.status !== null) query.status = searchForm.status

    const res = await request({
      url: '/user/list',
      method: 'get',
      params: query
    })

    if (res.code === 200 && res.data) {
      tableData.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '获取用户数据失败')
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('请求失败')
  } finally {
    loading.value = false
  }
}

// 查询和重置
const handleSearch = () => {
  pageParams.current = 1
  getList()
}

const handleReset = () => {
  searchForm.keyword = ''
  searchForm.status = null
  handleSearch()
}

onMounted(() => {
  getList()
})
</script>

<style scoped>
.user-management {
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
