import url from '__ENTRYPOINT__?worker&url';

export default class CustomSharedWorker extends SharedWorker {
    constructor(){
        super(url);
    }
}