function UploadArrow() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 shrink-0" fill="none">
      <path d="M4 12h14" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
      <path d="m13 6 6 6-6 6" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
    </svg>
  )
}

function Header({ onUploadClick, onHomeClick }) {
  return (
    <header className="relative z-20 mx-[50px] flex h-[60px] w-[calc(100%-100px)] items-center justify-between border border-white bg-black px-5">
      <button
        type="button"
        onClick={onHomeClick}
        className="text-[22px] font-medium leading-none text-white hover:opacity-70 transition-opacity"
      >
        Pdf Editor
      </button>

      <button
        type="button"
        onClick={onUploadClick}
        className="flex h-[44px] items-center gap-1 rounded-full border border-white bg-black py-1 pl-4 pr-2 text-[17px] font-medium leading-none text-white transition-colors hover:bg-white hover:text-black"
      >
        <span>Upload</span>
        <span className="grid size-8 place-items-center rounded-full">
          <UploadArrow />
        </span>
      </button>
    </header>
  )
}

export default Header