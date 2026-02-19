
export default function Loading() {
    return (
        <div className="flex h-[100dvh] w-full items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-3">
                <div className="relative h-12 w-12">
                    <div className="absolute h-12 w-12 animate-ping rounded-full bg-blue-100 opacity-75"></div>
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                    </div>
                </div>
                <div className="text-sm font-medium text-slate-500 animate-pulse">
                    PylonChat
                </div>
            </div>
        </div>
    )
}
