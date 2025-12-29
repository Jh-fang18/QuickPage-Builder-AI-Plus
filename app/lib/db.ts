import postgres from 'postgres';

// 检查环境变量是否存在
if (!process.env.POSTGRES_URL) {
  throw new Error(
    'POSTGRES_URL environment variable is not set. ' +
    'Please set it in your EdgeOne Page environment variables. ' +
    'Format: postgresql://user:password@host:port/database?sslmode=require'
  );
}

// 从 POSTGRES_URL 中解析 SSL 模式，或使用环境变量，或根据环境默认值
const getSslMode = (): 'require' | 'prefer' | 'allow' | 'verify-full' | boolean => {
  // 如果 URL 中包含 sslmode 参数，使用它
  const url = process.env.POSTGRES_URL || '';
  const sslModeMatch = url.match(/[?&]sslmode=([^&]+)/i);
  if (sslModeMatch) {
    const mode = sslModeMatch[1].toLowerCase();
    if (mode === 'disable') {
      return false;
    }
    if (['require', 'prefer', 'allow', 'verify-full'].includes(mode)) {
      return mode as 'require' | 'prefer' | 'allow' | 'verify-full';
    }
  }
  
  // 如果设置了环境变量，使用它
  if (process.env.POSTGRES_SSL_MODE) {
    const mode = process.env.POSTGRES_SSL_MODE.toLowerCase();
    if (mode === 'disable') {
      return false;
    }
    if (['require', 'prefer', 'allow', 'verify-full'].includes(mode)) {
      return mode as 'require' | 'prefer' | 'allow' | 'verify-full';
    }
  }
  
  // 默认：生产环境使用 require，开发环境使用 prefer
  return process.env.NODE_ENV === 'production' ? 'require' : 'prefer';
};

// 创建数据库连接
export const sql = postgres(process.env.POSTGRES_URL, {
  ssl: getSslMode(),
  max: 10, // 最大连接数
  idle_timeout: 20, // 空闲超时（秒）
  connect_timeout: 10, // 连接超时（秒）
});

