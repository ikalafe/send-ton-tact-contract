import "@stdlib/deploy";

message Withdraw {
    amount: Int as coins;
}

contract SendTon with Deployable {
    const MainTonForStorage: Int = ton("0.01");
    owner: Address;

    init(){
        self.owner = sender();
    }

    fun onlyOwner() {
        require(sender() == self.owner, "only owner is allowed to withdraw");
    }

    receive(){
        // accept incoming TON transfers
    }

    receive("withdraw_all"){
        self.onlyOwner();
        send(SendParameters{
                to: sender(),
                bounce: true,
                value: 0,
                mode: SendRemainingBalance + SendIgnoreErrors,
                body: "انتفال تمام موجودی".asComment()
            }
        );
    }

    receive("withdraw safe"){   
        self.onlyOwner();

        send(SendParameters{
            to: sender(),
            bounce: true,
            value: myBalance() - context().value - self.MainTonForStorage,
            mode: SendIgnoreErrors + SendRemainingValue,
        })
    }

    receive(msg: Withdraw) {
        self.onlyOwner();
        let amount: Int = min(msg.amount, myBalance() - context().value - self.MainTonForStorage);
        require(amount > 0, "Insufficient balance");
        send(SendParameters{
            to: sender(),
            bounce: true,
            value: amount,
            mode: SendIgnoreErrors + SendRemainingValue,
        });
    }

    get fun balance():Int {
        return myBalance();
    }
}