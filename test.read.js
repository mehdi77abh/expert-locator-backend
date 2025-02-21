async function fetchWithTimeout(resource, options = {}) {
    const {timeout = 8000} = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);

    return response;
}

async function handleSearch() {
    try {
        const response = await fetchWithTimeout('http://localhost:5000/search?query=Raji', {
            timeout: 15000
        });
        return await response.json();
    } catch (error) {
        // Timeouts if the request takes
        // longer than 6 seconds
        console.log("ERROR : ", error)
        console.log(error.name === 'AbortError');
    }
}

(async () => {
    const response = await handleSearch("")
    console.log("RESPONSE : ",response)
})()
