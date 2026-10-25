import { computed, ref } from 'vue'
import { preferencesClient } from '../lib/platform/preferences'
import { getCssVars } from '../theme'
import {
	applyDocumentTheme,
	getSystemThemePreference,
	resolveTheme,
	type ResolvedTheme,
	type ThemeSource
} from '../theme/runtime'

export type SystemTheme = ResolvedTheme | 'system'

export enum ThemeNameEnum {
	Dark = 'dark',
	Light = 'light'
}

const initialTheme: ResolvedTheme = getSystemThemePreference() ? 'dark' : 'light'
const isDarkMode = ref(initialTheme === 'dark')
const currentTheme = ref<SystemTheme>(initialTheme)
const themeSource = ref<ThemeSource>('system')
const themeName = ref<ThemeNameEnum>(initialTheme === 'dark' ? ThemeNameEnum.Dark : ThemeNameEnum.Light)

let removeThemeListener: (() => void) | null = null

function applyResolvedTheme(theme: ResolvedTheme): void {
	isDarkMode.value = theme === 'dark'
	currentTheme.value = theme
	themeName.value = theme === 'dark' ? ThemeNameEnum.Dark : ThemeNameEnum.Light
	applyDocumentTheme(theme, 'mobile')
}

function setupSystemThemeListener(): void {
	removeThemeListener?.()
	removeThemeListener = null

	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
	const handleChange = (event: MediaQueryListEvent) => {
		if (themeSource.value === 'system') applyResolvedTheme(event.matches ? 'dark' : 'light')
	}
	mediaQuery.addEventListener('change', handleChange)
	removeThemeListener = () => mediaQuery.removeEventListener('change', handleChange)
}

export function useTheme() {
	const themeClass = computed(() => isDarkMode.value ? 'dark' : 'light')
	const isDark = computed(() => themeName.value === ThemeNameEnum.Dark)

	const initTheme = async () => {
		try {
			const legacySource = localStorage.getItem('theme') as ThemeSource | null
			const preferences = await preferencesClient.get()
			const storedSource = legacySource || preferences.themeSource
			themeSource.value = storedSource && ['system', 'light', 'dark'].includes(storedSource)
				? storedSource
				: 'system'
			localStorage.setItem('theme', themeSource.value)
			if (preferences.themeSource !== themeSource.value) {
				await preferencesClient.set({ themeSource: themeSource.value })
			}
			applyResolvedTheme(resolveTheme(themeSource.value, getSystemThemePreference()))
			setupSystemThemeListener()
		} catch (error) {
			console.error('初始化主题失败:', error)
			themeSource.value = 'system'
			applyResolvedTheme(resolveTheme('system', getSystemThemePreference()))
			setupSystemThemeListener()
		}
	}

	const setThemeSource = async (source: ThemeSource) => {
		try {
			themeSource.value = source
			localStorage.setItem('theme', source)
			await preferencesClient.set({ themeSource: source })
			applyResolvedTheme(resolveTheme(source, getSystemThemePreference()))
			setupSystemThemeListener()
		} catch (error) {
			console.error('设置主题来源失败:', error)
		}
	}

	const toggleTheme = () => {
		void setThemeSource(isDark.value ? 'light' : 'dark')
	}

	const setTheme = (theme: ThemeNameEnum) => {
		void setThemeSource(theme)
	}

	const getThemeInfo = () => ({
		isDarkMode: isDarkMode.value,
		currentTheme: currentTheme.value,
		themeSource: themeSource.value,
		themeClass: themeClass.value,
		themeName: themeName.value
	})

	const cleanup = () => {
		removeThemeListener?.()
		removeThemeListener = null
	}

	return {
		isDarkMode: computed(() => isDarkMode.value),
		currentTheme: computed(() => currentTheme.value),
		themeSource: computed(() => themeSource.value),
		themeClass,
		themeName,
		isDark,
		initTheme,
		setThemeSource,
		toggleTheme,
		getThemeInfo,
		cleanup,
		setTheme,
		getCssVars: () => getCssVars(themeName.value)
	}
}

export const globalTheme = {
	isDarkMode,
	currentTheme,
	themeSource,
	themeName
}
