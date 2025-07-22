export function convertUnknownToError(e: unknown):Error {
    let error:Error;
    if( e instanceof Error ) {
        error = e;
    } else {
        let serializedError:string | undefined;
        try {
            serializedError = JSON.stringify(e);
        } catch(e) {}
        error = new Error(`Unknown error: ${serializedError ?? 'na'}`);
    }

    return error;
}