export function getErrorMessage(e:unknown) {
    if( e instanceof Error ) {
        return e.message;
    } else if( typeof e==='object' && !!e && "message" in e && typeof e.message==='string' ) {
        return e.message;
    }
    try {
        const json = JSON.stringify(e);
        return json;
    } catch(je) {}

    return 'na';
}

export function isFileErrorNotExists(e:unknown):boolean {
    return typeof e==='object' && !!e && "code" in e && e.code==='ENOENT';
}