import Link from 'next/link'
import { useEffect } from 'react';
import { useRouter } from 'next/router';

const Unauthorized = () => {
    const router = useRouter();

    useEffect(() => {
        setTimeout(() => {
            router.push('/');
        }, 5000)
    }, [])

    return (
        <>
      <main
        className="flex items-center justify-center h-screen-10"
      >
        <div className="p-4 space-y-4">
          <div className="flex flex-col items-start space-y-3 sm:flex-row sm:space-y-0 sm:items-center sm:space-x-3">
            <p className="font-semibold text-forestgreen text-9xl font-Lora">401</p>
            <div className="space-y-2">
              <h1 id="pageTitle" className="flex items-center space-x-2">
                <svg
                  aria-hidden="true"
                  className="w-6 h-6 text-gray-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-xl font-medium text-gray-600 sm:text-2xl font-Lora">
                    Unauthorized required, you are not authorized for selected action.
                </span>
              </h1>
              <p className="text-base font-normal text-gray-600 dark:text-gray-300 font-OpenSans">
                You may return to
                <a href="http://localhost:3000" className="text-orange-600"> <span className="hover:underline">home page</span></a> or you will be redirected.
              </p>
            </div>
          </div>

        </div>
      </main>
        </>
    )
}

export default Unauthorized;