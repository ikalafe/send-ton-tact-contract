import "@stdlib/deploy";

contract SendTon with Deployable {
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

    get fun balance(): String {
        return myBalance().toCoinsString();
    }
}