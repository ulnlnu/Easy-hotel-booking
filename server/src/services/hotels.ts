/**
 * server/src/services/hotels.ts
 * 酒店服务层
 *
 * 【服务层的职责】
 * 服务层负责实现具体的业务逻辑，包括：
 * 1. 数据的增删改查（CRUD）
 * 2. 复杂的筛选、排序、分页逻辑
 * 3. 跨模块的数据操作（如查询创建者信息）
 *
 * 【为什么不把逻辑放在控制器里？】
 * - 控制器只负责处理请求和响应
 * - 服务层可以被多个控制器复用
 * - 服务层更容易进行单元测试
 * - 符合"单一职责"原则
 *
 * 【文件结构】
 * 1. 数据读写函数（readHotels, writeHotels）
 * 2. 工具函数（generateId, calculateDistance）
 * 3. 服务对象（hotelService）
 */

import fs from 'fs/promises';
import path from 'path';
import type {
  Hotel,
  CreateHotelRequest,
  UpdateHotelRequest,
  HotelQueryParams,
} from '../../../shared/types/hotel';
import { HotelStatus } from '../../../shared/types/hotel';
import { authService } from './auth';

// ========================================
// 配置常量
// ========================================

// 数据目录路径
// process.cwd() 返回当前工作目录（运行 node 命令的位置）
const DATA_DIR = path.join(process.cwd(), 'src/data');

// 酒店数据文件路径
const HOTELS_FILE = path.join(DATA_DIR, 'hotels.json');

// ========================================
// 数据读写函数
// ========================================

/**
 * 确保数据目录存在
 *
 * 【为什么需要这个函数？】
 * 如果数据目录不存在，fs.writeFile 会报错
 * 所以在写入文件前，先确保目录存在
 *
 * 【recursive: true 的作用】
 * 如果父目录也不存在，会递归创建所有需要的目录
 * 类似于 mkdir -p 命令
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (error) {
    // 目录已存在会报错，但我们忽略这个错误
    // 因为目录已存在正是我们想要的结果
  }
}

/**
 * 读取酒店数据
 *
 * 【返回值】
 * - 成功：返回酒店数组
 * - 文件不存在：返回空数组 []
 *
 * 【为什么用 try-catch？】
 * fs.readFile 在文件不存在时会抛出错误
 * 我们捕获这个错误，返回空数组，让调用方不用关心文件是否存在
 */
async function readHotels(): Promise<Hotel[]> {
  // 先确保目录存在
  await ensureDataDir();

  try {
    // 读取文件内容
    // 'utf-8' 指定编码，否则返回的是 Buffer
    const data = await fs.readFile(HOTELS_FILE, 'utf-8');

    // 解析 JSON 字符串为 JavaScript 对象
    return JSON.parse(data);
  } catch (error) {
    // 文件不存在或其他读取错误，返回空数组
    return [];
  }
}

/**
 * 写入酒店数据
 *
 * 【JSON.stringify 的三个参数】
 * JSON.stringify(data, null, 2)
 * - data: 要转换的对象
 * - null: replacer 函数，用于过滤或转换属性
 * - 2: 缩进空格数，让 JSON 格式化，便于阅读
 *
 * 写入的文件内容会是格式化的 JSON，而不是一行
 */
async function writeHotels(hotels: Hotel[]): Promise<void> {
  await ensureDataDir();

  // JSON.stringify(hotels, null, 2)
  // 第三个参数 2 表示缩进 2 个空格，让 JSON 文件更易读
  await fs.writeFile(HOTELS_FILE, JSON.stringify(hotels, null, 2));
}

/**
 * 生成唯一 ID
 *
 * 【ID 格式】
 * "时间戳-随机字符串"
 * 例如: "1740012345678-abc123def"
 *
 * 【为什么不直接用 UUID？】
 * - 这个 ID 生成方式足够唯一
 * - 不需要额外的依赖包
 * - 时间戳前缀让 ID 大致有序
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ========================================
// LBS 距离计算 ⭐ 创新功能！答辩必问
// ========================================

/**
 * 计算两点之间的球面距离（公里）
 *
 * 【使用场景】
 * 用户打开移动端，获取当前位置
 * 后端计算每个酒店到用户的距离，按距离排序返回
 *
 * 【Haversine 公式】
 * 这是计算地球表面两点间距离的标准公式
 * 考虑了地球是球体，而不是平面
 *
 * 【公式推导（了解即可）】
 * 1. 将经纬度从度数转换为弧度
 * 2. 计算纬度差和经度差
 * 3. 应用 Haversine 公式计算中心角
 * 4. 中心角 × 地球半径 = 距离
 *
 * @param from - 起点 { lat: 纬度, lng: 经度 }
 * @param to - 终点 { lat: 纬度, lng: 经度 }
 * @returns 两点之间的距离（公里）
 *
 * @example
 * // 北京天安门到上海外滩的距离
 * calculateDistance(
 *   { lat: 39.9087, lng: 116.3975 },  // 北京
 *   { lat: 31.2397, lng: 121.4909 }   // 上海
 * )
 * // 返回约 1067 (公里)
 */
function calculateDistance(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number {
  // 地球平均半径（公里）
  // 实际上地球是椭球体，但 6371km 是常用的平均值
  const R = 6371;

  // 将纬度差和经度差转换为弧度
  const dLat = toRad(to.lat - from.lat);
  const dLng = toRad(to.lng - from.lng);

  // ========== Haversine 公式核心计算 ==========
  // a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(from.lat)) *
      Math.cos(toRad(to.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  // c = 2 × atan2(√a, √(1-a))
  // 这是计算中心角（弧度）
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  // 距离 = 中心角 × 地球半径
  // Math.round(x * 10) / 10 保留一位小数
  return Math.round(R * c * 10) / 10;
}

/**
 * 角度转弧度
 *
 * 【为什么需要转换？】
 * JavaScript 的 Math.sin、Math.cos 等三角函数
 * 接收的参数是弧度，不是度数
 *
 * 【转换公式】
 * 弧度 = 度数 × (π / 180)
 *
 * @param degrees - 角度值
 * @returns 弧度值
 */
function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// ========================================
// 酒店服务对象
// ========================================

/**
 * 酒店服务
 *
 * 【设计模式：模块模式】
 * 使用对象导出一系列方法，而不是单独导出每个函数
 * 这样可以：
 * 1. 组织相关的方法在一起
 * 2. 方便扩展新方法
 * 3. 调用时语义清晰：hotelService.getList()
 */
export const hotelService = {

  // ========================================
  // 获取酒店列表 ⭐ 最复杂的方法！
  // ========================================
  /**
   * 获取酒店列表
   *
   * 【支持的筛选条件】
   * - keyword: 关键词（搜索名称、地址、城市）
   * - city: 城市
   * - minPrice/maxPrice: 价格范围
   * - tags: 标签
   * - status: 状态
   * - createdBy: 创建者
   * - location: 定位点（用于距离排序）
   *
   * 【支持的排序方式】
   * - price: 按价格排序
   * - distance: 按距离排序（需要 location）
   * - rating: 按评分排序
   * - createdAt: 按创建时间排序
   *
   * 【分页参数】
   * - page: 当前页码（从 1 开始）
   * - pageSize: 每页数量
   *
   * @param params - 查询参数
   * @returns 分页后的酒店列表 + 总数 + 分页信息
   */
  getList: async (params: HotelQueryParams) => {
    // Step 1: 读取所有酒店数据
    let hotels = await readHotels();

    // ========== 筛选逻辑 ==========

    // Step 2: 关键词筛选
    // 在酒店名称、地址、城市中搜索
    if (params.keyword) {
      hotels = hotels.filter(
        h =>
          h.name.includes(params.keyword!) ||      // 名称包含关键词
          h.address.includes(params.keyword!) ||   // 地址包含关键词
          h.city.includes(params.keyword!)         // 城市包含关键词
      );
    }

    // Step 3: 城市筛选
    // 精确匹配城市名
    if (params.city) {
      hotels = hotels.filter(h => h.city === params.city);
    }

    // Step 4: 价格筛选
    // 使用最低房型价格进行比较
    if (params.minPrice !== undefined) {
      hotels = hotels.filter(h => {
        // 找出该酒店所有房型中的最低价格
        // ...h.roomTypes.map(r => r.price) 展开所有价格
        // Math.min(...) 取最小值
        const minPrice = Math.min(...h.roomTypes.map(r => r.price));
        return minPrice >= params.minPrice!;
      });
    }

    if (params.maxPrice !== undefined) {
      hotels = hotels.filter(h => {
        const minPrice = Math.min(...h.roomTypes.map(r => r.price));
        return minPrice <= params.maxPrice!;
      });
    }

    // Step 5: 标签筛选
    // 只要酒店包含任意一个指定的标签就符合条件
    if (params.tags && params.tags.length > 0) {
      // params.tags.some(...) 表示"任意一个匹配"
      // h.tags.includes(tag) 检查酒店是否包含该标签
      hotels = hotels.filter(h => params.tags!.some(tag => h.tags.includes(tag)));
    }

    // Step 5.1: 设施筛选
    // 酒店必须包含所有指定的设施
    if (params.facilities && params.facilities.length > 0) {
      // params.facilities.every(...) 表示"全部都要匹配"
      hotels = hotels.filter(h => params.facilities!.every(facility => h.facilities.includes(facility)));
    }

    // Step 5.2: 星级筛选
    // 精确匹配星级
    if (params.starLevel !== undefined) {
      hotels = hotels.filter(h => h.starLevel === params.starLevel);
    }

    // Step 5.3: 最低评分筛选
    // 酒店评分必须大于等于指定分数
    if (params.minRating !== undefined) {
      hotels = hotels.filter(h => h.rating >= params.minRating!);
    }

    // Step 6: 状态筛选
    // 三种情况：
    // 1. 指定了 status 参数 → 按指定状态筛选
    // 2. includeAll = true → 不筛选状态（管理端看所有）
    // 3. 默认 → 只显示已通过的酒店（移动端）
    if (params.status) {
      hotels = hotels.filter(h => h.status === params.status);
    } else if (!params.includeAll) {
      // 普通用户只能看到已审核通过的酒店
      hotels = hotels.filter(h => h.status === HotelStatus.APPROVED);
    }

    // Step 7: 创建者筛选
    // 酒店管理员只能看到自己创建的酒店
    if (params.createdBy) {
      hotels = hotels.filter(h => h.createdBy === params.createdBy);
    }

    // ========== 排序逻辑 ==========

    // 按价格排序
    if (params.sortBy === 'price') {
      hotels.sort((a, b) => {
        const minPriceA = Math.min(...a.roomTypes.map(r => r.price));
        const minPriceB = Math.min(...b.roomTypes.map(r => r.price));
        // params.order === 'desc' 降序，否则升序
        return params.order === 'desc' ? minPriceB - minPriceA : minPriceA - minPriceB;
      });
    }
    // 按距离排序 ⭐ LBS 功能
    else if (params.sortBy === 'distance' && params.location) {
      hotels = hotels
        // map: 为每个酒店计算距离
        .map(h => ({
          ...h,
          distance: calculateDistance(params.location!, h.location),
        }))
        // sort: 按距离升序排列
        .sort((a, b) => (a as any).distance - (b as any).distance);
    }
    // 按评分排序
    else if (params.sortBy === 'rating') {
      hotels.sort((a, b) =>
        params.order === 'desc' ? a.rating - b.rating : b.rating - a.rating
      );
    }
    // 按创建时间排序
    else if (params.sortBy === 'createdAt') {
      hotels.sort((a, b) =>
        params.order === 'desc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    // ========== 分页逻辑 ==========

    // 计算分页边界
    // 假设 page=2, pageSize=10
    // start = (2-1) * 10 = 10
    // end = 10 + 10 = 20
    // slice(10, 20) 取第 11-20 条数据
    const start = (params.page - 1) * params.pageSize;
    const end = start + params.pageSize;
    const pageData = hotels.slice(start, end);

    // ========== 附加创建者名称 ==========

    // 为每个酒店查询创建者的名称
    // Promise.all 等待所有查询完成
    const hotelsWithCreator = await Promise.all(
      pageData.map(async (hotel) => {
        // 查询创建者信息
        const creator = await authService.findById(hotel.createdBy);
        return {
          ...hotel,
          // 优先使用真实姓名，其次用户名，都没有显示"未知用户"
          createdByName: creator?.realName || creator?.username || '未知用户',
        };
      })
    );

    // ========== 返回结果 ==========

    return {
      success: true,
      data: hotelsWithCreator,   // 当前页数据
      total: hotels.length,       // 总数量（筛选后的）
      page: params.page,          // 当前页码
      pageSize: params.pageSize,  // 每页数量
      hasMore: end < hotels.length,  // 是否有更多数据
    };
  },

  // ========================================
  // 根据 ID 获取酒店
  // ========================================
  /**
   * 根据 ID 获取酒店详情
   *
   * @param id - 酒店 ID
   * @returns 酒店信息（包含创建者名称），不存在返回 null
   */
  getById: async (id: string): Promise<Hotel | null> => {
    const hotels = await readHotels();

    // Array.find() 查找符合条件的第一个元素
    const hotel = hotels.find(h => h.id === id);

    if (!hotel) return null;

    // 附加创建者名称
    const creator = await authService.findById(hotel.createdBy);
    return {
      ...hotel,
      createdByName: creator?.realName || creator?.username || '未知用户',
    };
  },

  // ========================================
  // 创建酒店
  // ========================================
  /**
   * 创建酒店
   *
   * 【创建流程】
   * 1. 生成酒店 ID
   * 2. 为每个房型生成 ID
   * 3. 设置初始状态为"待审核"
   * 4. 保存到文件
   *
   * @param data - 酒店数据
   * @param createdBy - 创建者用户 ID
   * @returns 新创建的酒店
   */
  create: async (data: CreateHotelRequest, createdBy: string): Promise<Hotel> => {
    // 调试日志
    console.log('[创建酒店 - Service] create 方法被调用');
    console.log('[创建酒店 - Service] createdBy (创建者ID):', createdBy);
    console.log('[创建酒店 - Service] 酒店名称:', data.name);

    // 读取现有数据
    const hotels = await readHotels();
    console.log('[创建酒店 - Service] 当前酒店总数:', hotels.length);

    const now = new Date().toISOString();
    const newHotelId = generateId();

    // 构建新酒店对象
    const newHotel: Hotel = {
      id: newHotelId,
      ...data,                       // 展开传入的数据
      rating: 0,                     // 初始评分为 0
      reviewCount: 0,                // 初始评论数为 0
      status: HotelStatus.PENDING,   // 新酒店默认"待审核"
      createdBy,                     // 记录创建者
      createdAt: now,
      updatedAt: now,
      // 为每个房型生成 ID
      roomTypes: data.roomTypes.map(rt => ({
        ...rt,
        id: generateId(),
      })),
    };

    console.log('[创建酒店 - Service] 新酒店状态 (status):', newHotel.status);

    // 添加到数组
    hotels.push(newHotel);

    // 保存到文件
    await writeHotels(hotels);
    console.log('[创建酒店 - Service] 创建成功，返回酒店对象');

    return newHotel;
  },

  // ========================================
  // 更新酒店
  // ========================================
  /**
   * 更新酒店
   *
   * 【智能状态处理】
   * - 如果酒店是"已通过"或"已拒绝"状态
   * - 编辑后自动变为"待审核"状态
   * - 因为修改后需要重新审核
   *
   * @param id - 酒店 ID
   * @param data - 更新数据
   * @returns 更新后的酒店，不存在返回 null
   */
  update: async (id: string, data: UpdateHotelRequest): Promise<Hotel | null> => {
    const hotels = await readHotels();
    const index = hotels.findIndex(h => h.id === id);

    if (index === -1) {
      return null;
    }

    // 处理房型数据：保留现有 ID 或生成新 ID
    const roomTypes = data.roomTypes
      ? data.roomTypes.map((rt, idx) => ({
          ...rt,
          // 如果原来的房型存在，保留其 ID
          id: hotels[index].roomTypes[idx]?.id || generateId(),
        }))
      : hotels[index].roomTypes;

    // 智能状态处理
    // 如果原来是"已通过"或"已拒绝"，编辑后变为"待审核"
    const updatedStatus =
      hotels[index].status === HotelStatus.APPROVED ||
      hotels[index].status === HotelStatus.REJECTED
        ? HotelStatus.PENDING
        : hotels[index].status;

    // 合并更新
    hotels[index] = {
      ...hotels[index],    // 保留原有数据
      ...data,             // 覆盖新数据
      roomTypes,
      status: updatedStatus,
      // 如果变为待审核，移除拒绝原因
      ...(updatedStatus === HotelStatus.PENDING ? { rejectionReason: undefined } : {}),
      updatedAt: new Date().toISOString(),
    } as Hotel;

    await writeHotels(hotels);

    return hotels[index];
  },

  // ========================================
  // 审核酒店
  // ========================================
  /**
   * 审核酒店
   *
   * @param id - 酒店 ID
   * @param action - 'approve' 通过 | 'reject' 拒绝
   * @param reason - 拒绝原因（拒绝时使用）
   */
  audit: async (id: string, action: 'approve' | 'reject', reason?: string): Promise<void> => {
    const hotels = await readHotels();
    const index = hotels.findIndex(h => h.id === id);

    if (index === -1) {
      throw new Error('酒店不存在');
    }

    if (action === 'approve') {
      // 通过：设置状态为已通过，移除拒绝原因
      hotels[index].status = HotelStatus.APPROVED;
      delete hotels[index].rejectionReason;
    } else {
      // 拒绝：设置状态为已拒绝，保存拒绝原因
      hotels[index].status = HotelStatus.REJECTED;
      hotels[index].rejectionReason = reason || '';
    }

    hotels[index].updatedAt = new Date().toISOString();

    await writeHotels(hotels);
  },

  // ========================================
  // 更新酒店状态（上线/下线）
  // ========================================
  /**
   * 更新酒店状态
   *
   * 【上线/下线的区别】
   * - 下线：酒店仍然存在，但用户看不到
   * - 可以随时恢复上线
   * - 数据不会丢失
   *
   * @param id - 酒店 ID
   * @param status - 'online' 上线 | 'offline' 下线
   */
  updateStatus: async (id: string, status: 'online' | 'offline'): Promise<void> => {
    const hotels = await readHotels();
    const index = hotels.findIndex(h => h.id === id);

    if (index === -1) {
      throw new Error('酒店不存在');
    }

    // online → APPROVED, offline → OFFLINE
    hotels[index].status = status === 'online' ? HotelStatus.APPROVED : HotelStatus.OFFLINE;
    hotels[index].updatedAt = new Date().toISOString();

    await writeHotels(hotels);
  },

  // ========================================
  // 删除酒店
  // ========================================
  /**
   * 删除酒店
   *
   * 【注意】这是真删除，数据会永久丢失
   * 如果只是想临时隐藏，应该使用 updateStatus('offline')
   *
   * @param id - 酒店 ID
   */
  delete: async (id: string): Promise<void> => {
    const hotels = await readHotels();

    // filter 过滤掉指定 ID 的酒店
    const filtered = hotels.filter(h => h.id !== id);

    // 如果数量没变，说明没找到
    if (filtered.length === hotels.length) {
      throw new Error('酒店不存在');
    }

    await writeHotels(filtered);
  },
};
