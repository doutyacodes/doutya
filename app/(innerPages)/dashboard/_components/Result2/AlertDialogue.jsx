'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

function AlertDialogue({fetchResults, setShowAlert}) {
    const t = useTranslations('IndustryAlert');
    const [open, setOpen] = useState(true)

    const handleContinue = ()=>{
        setShowAlert(false)
        fetchResults("any")
    }
    return (
        <Dialog open={open} onClose={setOpen} className="relative z-[9999]">
            <DialogBackdrop
                transition
                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
            />

            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <DialogPanel
                        transition
                        className="relative transform overflow-hidden rounded-2xl backdrop-blur-sm bg-gray-800/60 border border-gray-700/50 text-left shadow-2xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                    >
                        <div className="px-6 pt-6 pb-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-orange-500/10 rounded-full flex-shrink-0">
                                    <AlertTriangle className="w-8 h-8 text-orange-400" />
                                </div>
                                <div className="flex-1">
                                    <DialogTitle as="h3" className="text-xl font-bold leading-6 text-white mb-2">
                                        {t('title')}
                                    </DialogTitle>
                                    <p className="text-gray-300 leading-relaxed">
                                        {t('message')}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-700/30 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="inline-flex justify-center items-center px-4 py-2.5 bg-gray-600/50 hover:bg-gray-600/70 border border-gray-500/50 text-gray-200 hover:text-white text-sm font-medium rounded-xl transition-all duration-200 sm:mr-3"
                            >
                                {t('cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleContinue}
                                className="inline-flex justify-center items-center px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all duration-200"
                            >
                                {t('continue')}
                            </button>
                        </div>
                    </DialogPanel>
                </div>
            </div>
        </Dialog>
    )
}

export default AlertDialogue
