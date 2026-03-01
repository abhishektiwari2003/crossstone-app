async function main() {
    try {
        const url = "http://localhost:3000/api/projects/project-greenfield/drawings";

        // We will authenticate using the mock session by sending a dummy cookie 
        // Or wait, since we don't know the exact cookie, we might get 401. 
        // Let's see if we get 401 or 500.
        const req = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: "https://example.com/drawing.pdf", version: 1 }),
        });

        const text = await req.text();
        console.log("Status:", req.status);
        console.log("Response:", text);
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}
main();
