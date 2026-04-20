import Image from "next/image";

interface LogoProps {
    className?: string
}

export function Logo({ className }: LogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className || ''}`}>
            <Image src="/logos/sello-blanco.png" alt="Logo" width={200} height={180} />
        </div>
    );
}