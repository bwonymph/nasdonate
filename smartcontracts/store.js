'use strict'

var Data = function (address, timestamp, amount) {
    if(this.verifyAddress(address)){
        this.address = address;
        this.timestamp = timestamp;
        this.amount = amount;
    }else {
        let o = JSON.parse(address);
        this.address = o.address;
        this.timestamp = o.timestamp;
        this.amount = o.amount;
    }
};

Data.prototype = {
    toString: function () {
        return JSON.stringify(this);
    },
    verifyAddress: function (address) {
        return Blockchain.verifyAddress(address) !== 0;
    }
};

var DonateContract = function () {
    LocalContractStorage.defineMapProperty(this, "datas", {
        stringify: function (obj) {
            return obj.toString();
        },
        parse: function (str) {
            return new Data(str)
        }
    });
    LocalContractStorage.defineProperties(this, {
        totaldonate: {
            stringify: function (obj) {
                return obj.toString();
            },
            parse: function (str) {
                return new Data(str);
            }
        },
        adminAddress: null
    });
};

DonateContract.prototype = {
    init: function () {
        this.adminAddress = Blockchain.transaction.from;
        this.totaldonate = new Data(this.adminAddress,Date.now(), 1);
        this.setdonate(this.totaldonate.amount)
    },
    setdonate: function (amount) {
        if(parseInt(amount) > 0){
            let addr = Blockchain.transaction.from;
            let currentTime = Date.now();
            let data = new Data(addr,currentTime,amount);
            let oldData = this.datas.get(addr);
            let td = this.totaldonate;
            if(oldData instanceof Data){
                data.amount = +data.amount + +oldData.amount;
                this.datas.put(addr,data);
                this.totaldonate.amount = +td.amount + +data.amount;
            }else {
                this.datas.put(addr,data);
            }

            
            return this.datas.get(addr);
        }else {
            throw new Error("no data")
        }
    },
    getdonate: function () {
        let addr = Blockchain.transaction.from;
        let data = this.datas.get(addr);
        if(data instanceof Data){
            return data;
        }else {
            throw new Error("no data")
        }
    },
    curtot: function (amount) {
        if(parseInt(amount) > 0){
            let addr = Blockchain.transaction.from;
            let currentTime = new Date();
            let data = new Data(addr,currentTime,amount);
            this.totaldonate = data;
            return data;
        }else {
            throw new Error("no data")
        }
    },
    gettot: function () {
        if(this.totaldonate instanceof Data){
            return this.totaldonate;
        }else {
            throw new Error("no data")
        }
    },
    setAdminAddress: function (address) {
        if (Blockchain.transaction.from === this.adminAddress) {
            this.adminAddress = address;
        } else {
            throw new Error("Admin only");
        }
    },
};

module.exports = DonateContract;