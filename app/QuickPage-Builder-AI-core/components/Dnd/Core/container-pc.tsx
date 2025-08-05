"use client";

import { useMemo, useRef, useContext } from "react";
import { Modal } from "antd";

// 导入类型
import type { ComponentItem } from "../../types/dnd";

// 导入上下文
import EditContext from "../context";

import "./container-pc.css";

export default function ContainerPC({
  gridRow,
  gridColumn,
  gridScale,
  gridPadding,
}: {
  gridRow: number;
  gridColumn: number;
  gridScale: number;
  gridPadding: number;
}) {
  // ======================
  // 响应式变量
  // ======================
  const { activatedComponents, setActivatedComponents } = useContext<{
    activatedComponents: ComponentItem[];
    setActivatedComponents: React.Dispatch<
      React.SetStateAction<ComponentItem[]>
    >;
  }>(EditContext);

  // ======================
  // 非响应式变量
  // ======================
  const columnDifferences = useRef(0);
  const rowDifferences = useRef(0);
  const columnDeviationValue = useRef(0);
  const rowDeviationValue = useRef(0);
  const leftMax = useRef(0);
  const topMax = useRef(0);
  const downMax = useRef(0);
  const rightMax = useRef(0);
  let _activatedComponents = [...activatedComponents];

  // ======================
  // 计算属性
  // ======================

  // 计算网格列数
  const getGridTemplateColumns = useMemo(() => {
    return Array(gridColumn).fill(`${gridScale}px`).join(" ");
  }, [gridColumn, gridScale]);

  // 计算网格行数
  const getGridTemplateRows = useMemo(() => {
    return Array(gridRow).fill(`${gridScale}px`).join(" ");
  }, [gridRow, gridScale]);

  // 计算网格区域
  const getGridTemplateAreas = useMemo(() => {
    return Array.from(
      { length: gridRow },
      (_, i) =>
        `'${Array.from(
          { length: gridColumn },
          (_, j) => `g${i + 1}x${j + 1}`
        ).join(" ")}'`
    ).join(" ");
  }, [gridRow, gridColumn]);

  const blockRefs = useRef<Record<string, HTMLDivElement>>({});

  const [modal, contextHolder] = Modal.useModal();

  /* ====================== 核心方法 ====================== */

  // ======================
  // 工具函数
  // ======================

  /**
   * 根据已激活模块的数组顺序，更新rowIndex
   */
  const updateRowIndex = () => {
    activatedComponents.map((item, index) => {
      item.rowIndex = index;
    });
  };

  /**
   * 微件排序
   */
  const sortComponent = () => {
    activatedComponents.sort((x, y) => {
      let _xCcs = x.ccs.split("/").map((item) => Number(item));
      let _yCcs = y.ccs.split("/").map((item) => Number(item));

      if (_xCcs[0] < _yCcs[0]) {
        return -1;
      } else if (_xCcs[0] > _yCcs[0]) {
        return 1;
      } else {
        if (_xCcs[1] < _yCcs[1]) return -1;
        else return 1;
      }
    });
  };

  /**
   * 当前元素位置信息转换成Number数组
   * @param ccs 元素位置String类型，如：1/1/3/3
   * @returns 元素位置Number数组
   */
  const getComponentCcs = (ccs: string) => {
    return ccs.split("/").map((item) => Number(item));
  };

  /**
   * 已弃用思路，现已用递归方式查找代替
   * 获取折行元素的同行元素中元素的最大长度
   * 不包括折行元素
   * 当前元素为行末元素
   * @param currentComponent 折行元素
   * @returns 行内元素最大长度，_rowCcs = [0, 0, 0, 0]
   */
  const getRowMaxHeight = (currentComponent: ComponentItem): number[] => {
    let _rowCcs = [0, 0, 0, 0]; // 本一行元素最大长度， 初始值

    console.log("折行元素", currentComponent);

    for (let i = currentComponent.rowIndex - 1; i >= 0; i--) {
      const _ccs = getComponentCcs(activatedComponents[i].ccs), // 当前元素位置
        _prevCcs =
          i > 0
            ? getComponentCcs(activatedComponents[i - 1].ccs)
            : [0, 0, 0, 0]; // 上一个元素

      // 当前元素结束行小于最大元素起始行
      // 注: 最大元素是动态的, 故需要同时判断，当前元素起始行是否大于上一个元素的结束行
      if (_ccs[2] <= _rowCcs[0] && _ccs[0] >= _prevCcs[2]) break;

      if (_rowCcs[2] < _ccs[2]) {
        _rowCcs = _ccs;
      }

      console.log("行内最大元素", activatedComponents[i]);
    }

    console.log("行内最大元素", _rowCcs);

    return _rowCcs;
  };

  /** end **/

  // ======================
  // 控制元素大小函数
  // ======================

  /**
   * 右移变形元素后的元素，执行递归操作，直到没有相邻的元素
   * @param componentCcs 变形元素
   * @param oCcs 未变形元素
   * @param index 变形元素索引
   */
  const rightMoveComponents = (
    componentCcs: number[],
    oCcs: number[],
    index: number
  ) => {
    const // 已变形或位移元素的位置
      _ccs = componentCcs,
      // 未变形或位移元素的位置
      _oCcs = oCcs;

    let // 最大宽度
      _downMaxWidth = 0;

    // 变型元素后的元素查找，并执行左移操作
    for (let i = index + 1; i < activatedComponents.length; i++) {
      let _lastCcs = getComponentCcs(activatedComponents[i].ccs);

      const _width = activatedComponents[i].width,
        _rwidth = i - 1 === index ? 0 : activatedComponents[i - 1].width;

      if (
        _ccs[3] > _lastCcs[1] &&
        _oCcs[3] <= _lastCcs[1] &&
        _ccs[0] < _lastCcs[2] &&
        _ccs[2] > _lastCcs[0]
      ) {
        activatedComponents[i].ccs = `${_lastCcs[0]}
        /${_ccs[3]}
        /${_lastCcs[2]}
        /${_ccs[3] + activatedComponents[i].width}`;

        if (_width > _rwidth) _downMaxWidth = _width;
        else _downMaxWidth = _rwidth;

        _downMaxWidth = Math.max(
          _downMaxWidth,
          rightMoveComponents(
            getComponentCcs(activatedComponents[i].ccs),
            _lastCcs,
            i
          )
        );
      }
    }
    console.log("_downMaxWidth", _downMaxWidth);
    let // 最大宽度
      _upMaxWidth = 0;

    // 变型元素前的元素查找，并执行左移操作
    for (let i = index - 1; i >= 0; i--) {
      let _lastCcs = getComponentCcs(activatedComponents[i].ccs);

      const _width = activatedComponents[i].width,
        _rwidth = i + 1 === index ? 0 : activatedComponents[i + 1].width;

      if (
        _ccs[3] > _lastCcs[1] &&
        _oCcs[3] <= _lastCcs[1] &&
        _ccs[0] < _lastCcs[2] &&
        _ccs[2] > _lastCcs[0]
      ) {
        activatedComponents[i].ccs = `${_lastCcs[0]}
        /${_ccs[3] - (_oCcs[3] - _lastCcs[1] <= 0 ? 0 : _oCcs[3] - _lastCcs[1])}
        /${_lastCcs[2]}
        /${
          _ccs[3] +
          activatedComponents[i].width -
          (_oCcs[3] - _lastCcs[1] <= 0 ? 0 : _oCcs[3] - _lastCcs[1])
        }`;

        if (_width > _rwidth) _upMaxWidth = _width;
        else _upMaxWidth = _rwidth;

        _upMaxWidth = Math.max(
          _upMaxWidth,
          rightMoveComponents(
            getComponentCcs(activatedComponents[i].ccs),
            _lastCcs,
            i
          )
        );
      }
    }
    console.log("_upMaxWidth", _upMaxWidth);
    return _downMaxWidth > _upMaxWidth ? _downMaxWidth : _upMaxWidth;
  };

  /** end **/

  /**
   * 已弃用思路，现已用递归方式查找代替
   * 校准插入点后元素占位,不包括点击元素本身
   * ccs格式：1/1/3/3 表示起始行/起始列/结束行/结束列 实际宽度为结束列-起始列 故需+1
   * 元素长宽和grid长宽格式一致 无需加+1
   * @param lastComponents 平移元素，且其前必有下移元素
   * @param extraComponents 下移元素，包括拖动大小时已在下行元素，且其第一个元素一定在行头
   */
  const judgeLocation = (
    lastComponents: ComponentItem[],
    transDistance: number,
    extraComponents: ComponentItem[]
  ) => {
    // 复制对象，防止引用类型数据的修改导致原数据的变化
    let _lastComponents: ComponentItem[] = JSON.parse(
        JSON.stringify(lastComponents)
      ),
      _extraComponents: ComponentItem[] = JSON.parse(
        JSON.stringify(extraComponents)
      ),
      _transDistance = transDistance;

    //console.log("_lastComponents", _lastComponents);
    //console.log("_extraComponents", _extraComponents);

    // 判断是否有元素平移
    console.log("---------last----------");
    if (_lastComponents.length > 0) {
      let // 起始行
        _rowStart: number = 0,
        // 起始列
        _columnStart: number = 0;

      _lastComponents.map((item) => {
        const _componentCcs = getComponentCcs(
          activatedComponents[item.rowIndex].ccs
        );

        _rowStart = _componentCcs[0];

        // 起始列等于未平移距离加上该元素起始列
        _columnStart = _componentCcs[1] + _transDistance;

        // 平移元素
        activatedComponents[item.rowIndex].ccs =
          _rowStart +
          "/" +
          _columnStart +
          "/" +
          (_rowStart + item.height) +
          "/" +
          (_columnStart + item.width);
      });

      // 平移完成故清空，避免重复平移，递归调用
      _lastComponents = [];
    }

    // 判断是否有元素下移
    console.log("---------extra----------");
    if (_extraComponents.length > 0) {
      // 获取需下移元素中的第一个元素，此时元素还未折行，数据仍是原数据
      const _endComponent = _extraComponents[_extraComponents.length - 1];

      let _fristCcs = getComponentCcs(_endComponent.ccs);

      // 第一元素列起点为1，无需下移，后续也不用处理，直接返回
      if (_fristCcs[1] === 1) return;

      // 获取对应第一元素的上一个元素
      const _prevComponent = activatedComponents[_endComponent.rowIndex - 1],
        _prevCcs = getComponentCcs(_prevComponent.ccs);

      // 若第一个元素已超出Grid高度则直接删除, 并返回
      if (_prevCcs[2] + _endComponent.height > gridRow + 1) {
        activatedComponents.splice(
          _endComponent.rowIndex,
          _extraComponents.length
        );
        return;
      }

      // 获取元素未这行前所在行元素中的元素最大长度
      // 注意：因为位置还未改变，行元素包括已折行元素，故需要从行元素中清除
      const _rowBestCcs = getRowMaxHeight(_endComponent);

      let _rowStart = _rowBestCcs[2],
        _columnStart = 1;

      console.log("折行元素", _fristCcs);
      console.log("_endComponent.rowIndex", _endComponent.rowIndex);

      // 设置第一个元素位置
      activatedComponents[_endComponent.rowIndex].ccs =
        _rowStart +
        "/" +
        _columnStart +
        "/" +
        (_rowStart + _endComponent.height) +
        "/" +
        (_endComponent.width + 1 < gridColumn + 1
          ? _columnStart + _endComponent.width
          : gridColumn + 1);

      // 循环下移元素, 折行视作整行折行，故不考虑下方元素的位置
      for (
        let i = _endComponent.rowIndex + 1;
        i < activatedComponents.length;
        i++
      ) {
        const _componentCcs = getComponentCcs(activatedComponents[i].ccs);

        // 同行元素不下移
        if (_rowBestCcs[2] > _componentCcs[0]) continue;

        console.log("下移元素", activatedComponents[i]);

        activatedComponents[i].ccs =
          _componentCcs[0] +
          _endComponent.height +
          "/" +
          _componentCcs[1] +
          "/" +
          (_componentCcs[2] + _endComponent.height) +
          "/" +
          _componentCcs[3];
      }

      // 位置已移动，故从原需下移列表中清除
      _extraComponents.pop();
    }

    console.log("---------end----------");

    // 按activatedComponents内索引更新rowIndex，效率有待提升
    sortComponent();
    updateRowIndex();

    // console.log(activatedComponents);

    // 判断是否还有需平移和下移元素
    if (_lastComponents.length === 0 && _extraComponents.length === 0) return;
    else {
      // 因位置改变，_extraComponents中元素的rowindex需要重新计算
      for (let i = 0; i < activatedComponents.length; i++) {
        const item = activatedComponents[i];

        if (item.key === _extraComponents[0].key) {
          _extraComponents[0].rowIndex = item.rowIndex;
          break;
        }
      }
    }

    judgeLocation(_lastComponents, _transDistance, _extraComponents);
    // console.log('_lastComponents', _lastComponents);
    // console.log('_extraComponents', _extraComponents);
  };

  /**
   * 微件聚焦
   * @param key 微件的key值
   */
  const focusComponent = (key: string) => {
    activatedComponents.map((item, index) => {
      if (item.key === key) {
        blockRefs.current["block" + index].style.borderColor = " red";
        blockRefs.current["block" + index].style.zIndex = "999";
      } else {
        blockRefs.current["block" + index].style.borderColor = " #979797";
        blockRefs.current["block" + index].style.zIndex = "0";
      }
    });
  };

  /**
   * 微件向上扩大，位置信息有grid控制。
   * @description 鼠标点击微件顶部，拖动鼠标可使微件高度增加
   * @param e 鼠标事件
   * @param index 微件索引
   */
  const moveTop = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    e.preventDefault(); // 阻止默认事件

    const oBlock = blockRefs.current["block" + index], // 获取当前点击微件
      gridUnit = gridScale + gridPadding,
      _gridArea = getComponentCcs(oBlock.style.gridArea), // 获取当前微件的gridArea值
      _maxTop = Math.max(0, _gridArea[0] - 1) * gridUnit; // 最大可移动距离, 无需减去gridPadding

    oBlock.style.borderColor = " red"; // 设置边框颜色为红色
    oBlock.style.zIndex = "999"; // 设置z-index为999

    let disY = e.clientY - 0, // 获取鼠标点击的位置
      oTop: string | number = 0; // 初始化oTop，用于存储微件的top值

    // 控制微件高度
    document.onmousemove = (e) => {
      e.preventDefault(); // 阻止默认事件

      let top: string | number = e.clientY - disY,
        // 计算最小高度
        minHeight =
          activatedComponents[index].minHeight * gridUnit - gridPadding;

      // $ 表示已到画布边缘
      // # 表示已到元素最小值
      if (oTop === "$" || oTop === "#") {
        if (
          (top < 0 && Math.abs(top) < _maxTop) ||
          (top >= 0 &&
            // 计算最小高度到元素高度的距离，移动距离小于该距离也需移动
            top <=
              (_gridArea[2] - _gridArea[0]) * gridUnit -
                gridPadding -
                minHeight)
        ) {
          if (oTop === "$") oTop = top - 1;
          else if (oTop === "#") oTop = top + 1;
        } else return;
      } else oTop = Number(oTop);

      // 计算每个格子的宽度
      const // 0为起始点，top增大，高度变小，反之亦然
        newHeight = oBlock.offsetHeight + (oTop - top),
        maxHeight = (_gridArea[2] - 1) * gridUnit - gridPadding;

      if (oTop < top) {
        if (newHeight <= minHeight) {
          oBlock.style.height = `${minHeight}px`;
          oBlock.style.top = `${
            (_gridArea[2] - _gridArea[0]) * gridUnit - gridPadding - minHeight
          }px`;
          top = "#"; // 标记停止移动
        } else {
          oBlock.style.height = `${newHeight}px`;
          oBlock.style.top = `${top}px`;
        }
      } else {
        if (newHeight >= maxHeight) {
          oBlock.style.height = `${maxHeight}px`;
          oBlock.style.top = `${-_maxTop}px`;
          top = "$"; // 标记停止移动
        } else {
          oBlock.style.height = `${newHeight}px`;
          oBlock.style.top = `${top}px`;
        }
      }

      oTop = top;
    };

    // 松开后对微件后的元素进行处理
    document.onmouseup = () => {
      // 需加上一个gridPadding才是计算高度
      let _height = Math.ceil(
        (oBlock.offsetHeight + gridPadding) / (gridScale + gridPadding)
      );

      // 改变元素高度，越小越高
      _gridArea[0] = _gridArea[0] - (_height - (_gridArea[2] - _gridArea[0]));
      //console.log(_gridArea);

      // 浏览器补丁
      oBlock.style.height = "100%"; // 必须设回百分比，不然grid-area无法起效
      oBlock.style.top = "0"; // 必须设为0，不然无法恢复正确位置

      // 更新元素状态
      activatedComponents[index].ccs = _gridArea.join("/"); // 更新元素大小
      activatedComponents[index].height = _gridArea[2] - _gridArea[0]; // 更新元素高度

      //清空事件
      document.onmousemove = null;
      document.onmousedown = null;
      document.onmouseup = null;
    };
  };

  /**
   * 微件向右移动，位置信息有grid控制。
   * @description 鼠标点击微件右边，拖动鼠标可使微件宽度增加。右边接触其他微件后，接触微件自动移位
   * @param e 鼠标事件
   * @param index 微件索引
   */
  const moveRight = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    e.preventDefault(); // 阻止默认事件

    const oBlock = blockRefs.current["block" + index], //获取当前点击微件
      oCcs = getComponentCcs(activatedComponents[index].ccs), //获取当前点击微件的ccs
      gridUnit = gridScale + gridPadding,
      _gridArea = getComponentCcs(oBlock.style.gridArea); // 获取当前微件的gridArea值

    let disX = e.clientX - 0, // 鼠标点击位置
      oRight: string | number = 0, // 上一次移动距离
      _maxRight = Math.max(0, gridColumn - _gridArea[3] + 1) * gridUnit, // 无需减去gridPadding
      _rMaxWidth = 0;
    console.log("_maxRight1", _maxRight);
    oBlock.style.borderColor = " red";
    oBlock.style.zIndex = "999";
    // 修改微件实例宽度为100%，以便自适应变型的宽度
    if (oBlock.firstElementChild) {
      (oBlock.firstElementChild as HTMLElement).style.width = "100%";
    }

    // 控制微件宽度
    document.onmousemove = (e) => {
      e.preventDefault(); // 阻止默认事件

      let right: string | number = e.clientX - disX,
        _rminWidth =
          activatedComponents[index].minWidth * gridUnit - gridPadding;

      // $ 表示已到画布边缘
      // # 表示已到元素最小值
      if (oRight === "$" || oRight === "#") {
        if (
          (right < 0 &&
            right >=
              _rminWidth -
                (_gridArea[3] - _gridArea[1]) * gridUnit +
                gridPadding) ||
          (right >= 0 && Math.abs(right) < _maxRight)
        ) {
          console.log("_maxRight2", _maxRight);
          if (oRight === "$") oRight = right + 1;
          else if (oRight === "#") oRight = right - 1;
          console.log("1");
        } else return;
      } else oRight = Number(oRight);

      let _cWidth = oBlock.offsetWidth + (right - oRight),
        _maxWidth = (gridColumn - _gridArea[1] + 1) * gridUnit - gridPadding;

      if (oRight < right) {
        if (_cWidth >= _maxWidth) {
          // 元素宽度超过最大宽度，标记为$
          oBlock.style.width = _maxWidth + "px";
          right = "$";
        } else {
          oBlock.style.width = _cWidth + "px";
        }
      } else {
        if (_cWidth <= _rminWidth) {
          // 元素宽度小于最小宽度，标记为#
          oBlock.style.width = _rminWidth + "px";
          right = "#";
        } else {
          oBlock.style.width = _cWidth + "px";
        }
      }

      oRight = right;

      //======== 处理当前元素后的元素 ========//

      // 通过限制宽度取整商的范围，减少递归的运算次数，节省资源
      const _modulo = (_cWidth / (gridScale + gridPadding)) % 1;
      if (0.05 > _modulo && _modulo >= 0.1) return;

      let // 变形元素，值还未变，与oCcs不关联
        _componentCcs = getComponentCcs(activatedComponents[index].ccs);

      // 实时更新已变形元素的宽度
      _componentCcs[3] =
        Math.ceil((oBlock.offsetWidth + 0.5) / (gridScale + gridPadding)) + 1;

      // 获取移动元素的宽度和
      const _inter = rightMoveComponents(_componentCcs, oCcs, index);
      if (_inter) _rMaxWidth = _inter;

      // 存储 Maxwidth ！！！！！！

      // 单位转换
      _rMaxWidth = _rMaxWidth * gridUnit - gridPadding;
      console.log("_rMaxWidth", _rMaxWidth);
      _maxWidth = gridColumn * gridUnit - gridPadding;
      console.log("_cWidth", _cWidth);
      // 拖动元素后的元素是否已经达到最小值
      if (_cWidth + _rMaxWidth >= _maxWidth) {
        console.log("_maxRight3", _maxRight);
        console.log("_rWidth", _rMaxWidth);
        _maxRight -= _rMaxWidth;
        console.log("_maxRight4", _maxRight);
        oBlock.style.width = _cWidth + "px";
        oRight = "$";
      }
    };

    // 松开后对微件后的元素进行处理
    document.onmouseup = () => {
      const _width = Math.ceil(oBlock.offsetWidth / (gridScale + gridPadding)),
        _gridArea = getComponentCcs(oBlock.style.gridArea);

      // 超过边界，固定为最大宽度
      _gridArea[3] =
        _gridArea[1] + _width < gridColumn + 1
          ? _gridArea[1] + _width
          : gridColumn + 1;

      // 浏览器补丁
      oBlock.style.width = "100%"; //必须设回百分比，不然grid-area无法起效

      // 更新元素状态
      activatedComponents[index].ccs = _gridArea.join("/");
      activatedComponents[index].width = _gridArea[3] - _gridArea[1];

      //======== 处理当前元素后的元素 ========//

      // 清空事件
      document.onmousemove = null;
      document.onmousedown = null;
      document.onmouseup = null;
    };
  };

  /**
   * 微件向下移动，位置信息有grid控制。
   * @description 鼠标点击微件下边，拖动鼠标可使微件长度增加。下边接触其他微件后，接触微件自动移位
   * @param e 鼠标事件
   * @param index 微件索引
   */
  const moveDown = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    e.preventDefault(); // 阻止默认事件

    const oBlock = blockRefs.current["block" + index], //获取当前点击微件
      gridUnit = gridScale + gridPadding,
      _gridArea = getComponentCcs(oBlock.style.gridArea), // 获取当前微件的gridArea值
      _maxDown = (gridRow - _gridArea[2] + 1) * gridUnit; // 最大可移动距离, 无需减去gridPadding

    oBlock.style.borderColor = "red";
    oBlock.style.zIndex = "999";

    // 修改微件实例高度为100%，以便自适应变型的高度
    if (oBlock.firstElementChild) {
      if (oBlock.firstElementChild) {
        (oBlock.firstElementChild as HTMLElement).style.height = "100%";
      }
    }

    let disY = e.clientY - 0, // 鼠标点击位置
      oDown: string | number = 0; // 初始化oDown，用于存储微件的down值

    document.onmousemove = (e) => {
      e.preventDefault(); // 阻止默认事件

      let down: string | number = e.clientY - disY, // 移动距离
        minHeight =
          activatedComponents[index].minHeight * gridUnit - gridPadding;

      // $ 表示已到画布边缘
      // # 表示已到元素最小值
      if (oDown === "$" || oDown === "#") {
        if (
          (down > 0 && Math.abs(down) < _maxDown) ||
          (down <= 0 &&
            // 计算最小高度到元素高度的距离，移动距离小于该距离也需移动
            down >=
              minHeight -
                (_gridArea[2] - _gridArea[0]) * gridUnit +
                gridPadding)
        ) {
          if (oDown === "$") oDown = down - 1;
          else if (oDown === "#") oDown = down + 1;
        } else return;
      } else oDown = Number(oDown);

      // 计算每个格子的宽度
      const // 0为起始点，top增大，高度变大，反之亦然
        newHeight = oBlock.offsetHeight - (oDown - down),
        maxHeight = (gridRow - _gridArea[0] + 1) * gridUnit - gridPadding;

      if (oDown < down) {
        if (newHeight < maxHeight) {
          oBlock.style.height = `${newHeight}px`;
        } else {
          oBlock.style.height = `${maxHeight}px`;
          down = "#"; // 标记停止移动
        }
      } else {
        if (newHeight > minHeight) {
          oBlock.style.height = `${newHeight}px`;
        } else {
          oBlock.style.height = `${minHeight}px`;
          down = "$"; // 标记停止移动
        }
      }

      oDown = down;
    };

    document.onmouseup = () => {
      const _height = Math.ceil(
        oBlock.offsetHeight / (gridScale + gridPadding)
      );

      let _gridArea = getComponentCcs(oBlock.style.gridArea);

      _gridArea[2] =
        _gridArea[0] + _height < gridRow + 1
          ? _gridArea[0] + _height
          : gridRow + 1;

      // 浏览器补丁 必须设回百分比，不然grid-area无法生效
      oBlock.style.height = "100%";

      activatedComponents[index].ccs = _gridArea.join("/");
      activatedComponents[index].height = _height;

      //======== 处理当前元素后的元素 ========//

      const // 当前变形元素
        _componentCcs = getComponentCcs(activatedComponents[index].ccs);

      const // 下移变形元素后的元素，执行递归操作，直到没有相邻的元素
        downMoveComponents = (componentCcs: number[], index: number) => {
          const // 已变形或位移的元素
            _ccs = componentCcs;

          // 下移元素后的元素查找，并执行下移操作
          for (let i = index + 1; i < activatedComponents.length; i++) {
            let _lastCcs = getComponentCcs(activatedComponents[i].ccs);

            if (
              _ccs[2] > _lastCcs[0] &&
              _ccs[1] < _lastCcs[3] &&
              _ccs[3] > _lastCcs[1]
            ) {
              console.log("activatedComponents[i]", activatedComponents[i]);

              activatedComponents[i].ccs =
                _ccs[2] +
                "/" +
                _lastCcs[1] +
                "/" +
                (_ccs[2] + activatedComponents[i].height) +
                "/" +
                _lastCcs[3];

              _lastCcs = getComponentCcs(activatedComponents[i].ccs);
              downMoveComponents(_lastCcs, i);
            }
          }
        };

      downMoveComponents(_componentCcs, index);
      focusComponent(activatedComponents[index].key);

      //清空事件
      document.onmousemove = null;
      document.onmousedown = null;
      document.onmouseup = null;
    };
  };

  // 微件向左移动
  const moveLeft = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    e.preventDefault(); // 阻止默认事件

    let oBlock = blockRefs.current["block" + index], //获取当前点击微件
      disX = e.clientX - 0,
      oLeft: number | string = 0;

    oBlock.style.borderColor = "red";
    oBlock.style.zIndex = "999";

    document.onmousemove = (e) => {
      e.preventDefault(); // 阻止默认事件

      if (String(oLeft) === "$") return;
      let left: number | string = e.clientX - disX;
      if (typeof oLeft === 'number' && typeof left === 'number' && oLeft < left) {
        //减去一个gridPadding才是微件的大小
        let _rminWidth =
          activatedComponents[index].minWidth * (gridScale + gridPadding) -
          gridPadding;
        let _cWidth = oBlock.offsetWidth + (oLeft - left);
        if (_cWidth >= _rminWidth) {
          oBlock.style.width = _cWidth + "px";
          oBlock.style.left = left + "px";
        } else {
          oBlock.style.width = _rminWidth + "px";
          left = "$";
        }
      } else {
        oBlock.style.width = oBlock.offsetWidth - (left - oLeft) + "px";
        oBlock.style.left = left + "px";
      }

      oLeft = left;
    };
    document.onmouseup = () => {
      //需加上一个gridPadding才是计算宽度
      let _width = Math.ceil(
          (oBlock.offsetWidth + gridPadding) / (gridScale + gridPadding)
        ),
        _left = Math.ceil(oBlock.offsetLeft / (gridScale + gridPadding));
      if (oLeft === "$") {
        _left = _left + 1;
      } else {
        //超过边界，固定为1
        if (_left <= 0) _left = 1;
        //_left = 0;
      }

      let _gridArea = oBlock.style.gridArea
        .split("/")
        .map((item) => Number(item));
      let _prevCcs =
        index - 1 >= 0
          ? activatedComponents[index - 1].ccs
              .split("/")
              .map((item) => Number(item))
          : [_gridArea[0], _gridArea[1], 1, 1];

      //判断是否换行
      if (
        _prevCcs[0] === _gridArea[0] &&
        _prevCcs[3] + _width <= gridColumn + 1
      ) {
        if (_prevCcs[3] === _gridArea[1]) _gridArea[1] = _prevCcs[3];
        else _gridArea[1] = _left;
        _gridArea[3] = _gridArea[1] + _width;
      } else {
        _gridArea[0] = _prevCcs[2];
        _gridArea[1] = _left;
        _gridArea[2] = _prevCcs[2] + activatedComponents[index].height;
        _gridArea[3] =
          _left + _width < gridColumn + 1 ? _left + _width : gridColumn + 1;
      }

      console.log(_gridArea);

      oBlock.style.gridArea = _gridArea.join("/");
      oBlock.style.width = "100%"; //必须设回百分比，不然grid-area无法奇效
      oBlock.style.left = "0"; //必须设为0，不然无法恢复正确位置
      activatedComponents[index].ccs = oBlock.style.gridArea;
      activatedComponents[index].width = _gridArea[3] - _gridArea[1];

      let _componentCcs = activatedComponents[index].ccs
        .split("/")
        .map((item) => Number(item));
      let _lastComponents = [];
      let _extraComponents = [];
      let _lastWidth = 0;

      for (let i = index + 1; i < activatedComponents.length; i++) {
        let _ccs = activatedComponents[i].ccs
          .split("/")
          .map((item) => Number(item));

        if (
          _componentCcs[0] === _ccs[0] &&
          _componentCcs[3] + activatedComponents[i].width + _lastWidth <=
            gridColumn + 1
        ) {
          _lastComponents.push({
            ...activatedComponents[i],
            rowIndex: i,
          });
          //console.log('_lastComponents', activatedComponents[i]);
        } else {
          _extraComponents.push({
            ...activatedComponents[i],
            rowIndex: i,
          });
          //console.log('_extraComponents', activatedComponents[i]);
        }

        _lastWidth = activatedComponents[i].width + _lastWidth;
      }

      focusComponent(activatedComponents[index].key);
      judgeLocation(_lastComponents, 0, _extraComponents);

      //清空事件
      document.onmousemove = null;
      document.onmousedown = null;
      document.onmouseup = null;
    };
  };

  /**
   * 获取微件位置
   * @param e 鼠标事件
   * @param gDiv 容器
   */
  const getPosition = (
    e: MouseEvent | React.MouseEvent<HTMLSpanElement>,
    gDiv: HTMLElement
  ) => {
    e.preventDefault(); // 阻止默认事件

    let _positions = "";
    let _y = e.clientY - gDiv.offsetTop - rowDeviationValue.current;
    let _x = e.clientX - gDiv.offsetLeft - columnDeviationValue.current;

    //设置边界值
    if (topMax.current && e.clientY - gDiv.offsetTop <= topMax.current)
      _y = topMax.current;
    if (rightMax.current && e.clientX - gDiv.offsetLeft >= rightMax.current)
      _x = rightMax.current - columnDeviationValue.current;
    if (downMax.current && e.clientY - gDiv.offsetTop >= downMax.current)
      _y = downMax.current - rowDeviationValue.current;
    if (leftMax.current && e.clientX - gDiv.offsetLeft <= leftMax.current)
      _x = leftMax.current;

    // console.log(_y);
    // console.log(_x);
    // console.log(e.clientX);
    // console.log(gDiv.offsetLeft);
    // console.log('rowDeviationValue', rowDeviationValue.value);
    // console.log('_yy', e.clientY - gDiv.offsetTop);

    //找出当前点击格子, 出现未知值时固定为1
    for (let i = 0; i < gridRow; i++) {
      if (
        _y >= i * (gridScale + gridPadding) &&
        _y < (i + 1) * (gridScale + gridPadding)
      ) {
        for (let j = 0; j < gridColumn; j++) {
          if (
            _x >= j * (gridScale + gridPadding) &&
            _x < (j + 1) * (gridScale + gridPadding)
          ) {
            _positions =
              "g" +
              (i + 1 - rowDifferences.current > 0
                ? i + 1 - rowDifferences.current
                : 1) +
              "x" +
              (j + 1 - columnDifferences.current > 0
                ? j + 1 - columnDifferences.current
                : 1);
            break;
          }
        }
        break;
      }
    }

    // console.log('_positions', _positions);
    return _positions;
  };

  /**
   * 移动位置
   * @param blockName dom名称
   * @param oDiv 容器
   * @param component 微件信息
   */
  const changeBlock = (
    blockName: string,
    oDiv: HTMLElement,
    component: ComponentItem,
    index: number
  ) => {
    //console.log(blockName);
    let _cs = blockName
      .replace("g", "")
      .split("x")
      .map((item) => Number(item));
    //console.log("_cs", _cs);
    let _row = _cs[0] + component.height;
    let _column = _cs[1] + component.width;
    //设置元素大小位置
    oDiv.style.gridArea =
      _cs[0] +
      "/" +
      _cs[1] +
      "/" +
      (_row < gridRow + 1 ? _row : gridRow + 1) +
      "/" +
      (_column < gridColumn + 1 ? _column : gridColumn + 1);

    _activatedComponents[index] = {
      ...component,
      ccs: oDiv.style.gridArea,
    };

    console.log("area", oDiv.style.gridArea);
  };

  /**
   * 鼠标按下
   * @param e 鼠标事件
   * @param component 微件信息
   * @param index 微件索引
   */
  const mousedown = (
    e: React.MouseEvent<HTMLDivElement>,
    component: ComponentItem,
    index: number
  ) => {
    e.preventDefault(); // 阻止默认事件，防止浏览器拖动元素

    // 获取点击的目标元素，处理 e.target 可能为 null 的情况，同时转换类型以访问 parentElement 属性
    let oDiv = e.target ? (e.target as HTMLElement).parentElement : null;
    //console.log("oDiv", oDiv);
    if (
      oDiv === null ||
      oDiv.className === "title" ||
      oDiv.className === "delete" ||
      oDiv.className === "form" ||
      oDiv.className === "morph" ||
      oDiv.parentElement?.className === "title" ||
      oDiv.parentElement?.className === "form" ||
      oDiv.parentElement?.className === "delete" ||
      oDiv.parentElement?.className === "morph"
    )
      return;

    let _componentCcs = getComponentCcs(component.ccs);
    //console.log("_componentCcs", _componentCcs);

    // 获取点击元素的父级元素，移动端直接抓取tabs
    let gDiv = oDiv.parentElement;

    let disX = e.clientX - 0;
    let disY = e.clientY - 0;
    oDiv.style.borderColor = " red";
    oDiv.style.zIndex = "999";

    if (gDiv === null) return;

    //因每次点击位置不同，故初始化差值
    columnDifferences.current = 0;
    rowDifferences.current = 0;
    columnDeviationValue.current = 0;
    rowDeviationValue.current = 0;
    leftMax.current = 0;
    topMax.current = 0;
    downMax.current = 0;
    rightMax.current = 0;

    let _positions = getPosition(e, gDiv)
      .replace("g", "")
      .split("x")
      .map((item) => Number(item));
    //console.log("first", _positions);

    rowDifferences.current = _positions[0] - _componentCcs[0];
    //console.log("rowDifferences", rowDifferences.current);
    rowDeviationValue.current =
      e.clientY -
      gDiv.offsetTop -
      (_positions[0] - 1) * (gridScale + gridPadding);
    //console.log("rowDeviationValue", rowDeviationValue.current);
    columnDifferences.current = _positions[1] - _componentCcs[1];
    //console.log("columnDifferences", columnDifferences.current);
    columnDeviationValue.current =
      e.clientX -
      gDiv.offsetLeft -
      (_positions[1] - 1) * (gridScale + gridPadding);
    //console.log('columnDeviationValue', columnDeviationValue.value);

    topMax.current =
      e.clientY -
      gDiv.offsetTop -
      (_componentCcs[0] - 1) * (gridScale + gridPadding);
    rightMax.current =
      e.clientX -
      gDiv.offsetLeft +
      (gridColumn + 1 - _componentCcs[3]) * (gridScale + gridPadding);
    downMax.current =
      e.clientY -
      gDiv.offsetTop +
      (gridRow + 1 - _componentCcs[2]) * (gridScale + gridPadding);
    //console.log('downMax', rightMax.value);
    leftMax.current =
      e.clientX -
      gDiv.offsetLeft -
      (_componentCcs[1] - 1) * (gridScale + gridPadding);

    document.onmousemove = (e) => {
      e.preventDefault();

      let left = e.clientX - disX;
      let top = e.clientY - disY;
      if (oDiv === null) return;
      let _axis =
        oDiv.style.gridArea.split("/").map((item) => Number(item)) || [];

      if (_axis.length === 0) return;

      //上边界
      let _topBoundary =
        0 + _axis[0] * (gridScale + gridPadding) - (gridScale + gridPadding);
      if (top < -_topBoundary) top = -_topBoundary;

      //右边界
      let _rightBoundary =
        gridColumn * (gridScale + gridPadding) -
        (_axis[3] - 1) * (gridScale + gridPadding);
      if (left > _rightBoundary) left = _rightBoundary;

      //下边界
      let _bottomBoundary =
        gridRow * (gridScale + gridPadding) -
        (_axis[2] - 1) * (gridScale + gridPadding);
      if (top > _bottomBoundary) top = _bottomBoundary;

      //左边界
      let _leftBoundary =
        0 + _axis[1] * (gridScale + gridPadding) - (gridScale + gridPadding);
      if (left < -_leftBoundary) left = -_leftBoundary;

      oDiv.style.left = left + "px";
      oDiv.style.top = top + "px";

      _activatedComponents[index] = {
        ...component,
        positionX: left,
        positionY: top,
      };
    };

    document.onmouseup = (e) => {
      e.preventDefault();

      if (gDiv === null || oDiv === null) return;

      let _positions = getPosition(e, gDiv);
      //console.log("second", _positions);
      //console.log(e.target);
      if (_positions && _positions.split("x")[1] != "NaN") {
        changeBlock(_positions, oDiv, component, index);
        oDiv.style.left = "0px";
        oDiv.style.top = "0px";

        //console.log(_component);
        let _focusComponent = {};
        let _lastComponents = [];
        let _extraComponents = [];
        // onsole.log("componentCcs", _componentCcs);

        //现已左上角顶点落点为判断条件
        // activatedComponents.map((item, i) => {
        //   let _ccs = item.ccs.split("/").map((item) => Number(item));

        //   if (
        //     component.key !== item.key &&
        //     _componentCcs[0] >= _ccs[0] &&
        //     _componentCcs[0] < _ccs[2] &&
        //     _componentCcs[1] >= _ccs[1] &&
        //     _componentCcs[1] < _ccs[3]
        //   ) {
        //     //console.log('get', index);
        //     let _ccs = item.ccs.split("/").map((item) => Number(item));
        //     if (
        //       Math.abs(_ccs[2] - _componentCcs[0]) /
        //         Math.min(...[item.height, component.height]) >=
        //         0.7 &&
        //       Math.abs(_ccs[3] - _componentCcs[1]) /
        //         Math.min(...[item.width, component.width]) >=
        //         0.7
        //     )
        //       _focusComponent = { ...item, rowIndex: i };
        //   }
        // });

        // //console.log('_focusComponent', _focusComponent);

        // //定位
        // if (Object.keys(_focusComponent).length > 0) {
        //   let _focusComponentCcs = _focusComponent.ccs
        //     .split("/")
        //     .map((item) => Number(item));
        //   //console.log('focusRowCcs', _focusComponentCcs);
        //   //定位拖动元素
        //   oDiv.style.gridArea =
        //     _focusComponentCcs[0] +
        //     "/" +
        //     _focusComponentCcs[1] +
        //     "/" +
        //     (_focusComponentCcs[0] + _component.height) +
        //     "/" +
        //     (_focusComponentCcs[1] + _component.width);

        //   _component.ccs = oDiv.style.gridArea;

        //   //console.log('focus', _focusComponent);

        //   activatedComponents.splice(_focusComponent.rowIndex, 0, _component);
        //   activatedComponents.splice(
        //     _componentIndex > _focusComponent.rowIndex
        //       ? _componentIndex + 1
        //       : _componentIndex,
        //     1
        //   );

        //   oDiv = blockRefs.current["block" + _focusComponent.rowIndex];

        //   //获取插入元素新的位置信息
        //   _componentCcs = _component.ccs.split("/").map((item) => Number(item));
        //   //console.log('_componentCcs', _componentCcs);

        //   //行累计宽度
        //   let _lastWidth = 0;
        //   //获取插入后同行元素和不同行元素
        //   for (
        //     let i =
        //       (_componentIndex > _focusComponent.rowIndex
        //         ? _focusComponent.rowIndex
        //         : _focusComponent.rowIndex - 1) + 1;
        //     i < activatedComponents.length;
        //     i++
        //   ) {
        //     let _lastCcs = activatedComponents[i].ccs
        //       .split("/")
        //       .map((item) => Number(item));
        //     if (
        //       _componentCcs[0] <= _lastCcs[0] &&
        //       _lastCcs[0] <= _componentCcs[2]
        //     ) {
        //       if (
        //         _componentCcs[3] + activatedComponents[i].width + _lastWidth <=
        //         gridColumn + 1
        //       )
        //         _lastComponents.push({
        //           ...activatedComponents[i],
        //           rowIndex: i,
        //         });
        //       else
        //         _extraComponents.push({
        //           ...activatedComponents[i],
        //           rowIndex: i,
        //         });
        //       _lastWidth = activatedComponents[i].width + _lastWidth;
        //     } else {
        //       _extraComponents.push({
        //         ...activatedComponents[i],
        //         rowIndex: i,
        //       });
        //     }
        //   }
        // }

        sortComponent();
        focusComponent(component.key);
      }

      // 更新激活组件
      setActivatedComponents([..._activatedComponents]);

      console.log("activatedComponents", activatedComponents);

      //清空事件
      document.onmousemove = null;
      document.onmouseup = null;
    };
  };

  // 确认信息
  const showConfirm = (index: number) => {
    console.log(index);
    modal.confirm({
      title: "提示",
      content: "是否确认删除此微件？",
      okText: "确定",
      cancelText: "取消",
      onOk: () => {
        removeComponent(index);
      },
    });
  };

  // 删除微件
  const removeComponent = (index: number) => {
    // 更新激活组件
    setActivatedComponents([..._activatedComponents.filter((_, i) => i !== index)]);
  };

  return (
    <>
      <div
        className="container pc"
        style={{
          width: (gridScale + gridPadding) * gridColumn - 20 + "px",
          gridTemplateColumns: getGridTemplateColumns,
          gridTemplateRows: getGridTemplateRows,
          gridTemplateAreas: getGridTemplateAreas,
        }}
      >
        {activatedComponents.map((item, index) => (
          <div
            key={index}
            className="block animated"
            style={{
              top: item.positionY,
              left: item.positionX,
              gridArea: item.ccs,
            }}
            ref={(el) => {
              if (el) blockRefs.current["block" + index] = el;
            }}
          >
            <div
              className="shape"
              onMouseDown={(e) => mousedown(e, item, index)}
            >
              <div className="title">
                <a href="javascript:void(0)">{item.title}</a>
              </div>
              <div className="delete">
                <button type="button" onClick={() => showConfirm(index)}>
                  删除
                </button>
              </div>
              <div className="morph">
                <span className="up" onMouseDown={(e) => moveTop(e, index)}>
                  上
                </span>
                <span
                  className="right"
                  onMouseDown={(e) => moveRight(e, index)}
                >
                  右
                </span>
                <span className="down" onMouseDown={(e) => moveDown(e, index)}>
                  下
                </span>
                <span className="left" onMouseDown={(e) => moveLeft(e, index)}>
                  左
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {contextHolder}
    </>
  );
}
