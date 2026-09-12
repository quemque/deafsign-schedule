export default function Footer() {
   return (
      <footer className="border-t border-neutral-200 bg-white mt-16">
         <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            <div className="flex items-center gap-4">
               <span className="font-medium text-neutral-900">DeafSign</span>
               <span>© {new Date().getFullYear()}</span>
            </div>

            <div className="flex flex-wrap items-center gap-6">
               <a
                  href="https://deafsign.ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-neutral-900 transition-colors"
               >
                  <svg
                     className="w-3.5 h-3.5 text-neutral-400"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                     strokeWidth="1.75"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8"
                     />
                  </svg>
                  <span>deafsign.ru</span>
               </a>

               <a
                  href="tel:+79999033223"
                  className="flex items-center gap-2 hover:text-neutral-900 transition-colors"
               >
                  <svg
                     className="w-3.5 h-3.5 text-neutral-400"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                     strokeWidth="1.75"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 5.5A2.5 2.5 0 015.5 3h2.086a1 1 0 01.95.69l1.17 3.51a1 1 0 01-.27 1.05l-1.54 1.54a12.04 12.04 0 005.18 5.18l1.54-1.54a1 1 0 011.05-.27l3.51 1.17a1 1 0 01.69.95v2.086a2.5 2.5 0 01-2.5 2.5h-.5C10.045 21 3 13.955 3 5.5v-.5z"
                     />
                  </svg>
                  <span>+7 999 903-32-23</span>
               </a>

               <a
                  href="mailto:info@deafsign.ru"
                  className="flex items-center gap-2 hover:text-neutral-900 transition-colors"
               >
                  <svg
                     className="w-3.5 h-3.5 text-neutral-400"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                     strokeWidth="1.75"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                     />
                  </svg>
                  <span>info@deafsign.ru / deafsign@yandex.ru</span>
               </a>
            </div>
         </div>
      </footer>
   )
}
