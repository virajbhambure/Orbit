class apiResponce{
    constructor(statusCode,data,massage="Success")
    {
        
        this.statusCode=statusCode;
        this.data=data;
        // console.log(this.data)
        this.massage=massage;
        this.success=statusCode <400;
    }
}

export {apiResponce}