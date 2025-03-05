export type ScanProgress = {
  completed: number
  total: number
  status: 'starting' | 'scanning' | 'complete' | 'idle'
}
