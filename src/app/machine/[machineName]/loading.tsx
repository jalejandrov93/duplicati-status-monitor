import MachineLoader from "@/components/machine-loader";

export default function MachineDetailLoading() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center justify-center">
                <MachineLoader />
                <p className="text-muted-foreground">
                    Cargando detalles de la máquina...
                </p>
            </div>
        </div>
    );
}
