<template>
	<div class="mt-3 flex items-center justify-between">
		<span class="inline-block text-[10px] font-medium uppercase text-gray-600 dark:text-zinc-400">
			<slot />
		</span>
		<Input
			:type="type"
			:value="value"
			:options="options"
			v-if="type != 'autocomplete'"
			@change="handleChange"
			class="w-[150px] rounded-md text-sm text-gray-800 dark:bg-zinc-800 dark:text-zinc-200 dark:focus:bg-zinc-700" />
		<Autocomplete
			v-if="type == 'autocomplete'"
			:value="value"
			:options="options.map((option) => ({ label: option, value: option }))"
			@change="handleChange"
			class="!dark:text-zinc-200 !dark:focus:bg-zinc-700 w-[150px] rounded-md text-sm text-gray-800 dark:bg-zinc-800 [&>div>button]:dark:!bg-zinc-800 [&>div>button]:dark:!text-zinc-200" />
	</div>
</template>
<script setup lang="ts">
import { Autocomplete, Input } from "frappe-ui";

defineProps({
	value: {
		type: [String, Number],
		default: "",
	},
	type: {
		type: String,
		default: "text",
	},
	unitOptions: {
		type: Array,
		default: () => [],
	},
	options: {
		type: Array,
		default: () => [],
	},
});

const emit = defineEmits(["updateValue"]);

const handleChange = (value: string | number | null) => {
	emit("updateValue", value);
};
</script>
