## QuickPage-Builder-AI-core 升级版

### 预览地址

临时预览地址：[https://nextjs-dashboard.zh-cn.edgeone.cool/QuickPage-Builder-AI-core/dashboard/pageBuilder/create](https://nextjs-dashboard.zh-cn.edgeone.cool/QuickPage-Builder-AI-core/dashboard/pageBuilder/create)

## EdgeOne Page 部署配置

### 环境变量配置

在 EdgeOne Page 部署时，需要在环境变量中配置数据库连接：

**必需的环境变量：**
- `POSTGRES_URL`: PostgreSQL 数据库连接字符串

**配置格式：**
```
postgresql://用户名:密码@主机:端口/数据库名?sslmode=require
```

**示例：**
```
postgresql://user:password@db.example.com:5432/nextjs_dashboard?sslmode=require
```

### 在 EdgeOne Page 中设置环境变量

1. 登录 EdgeOne Page 控制台
2. 进入你的项目设置
3. 找到"环境变量"或"Environment Variables"选项
4. 添加 `POSTGRES_URL` 变量，值为你的数据库连接字符串

### 注意事项

- 确保数据库允许来自 EdgeOne Page 服务器的连接
- 生产环境建议使用 SSL 连接（`sslmode=require`）
- 如果数据库不支持 SSL，可以将 `sslmode=require` 改为 `sslmode=prefer` 或 `sslmode=disable`
