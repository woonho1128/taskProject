import type { TimeSpent } from '../../types'
import { TIME_SPENT_CONFIG } from '../../types'

interface Props {
  open: boolean
  onConfirm: (timeSpent: TimeSpent) => void
  onClose: () => void
}

const OPTIONS: TimeSpent[] = ['under_1h', 'half_day', 'over_1day', 'over_3days']

export function TimeSpentModal({ open, onConfirm, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">소요 시간</h2>
          <p className="text-sm text-gray-500 mb-4">이 태스크에 얼마나 걸렸나요?</p>

          <div className="space-y-2">
            {OPTIONS.map(key => (
              <button
                key={key}
                onClick={() => onConfirm(key)}
                className="w-full px-4 py-3 text-left text-sm font-medium rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {TIME_SPENT_CONFIG[key].label}
              </button>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full mt-3 px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            나중에
          </button>
        </div>
      </div>
    </div>
  )
}
