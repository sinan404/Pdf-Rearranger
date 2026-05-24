import DashboardCards from './DashboardCards'

function UploadIcon() {
    return (
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none">
            <path
                d="M12 16V4m0 0-4 4m4-4 4 4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
            />
            <path
                d="M5 15.5v2.75A1.75 1.75 0 0 0 6.75 20h10.5A1.75 1.75 0 0 0 19 18.25V15.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.5"
            />
        </svg>
    )
}

function EditorHero({ onFileSelect }) {
    function handleChange(e) {
        const file = e.target.files[0]

        if (file) onFileSelect(file)
    }

    return (
        <section className="flex w-full max-w-[1120px] flex-col items-center gap-[60px]">
            <div className="flex w-full flex-col items-center gap-8">
                <div className="w-full self-start pl-[64px] uppercase text-white mt-16">
                    <h1 className="text-[80px] font-bold leading-[0.94] tracking-[0]">
                        <span className="block">Cheat Smarter</span>
                        <span className="block">
                            Score <span className="font-black italic text-[#dc0d0d]">Higher</span>
                        </span>
                    </h1>
                    <p className="mt-5 text-[26px] font-normal normal-case leading-9">
                        Edit PDFs Online with Ease
                    </p>
                </div>

                <label className="flex h-14 cursor-pointer items-center gap-3 rounded-lg border border-black bg-white px-6 text-[22px] font-medium leading-8 text-black transition-colors hover:bg-white/90">
                    <UploadIcon />
                    <span>Get Started - Upload PDF</span>
                    <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={handleChange}
                    />
                </label>
            </div>

            <DashboardCards />
        </section>
    )
}

export default EditorHero
