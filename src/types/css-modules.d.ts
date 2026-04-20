// Declaración de módulos CSS para TypeScript
declare module "*.css" {
    const content: Record<string, string>;
    export default content;
}

declare module "@/styles/*.css" {
    const content: Record<string, string>;
    export default content;
}

declare module "@/styles/components/*.css" {
    const content: Record<string, string>;
    export default content;
}
