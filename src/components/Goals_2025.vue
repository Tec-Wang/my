<template>
  <div ref="networkContainer" class="network-container"></div>

  <!-- 编辑节点弹窗 -->
  <div v-if="editDialog" class="dialog-mask">
    <div class="dialog-content">
      <h3>编辑节点</h3>

      <!-- 节点名称编辑 -->
      <div class="form-item">
        <label>节点名称：</label>
        <input v-model="editingNode.label" />
      </div>

      <!-- 目标节点选择 -->
      <div class="form-item">
        <label>连接目标：</label>
        <div class="target-list">
          <div v-for="node in filteredExistingNodes" :key="node.id" class="target-item">
            <input type="checkbox" :id="'edit-target-' + node.id" v-model="editingNode.targets" :value="node.id">
            <label :for="'edit-target-' + node.id">{{ node.label }}</label>
          </div>
        </div>
      </div>

      <!-- 操作按钮（新增删除按钮） -->
      <div class="dialog-footer">
        <button @click="confirmDeleteNode" class="dag-node-delete-btn">❗ 删除节点</button>
        <div class="action-buttons">
          <button @click="saveEdit" class="confirm-btn">保存</button>
          <button @click="cancelEdit" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </div>

  <!-- 新增节点按钮 -->
  <button class="add-btn" @click="showDialog = true">+ 新增节点</button>

  <!-- 添加节点弹窗 -->
  <div v-if="showDialog" class="dialog-mask">
    <div class="dialog-content">
      <h3>添加新节点</h3>

      <!-- 节点名称输入 -->
      <div class="form-item">
        <label>节点名称：</label>
        <input v-model="newNode.label" placeholder="请输入名称" />
      </div>

      <!-- 目标节点选择 -->
      <div class="form-item">
        <label>连接目标：</label>
        <div class="target-list">
          <div v-for="node in existingNodes" :key="node.id" class="target-item">
            <input type="checkbox" :id="'target-' + node.id" v-model="newNode.targets" :value="node.id">
            <label :for="'target-' + node.id">{{ node.label }}</label>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="dialog-footer">
        <button @click="addNode" class="confirm-btn">确认添加</button>
        <button @click="showDialog = false" class="cancel-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed, onUnmounted, watch } from 'vue';
import { Network, DataSet } from 'vis-network/standalone';
import type { Id } from 'vis-data/declarations/data-interface';

interface Node {
  id: number;
  label: string;
}

// 在类型声明部分明确Edge结构
interface Edge {
  id?: string | number; // vis-network要求边必须包含id字段
  from: number;
  to: number;
}

// 定义点击事件的参数类型
interface NetworkDoubleClickEventParams {
  nodes: number[];
  edges: string[];
  event: PointerEvent;
}


export default defineComponent({
  setup() {
    const editDialog = ref(false); // 添加这行初始化代码
    const showDialog = ref(false);

    // 添加键盘事件监听
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && editDialog.value) {
        editDialog.value = false
      } else if (event.key == 'Enter' && editDialog.value) {
        saveEdit();
        editDialog.value = false
      }
      if (event.key === 'Escape' && showDialog.value) {
        showDialog.value = false
      } else if (event.key == 'Enter' && showDialog.value) {
        addNode();
        showDialog.value = false
      }
    }

    const handleDoubleClick = (params: NetworkDoubleClickEventParams) => {
      if (params.nodes.length === 0) {
        // 如果双击的位置没有节点，则打开新增节点窗口
        showDialog.value = true;
      }
    };
    watch(showDialog, (newVal) => {
      if (newVal) {
        window.addEventListener('keydown', handleKeyDown)
      } else {
        window.removeEventListener('keydown', handleKeyDown)
      }
    })
    watch(editDialog, (newVal) => {
      if (newVal) {
        window.addEventListener('keydown', handleKeyDown)
      } else {
        window.removeEventListener('keydown', handleKeyDown)
      }
    })


    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
    })



    // 网络图容器
    const networkContainer = ref<HTMLElement>();
    const network = ref<Network>();

    const nodesDataSet = ref<DataSet<Node, "id">>(new DataSet([]));
    const edgesDataSet = ref<DataSet<Edge, "id">>(new DataSet([]));


    // 响应式数据
    const nodes = ref<Node[]>([
      { id: 1, label: '我' },
    ]);

    const edges = ref<Edge[]>([
    ]);

    // 新增节点相关状态
    const newNode = reactive({
      label: '',
      targets: [] as number[]
    });
    const nextId = ref(2); // 使用 ref 包裹使其响应式

    // 初始化网络图

    const initNetwork = () => {
      if (!networkContainer.value) return;

      // 初始化 DataSet
      nodesDataSet.value = new DataSet(nodes.value);
      edgesDataSet.value = new DataSet(edges.value);

      const data = {
        nodes: nodesDataSet.value,
        edges: edgesDataSet.value
      };

      const options = {
        interaction: {
          dragNodes: true,
          dragView: true,
          hideEdgesOnDrag: false,
          hideEdgesOnZoom: false,
          hideNodesOnDrag: false,
          hover: false,
          hoverConnectedEdges: true,
          keyboard: {
            enabled: false,
            speed: { x: 10, y: 10, zoom: 0.02 },
            bindToWindow: true,
            autoFocus: true,
          },
          multiselect: false,
          navigationButtons: false,
          selectable: true,
          selectConnectedEdges: true,
          tooltipDelay: 300,
          zoomSpeed: 1,
          zoomView: true
        },
        edges: {
          arrows: {
            to: {
              enabled: true,
              type: "arrow" // 需要明确指定类型
            }
          },
          chosen: true,
          color: {
            color: "#000000",
            highlight: "#FF0000"
          },
          smooth: {
            enabled: true, // 必须添加 enabled 字段
            type: "cubicBezier",
            roundness: 0.5 // 需要补充 roundness 参数
          }
        },
        nodes: {
          borderWidth: 2,
          borderWidthSelected: 4,
          color: {
            border: "#000000",
            background: "#FFFFFF",
            highlight: {
              border: "#FF0000",
              background: "#FFFF00"
            }
          },
          font: {
            size: 14,
            color: "#000000"
          },
          labelHighlightBold: true,
          shadow: {
            enabled: true,
            color: "#000000",
            size: 10
          }
        }
      }
      network.value = new Network(networkContainer.value, data, options);

      // 添加事件监听，编辑节点
      network.value.on("doubleClick", handleNodeDoubleClick);

      // 添加事件监听，新增节点
      network.value.on("doubleClick", handleDoubleClick);

    };

    // 完整修改后的 addNode 方法：
    const addNode = () => {
      if (!newNode.label.trim()) {
        alert('请输入节点名称');
        return;
      }

      const newNodeData = {
        id: nextId.value, // 使用 .value 访问
        label: newNode.label.trim()
      };

      // 添加节点到 DataSet
      nodesDataSet.value.add(newNodeData);
      nodes.value.push(newNodeData); // 添加这行同步数据


      // 添加边到 DataSet
      const newEdges = newNode.targets.map(targetId => ({
        id: `edge_${Date.now()}_${Math.random()}`,
        from: newNodeData.id,
        to: targetId
      }));
      edgesDataSet.value.add(newEdges);

      nextId.value++; // 使用 .value 修改

      // 重置表单
      showDialog.value = false;
      newNode.label = '';
      newNode.targets = [];
    };

    // 新增删除节点方法
    const confirmDeleteNode = () => {
      if (confirm("确定要删除这个节点及其所有连接吗？")) {
        deleteNode(editingNode.id);
        editDialog.value = false;
      }
    };

    const deleteNode = (nodeId: number) => {
      // 删除节点
      nodesDataSet.value?.remove(nodeId);

      // 删除所有相关边
      const relatedEdges = edgesDataSet.value?.get({
        filter: (edge: Edge) =>
          edge.from === nodeId || edge.to === nodeId
      }) || [];

      relatedEdges.forEach((edge: { id: Edge | Id | (Edge | Id)[]; }) => {
        if (edge.id) edgesDataSet.value?.remove(edge.id);
      });

      // 更新本地数据（如果维护）
      nodes.value = nodes.value.filter(n => n.id !== nodeId);
      edges.value = edges.value.filter(e =>
        e.from !== nodeId && e.to !== nodeId
      );
    };

    // 计算现有节点（排除自己）
    const filteredExistingNodes = computed<{ id: number; label: string }[]>(() =>
      nodes.value
        .map(n => ({ id: n.id, label: n.label }))
        .filter(n => n.id !== editingNode.id) // 排除当前编辑的节点
    );

    // 全部的节点，用于新增节点使用
    const existingNodes = computed<{ id: number; label: string }[]>(() =>
      nodes.value
        .map(n => ({ id: n.id, label: n.label }))
        .filter(n => n.id !== nextId.value) // 使用 .value 访问
    );

    // 新增编辑相关状态
    const editingNode = reactive({
      id: -1,
      label: '',
      targets: [] as number[],
      originalTargets: [] as number[] // 记录原始连接用于对比
    });

    // 节点点击事件处理
    const handleNodeDoubleClick = (params: NetworkDoubleClickEventParams) => {
      if (params.nodes.length === 1) {
        const nodeId = params.nodes[0];
        const node = nodesDataSet.value?.get(nodeId);
        if (node) {
          // 获取现有连接
          const currentEdges = edgesDataSet.value?.get({
            filter: (edge: Edge) => edge.from === nodeId
          }) || [];

          editingNode.id = nodeId;
          editingNode.label = node.label;
          editingNode.targets = currentEdges.map(e => e.to);
          editingNode.originalTargets = [...editingNode.targets];

          editDialog.value = true;
        }
      }
    };

    // 保存编辑
    const saveEdit = () => {
      // 更新节点名称
      nodesDataSet.value?.update({
        id: editingNode.id,
        label: editingNode.label
      });

      // 同步更新本地 nodes 数组
      const nodeIndex = nodes.value.findIndex(n => n.id === editingNode.id);
      if (nodeIndex !== -1) {
        nodes.value[nodeIndex].label = editingNode.label;
      }
      // 计算需要删除的旧边
      const removedTargets = editingNode.originalTargets
        .filter(t => !editingNode.targets.includes(t));

      // 计算需要添加的新边
      const newTargets = editingNode.targets
        .filter(t => !editingNode.originalTargets.includes(t));

      // 删除旧边
      removedTargets.forEach(targetId => {
        const edge = edgesDataSet.value?.get({
          filter: (e: Edge) => e.from === editingNode.id && e.to === targetId
        })[0];
        if (edge) edgesDataSet.value?.remove(edge.id);
      });

      // 添加新边
      newTargets.forEach(targetId => {
        edgesDataSet.value?.add({
          id: `edge_${Date.now()}_${Math.random()}`,
          from: editingNode.id,
          to: targetId
        });
      });

      editDialog.value = false;
    };

    // 取消编辑
    const cancelEdit = () => {
      editDialog.value = false;
    };


    return {
      networkContainer,
      nodes,
      edges,
      showDialog,
      newNode,
      addNode,
      initNetwork,
      editDialog,
      editingNode,
      saveEdit,
      cancelEdit,
      confirmDeleteNode,
      filteredExistingNodes,
      existingNodes,
      handleDoubleClick
    };
  },

  mounted() {
    this.initNetwork();
  }
});
</script>

<style scoped>
.network-container {
  /* 调整前：left: 240px (220+20) */
  /* 调整后：left: 260px (220+40) 增加20px间隙 */
  left: 260px;

  /* 调整前：width: calc(100% - 260px) */
  /* 调整后：width: calc(100% - 280px) (220+40+20) */
  width: calc(100% - 280px);

  /* 其他属性保持不变 */
  height: calc(100vh - 60px);
  position: fixed;
  top: 60px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 新增节点按钮 */
.add-btn {
  position: fixed;
  left: 300px;
  /* 从 right: 30px 改为 left: 30px */
  top: 20px;
  padding: 8px 16px;
  background: #409eff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000;
}

/* 弹窗样式 */
.dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}

.form-item {
  margin: 15px 0;
}

.target-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 10px;
}

.target-item {
  padding: 8px;
  display: flex;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.dag-node-delete-btn {
  background: #409eff;
  color: white;
  order: 1;
  margin-right: auto;
  /* 左对齐 */
  padding: 10px 20px;
  /* 增加按钮大小 */
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  /* 增加字体大小 */
  transition: background-color 0.3s ease;
  /* 添加过渡效果 */
}

.dag-node-delete-btn:hover {
  background-color: #66b1ff;
  /* 鼠标悬停时的背景色 */
}

.action-buttons {
  display: flex;
  gap: 10px;
  order: 2;
}

.confirm-btn {
  background: #67c23a;
  color: white;
  margin-right: 10px;
  padding: 10px 20px;
  /* 增加按钮大小 */
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  /* 增加字体大小 */
  transition: background-color 0.3s ease;
  /* 添加过渡效果 */
}

.confirm-btn:hover {
  background-color: #85ce61;
  /* 鼠标悬停时的背景色 */
}

.cancel-btn {
  background: #909399;
  color: white;
  padding: 10px 20px;
  /* 增加按钮大小 */
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  /* 增加字体大小 */
  transition: background-color 0.3s ease;
  /* 添加过渡效果 */
}

.cancel-btn:hover {
  background-color: #a6a9ad;
  /* 鼠标悬停时的背景色 */
}


/* 操作按钮组调整 */
.action-buttons {
  display: flex;
  gap: 10px;
}

.dialog-mask {
  z-index: 2000;
  /* 确保高于其他元素 */
}
</style>
