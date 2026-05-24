import { useRef, useState } from 'react'

const cards = [
    {
        id: 'annotate-blue',
        eyebrow: 'rearrange',
        title: 'Rearranged pages',
        description: 'Rearrange pages for better both side printing',
        accent: '#0099ff',
    },
    {
        id: 'annotate-green',
        eyebrow: 'MicroSized',
        title: 'Micro Sized PDFs',
        description: 'Convert PDFs into micro-sized (per page 9)',
        accent: '#1ed760',
    },
    {
        id: 'annotate-purple',
        eyebrow: 'download',
        title: 'Download Instantly',
        description: 'Save your edited PDFs with all features applied',
        accent: '#d000ff',
    },
]

function DocumentIcon({ accent }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 96 96" className="size-12" fill="none">
            <path
                d="M29 11h27l16 16v51a7 7 0 0 1-7 7H29a7 7 0 0 1-7-7V18a7 7 0 0 1 7-7Z"
                stroke={accent}
                strokeLinejoin="round"
                strokeWidth="4"
            />
            <path d="M56 11v16h16" stroke={accent} strokeLinejoin="round" strokeWidth="4" />
            <path
                d="M35 43h10m-10 15h25m-25 14h25"
                stroke={accent}
                strokeLinecap="round"
                strokeWidth="4"
            />
        </svg>
    )
}

function DashboardCard({ card }) {
    const ref = useRef(null)
    const [pointer, setPointer] = useState({ x: 0, y: 0, active: false })

    function handlePointerMove(e) {
        const rect = ref.current.getBoundingClientRect()
        setPointer({
            active: true,
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        })
    }

    function handlePointerLeave() {
        setPointer((current) => ({ ...current, active: false }))
    }

    return (
        <article
            ref={ref}
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
            className="group relative min-h-[236px] flex-1 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-2.5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-1 hover:scale-[1.015] hover:bg-white/[0.055]"
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(360px circle at ${pointer.x}px ${pointer.y}px, ${card.accent}22, transparent 58%)`,
                }}
            />
            <div
                className="pointer-events-none absolute inset-0 rounded-3xl p-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                    background: `radial-gradient(260px circle at ${pointer.x}px ${pointer.y}px, ${card.accent}, transparent 62%)`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                }}
            />
            <div
                className={`pointer-events-none absolute -inset-16 blur-3xl transition-opacity duration-700 ${
                    pointer.active ? 'opacity-25' : 'opacity-0'
                }`}
                style={{
                    background: `radial-gradient(circle at ${pointer.x}px ${pointer.y}px, ${card.accent}, transparent 45%)`,
                }}
            />

            <div className="relative z-10 flex h-full flex-col rounded-2xl border border-white/8 bg-black/35 p-2.5">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-200/70">
                            {card.eyebrow}
                        </p>
                        <h3 className="mt-3 text-[22px] font-medium leading-7 text-white">
                            {card.title}
                        </h3>
                    </div>
                    <div className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                        <DocumentIcon accent={card.accent} />
                    </div>
                </div>

                <p className="mt-4 text-[14px] leading-6 text-zinc-400">{card.description}</p>
            </div>
        </article>
    )
}

function DashboardCards() {
    return (
        <div className="relative w-full max-w-[1120px]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="relative grid gap-6 md:grid-cols-3">
                {cards.map((card) => (
                    <DashboardCard key={card.id} card={card} />
                ))}
            </div>
        </div>
    )
}

export default DashboardCards