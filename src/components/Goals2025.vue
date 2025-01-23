<template>
  <div ref="networkContainer" class="network-container"></div>
  <!-- 增加一个按钮在页面的右上角，当点击的时候，弹出来一个新增节点的编辑框，定义节点的名称 -->
  <button @click="showAddNodeDialog">新增节点</button>

</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { Network ,DataSet} from 'vis-network/standalone';
import type { Node, Edge, Data } from 'vis-network/standalone';


export default defineComponent({
  name: 'NetworkGraph',
  setup() {
    const networkContainer = ref<HTMLDivElement | null>(null);
    const network = ref<Network | null>(null);

    onMounted(() => {
      const nodes = [
        { id: 1, label: '节点1' },
        { id: 2, label: '节点2' },
        { id: 3, label: '节点3' },
        { id: 4, label: '节点4' },
        { id: 5, label: '节点5' }
      ];

      const edges = [
        { from: 1, to: 3 },
        { from: 1, to: 2 },
        { from: 2, to: 4 },
        { from: 2, to: 5 }
      ];

      const data: Data = {
        nodes: new DataSet<Node>(nodes),
      edges: new DataSet<Edge>(edges)
      };

      const options = {};

      if (networkContainer.value) {
        network.value = new Network(networkContainer.value, data, options);
      }
    });

    onUnmounted(() => {
      if (network.value) {
        network.value.destroy();
      }
    });

    const showAddNodeDialog = () => {
        if (network.value) {
          network.value.addNodeMode()
          console.log(network.value.cluster.toString())
        }
    };

    return {
      networkContainer,
      showAddNodeDialog
    };
  }
});
</script>

<style scoped>
.network-container {
  width: 100%;
  height: 100vh;
  border: 1px solid #ccc;
}
</style>
