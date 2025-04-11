import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { CheckCircleIcon, CalendarIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';

export default function PaymentSuccessModal({ isOpen, onClose, bookingType, mentorName, selectedSlot }) {
  const formatTime = (timeString) => {
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString(undefined, options);
  };

  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex flex-col items-center text-center">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mb-4" />
                  <Dialog.Title as="h3" className="text-xl font-bold text-white mb-2">
                    Payment Successful!
                  </Dialog.Title>
                  
                  {bookingType === 'questions' ? (
                    <>
                      <div className="mt-2 mb-6">
                        <p className="text-gray-300">
                          You've successfully purchased the 5 Question Package with {mentorName}.
                          You can now ask up to 5 questions about your career.
                        </p>
                      </div>
                      <div className="bg-gray-700 rounded-lg p-4 w-full mb-6">
                        <div className="flex items-center">
                          <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-400 mr-3" />
                          <div>
                            <h4 className="font-medium text-white">5 Question Package</h4>
                            <p className="text-gray-400 text-sm">Valid for 30 days</p>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="mt-2 mb-6">
                        <p className="text-gray-300">
                          You've successfully booked a one-on-one session with {mentorName}.
                        </p>
                      </div>
                      {selectedSlot && (
                        <div className="bg-gray-700 rounded-lg p-4 w-full mb-6">
                          <div className="flex items-center">
                            <CalendarIcon className="h-6 w-6 text-blue-400 mr-3" />
                            <div>
                              <h4 className="font-medium text-white">One-on-One Session</h4>
                              <p className="text-gray-400">
                                {getDayName(selectedSlot.day_of_week)}, {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="mt-2">
                    <p className="text-sm text-gray-400">
                      Check your "Mentor" section to view and manage your bookings.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={onClose}
                  >
                    Go to Dashboard
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}