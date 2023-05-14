<template>
	<div>
		<div v-if="!Object.keys(store.components).length" class="text-sm italic text-gray-600">
			No templates saved
		</div>
		<draggable
			:list="store.components"
			:group="{ name: 'blocks', pull: 'clone', put: false }"
			item-key="id"
			:sort="false"
			:clone="cloneTemplate"
			class="flex w-full flex-wrap">
			<template #item="{ element }">
				<div class="mb-3 w-full">
					<div
						class="relative mr-2 mb-1 flex h-24 w-full max-w-[300px] cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-gray-50 p-2 shadow-sm last:mr-0 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
						<div
							class="pointer-events-none absolute w-[1400px]"
							:style="{
								transform: 'scale(' + element.scale + ')',
							}">
							<BuilderBlock
								:block="store.getBlockCopy(element.block)"
								ref="preview"
								@render-complete="(el) => setScale(el, element)"
								:preview="true" />
						</div>
					</div>
					<p class="text-xs text-gray-800 dark:text-zinc-500">
						{{ element.component_name }}
					</p>
				</div>
			</template>
		</draggable>
	</div>
</template>
<script setup lang="ts">
import { createListResource } from "frappe-ui";
import { ref } from "vue";
import draggable from "vuedraggable";
import useStore from "../store";
import BuilderBlock from "./BuilderBlock.vue";

const store = useStore();
const preview = ref(null);

createListResource({
	doctype: "Web Page Component",
	fields: ["component_name", "icon", "block"],
	orderBy: "creation",
	start: 0,
	pageLength: 10,
	auto: true,
	transform(data: any[]) {
		data.forEach((d) => {
			d.block = JSON.parse(d.block);
			d.scale = 0.3; // for preview
		});
		return data;
	},
	onSuccess(data: BlockTemplate[]) {
		store.components = data;
	},
});

const setScale = (el: HTMLElement, block: BlockOptions) => {
	const scale = Math.min(140 / el.offsetWidth, 70 / el.offsetHeight, 0.6);
	block.scale = scale;
};

const cloneTemplate = (blockTemplate: BlockTemplate) => {
	const blockCopy = store.getBlockCopy(blockTemplate.block);
	if (blockTemplate.component_name === "Card") {
		blockCopy.component = {
			name: "Card",
			doctype: "User",
			mappings: {
				avatar: "user_image",
				full_name: "full_name",
				email: "email",
			}
		}
	}
	return blockCopy;
}
</script>