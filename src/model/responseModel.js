class ResponseModel {
    constructor(Status, Data, Message) {
        this.status = Status;
        this.data = Data;
        this.message = Message;
    }
}

module.exports = ResponseModel;