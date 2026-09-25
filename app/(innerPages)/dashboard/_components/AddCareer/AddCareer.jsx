'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useRouter } from 'next/navigation'
import { Compass, ArrowRight, X } from 'lucide-react'

function AddCareer({ isOpen, onClose, setCareerName, careerName, handleSubmit, roadMapLoading }) {
  const router = useRouter()

  const handleGoToSuggestions = () => {
    onClose()
    router.push('/dashboard/careers/career-suggestions')
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-xl bg-gray-900 border border-gray-700/80 text-left shadow-2xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg p-6 data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <DialogTitle as="h3" className="text-lg font-bold text-white">
                Add a Career
              </DialogTitle>
              <button
                type="button"
                onClick={onClose}
                disabled={roadMapLoading}
                className="text-gray-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="pt-4 space-y-4">
              {/* Option A: Suggested Careers */}
              <button
                type="button"
                onClick={handleGoToSuggestions}
                disabled={roadMapLoading}
                className="w-full text-left p-4 rounded-lg bg-gray-800/60 border border-gray-700/70 hover:bg-gray-800 hover:border-blue-500/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      Browse Career Suggestions
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Explore careers tailored to your test assessment results
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </button>

              {/* Divider */}
              <div className="relative my-2 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <span className="relative bg-gray-900 px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Or enter career name manually
                </span>
              </div>

              {/* Option B: Manual Career Name Input */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Career Name
                </label>
                <input
                  type="text"
                  value={careerName}
                  onChange={(e) => setCareerName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !roadMapLoading && careerName.trim()) {
                      e.preventDefault()
                      handleSubmit()
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-gray-800/80 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                  placeholder="e.g. Data Analyst, UX Designer..."
                  autoFocus
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Enter any career title to customize your personalized roadmap.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-gray-800 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={roadMapLoading}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={roadMapLoading || !careerName.trim()}
                className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold text-white shadow-sm transition-colors ${
                  roadMapLoading || !careerName.trim()
                    ? 'bg-blue-600/40 text-white/50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 cursor-pointer'
                }`}
              >
                {roadMapLoading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8h8a8 8 0 11-16 0z"
                      ></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  )
}

export default AddCareer
