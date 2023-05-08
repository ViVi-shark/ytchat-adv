Rx.CompositeDisposable.prototype.clear = function(){
    while (this.disposables.lenght > 0) {
        this.remove(this.disposables[0]);
    }
};

class ReactiveProperty{
    constructor(initialValue){
        this.value = initialValue;
        this.subject = new Rx.BehaviorSubject(this.value);
    }
    setValue(value){
        this.value = value;
        this.subject.onNext(this.value);
    }
    getValue(){
        return this.value;
    }
    observe(){
        return this.subject;
    }
}

class ReactiveList{
    constructor(){
        this.items = new ReactiveProperty([]);
    }

    add(item){
        this.items.setValue(this.items.getValue().concat([item]));
        return this;
    }

    observeCount(){
        return this.items.observe().map(x => x.length);
    }

    observeAsArray(){
        return this.items.observe();
    }

    observeAdded(){
        return this.observeAsArray()
            .pairwise()
            .map(x => x.current[-1]);
    }
}

class ReactiveButton{
    constructor($button){
        this.onClicked = new Rx.Subject();

        const s = this.onClicked;
        $button.on(
            'click',
            () => s.onNext(Rx.Observable.Unit)
        );
    }

    observeClicked(){
        return this.onClicked;
    }
}

class ReactiveInput{
    constructor($input){
        this.property = new ReactiveProperty($input.val());
        
        const p = this.property;
        $input.on(
            'change',
            function(){
                p.setValue($(this).val());
            }
        );
    }

    observe(){
        return this.property.observe();
    }
}
