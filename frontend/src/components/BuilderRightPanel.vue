<template>
	<div
		:style="{
			width: `${store.builderLayout.rightPanelWidth}px`,
		}">
		<PanelResizer
			:width="store.builderLayout.rightPanelWidth"
			side="left"
			@resize="(width) => (store.builderLayout.rightPanelWidth = width)"
			:min-width="220"
			:max-width="400" />
		<!-- <div class="flex w-full border-gray-200 p-[2px] text-sm dark:border-zinc-800">
			<button
				v-for="tab of ['Properties', 'Data']"
				:key="tab"
				class="mx-3 flex-1 p-2"
				@click="activeTab = tab"
				:class="{
					'border-b-[1px] border-gray-900 dark:border-zinc-500 dark:text-zinc-300': activeTab === tab,
					'text-gray-700 dark:text-zinc-600': activeTab !== tab,
				}">
				{{ tab }}
			</button>
		</div> -->
		<BlockProperties
			v-if="store.builderState.selectedBlock"
			:selected-block="store.builderState.selectedBlock"
			v-show="activeTab === 'Properties'"
			class="p-4" />
		<PageData class="p-4" v-show="activeTab === 'Data'" />
	</div>
</template>
<script setup>
import useStore from "@/store";
import { ref } from "vue";
import BlockProperties from "./BlockProperties.vue";
import PageData from "./PageData.vue";
import PanelResizer from "./PanelResizer.vue";

const activeTab = ref("Properties");

const store = useStore();
</script>
