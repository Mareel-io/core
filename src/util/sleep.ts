export async function sleep(msec: number): Promise<void> {
    return await new Promise((ful, _rej) => {
        setTimeout(() => {
            ful(undefined);
        }, msec);
    });
}