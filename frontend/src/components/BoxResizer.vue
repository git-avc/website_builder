<template>
	<span
		class="resize-dimensions absolute bottom-[-40px] right-[-40px] flex h-8 w-20 items-center justify-center whitespace-nowrap rounded-full bg-gray-600 p-2 text-sm text-white opacity-80"
		v-if="resizing && !targetBlock.isText()">
		{{ targetWidth }} x
		{{ targetHeight }}
	</span>
	<span
		class="resize-dimensions absolute bottom-[-40px] right-[-40px] flex h-8 w-fit items-center justify-center whitespace-nowrap rounded-full bg-gray-600 p-2 text-sm text-white opacity-80"
		v-if="resizing && targetBlock.isText()">
		{{ fontSize }}
	</span>

	<div
		class="left-handle ew-resize pointer-events-auto absolute bottom-0 left-[-2px] top-0 w-[4px] border-none bg-transparent" />
	<div
		class="right-handle pointer-events-auto absolute bottom-0 right-[-2px] top-0 w-[4px] border-none bg-transparent"
		:class="{ 'cursor-ew-resize': true }"
		@mousedown.stop="handleRightResize" />
	<div
		class="top-handle ns-resize pointer-events-auto absolute left-0 right-0 top-[-2px] h-[4px] border-none bg-transparent" />
	<div
		class="bottom-handle pointer-events-auto absolute bottom-[-2px] left-0 right-0 h-[4px] border-none bg-transparent"
		:class="{ 'cursor-ns-resize': true }"
		@mousedown.stop="handleBottomResize" />
	<div
		class="pointer-events-auto absolute bottom-[-4px] right-[-4px] h-[8px] w-[8px] cursor-nwse-resize rounded-full border-[1px] border-blue-400 bg-white"
		@mousedown.stop="handleBottomCornerResize" />
</template>
<script setup lang="ts">
import { getNumberFromPx } from "@/utils/helpers";
import { computed, onMounted, ref, watchEffect } from "vue";
import useStore from "../store";
import Block from "../utils/block";
import guidesTracker from "../utils/guidesTracker";

const props = defineProps({
	targetBlock: {
		type: Block,
		default: null,
	},
	target: {
		type: HTMLElement,
		default: null,
	},
});

const emit = defineEmits(["resizing"]);
const store = useStore();
const targetBlock = props.targetBlock;
const target = props.target;
const resizing = ref(false);
let guides = null as unknown as ReturnType<typeof guidesTracker>;

onMounted(() => {
	guides = guidesTracker(target);
});

watchEffect(() => {
	emit("resizing", resizing.value);
});

const targetWidth = computed(() => {
	targetBlock.getStyle("width"); // to trigger reactivity
	return getNumberFromPx(getComputedStyle(target).getPropertyValue("width"));
});

const targetHeight = computed(() => {
	targetBlock.getStyle("height"); // to trigger reactivity
	return getNumberFromPx(getComputedStyle(target).getPropertyValue("height"));
});

const fontSize = computed(() => {
	targetBlock.getStyle("fontSize"); // to trigger reactivity
	return getNumberFromPx(getComputedStyle(target).getPropertyValue("font-size"));
});

const handleRightResize = (ev: MouseEvent) => {
	const startX = ev.clientX;
	const startWidth = target.offsetWidth;
	const parentWidth = target.parentElement?.offsetWidth || 0;
	// to disable cursor jitter
	const docCursor = document.body.style.cursor;
	document.body.style.cursor = window.getComputedStyle(ev.target as HTMLElement).cursor;
	resizing.value = true;
	guides.showX();
	const mousemove = (mouseMoveEvent: MouseEvent) => {
		// movement / scale * speed
		const movement = (mouseMoveEvent.clientX - startX) / store.canvas.scale;
		const finalWidth = guides.getFinalWidth(startWidth + movement);

		if (targetBlock.isText()) {
			targetBlock.setStyle("fontSize", `${Math.round(finalWidth * 0.5)}px`);
			return mouseMoveEvent.preventDefault();
		}

		if (mouseMoveEvent.shiftKey) {
			const movementPercent = (movement / parentWidth) * 100;
			const startWidthPercent = (startWidth / parentWidth) * 100;
			const finalHeight = Math.round(startWidthPercent + movementPercent);
			targetBlock.setStyle("width", `${finalHeight}%`);
		} else {
			targetBlock.setStyle("width", `${finalWidth}px`);
		}
		mouseMoveEvent.preventDefault();
	};
	document.addEventListener("mousemove", mousemove);
	document.addEventListener(
		"mouseup",
		(mouseUpEvent) => {
			document.body.style.cursor = docCursor;
			document.removeEventListener("mousemove", mousemove);
			mouseUpEvent.preventDefault();
			resizing.value = false;
			guides.hideX();
		},
		{ once: true }
	);
};

const handleBottomResize = (ev: MouseEvent) => {
	const startY = ev.clientY;
	const startHeight = target.offsetHeight;

	// to disable cursor jitter
	const docCursor = document.body.style.cursor;
	document.body.style.cursor = window.getComputedStyle(ev.target as HTMLElement).cursor;
	resizing.value = true;
	guides.showY();

	const mousemove = (mouseMoveEvent: MouseEvent) => {
		const movement = (mouseMoveEvent.clientY - startY) / store.canvas.scale;
		let finalHeight = guides.getFinalHeight(startHeight + movement);

		if (targetBlock.isText()) {
			targetBlock.setStyle("fontSize", `${Math.round(finalHeight * 0.5)}px`);
			return mouseMoveEvent.preventDefault();
		}

		targetBlock.setStyle("height", `${finalHeight}px`);
		mouseMoveEvent.preventDefault();
	};
	document.addEventListener("mousemove", mousemove);
	document.addEventListener(
		"mouseup",
		(mouseUpEvent) => {
			document.body.style.cursor = docCursor;
			document.removeEventListener("mousemove", mousemove);
			mouseUpEvent.preventDefault();
			resizing.value = false;
			guides.hideY();
		},
		{ once: true }
	);
};

const handleBottomCornerResize = (ev: MouseEvent) => {
	const startX = ev.clientX;
	const startY = ev.clientY;
	const startHeight = target.offsetHeight;
	const startWidth = target.offsetWidth;

	// to disable cursor jitter
	const docCursor = document.body.style.cursor;
	document.body.style.cursor = window.getComputedStyle(ev.target as HTMLElement).cursor;
	resizing.value = true;

	const mousemove = (mouseMoveEvent: MouseEvent) => {
		const movementX = (mouseMoveEvent.clientX - startX) / store.canvas.scale;
		const finalWidth = Math.round(startWidth + movementX);

		if (targetBlock.isText()) {
			targetBlock.setStyle("fontSize", `${Math.round(finalWidth * 0.5)}px`);
			return mouseMoveEvent.preventDefault();
		}

		targetBlock.setStyle("width", `${finalWidth}px`);
		const movementY = (mouseMoveEvent.clientY - startY) / store.canvas.scale;
		const finalHeight = Math.round(startHeight + movementY);
		targetBlock.setStyle("height", `${finalHeight}px`);
		mouseMoveEvent.preventDefault();
	};
	document.addEventListener("mousemove", mousemove);
	document.addEventListener(
		"mouseup",
		(mouseUpEvent) => {
			document.body.style.cursor = docCursor;
			document.removeEventListener("mousemove", mousemove);
			mouseUpEvent.preventDefault();
			resizing.value = false;
		},
		{ once: true }
	);
};
</script>
