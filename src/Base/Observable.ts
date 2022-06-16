export type Callback<T> = (value: T) => void

export class Observable<T> {
    private subscriptions = new Array<Callback<T>>()

    subscribe(cb: Callback<T>) {
        this.subscriptions.push(cb);

        return {
            unsubscribe: () => {
                this.subscriptions.splice(this.subscriptions.indexOf(cb), 1)
            }
        }
    }

    update(next: T){
        for(const subscription of this.subscriptions) {
            subscription(next);
        }
    }
}