'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { TextAlign } from '@tiptap/extension-text-align';
import { Link } from '@tiptap/extension-link';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { Underline } from '@tiptap/extension-underline';
import { Strike } from '@tiptap/extension-strike';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import { CharacterCount } from '@tiptap/extension-character-count';
import { Typography } from '@tiptap/extension-typography';
import { Placeholder } from '@tiptap/extension-placeholder';
import { Focus } from '@tiptap/extension-focus';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { History } from '@tiptap/extension-history';
import { HardBreak } from '@tiptap/extension-hard-break';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';

import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Toggle } from './ui/toggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from './ui/tooltip';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from './ui/dropdown-menu';
import {
	Bold,
	Italic,
	Underline as UnderlineIcon,
	Strikethrough,
	Heading1,
	Heading2,
	Heading3,
	Heading4,
	Heading5,
	Heading6,
	List,
	ListOrdered,
	Quote,
	AlignLeft,
	AlignCenter,
	AlignRight,
	AlignJustify,
	Table as TableIcon,
	Plus,
	Heart,
	Undo,
	Redo,
	Maximize,
	Minimize,
	Copy,
	FileText,
	Type,
	Minus,
	Printer,
	Download,
	FileImage,
	Search,
	ZoomIn,
	ZoomOut,
	Settings,
	Eye,
	Monitor,
	Smartphone,
	Tablet,
	Ruler,
	Star,
	BookOpen,
	ScrollText,
	Feather
} from 'lucide-react';
import { useState } from 'react';

interface RichTextEditorProps {
	content: string;
	onChange: (content: string) => void;
	placeholder?: string;
	className?: string;
	minHeight?: number;
}

export function RichTextEditor({
	content,
	onChange,
	placeholder = 'Begin writing your biblical insights...',
	className = '',
	minHeight = 500,
}: RichTextEditorProps) {
	// UI State
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [showCharCount, setShowCharCount] = useState(true);
	const [showRulers, setShowRulers] = useState(false);
	const [showOutline, setShowOutline] = useState(false);
	const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
	const [zoom, setZoom] = useState(100);

	// Document Settings
	const [pageWidth, setPageWidth] = useState(800);
	const [lineHeight, setLineHeight] = useState(1.6);
	const [fontSize, setFontSize] = useState(16);
	const [fontFamily, setFontFamily] = useState('Inter');

	// Content Tools State
	const [tableRows] = useState(3);
	const [tableCols] = useState(3);

	// Editor State
	const [isDragging, setIsDragging] = useState(false);
	const [selectedText, setSelectedText] = useState('');

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				// Disable extensions that we're adding separately with custom configs
				strike: false,
				dropcursor: false,
				gapcursor: false,
				undoRedo: false,
				hardBreak: false,
				horizontalRule: false,
				link: false,
				underline: false,
			}),
			TextStyle,
			TextAlign.configure({
				types: ['heading', 'paragraph', 'div'],
				alignments: ['left', 'center', 'right', 'justify'],
				defaultAlignment: 'left',
			}),
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: 'text-primary underline underline-offset-4 hover:text-primary/80 transition-colors cursor-pointer',
				},
				protocols: ['ftp', 'mailto'],
				autolink: true,
				linkOnPaste: true,
			}),
			Image.configure({
				inline: false,
				allowBase64: true,
				HTMLAttributes: {
					class: 'max-w-full h-auto rounded-md border border-border shadow-sm',
				},
			}),
			Table.configure({
				resizable: true,
				HTMLAttributes: {
					class: 'border-collapse table-auto w-full border border-border rounded-md overflow-hidden',
				},
			}),
			TableRow.configure({
				HTMLAttributes: {
					class: 'border-b border-border',
				},
			}),
			TableHeader.configure({
				HTMLAttributes: {
					class: 'border border-border bg-muted/50 font-semibold text-left p-3 text-sm',
				},
			}),
			TableCell.configure({
				HTMLAttributes: {
					class: 'border border-border p-3 text-sm',
				},
			}),
			Underline,
			Strike,
			Superscript,
			Subscript,
			CharacterCount,
			Typography.configure({
				openDoubleQuote: '"',
				closeDoubleQuote: '"',
				openSingleQuote: "'",
				closeSingleQuote: "'",
				ellipsis: '…',
				emDash: '—',
			}),
			Placeholder.configure({
				placeholder: ({ node, pos, hasAnchor }) => {
					if (hasAnchor) return ''
					if (node.type.name === 'heading') {
						return `Heading ${node.attrs.level}`
					}
					return placeholder
				},
				includeChildren: true,
			}),
			Focus.configure({
				className: 'has-focus ring-2 ring-ring ring-offset-2',
				mode: 'all',
			}),
			Dropcursor.configure({
				color: 'hsl(var(--primary))',
				width: 3,
				class: 'ProseMirror-dropcursor',
			}),
			Gapcursor,
			History.configure({
				depth: 100,
				newGroupDelay: 1000,
			}),
			HardBreak.configure({
				HTMLAttributes: {
					class: 'hard-break',
				},
			}),
			HorizontalRule.configure({
				HTMLAttributes: {
					class: 'my-6 border-t border-border',
				},
			}),
		],
		content,
		immediatelyRender: false,
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		onSelectionUpdate: ({ editor }) => {
			const { from, to } = editor.state.selection;
			const text = editor.state.doc.textBetween(from, to, ' ');
			setSelectedText(text);
		},
		editorProps: {
			attributes: {
				class: 'prose prose-neutral dark:prose-invert max-w-none focus:outline-none',
				style: `
					font-size: ${fontSize}px;
					line-height: ${lineHeight};
					font-family: ${fontFamily}, ui-sans-serif, system-ui, sans-serif;
					min-height: ${minHeight}px;
					padding: 2rem;
					margin: 0 auto;
					max-width: ${pageWidth}px;
				`,
			},
			handleKeyDown: (view, event) => {
				// Enhanced keyboard shortcuts
				if (event.ctrlKey || event.metaKey) {
					switch (event.key) {
						case 'e':
							event.preventDefault();
							toggleFullscreen();
							return true;
						case 'd':
							event.preventDefault();
							insertBibleVerse();
							return true;
						case 'p':
							event.preventDefault();
							insertPrayerBox();
							return true;
						case 'r':
							event.preventDefault();
							insertReflectionBox();
							return true;
						case '=':
							event.preventDefault();
							setZoom(Math.min(200, zoom + 10));
							return true;
						case '-':
							event.preventDefault();
							setZoom(Math.max(50, zoom - 10));
							return true;
						case '0':
							event.preventDefault();
							setZoom(100);
							return true;
					}
				}
				return false;
			},
			handleDrop: (view, event, slice, moved) => {
				setIsDragging(false);
				// Handle file drops
				if (!moved && event.dataTransfer && event.dataTransfer.files.length > 0) {
					event.preventDefault();
					const file = event.dataTransfer.files[0];
					if (file.type.startsWith('image/')) {
						// Handle image upload
						const reader = new FileReader();
						reader.onload = (e) => {
							const src = e.target?.result as string;
							editor?.chain().focus().setImage({ src }).run();
						};
						reader.readAsDataURL(file);
						return true;
					}
				}
				return false;
			},
			handleDOMEvents: {
				dragenter: () => {
					setIsDragging(true);
					return false;
				},
				dragleave: () => {
					setIsDragging(false);
					return false;
				},
			},
		},
	});

	if (!editor) {
		return (
			<div className="flex items-center justify-center h-64 border border-border rounded-lg bg-muted/20">
				<div className="text-center">
					<FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
					<p className="text-muted-foreground">Loading editor...</p>
				</div>
			</div>
		);
	}

	// Content Functions
	const addTable = () => {
		editor.chain().focus().insertTable({
			rows: tableRows,
			cols: tableCols,
			withHeaderRow: true
		}).run();
	};

	const insertScriptureReference = () => {
		const reference = '[Scripture Reference]';
		editor.chain().focus().insertContent(`<span class="inline-block bg-primary/10 text-primary font-semibold px-2 py-1 rounded-md text-sm border border-primary/20">${reference}</span> `).run();
	};

	const insertHorizontalRule = () => {
		editor.chain().focus().setHorizontalRule().run();
	};

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(editor.getHTML());
			// Toast notification would go here
		} catch (err) {
			console.error('Failed to copy content:', err);
		}
	};

	const toggleFullscreen = () => {
		setIsFullscreen(!isFullscreen);
	};

	// Enhanced Biblical Content Templates
	const insertBibleVerse = () => {
		const verseTemplate = `<div class="bible-verse bg-gradient-to-r from-primary/5 to-primary/10 border-l-4 border-primary p-6 my-6 rounded-r-md">
			<blockquote class="text-lg italic font-medium text-foreground mb-3 leading-relaxed">
				"[Insert verse text here]"
			</blockquote>
			<cite class="text-sm font-semibold text-primary">
				— [Book Chapter:Verse]
			</cite>
		</div>`;
		editor.chain().focus().insertContent(verseTemplate).run();
	};

	const insertPrayerBox = () => {
		const prayerTemplate = `<div class="prayer-box bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 my-6">
			<div class="flex items-center mb-3">
				<span class="text-amber-600 dark:text-amber-400 mr-2 text-xl">🙏</span>
				<h4 class="font-semibold text-amber-800 dark:text-amber-200 text-lg">Prayer Request</h4>
			</div>
			<p class="text-foreground/80 italic leading-relaxed">[Write your prayer here]</p>
		</div>`;
		editor.chain().focus().insertContent(prayerTemplate).run();
	};

	const insertReflectionBox = () => {
		const reflectionTemplate = `<div class="reflection-box bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6 my-6">
			<div class="flex items-center mb-3">
				<span class="text-emerald-600 dark:text-emerald-400 mr-2 text-xl">💭</span>
				<h4 class="font-semibold text-emerald-800 dark:text-emerald-200 text-lg">Reflection</h4>
			</div>
			<p class="text-foreground/80 leading-relaxed">[Share your thoughts and reflections here]</p>
		</div>`;
		editor.chain().focus().insertContent(reflectionTemplate).run();
	};

	const insertCalloutBox = (type: 'info' | 'warning' | 'success' | 'error') => {
		const configs = {
			info: { color: 'blue', icon: 'ℹ️', title: 'Information' },
			warning: { color: 'yellow', icon: '⚠️', title: 'Warning' },
			success: { color: 'green', icon: '✅', title: 'Success' },
			error: { color: 'red', icon: '❌', title: 'Error' }
		};
		const config = configs[type];

		const calloutTemplate = `<div class="callout-${type} bg-gradient-to-r from-${config.color}-50 to-${config.color}-100 dark:from-${config.color}-950/20 dark:to-${config.color}-900/20 border-l-4 border-${config.color}-500 p-4 my-4 rounded-r-md">
			<div class="flex items-center mb-2">
				<span class="mr-2 text-lg">${config.icon}</span>
				<h4 class="font-semibold text-${config.color}-800 dark:text-${config.color}-200">${config.title}</h4>
			</div>
			<p class="text-foreground/80">[Your message here]</p>
		</div>`;
		editor.chain().focus().insertContent(calloutTemplate).run();
	};

	// UI Helper Components
	const ToolbarButton = ({
		onClick,
		isActive = false,
		tooltip,
		children,
		disabled = false,
		variant = 'ghost'
	}: {
		onClick: () => void;
		isActive?: boolean;
		tooltip: string;
		children: React.ReactNode;
		disabled?: boolean;
		variant?: 'ghost' | 'outline' | 'default';
	}) => (
		<Tooltip>
			<TooltipTrigger asChild>
				<Toggle
					pressed={isActive}
					onPressedChange={onClick}
					disabled={disabled}
					size="sm"
					className="h-8 w-8 p-0 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
				>
					{children}
				</Toggle>
			</TooltipTrigger>
			<TooltipContent side="bottom">
				<p className="text-xs">{tooltip}</p>
			</TooltipContent>
		</Tooltip>
	);

	const getViewModeStyles = () => {
		const styles = {
			desktop: { maxWidth: `${pageWidth}px`, transform: `scale(${zoom / 100})` },
			tablet: { maxWidth: '768px', transform: `scale(${zoom / 100})` },
			mobile: { maxWidth: '375px', transform: `scale(${zoom / 100})` }
		};
		return styles[viewMode];
	};

	return (
		<TooltipProvider>
			<div className={`
				${isFullscreen
					? 'fixed inset-0 z-50 bg-background'
					: `border border-border rounded-lg shadow-sm ${className}`
				}
				flex flex-col transition-all duration-300
			`}>
				{/* Top Menu Bar */}
				<div className="border-b border-border bg-muted/30 p-2">
					<div className="flex items-center justify-between">
						{/* Left Controls */}
						<div className="flex items-center gap-1">
							<ToolbarButton
								onClick={() => editor.chain().focus().undo().run()}
								disabled={!editor.can().undo()}
								tooltip="Undo (Ctrl+Z)"
							>
								<Undo className="h-4 w-4" />
							</ToolbarButton>
							<ToolbarButton
								onClick={() => editor.chain().focus().redo().run()}
								disabled={!editor.can().redo()}
								tooltip="Redo (Ctrl+Y)"
							>
								<Redo className="h-4 w-4" />
							</ToolbarButton>

							<Separator orientation="vertical" className="h-6 mx-2" />

							<ToolbarButton onClick={copyToClipboard} tooltip="Copy HTML">
								<Copy className="h-4 w-4" />
							</ToolbarButton>
							<ToolbarButton onClick={() => window.print()} tooltip="Print">
								<Printer className="h-4 w-4" />
							</ToolbarButton>
						</div>

						{/* Center Controls */}
						<div className="flex items-center gap-2">
							<Select value={fontFamily} onValueChange={setFontFamily}>
								<SelectTrigger className="w-32 h-8">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Inter">Inter</SelectItem>
									<SelectItem value="Georgia">Georgia</SelectItem>
									<SelectItem value="Times New Roman">Times</SelectItem>
									<SelectItem value="Arial">Arial</SelectItem>
									<SelectItem value="Helvetica">Helvetica</SelectItem>
									<SelectItem value="Courier New">Courier</SelectItem>
								</SelectContent>
							</Select>

							<Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
								<SelectTrigger className="w-16 h-8">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map(size => (
										<SelectItem key={size} value={size.toString()}>{size}</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						{/* Right Controls */}
						<div className="flex items-center gap-1">
							<div className="flex items-center gap-1 mr-2">
								<ToolbarButton
									onClick={() => setViewMode('desktop')}
									isActive={viewMode === 'desktop'}
									tooltip="Desktop View"
								>
									<Monitor className="h-4 w-4" />
								</ToolbarButton>
								<ToolbarButton
									onClick={() => setViewMode('tablet')}
									isActive={viewMode === 'tablet'}
									tooltip="Tablet View"
								>
									<Tablet className="h-4 w-4" />
								</ToolbarButton>
								<ToolbarButton
									onClick={() => setViewMode('mobile')}
									isActive={viewMode === 'mobile'}
									tooltip="Mobile View"
								>
									<Smartphone className="h-4 w-4" />
								</ToolbarButton>
							</div>

							<Separator orientation="vertical" className="h-6 mx-2" />

							<Badge variant="secondary" className="text-xs">
								{zoom}%
							</Badge>
							<ToolbarButton
								onClick={() => setZoom(Math.max(50, zoom - 10))}
								tooltip="Zoom Out"
							>
								<ZoomOut className="h-4 w-4" />
							</ToolbarButton>
							<ToolbarButton
								onClick={() => setZoom(Math.min(200, zoom + 10))}
								tooltip="Zoom In"
							>
								<ZoomIn className="h-4 w-4" />
							</ToolbarButton>

							<Separator orientation="vertical" className="h-6 mx-2" />

							<ToolbarButton
								onClick={toggleFullscreen}
								tooltip={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
							>
								{isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
							</ToolbarButton>
						</div>
					</div>
				</div>

				{/* Main Toolbar */}
				<div className="border-b border-border bg-background p-2">
					<div className="flex flex-wrap items-center gap-1">
						{/* Text Formatting */}
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleBold().run()}
							isActive={editor.isActive('bold')}
							tooltip="Bold (Ctrl+B)"
						>
							<Bold className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleItalic().run()}
							isActive={editor.isActive('italic')}
							tooltip="Italic (Ctrl+I)"
						>
							<Italic className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleUnderline().run()}
							isActive={editor.isActive('underline')}
							tooltip="Underline (Ctrl+U)"
						>
							<UnderlineIcon className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleStrike().run()}
							isActive={editor.isActive('strike')}
							tooltip="Strikethrough"
						>
							<Strikethrough className="h-4 w-4" />
						</ToolbarButton>

						<Separator orientation="vertical" className="h-6 mx-2" />

						{/* Headings */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="h-8">
									<Type className="h-4 w-4 mr-1" />
									Style
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={() => editor.chain().focus().setParagraph().run()}>
									<FileText className="h-4 w-4 mr-2" />
									Paragraph
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
									<Heading1 className="h-4 w-4 mr-2" />
									Heading 1
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
									<Heading2 className="h-4 w-4 mr-2" />
									Heading 2
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
									<Heading3 className="h-4 w-4 mr-2" />
									Heading 3
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
									<Heading4 className="h-4 w-4 mr-2" />
									Heading 4
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}>
									<Heading5 className="h-4 w-4 mr-2" />
									Heading 5
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}>
									<Heading6 className="h-4 w-4 mr-2" />
									Heading 6
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>

						<Separator orientation="vertical" className="h-6 mx-2" />

						{/* Alignment */}
						<ToolbarButton
							onClick={() => editor.chain().focus().setTextAlign('left').run()}
							isActive={editor.isActive({ textAlign: 'left' })}
							tooltip="Align Left"
						>
							<AlignLeft className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							onClick={() => editor.chain().focus().setTextAlign('center').run()}
							isActive={editor.isActive({ textAlign: 'center' })}
							tooltip="Align Center"
						>
							<AlignCenter className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							onClick={() => editor.chain().focus().setTextAlign('right').run()}
							isActive={editor.isActive({ textAlign: 'right' })}
							tooltip="Align Right"
						>
							<AlignRight className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							onClick={() => editor.chain().focus().setTextAlign('justify').run()}
							isActive={editor.isActive({ textAlign: 'justify' })}
							tooltip="Justify"
						>
							<AlignJustify className="h-4 w-4" />
						</ToolbarButton>

						<Separator orientation="vertical" className="h-6 mx-2" />

						{/* Lists */}
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleBulletList().run()}
							isActive={editor.isActive('bulletList')}
							tooltip="Bullet List"
						>
							<List className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleOrderedList().run()}
							isActive={editor.isActive('orderedList')}
							tooltip="Numbered List"
						>
							<ListOrdered className="h-4 w-4" />
						</ToolbarButton>
						<ToolbarButton
							onClick={() => editor.chain().focus().toggleBlockquote().run()}
							isActive={editor.isActive('blockquote')}
							tooltip="Quote"
						>
							<Quote className="h-4 w-4" />
						</ToolbarButton>

						<Separator orientation="vertical" className="h-6 mx-2" />

						{/* Insert Menu */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="h-8">
									<Plus className="h-4 w-4 mr-1" />
									Insert
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56">
								<DropdownMenuLabel>Media</DropdownMenuLabel>
								<DropdownMenuItem>
									<FileImage className="h-4 w-4 mr-2" />
									Image
								</DropdownMenuItem>
								<DropdownMenuItem onClick={addTable}>
									<TableIcon className="h-4 w-4 mr-2" />
									Table
								</DropdownMenuItem>
								<DropdownMenuItem onClick={insertHorizontalRule}>
									<Minus className="h-4 w-4 mr-2" />
									Horizontal Rule
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuLabel>Biblical Elements</DropdownMenuLabel>
								<DropdownMenuItem onClick={insertBibleVerse}>
									<BookOpen className="h-4 w-4 mr-2" />
									Bible Verse
								</DropdownMenuItem>
								<DropdownMenuItem onClick={insertPrayerBox}>
									<Heart className="h-4 w-4 mr-2" />
									Prayer Box
								</DropdownMenuItem>
								<DropdownMenuItem onClick={insertReflectionBox}>
									<Feather className="h-4 w-4 mr-2" />
									Reflection
								</DropdownMenuItem>
								<DropdownMenuItem onClick={insertScriptureReference}>
									<ScrollText className="h-4 w-4 mr-2" />
									Scripture Reference
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<Star className="h-4 w-4 mr-2" />
										Callouts
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										<DropdownMenuItem onClick={() => insertCalloutBox('info')}>
											ℹ️ Information
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => insertCalloutBox('warning')}>
											⚠️ Warning
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => insertCalloutBox('success')}>
											✅ Success
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => insertCalloutBox('error')}>
											❌ Error
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuSub>
							</DropdownMenuContent>
						</DropdownMenu>

						<Separator orientation="vertical" className="h-6 mx-2" />

						{/* More Tools */}
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="outline" size="sm" className="h-8">
									<Settings className="h-4 w-4 mr-1" />
									Tools
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent>
								<DropdownMenuItem onClick={() => setShowCharCount(!showCharCount)}>
									<Eye className="h-4 w-4 mr-2" />
									{showCharCount ? 'Hide' : 'Show'} Word Count
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setShowRulers(!showRulers)}>
									<Ruler className="h-4 w-4 mr-2" />
									{showRulers ? 'Hide' : 'Show'} Rulers
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => setShowOutline(!showOutline)}>
									<List className="h-4 w-4 mr-2" />
									{showOutline ? 'Hide' : 'Show'} Outline
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem>
									<Search className="h-4 w-4 mr-2" />
									Find & Replace
								</DropdownMenuItem>
								<DropdownMenuItem>
									<Download className="h-4 w-4 mr-2" />
									Export
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{/* Editor Area */}
				<div className="flex-1 flex overflow-hidden">
					{/* Sidebar (when outline is shown) */}
					{showOutline && (
						<div className="w-64 border-r border-border bg-muted/20 p-4">
							<h3 className="font-semibold text-sm mb-3">Document Outline</h3>
							<div className="text-sm text-muted-foreground">
								<p>Outline will appear here as you add headings to your document.</p>
							</div>
						</div>
					)}

					{/* Main Editor Container */}
					<div className="flex-1 flex flex-col overflow-auto bg-muted/10">
						{/* Rulers */}
						{showRulers && (
							<div className="h-6 bg-muted/50 border-b border-border flex items-center px-4">
								<div className="text-xs text-muted-foreground">Ruler</div>
							</div>
						)}

						{/* Document Container */}
						<div className="flex-1 p-8 overflow-auto" style={getViewModeStyles()}>
							<div
								className={`
									mx-auto bg-background shadow-lg rounded-lg overflow-hidden
									${isDragging ? 'ring-2 ring-primary ring-offset-2' : ''}
								`}
								style={{
									maxWidth: getViewModeStyles().maxWidth,
									transform: getViewModeStyles().transform,
									transformOrigin: 'top center'
								}}
							>
									{/* Editor Content */}
								<EditorContent
									editor={editor}
									className="min-h-full"
								/>
							</div>
						</div>

						{/* Status Bar */}
						<div className="border-t border-border bg-muted/30 px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
							<div className="flex items-center gap-4">
								{showCharCount && editor.extensionManager.extensions.find(ext => ext.name === 'characterCount') && (
									<>
										<span>{editor.storage.characterCount.words()} words</span>
										<span>{editor.storage.characterCount.characters()} characters</span>
									</>
								)}
								{selectedText && (
									<span>Selected: "{selectedText.slice(0, 20)}{selectedText.length > 20 ? '...' : ''}"</span>
								)}
							</div>
							<div className="flex items-center gap-4">
								<span>Page Width: {pageWidth}px</span>
								<span>Line Height: {lineHeight}</span>
								<span>{viewMode} view</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}
