import tokens from "../design-tokens.json"

// 获取 CSS 变量
export function getCssVars(themeName: 'light' | 'dark'): Record<string, string> {
  const palette = tokens.palette[themeName]
  const { surface, content, accent, border, interactive, overlay } = palette

  return {
    // 表面颜色
    "surface-primary": surface.primary,
    "surface-secondary": surface.secondary,
    "surface-tertiary": surface.tertiary,
    "surface-sidebar": surface.sidebar,
    "surface-body": surface.body,

    // 内容颜色
    "content-primary": content.primary,
    "content-secondary": content.secondary,
    "content-tertiary": content.tertiary,
    "content-muted": content.muted,

    // 强调色
    "accent-primary": accent.primary,
    "accent-success": accent.success,
    "accent-warning": accent.warning,
    "accent-error": accent.error,
    "accent-info": accent.info,

    // 边框颜色
    "border-default": border.default,
    "border-strong": border.strong,
    "border-subtle": border.subtle,

    // 交互颜色
    "interactive-hover": interactive.hover,
    "interactive-active": interactive.active,
    "interactive-focus": interactive.focus,

    // 浮层遮罩
    "overlay-backdrop": overlay.backdrop,
    "overlay-preview": overlay.preview,

    // 间距
    "spacing-xs": tokens.spacing.xs,
    "spacing-sm": tokens.spacing.sm,
    "spacing-md": tokens.spacing.md,
    "spacing-lg": tokens.spacing.lg,
    "spacing-xl": tokens.spacing.xl,
    "spacing-2xl": tokens.spacing["2xl"],
    "spacing-3xl": tokens.spacing["3xl"],

    // 圆角
    "radius-sm": tokens.radius.sm,
    "radius-md": tokens.radius.md,
    "radius-lg": tokens.radius.lg,
    "radius-xl": tokens.radius.xl,
    "radius-control": tokens.component.controlRadius,
    "radius-panel": tokens.component.panelRadius,
    "radius-modal": tokens.component.modalRadius,
    "radius-image": tokens.component.imageRadius,

    // 页面布局
    "page-padding": tokens.component.pagePadding,
    "content-padding": tokens.component.contentPadding,
    "compact-padding": tokens.component.compactPadding,
    "section-gap": tokens.component.sectionGap,

    // 浮层阴影（常驻面板不使用阴影）
    "shadow-popover": tokens.elevation.popover,
    "shadow-overlay": tokens.elevation.overlay,

    // 字体
    "font-size-xs": tokens.typography.fontSizes.xs,
    "font-size-sm": tokens.typography.fontSizes.sm,
    "font-size-base": tokens.typography.fontSizes.base,
    "font-size-lg": tokens.typography.fontSizes.lg,
    "font-size-xl": tokens.typography.fontSizes.xl,
    "font-size-2xl": tokens.typography.fontSizes["2xl"],
    "font-size-3xl": tokens.typography.fontSizes["3xl"],
    "font-size-4xl": tokens.typography.fontSizes["4xl"],

    // 字重
    "font-weight-normal": tokens.typography.fontWeights.normal,
    "font-weight-medium": tokens.typography.fontWeights.medium,
    "font-weight-semibold": tokens.typography.fontWeights.semibold,
    "font-weight-bold": tokens.typography.fontWeights.bold,

    // 行高
    "line-height-tight": tokens.typography.lineHeights.tight,
    "line-height-normal": tokens.typography.lineHeights.normal,
    "line-height-relaxed": tokens.typography.lineHeights.relaxed
  }
}
