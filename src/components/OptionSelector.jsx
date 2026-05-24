import { useState } from 'react'

function OptionSelector({ fileName, onConfirm }) {
  const [rearrange, setRearrange] = useState(false)
  const [microsize, setMicrosize] = useState(false)

  const nothingSelected = !rearrange && !microsize

  return (
    <div className="flex w-full max-w-[600px] flex-col gap-6">

      {/* File name */}
      <div className="text-center">
        <p className="text-sm" style={{ color: '#9BA3B8' }}>Selected file</p>
        <p className="mt-1 text-lg font-medium text-white truncate">{fileName}</p>
      </div>

      {/* Warning */}
      {!microsize && (
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
          <p className="text-sm font-medium text-yellow-300">
            ⚠️ This PDF should not be in microsized
          </p>
          <p className="mt-1 text-xs" style={{ color: '#9BA3B8' }}>
            Only works in normal form
          </p>
        </div>
      )}

      {/* Checkboxes */}
      <div className="flex flex-col gap-3">

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={rearrange}
            onChange={e => setRearrange(e.target.checked)}
            className="size-5 cursor-pointer accent-blue-500"
          />
          <div>
            <p className="text-white text-sm font-medium">PDF will be rearranged</p>
            <p className="text-xs" style={{ color: '#9BA3B8' }}>Apply odd/even stream algorithm</p>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={microsize}
            onChange={e => setMicrosize(e.target.checked)}
            className="size-5 cursor-pointer accent-green-500"
          />
          <div>
            <p className="text-white text-sm font-medium">PDF will be converted to microsized</p>
            <p className="text-xs" style={{ color: '#9BA3B8' }}>Compress 9 pages into 1 (3×3 portrait grid)</p>
          </div>
        </label>

      </div>

      {/* Error if nothing selected */}
      {nothingSelected && (
        <p className="text-xs text-red-400 text-center">
          ⚠️ Select at least one option to continue
        </p>
      )}

      {/* Confirm */}
      <button
        onClick={() => onConfirm({ rearrange, microsize })}
        disabled={nothingSelected}
        className="w-full rounded-lg py-3 text-base font-medium transition-colors"
        style={{
          background: nothingSelected ? '#333' : '#fff',
          color: nothingSelected ? '#666' : '#000',
          cursor: nothingSelected ? 'not-allowed' : 'pointer',
        }}
      >
        Confirm & Process
      </button>

    </div>
  )
}

export default OptionSelector