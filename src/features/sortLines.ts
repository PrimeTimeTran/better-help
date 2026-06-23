export function sortLines(lines: string[]): string[] {
  // Deduplicate and remove empty lines
  const uniqueLines = Array.from(new Set(lines.map((l) => l.trim()).filter((l) => l.length > 0)))

  return uniqueLines.sort((a, b) => {
    const isDirectory = (path: string) => {
      // Remove JSON syntax for checking
      const clean = path.replace(/["':,]/g, '')
      return clean.endsWith('/') || !clean.includes('.')
    }

    const dirA = isDirectory(a)
    const dirB = isDirectory(b)

    if (dirA !== dirB) return dirA ? -1 : 1
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  })
}
