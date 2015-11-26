export class Utility{
    constructor(){
    }

    route(path,router,e){
        e.preventDefault();
        router.parent.navigateByUrl(path);
    }


}