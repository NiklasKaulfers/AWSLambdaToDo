export function existsForApiGateway<T>(check: T, successMessage: string, errorMessage: string, successStatusCode?: number, errorStatusCode?: number): GatewayResult {
    if (!check) {
        return {
            statusCode: errorStatusCode ?? 404,
            body: JSON.stringify({message: errorMessage}),
        }
    }
    return{
        statusCode: successStatusCode ?? 200,
        body: JSON.stringify({message: successMessage}),
    }
}

interface GatewayResult{
    statusCode?: number,
    body?: string
}