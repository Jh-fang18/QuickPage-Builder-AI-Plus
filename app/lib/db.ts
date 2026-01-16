import postgres from 'postgres';

// 检查环境变量是否存在
if (!process.env.POSTGRES_URL) {
  throw new Error(
    'POSTGRES_URL environment variable is not set. ' +
    'Please set it in your EdgeOne Page environment variables. ' +
    'Format: postgresql://user:password@host:port/database?sslmode=require'
  );
}

/**
 * 从 POSTGRES_URL 中解析 SSL 模式，或使用环境变量，或根据环境默认值
 * 
 * SSL 模式说明：
 * - disable: 禁用 SSL 连接
 * - allow: 允许但不要求 SSL（优先非 SSL，如果服务器要求则使用 SSL）
 * - prefer: 优先使用 SSL，但如果服务器不支持则回退到非 SSL（默认值）
 * - require: 强制使用 SSL，但不验证服务器证书
 * - verify-ca: 强制使用 SSL 并验证服务器证书是否由受信任的 CA 签署
 * - verify-full: 强制使用 SSL，验证 CA 并确保服务器主机名与证书匹配（最安全）
 * 
 * @returns SSL 配置对象或布尔值，用于 postgres.js 库
 */
const getSslConfig = (): boolean | 'require' | { rejectUnauthorized: boolean } => {
  let sslMode: string | undefined;
  
  // 优先级 1: 从 POSTGRES_URL 中解析 sslmode 参数
  const url = process.env.POSTGRES_URL || '';
  const sslModeMatch = url.match(/[?&]sslmode=([^&]+)/i);
  if (sslModeMatch) {
    sslMode = sslModeMatch[1].toLowerCase();
  }
  
  // 优先级 2: 从环境变量 POSTGRES_SSL_MODE 读取
  if (!sslMode && process.env.POSTGRES_SSL_MODE) {
    sslMode = process.env.POSTGRES_SSL_MODE.toLowerCase();
  }
  
  // 优先级 3: 根据环境设置默认值
  if (!sslMode) {
    sslMode = process.env.NODE_ENV === 'production' ? 'require' : 'prefer';
  }
  
  // 根据 SSL 模式返回相应的配置
  switch (sslMode) {
    case 'disable':
      return false;
    
    case 'allow':
    case 'prefer':
      // prefer 和 allow 都优先使用 SSL，但不强制验证
      return 'require';
    
    case 'require':
      // 要求 SSL 但不验证证书
      return 'require';
    
    case 'verify-ca':
    case 'verify-full':
      // 验证证书（verify-full 还会验证主机名，但 postgres.js 需要额外配置）
      return { rejectUnauthorized: true };
    
    default:
      // 未知模式，使用默认值
      console.warn(`未知的 SSL 模式: ${sslMode}，使用默认值 'require'`);
      return 'require';
  }
};

// 创建数据库连接
export const sql = postgres(process.env.POSTGRES_URL, {
  ssl: getSslConfig(),
  max: 10, // 最大连接数
  idle_timeout: 20, // 空闲超时（秒）
  connect_timeout: 10, // 连接超时（秒）
});

