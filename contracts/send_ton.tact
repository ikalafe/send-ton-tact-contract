import "@stdlib/deploy";

contract SendTon with Deployable {
    const MainTonForStorage: Int = ton("0.01");
    owner: Address;

    init(){
        self.owner = sender();
    }

    receive(){
        // accept incoming TON transfers
    }

    receive("withdraw_all"){
        require(sender() == self.owner, "only owner is allowed to withdraw");
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
        require(sender() == self.owner, "only owner is allowed to withdraw");

        send(SendParameters{
            to: sender(),
            bounce: true,
            value: myBalance() - context().value - self.MainTonForStorage,
            mode: SendIgnoreErrors + SendRemainingValue,
        })
    }

    get fun balance():Int {
        return myBalance();
    }
}