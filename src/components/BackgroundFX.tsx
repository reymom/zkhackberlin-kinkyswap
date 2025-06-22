export default function BackgroundFX() {
    return (
        <>
            {/* grid pattern */}
            <div className="fixed inset-0 -z-20 pointer-events-none opacity-20
                      bg-[url('/grid.svg')] bg-center
                      [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            {/* blurred color wash */}
            <div className="fixed inset-0 -z-30 pointer-events-none blur-3xl opacity-30
                      bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20" />
        </>
    );
}