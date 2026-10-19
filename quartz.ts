import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import * as ExternalPlugin from "./.quartz/plugins"

ExternalPlugin.Explorer({
  sortFn: (a, b) => {
    // Folders above posts
    if (a.isFolder !== b.isFolder) return a.isFolder ? -1 : 1

    // Folders stay alphabetical
    if (a.isFolder && b.isFolder) {
      return a.displayName.localeCompare(b.displayName, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    }

    // Posts: newest first
    const dateA = (a.data as any)?.date ? new Date((a.data as any).date).getTime() : 0
    const dateB = (b.data as any)?.date ? new Date((b.data as any).date).getTime() : 0
    return dateB - dateA
  },
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
