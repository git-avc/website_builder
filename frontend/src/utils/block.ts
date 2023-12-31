import useStore from "@/store";
import { addPxToNumber, getNumberFromPx } from "./helpers";
import { reactive } from "vue";

class Block implements BlockOptions {
	blockId: string;
	blockName?: string;
	element: string;
	editorStyles: BlockStyleMap;
	children: Array<Block>;
	draggable?: boolean;
	baseStyles: BlockStyleMap;
	rawStyles: BlockStyleMap;
	mobileStyles: BlockStyleMap;
	tabletStyles: BlockStyleMap;
	attributes: BlockAttributeMap;
	classes: Array<string>;
	resizable?: boolean;
	innerText?: string;
	componentData: ComponentData;
	computedStyles: ProxyHandler<BlockStyleMap>;
	isComponent?: boolean;
	originalElement?: string | undefined;
	parentBlockId?: string;
	constructor(options: BlockOptions) {
		delete options.computedStyles;
		this.element = options.element;
		this.draggable = options.draggable;
		this.innerText = options.innerText;
		this.originalElement = options.originalElement;
		this.blockId = options.blockId || this.generateId();
		this.parentBlockId = options.parentBlockId;
		this.children = (options.children || []).map((child: BlockOptions) => {
			child.parentBlockId = this.blockId;
			return new Block(child);
		});

		this.baseStyles = reactive(options.styles || options.baseStyles || {});
		this.rawStyles = reactive(options.rawStyles || {});
		this.mobileStyles = reactive(options.mobileStyles || {});
		this.tabletStyles = reactive(options.tabletStyles || {});
		this.editorStyles = reactive(options.editorStyles || {});
		this.attributes = reactive(options.attributes || {});
		this.blockName = options.blockName;
		delete this.attributes.style;
		this.classes = options.classes || [];
		this.isComponent = options.isComponent;

		this.componentData = {
			name: options.blockName,
			isDynamic: false,
		};

		if (this.isButton()) {
			this.editorStyles.display = "inline-block";
		}

		if (this.isRoot()) {
			this.blockId = "root";
			this.editorStyles = {
				width: "inherit",
				"overflow-x": "hidden",
			};
			this.draggable = false;
		}

		this.computedStyles = new Proxy(this.baseStyles, {
			set: (target, prop: string, value) => {
				this.setStyle(prop, value);
				return true;
			},
			get: (target, prop: string) => {
				return this.getStyle(prop);
			},
		});
	}
	isImage() {
		return this.element === "img";
	}
	isButton() {
		return this.element === "button";
	}
	isLink() {
		return this.element === "a";
	}
	isText() {
		return ["span", "h1", "p", "b", "h2", "h3", "h4", "h5", "h6", "a", "label"].includes(this.element);
	}
	isContainer() {
		return ["section", "div"].includes(this.element);
	}
	setStyle(style: string, value: number | string | null) {
		const store = useStore();
		if (value === null || value === "") {
			delete this.baseStyles[style];
			delete this.mobileStyles[style];
			delete this.tabletStyles[style];
			return;
		}
		if (store.builderState.activeBreakpoint === "mobile") {
			this.mobileStyles[style] = value;
			return;
		} else if (store.builderState.activeBreakpoint === "tablet") {
			this.tabletStyles[style] = value;
			return;
		}
		this.baseStyles[style] = value;
	}
	getStyle(style: string) {
		const store = useStore();
		if (store.builderState.activeBreakpoint === "mobile") {
			return this.mobileStyles[style] || this.baseStyles[style];
		} else if (store.builderState.activeBreakpoint === "tablet") {
			return this.tabletStyles[style] || this.baseStyles[style];
		}
		return this.baseStyles[style];
	}
	generateId() {
		return Math.random().toString(36).substr(2, 9);
	}
	getIcon() {
		return this.isRoot()
			? "hash"
			: this.isText()
			? "type"
			: this.isImage()
			? "image"
			: this.isContainer()
			? "square"
			: this.isLink()
			? "link"
			: "square";
	}
	isRoot() {
		return this.originalElement === "body";
	}
	getTag() {
		return this.element === "button" ? "div" : this.element;
	}
	isDiv() {
		return this.element === "div";
	}
	getStylesCopy() {
		return {
			styles: Object.assign({}, this.baseStyles),
			mobileStyles: Object.assign({}, this.mobileStyles),
			tabletStyles: Object.assign({}, this.tabletStyles),
		};
	}
	getFontFamily() {
		return (
			this.baseStyles.fontFamily || this.mobileStyles.fontFamily || this.tabletStyles.fontFamily || "Inter"
		);
	}
	isHovered(): boolean {
		const store = useStore();
		return store.hoveredBlock === this.blockId;
	}
	isSelected(): boolean {
		const store = useStore();
		return Boolean(store.builderState.selectedBlock) && store.builderState.selectedBlock === this;
	}
	isMovable(): boolean {
		return this.getStyle("position") === "absolute";
	}
	move(direction: "up" | "left" | "down" | "right") {
		if (!this.isMovable()) {
			return;
		}
		let top = getNumberFromPx(this.getStyle("top")) || 0;
		let left = getNumberFromPx(this.getStyle("left")) || 0;
		if (direction === "up") {
			top -= 1;
			this.setStyle("top", addPxToNumber(top));
		} else if (direction === "down") {
			top += 1;
			this.setStyle("top", addPxToNumber(top));
		} else if (direction === "left") {
			left -= 1;
			this.setStyle("left", addPxToNumber(left));
		} else if (direction === "right") {
			left += 1;
			this.setStyle("left", addPxToNumber(left));
		}
	}
	addChild(child: BlockOptions) {
		child.parentBlockId = this.blockId;
		const childBlock = new Block(child);
		this.children.push(childBlock);
		return childBlock;
	}
	selectBlock() {
		const store = useStore();
		store.builderState.selectedBlock = this;
	}
	getParentBlock(): Block | null {
		const store = useStore();
		return store.findBlock(this.parentBlockId || "root");
	}
	canHaveChildren(): boolean {
		return this.isContainer() || this.isRoot() || this.isDiv();
	}
}

export default Block;
