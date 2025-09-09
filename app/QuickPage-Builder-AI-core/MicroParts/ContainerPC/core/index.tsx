"use client";

import { useMemo, useState, useEffect, Suspense, ComponentProps } from "react";
import { useDrop } from "react-dnd";
import { Modal, message } from "antd";

// 导入自有组件
import DrawerForm from "./drawerForm";

// 导入类型
import type { ContainerPCProps } from "../../types/common";
import type { ComponentItem } from "../../../types/common";

// 导入动态组件渲染函数
import { dynamicComponent } from "../utils";

// 导入样式
import "./styles.core.css";

export default function Core({
  gridColumn, // 容器列数
  gridRow, // 容器行数
  gridScale, // 容器缩放比例
  gridPadding, // 容器内边距
  MicroCards, // 微件列表
  activatedComponents, // 已激活组件列表
  onActivatedComponents, // 激活组件列表改变回调
  currentIndex = "-1", // 当前选中组件索引
  moduleProps = { // 微件z-index深度
    zIndex: 0,
  },
}: ContainerPCProps) {
  // ======================
  // 响应式变量
  // ======================

  const [divTop, setDivTop] = useState(0);
  const [divBottom, setDivBottom] = useState(0);
  const [divBottomTop, setDivBottomTop] = useState(0);
  const [divRight, setDivRight] = useState(0);
  const [divRightLeft, setDivRightLeft] = useState(0);
  const [divLeft, setDivLeft] = useState(0);
  const [shouldShow, setShouldShow] = useState<number>(-1);
  const [_activatedComponents, _setActivatedComponents] = useState<
    ComponentItem[]
  >([...activatedComponents]); // 传入props的类型还需定义
  const [modal, contextHolder] = Modal.useModal();
  const [{ isOverCurrent }, drop] = useDrop(
    () => ({
      accept: "MENU_ITEM",
      drop(item: ComponentItem, monitor) {
        if (monitor.didDrop()) return;

        if (monitor.isOver()) {
          const _component: ComponentItem = {
            ...item,
            // 生成唯一key，格式: 组件key_时间戳_随机字符串
            key: `${item.key}_${
              Date.now().toString(36) + Math.random().toString(36).substring(2)
            }`,
            menuKey: item.menuKey,
          };

          _component.width = _component.props?.gridColumn
            ? _component.props?.gridColumn < _component.minWidth
              ? _component.minWidth
              : _component.props?.gridColumn
            : _component.minWidth;

          _component.height =
            _component.props?.gridRow < _component.minHeight
              ? _component.minHeight
              : _component.props?.gridRow
              ? _component.props?.gridRow
              : _component.minHeight;

          if (_activatedComponents && _activatedComponents.length > 0) {
            // 画布不为空
            // 获取最后一个组件的高度和ccs
            const { ccs } =
              _activatedComponents[_activatedComponents.length - 1];

            // 分割ccs字符串并转换为数字数组, 格式: [x, y, height, width], 相对grid-area: [grid-row-start / grid-column-start / grid-row-end / grid-column-end]
            const aCss = ccs.split("/").map(Number);

            if (
              // 判断在最后一个微件的同一行里是否有位置可以插入新微件
              aCss[0] + _component.height <= gridRow + 1 && // 高度和小于画布
              aCss[3] + _component.width <= gridColumn + 1 // 宽度和小于画布
            ) {
              _component.ccs =
                aCss[0] +
                "/" +
                aCss[3] +
                "/" +
                (aCss[0] + _component.height) +
                "/" +
                (aCss[3] + _component.width);
            } else if (
              // 判断在最后一个微件的同一行后是否有位置可以插入新微件
              aCss[0] + _component.height <= gridRow + 1 &&
              aCss[3] + _component.width > gridColumn + 1
            ) {
              // 找到最后行中组件的最大高度
              const maxHeight = _activatedComponents.reduce(
                (prev: number, curr: ComponentItem) => {
                  if (!curr.ccs) return prev;
                  return Math.max(prev, Number(curr.ccs.split("/")[2]));
                },
                0
              );

              _component.ccs =
                maxHeight +
                "/1" +
                "/" +
                (maxHeight + _component.height) +
                "/" +
                (_component.width + 1);
            } else {
              message.warning("已没有位置可以插入新组件！");
              return;
            }
          } // 画布为空，直接插入第一个组件
          else
            _component.ccs =
              "1/1/" + (_component.height + 1) + "/" + (_component.width + 1);

          // 计算组件的rowIndex，实际为插入元素个数-1，故与已激活组件为添加自身前数组长度相同
          _component.rowIndex = _activatedComponents.length;
          //console.log("monitor",monitor)
          // console.log("_component", _component.url);
          // console.log("_activatedComponents", _activatedComponents);

          _setActivatedComponents([
            ..._activatedComponents,
            { ..._component, props: { ..._component.props } },
          ]);
        }
      },
      collect: (monitor) => {
        return {
          isOverCurrent: !!monitor.isOver({ shallow: true }),
        };
      },
    }),
    [_activatedComponents]
  );

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

  // 计算网格区域,暂时弃用
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

  // ======================
  // 非响应式变量
  // ======================

  let columnDifferences = 0;
  let rowDifferences = 0;
  let columnDeviationValue = 0;
  let rowDeviationValue = 0;
  let leftMax = 0;
  let topMax = 0;
  let downMax = 0;
  let rightMax = 0;

  const blockZIndex = currentIndex.split("-").length;
  const blockRefs: Record<string, HTMLDivElement> = {};
  const borderStyle = {
    backgroundColor: "pink",
  };

  /* ====================== 普通函数 ====================== */

  // ======================
  // 工具函数
  // ======================

  /**
   * 根据已激活模块的数组顺序，更新rowIndex
   */
  const updateRowIndex = (components: ComponentItem[]) => {
    return components.map((item, index) => ({
      ...item,
      rowIndex: index,
    }));
  };

  /**
   * 微件排序
   */
  const sortComponent = (components: ComponentItem[]) => {
    return [...components].sort((x, y) => {
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

  /** 工具函数 end */

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
    for (let i = index + 1; i < _activatedComponents.length; i++) {
      let _lastCcs = getComponentCcs(_activatedComponents[i].ccs);

      const _width = _activatedComponents[i].width,
        _rwidth = i - 1 === index ? 0 : _activatedComponents[i - 1].width;

      if (
        _ccs[3] > _lastCcs[1] &&
        _oCcs[3] <= _lastCcs[1] &&
        _ccs[0] < _lastCcs[2] &&
        _ccs[2] > _lastCcs[0]
      ) {
        _activatedComponents[i].ccs = `${_lastCcs[0]}
        /${_ccs[3]}
        /${_lastCcs[2]}
        /${_ccs[3] + _activatedComponents[i].width}`;

        if (_width > _rwidth) _downMaxWidth = _width;
        else _downMaxWidth = _rwidth;

        _downMaxWidth = Math.max(
          _downMaxWidth,
          rightMoveComponents(
            getComponentCcs(_activatedComponents[i].ccs),
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
      let _lastCcs = getComponentCcs(_activatedComponents[i].ccs);

      const _width = _activatedComponents[i].width,
        _rwidth = i + 1 === index ? 0 : _activatedComponents[i + 1].width;

      if (
        _ccs[3] > _lastCcs[1] &&
        _oCcs[3] <= _lastCcs[1] &&
        _ccs[0] < _lastCcs[2] &&
        _ccs[2] > _lastCcs[0]
      ) {
        _activatedComponents[i].ccs = `${_lastCcs[0]}
        /${_ccs[3] - (_oCcs[3] - _lastCcs[1] <= 0 ? 0 : _oCcs[3] - _lastCcs[1])}
        /${_lastCcs[2]}
        /${
          _ccs[3] +
          _activatedComponents[i].width -
          (_oCcs[3] - _lastCcs[1] <= 0 ? 0 : _oCcs[3] - _lastCcs[1])
        }`;

        if (_width > _rwidth) _upMaxWidth = _width;
        else _upMaxWidth = _rwidth;

        _upMaxWidth = Math.max(
          _upMaxWidth,
          rightMoveComponents(
            getComponentCcs(_activatedComponents[i].ccs),
            _lastCcs,
            i
          )
        );
      }
    }
    console.log("_upMaxWidth", _upMaxWidth);
    return _downMaxWidth > _upMaxWidth ? _downMaxWidth : _upMaxWidth;
  };

  /**
   * 微件聚焦
   * @param key 微件的key值
   */
  const focusComponent = (index: number) => {
    if (index < 0) return;
    const block = blockRefs[`block${index}`];

    if (block && block.firstElementChild) {
      if (block.classList.contains("zIndex999"))
        block.classList.remove("zIndex999");
      else block.classList.add("zIndex999");

      if (block.firstElementChild.classList.contains("highlight")) {
        block.firstElementChild.classList.remove("highlight");
      } else {
        block.firstElementChild.classList.add("highlight");
      }
    }
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
    let _positions = "";
    let _y = e.clientY - gDiv.getBoundingClientRect().top - rowDeviationValue;
    let _x =
      e.clientX - gDiv.getBoundingClientRect().left - columnDeviationValue;

    // console.log("1", _y);
    // console.log("1", _x);
    // console.log("rowDeviationValue", rowDeviationValue);
    // console.log("columnDeviationValue", columnDeviationValue);

    //设置边界值
    if (topMax && e.clientY - gDiv.getBoundingClientRect().top <= topMax)
      _y = topMax;
    if (rightMax && e.clientX - gDiv.getBoundingClientRect().left >= rightMax)
      _x = rightMax - columnDeviationValue;
    if (downMax && e.clientY - gDiv.getBoundingClientRect().top >= downMax)
      _y = downMax - rowDeviationValue;
    if (leftMax && e.clientX - gDiv.getBoundingClientRect().left <= leftMax)
      _x = leftMax;

    // console.log("2", _y);
    // console.log("2", _x);
    // console.log(e.clientX);
    // console.log(gDiv.getBoundingClientRect().left);
    // console.log('_yy', e.clientY - gDiv.getBoundingClientRect().top);
    // console.log("gridScale + gridPadding", gridScale + gridPadding);
    // console.log("gridRow", gridRow);
    // console.log("gridColumn", gridColumn);

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
              (i + 1 - rowDifferences > 0 ? i + 1 - rowDifferences : 1) +
              "x" +
              (j + 1 - columnDifferences > 0 ? j + 1 - columnDifferences : 1);
            //console.log("_positions1", _positions);
            break;
          }
          //console.log("_positions2", _positions);
        }
        //onsole.log("_positions3", _positions);
        break;
      }
    }

    return _positions;
  };

  // 删除微件
  // 如是容器组件需清空子组件
  const removeComponent = (index: number) => {
    // 更新激活组件
    const newActivatedComponents: ComponentItem[] = [..._activatedComponents];
    let __activatedComponents =
      newActivatedComponents[index].props.activatedComponents;

    if (__activatedComponents && __activatedComponents.length > 0) {
      newActivatedComponents[index].props.activatedComponents = [];
    }

    newActivatedComponents.splice(index, 1);

    _setActivatedComponents([...newActivatedComponents]);
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
    index: number,
    newActivatedComponents: ComponentItem[]
  ): ComponentItem[] => {
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

    //console.log(oDiv.style.gridArea)
    const _newActivatedComponents = [...newActivatedComponents];
    _newActivatedComponents[index] = {
      ...component,
      ccs: oDiv.style.gridArea,
    };

    return _newActivatedComponents;

    //console.log("area", oDiv.style.gridArea);
  };

  /**
   * 设置div位置数值
   * @param oDiv 元素
   * @param gDiv 父元素
   */
  const setDiv = (oDiv: HTMLElement, gDiv: HTMLElement) => {
    setDivTop(oDiv.offsetTop);
    setDivBottomTop(oDiv.offsetHeight + 10);
    setDivBottom(gDiv.offsetHeight - oDiv.offsetTop - oDiv.offsetHeight);
    setDivRightLeft(oDiv.offsetWidth + 10);
    setDivRight(gDiv.offsetWidth - oDiv.offsetLeft - oDiv.offsetWidth);
    setDivLeft(oDiv.offsetLeft);
  };

  /** 普通函数 end */

  /* ====================== 事件函数 ====================== */

  /**
   * 微件向上扩大，位置信息有grid控制。
   * @description 鼠标点击微件顶部，拖动鼠标可使微件高度增加
   * @param e 鼠标事件
   * @param index 微件索引
   */
  const moveTop = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    const oBlock = blockRefs["block" + index], // 获取当前点击微件
      gridUnit = gridScale + gridPadding,
      _gridArea = getComponentCcs(oBlock.style.gridArea), // 获取当前微件的gridArea值
      _maxTop = Math.max(0, _gridArea[0] - 1) * gridUnit; // 最大可移动距离, 无需减去gridPadding
    oBlock.style.borderColor = " red"; // 设置边框颜色为红色

    let disY = e.clientY - 0, // 获取鼠标点击的位置
      oTop: string | number = 0; // 初始化oTop，用于存储微件的top值

    // 修改微件实例高度为100%，以便自适应变型的高度

    if (oBlock.firstElementChild) {
      (oBlock.firstElementChild as HTMLElement).style.height = "100%";
    }

    // 控制微件高度
    document.onmousemove = (e) => {
      e.preventDefault();
      e.stopPropagation(); // 阻止默认事件

      let top: string | number = e.clientY - disY,
        // 计算最小高度
        minHeight =
          _activatedComponents[index].minHeight * gridUnit - gridPadding;

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
      const newActivatedComponents: ComponentItem[] = [..._activatedComponents];
      newActivatedComponents[index].ccs = _gridArea.join("/"); // 更新元素大小
      newActivatedComponents[index].height = _gridArea[2] - _gridArea[0]; // 更新元素高度
      newActivatedComponents[index].props.gridRow = _gridArea[2] - _gridArea[0];

      _setActivatedComponents([...newActivatedComponents]);

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
    e.preventDefault();
    e.stopPropagation();

    const oBlock = blockRefs["block" + index], //获取当前点击微件
      oCcs = getComponentCcs(_activatedComponents[index].ccs), //获取当前点击微件的ccs
      gridUnit = gridScale + gridPadding,
      _gridArea = getComponentCcs(oBlock.style.gridArea); // 获取当前微件的gridArea值

    let disX = e.clientX - 0, // 鼠标点击位置
      oRight: string | number = 0, // 上一次移动距离
      _maxRight = Math.max(0, gridColumn - _gridArea[3] + 1) * gridUnit, // 无需减去gridPadding
      _rMaxWidth = 0;
    console.log("_maxRight1", _maxRight);
    oBlock.style.borderColor = " red";

    // 修改微件实例宽度为100%，以便自适应变型的宽度
    const firstEle = oBlock.firstElementChild;
    if (firstEle instanceof HTMLElement) {
      firstEle.style.width = "100%";
      firstEle.style.overflow = "hidden";
    }

    // 控制微件宽度
    document.onmousemove = (e) => {
      e.preventDefault();
      e.stopPropagation();

      let right: string | number = e.clientX - disX,
        _rminWidth =
          _activatedComponents[index].minWidth * gridUnit - gridPadding;

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
        _componentCcs = getComponentCcs(_activatedComponents[index].ccs);

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
      const newActivatedComponents: ComponentItem[] = [..._activatedComponents];
      newActivatedComponents[index].ccs = _gridArea.join("/");
      newActivatedComponents[index].width = _gridArea[3] - _gridArea[1];
      newActivatedComponents[index].props.gridColumn =
        _gridArea[3] - _gridArea[1];

      _setActivatedComponents([...newActivatedComponents]);

      // 清空事件
      document.onmousemove = null;
      document.onmousedown = null;
      document.onmouseup = null;

      // 取消overflow:hidden，确保内部元素不会被裁剪
      if (firstEle instanceof HTMLElement) {
        firstEle.style.overflow = "inherit";
      }
    };
  };

  /**
   * 微件向下移动，位置信息有grid控制。
   * @description 鼠标点击微件下边，拖动鼠标可使微件长度增加。下边接触其他微件后，接触微件自动移位
   * @param e 鼠标事件
   * @param index 微件索引
   */
  const moveDown = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    const oBlock = blockRefs["block" + index], //获取当前点击微件
      gridUnit = gridScale + gridPadding,
      _gridArea = getComponentCcs(oBlock.style.gridArea), // 获取当前微件的gridArea值
      _maxDown = (gridRow - _gridArea[2] + 1) * gridUnit; // 最大可移动距离, 无需减去gridPadding

    oBlock.style.borderColor = "red";

    // 修改微件实例高度为100%，以便自适应变型的高度
    if (oBlock.firstElementChild)
      (oBlock.firstElementChild as HTMLElement).style.height = "100%";

    let disY = e.clientY - 0, // 鼠标点击位置
      oDown: string | number = 0; // 初始化oDown，用于存储微件的down值

    document.onmousemove = (e) => {
      e.preventDefault();
      e.stopPropagation();

      let down: string | number = e.clientY - disY, // 移动距离
        minHeight =
          _activatedComponents[index].minHeight * gridUnit - gridPadding;

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

      const newActivatedComponents: ComponentItem[] = [..._activatedComponents];
      newActivatedComponents[index].ccs = _gridArea.join("/");
      newActivatedComponents[index].height = _height;
      newActivatedComponents[index].props.gridRow = _gridArea[2] - _gridArea[0];

      _setActivatedComponents([...newActivatedComponents]);

      //======== 处理当前元素后的元素 ========//

      const // 当前变形元素
        _componentCcs = getComponentCcs(_activatedComponents[index].ccs);

      const // 下移变形元素后的元素，执行递归操作，直到没有相邻的元素
        downMoveComponents = (componentCcs: number[], index: number) => {
          const // 已变形或位移的元素
            _ccs = componentCcs;

          // 下移元素后的元素查找，并执行下移操作
          for (let i = index + 1; i < _activatedComponents.length; i++) {
            let _lastCcs = getComponentCcs(_activatedComponents[i].ccs);

            if (
              _ccs[2] > _lastCcs[0] &&
              _ccs[1] < _lastCcs[3] &&
              _ccs[3] > _lastCcs[1]
            ) {
              const newActivatedComponents: ComponentItem[] = [
                ..._activatedComponents,
              ];
              newActivatedComponents[i].ccs =
                _ccs[2] +
                "/" +
                _lastCcs[1] +
                "/" +
                (_ccs[2] + _activatedComponents[i].height) +
                "/" +
                _lastCcs[3];

              _setActivatedComponents([...newActivatedComponents]);

              _lastCcs = getComponentCcs(_activatedComponents[i].ccs);
              downMoveComponents(_lastCcs, i);
            }
          }
        };

      downMoveComponents(_componentCcs, index);

      //清空事件
      document.onmousemove = null;
      document.onmousedown = null;
      document.onmouseup = null;
    };
  };

  // 微件向左移动
  const moveLeft = (e: React.MouseEvent<HTMLSpanElement>, index: number) => {
    e.preventDefault();
    e.stopPropagation();

    let oBlock = blockRefs["block" + index], //获取当前点击微件
      disX = e.clientX - 0,
      oLeft: number | string = 0;

    oBlock.style.borderColor = "red";

    document.onmousemove = (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (String(oLeft) === "$") return;
      let left: number | string = e.clientX - disX;
      if (
        typeof oLeft === "number" &&
        typeof left === "number" &&
        oLeft < left
      ) {
        //减去一个gridPadding才是微件的大小
        let _rminWidth =
          _activatedComponents[index].minWidth * (gridScale + gridPadding) -
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
        oBlock.style.width = `${
          Number(oBlock.offsetWidth) - (Number(left) - Number(oLeft))
        }px`;
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
          ? _activatedComponents[index - 1].ccs
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
        _gridArea[2] = _prevCcs[2] + _activatedComponents[index].height;
        _gridArea[3] =
          _left + _width < gridColumn + 1 ? _left + _width : gridColumn + 1;
      }

      console.log(_gridArea);

      oBlock.style.gridArea = _gridArea.join("/");
      oBlock.style.width = "100%"; //必须设回百分比，不然grid-area无法见效
      oBlock.style.left = "0"; //必须设为0，不然无法恢复正确位置

      const newActivatedComponents: ComponentItem[] = [..._activatedComponents];
      newActivatedComponents[index].ccs = oBlock.style.gridArea;
      newActivatedComponents[index].width = _gridArea[3] - _gridArea[1];
      newActivatedComponents[index].props.gridColumn =
        _gridArea[3] - _gridArea[1];

      _setActivatedComponents([...newActivatedComponents]);
      focusComponent(index);

      //清空事件
      document.onmousemove = null;
      document.onmousedown = null;
      document.onmouseup = null;
    };
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
    e.preventDefault();
    e.stopPropagation();

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
    //console.log("gDiv", gDiv);

    let disX = e.clientX - 0;
    let disY = e.clientY - 0;

    if (gDiv === null) return;

    //因每次点击位置不同，故初始化差值
    columnDifferences = 0;
    rowDifferences = 0;
    columnDeviationValue = 0;
    rowDeviationValue = 0;
    leftMax = 0;
    topMax = 0;
    downMax = 0;
    rightMax = 0;

    let _positions = getPosition(e, gDiv)
      .replace("g", "")
      .split("x")
      .map((item) => Number(item));
    //console.log("first", _positions);

    rowDifferences = _positions[0] - _componentCcs[0];
    //console.log("rowDifferences", rowDifferences);

    columnDifferences = _positions[1] - _componentCcs[1];
    //console.log("columnDifferences", columnDifferences);
    // if (_positions.length > 1) {
    rowDeviationValue =
      e.clientY -
      gDiv.getBoundingClientRect().top -
      (_positions[0] - 1) * (gridScale + gridPadding);
    // console.log("e.clientY", e.clientY);
    // console.log("gDiv", gDiv)
    // console.log("gDiv.getBoundingClientRect().top", gDiv.getBoundingClientRect().top);
    // console.log("rowDeviationValue", rowDeviationValue);
    columnDeviationValue =
      e.clientX -
      gDiv.getBoundingClientRect().left -
      (_positions[1] - 1) * (gridScale + gridPadding);
    // console.log("e.clientX", e.clientX);
    // console.log("gDiv.getBoundingClientRect().left", gDiv.getBoundingClientRect().left);
    // console.log("_positions[1]", _positions[1]);
    // console.log("columnDeviationValue", columnDeviationValue);
    // }

    topMax =
      e.clientY -
      gDiv.getBoundingClientRect().top -
      (_componentCcs[0] - 1) * (gridScale + gridPadding);
    rightMax =
      e.clientX -
      gDiv.getBoundingClientRect().left +
      (gridColumn + 1 - _componentCcs[3]) * (gridScale + gridPadding);
    downMax =
      e.clientY -
      gDiv.getBoundingClientRect().top +
      (gridRow + 1 - _componentCcs[2]) * (gridScale + gridPadding);
    //console.log('downMax', rightMax.value);
    leftMax =
      e.clientX -
      gDiv.getBoundingClientRect().left -
      (_componentCcs[1] - 1) * (gridScale + gridPadding);

    focusComponent(index);
    setShouldShow(index);
    // 是否显示div位置数值
    setDiv(oDiv, gDiv);

    let newActivatedComponents: ComponentItem[] = [..._activatedComponents];

    document.onmousemove = (e) => {
      e.preventDefault();

      setDiv(oDiv, gDiv);

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

      newActivatedComponents[index] = {
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
        newActivatedComponents = [
          ...changeBlock(
            _positions,
            oDiv,
            component,
            index,
            newActivatedComponents
          ),
        ];

        // 副作用
        newActivatedComponents = sortComponent([...newActivatedComponents]);
        newActivatedComponents = updateRowIndex([...newActivatedComponents]);
        oDiv.style.left = "0px";
        oDiv.style.top = "0px";
        focusComponent(index);
        _setActivatedComponents([...newActivatedComponents]);
        setShouldShow(-1);
        setDiv(oDiv, gDiv);
      }

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

  /**
   * 子组件传递激活微件列表给父组件的微件列表，父组件再传递给上一级组件，直到根组件
   * @param components 当前container下的微件列表，通过onActivatedComponents方法传递给上层的微件列表
   * @param index 微件在父组件中的索引
   */
  const handleSetActivatedComponents = (
    components: ComponentItem[],
    index: string
  ) => {
    //console.log("index", index)
    if (index === undefined) return;
    // console.log("father currentIndex", currentIndex);
    // console.log(
    //   "_activatedComponents for father childrens",
    //   _activatedComponents
    // );
    // console.log("components", [...components])

    // console.log("_activatedComponents for son-index", index);
    const safeIndex = index ?? "";
    if (!safeIndex) return;

    const indexParts = safeIndex.split("-");
    const _index = Number(indexParts[indexParts.length - 1]);
    if (isNaN(_index)) return;

    const newActivatedComponents = _activatedComponents.map((item, i) =>
      i === _index
        ? {
            ...item,
            props: {
              ...item.props,
              activatedComponents: [...components],
            },
          }
        : item
    );
    //console.log("newActivatedComponents for father end", newActivatedComponents);

    if (onActivatedComponents) {
      onActivatedComponents([...newActivatedComponents], currentIndex);
    }
  };

  /** 修改当前container下的微件列表 */
  const handleSetCurrentActivatedComponent = (
    component: ComponentItem,
    index: number
  ) => {
    const newActivatedComponents = _activatedComponents.map((item, i) =>
      i === index
        ? {
            ...component,
            props: {
              ...component.props,
            },
          }
        : item
    );
    _setActivatedComponents([...newActivatedComponents]);
  };

  /** 事件函数 end */

  /* ====================== 脱困机制 ====================== */

  useEffect(() => {
    // console.log("update currentIndex", currentIndex);
    // console.log("update _activatedComponents", _activatedComponents);
    if (onActivatedComponents) {
      onActivatedComponents([..._activatedComponents], currentIndex);
    }
  }, [_activatedComponents]);

  useEffect(() => {
    //console.log("activatedComponents", activatedComponents);
    _setActivatedComponents([...activatedComponents]);
  }, [activatedComponents]);

  /** 脱困机制 end */

  return (
    <>
      <div
        ref={drop as any}
        className={`core-container pc`}
        style={{
          width: (gridScale + gridPadding) * gridColumn - gridPadding + "px",
          gridTemplateColumns: getGridTemplateColumns,
          gridTemplateRows: getGridTemplateRows,
          // gridTemplateAreas: getGridTemplateAreas,
          backgroundSize: `${gridScale + gridPadding}px ${
            gridScale + gridPadding
          }px`,
          zIndex: moduleProps?.zIndex,
          ...(isOverCurrent ? borderStyle : {}), // dropover样式
          ...({ "--grid-gap": `${gridPadding}px` } as React.CSSProperties), //断言自定义属性为CSSProperties合法属性
        }}
      >
        {_activatedComponents.map((item, index) => {
          return (
            <div
              key={index}
              className={`block`}
              style={{
                top: item.positionY,
                left: item.positionX,
                gridArea: item.ccs,
                zIndex: blockZIndex,
              }}
              ref={(el) => {
                if (el) blockRefs["block" + index] = el;
              }}
            >
              <Suspense fallback={"loading..."}>
                {/* 渲染子元素的编辑版本 */}
                {dynamicComponent({
                  currentIndex, // 父组件索引
                  index, // 子组件索引
                  gridScale, // 子组件缩放比例
                  gridPadding, // 子组件间距
                  MicroCards, // 微件列表
                  activatedComponent: item, // 当前微件信息
                  html: false, // 子组件是否为编辑状态
                  handleSetActivatedComponents, // 微件信息传递函数
                })}
              </Suspense>
              <div
                className={`shape ${
                  item.url === "ContainerPC" || item.url === "FormMP"
                    ? "brand"
                    : "normal"
                }`}
                onMouseDown={(e) => mousedown(e, item, index)}
              >
                移动
              </div>
              <div className={`title`}>{item.title}</div>
              <div className="attribute">
                <DrawerForm
                  index={index}
                  component={item || {}}
                  onCurrentActivatedComponent={
                    handleSetCurrentActivatedComponent
                  }
                />
              </div>
              <div className={`delete`}>
                <button type="button" onClick={() => showConfirm(index)}>
                  删除
                </button>
              </div>
              <div className={`morph`}>
                <span
                  className={`up`}
                  onMouseDown={(e) => moveTop(e, index)}
                  style={{
                    display: item.props.moduleProps?.morph?.up
                      ? "block"
                      : "none",
                  }}
                >
                  上
                </span>
                <span
                  className={`right`}
                  onMouseDown={(e) => moveRight(e, index)}
                  style={{
                    display: item.props.moduleProps?.morph?.right
                      ? "block"
                      : "none",
                  }}
                >
                  右
                </span>
                <span
                  className={`down`}
                  onMouseDown={(e) => moveDown(e, index)}
                  style={{
                    display: item.props.moduleProps?.morph?.down
                      ? "block"
                      : "none",
                  }}
                >
                  下
                </span>
                <span
                  className={`left`}
                  onMouseDown={(e) => moveLeft(e, index)}
                  style={{
                    display: item.props.moduleProps?.morph?.left
                      ? "block"
                      : "none",
                  }}
                >
                  左
                </span>
              </div>
              <div
                className={`morph`}
                style={{ display: shouldShow === index ? "block" : "none" }}
              >
                <span
                  className={`padding up`}
                  style={{ top: -divTop - 10, height: divTop }}
                >
                  {divTop}
                </span>
                <span
                  className={`padding right`}
                  style={{ left: divRightLeft, width: divRight }}
                >
                  {divRight}
                </span>
                <span
                  className={`padding down`}
                  style={{ top: divBottomTop, height: divBottom }}
                >
                  {divBottom}
                </span>
                <span
                  className={`padding left`}
                  style={{ left: -divLeft - 10, width: divLeft }}
                >
                  {divLeft}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {contextHolder}
    </>
  );
}
