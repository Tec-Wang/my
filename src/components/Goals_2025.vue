<template>
  <div ref="networkContainer" class="network-container"></div>

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
import { defineComponent, ref, reactive,computed } from 'vue';
import { Network, DataSet } from 'vis-network/standalone';

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


export default defineComponent({
  setup() {
    // 网络图容器
    const networkContainer = ref<HTMLElement>();
    const network = ref<Network>();

    const nodesDataSet = ref<DataSet<Node, "id">>(new DataSet([]));
    const edgesDataSet = ref<DataSet<Edge, "id">>(new DataSet([]));


    // 响应式数据
    const nodes = ref<Node[]>([
      { id: 1, label: '节点1' },
      { id: 2, label: '节点2' },
      { id: 3, label: '节点3' },
      { id: 4, label: '节点4' },
      { id: 5, label: '节点5' }
    ]);

    const edges = ref<Edge[]>([
      { from: 1, to: 3 },
      { from: 1, to: 2 },
      { from: 2, to: 4 },
      { from: 2, to: 5 },
      { from: 2, to: 3 }
    ]);

    // 新增节点相关状态
    const showDialog = ref(false);
    const newNode = reactive({
      label: '',
      targets: [] as number[]
    });
    let nextId = 6;

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
        edges: {
          arrows: {
            to: {
              enabled: true,
              type: "arrow" // 需要明确指定类型
            }
          },
          smooth: {
            enabled: true, // 必须添加 enabled 字段
            type: "cubicBezier",
            roundness: 0.5 // 需要补充 roundness 参数
          }
        }
      }

      network.value = new Network(networkContainer.value, data, options);
    };

    // 完整修改后的 addNode 方法：
    const addNode = () => {
      if (!newNode.label.trim()) {
        alert('请输入节点名称');
        return;
      }

      const newNodeData = {
        id: nextId++,
        label: newNode.label.trim()
      };

      // 添加节点到 DataSet
      nodesDataSet.value.add(newNodeData);

      // 添加边到 DataSet
      const newEdges = newNode.targets.map(targetId => ({
        id: `edge_${Date.now()}_${Math.random()}`,
        from: newNodeData.id,
        to: targetId
      }));
      edgesDataSet.value.add(newEdges);

      // 重置表单
      showDialog.value = false;
      newNode.label = '';
      newNode.targets = [];
    };


    // 计算现有节点（排除自己）
    const existingNodes = computed<Node[]>(() =>
      nodes.value.filter(n => n.id !== nextId)
    );

    // const existingNodes = () => nodes.value.filter(n => n.id !== nextId);

    return {
      networkContainer,
      nodes,
      edges,
      showDialog,
      newNode,
      addNode,
      existingNodes,
      initNetwork
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
  top: 40px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

/* 新增节点按钮 */
.add-btn {
  position: fixed;
  right: 30px;
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
  margin-top: 20px;
  text-align: right;
}

.confirm-btn {
  background: #67c23a;
  color: white;
}

.cancel-btn {
  background: #909399;
  color: white;
  margin-left: 10px;
}
</style>

<!--
const options = {
  edges: {
    arrows: {
      to: {
        enabled: true,    // 启用目标箭头
        type: "arrow"     // 箭头类型（默认值）
      },
      middle: { enabled: false }, // 中间箭头
      from: { enabled: false }    // 源箭头
    }
  }
}; -->

<!--
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
  top: 40px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}
</style> -->
