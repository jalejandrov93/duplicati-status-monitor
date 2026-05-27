import Image from "next/image";
import logo from "../../assets/img/logos/sello-blanco.png";

interface LogoProps {
    className?: string
}

export function Logo({ className }: LogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className || ''}`}>
            <Image src={logo} alt="Logo" width={200} height={180} />
        </div>
    );
}