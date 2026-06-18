export async function Log(stack, level, packageName, message) {
    const token = process.env.LOG_API_TOKEN?.trim();
    const endpoint = process.env.LOG_API_ENDPOINT?.trim();
    if (!endpoint) {
        throw new Error("LOG_API_ENDPOINT is required in environment variables");
    }
    if (!token) {
        throw new Error("LOG_API_TOKEN is required in environment variables");
    }
    const payload = {
        stack,
        level,
        package: packageName,
        message,
    };
    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
        });
        const responseBody = await response.text();
        if (!response.ok) {
            throw new Error(`Log API returned ${response.status}: ${responseBody}`);
        }
        const data = JSON.parse(responseBody);
        return data;
    }
    catch (error) {
        const messageText = error instanceof Error ? error.message : "Unknown logging error";
        return {
            success: false,
            loggedAt: new Date().toISOString(),
            message: messageText,
            package: packageName,
            level,
        };
    }
}
