  <template>
    <div ref="networkContainer" class="network-container"></div>

    <!-- 在模板中添加编辑弹窗 -->
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
            <div v-for="node in existingNodes" :key="node.id" class="target-item">
              <input type="checkbox" :id="'edit-target-' + node.id" v-model="editingNode.targets" :value="node.id">
              <label :for="'edit-target-' + node.id">{{ node.label }}</label>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="dialog-footer">
          <button @click="saveEdit" class="confirm-btn">保存</button>
          <button @click="cancelEdit" class="cancel-btn">取消</button>
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
      }
      if (event.key === 'Escape' && showDialog.value) {
        showDialog.value = false
      }
    }

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
      { id: 1, label: 'Who' },
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

      // 添加事件监听
      network.value.on("doubleClick", handleNodeDoubleClick);
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


    // 计算现有节点（排除自己）
    const existingNodes = computed<{ id: number; label: string }[]>(() =>
      nodes.value
        .map(n => ({ id: n.id, label: n.label }))
        .filter(n => n.id !== nextId.value) // 使用 .value 访问
    );

    // const existingNodes = () => nodes.value.filter(n => n.id !== nextId);


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

    // 保存编辑
    const saveEdit = () => {
      // 更新节点名称
      nodesDataSet.value?.update({
        id: editingNode.id,
        label: editingNode.label
      });

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
      existingNodes,
      initNetwork,
      editDialog,
      editingNode,
      saveEdit,
      cancelEdit
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
