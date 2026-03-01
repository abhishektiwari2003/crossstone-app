async function main() {
    try {
        console.log("Importing route...");
        const route = await import("./src/app/api/projects/[id]/drawings/route");
        console.log("Route imported!", Object.keys(route));
    } catch (e) {
        console.error("Crash during import:", e);
    }
}
main();
