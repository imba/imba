import url from '__ENTRYPOINT__?worker&url';

export default class CustomWorker extends Worker {
    constructor(){
        super(url);
    }
}